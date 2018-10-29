import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, Image, Clipboard, Linking, Dimensions, ImageBackground} from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Header from '../../components/Header'
import QRCode from 'react-native-qrcode-svg';
import ViewShot from "react-native-view-shot";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var WeChat = require('react-native-wechat');
const UrlHead = "https://eoseco.com/search?q=";

@connect(({login}) => ({...login}))
class TradeDetails extends BaseComponent {

  static navigationOptions = {
      headerTitle: '交易详情' ,
      header:null, 
  };

  constructor(props) {
    super(props);
    var paramtrade = new Object();
    if(this.props.navigation.state.params.trade){
      paramtrade = this.props.navigation.state.params.trade;
      paramtrade.disptype = 0;
    }else if(this.props.navigation.state.params.transaction){
      paramtrade.disptype = 1;
      paramtrade.type = this.props.navigation.state.params.transaction.action_name;
      paramtrade.quantity = this.props.navigation.state.params.transaction.eos_qty;
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = this.props.navigation.state.params.transaction.record_date;
      paramtrade.transactionId = this.props.navigation.state.params.transaction.trx_id;
      paramtrade.from = this.props.navigation.state.params.transaction.account;
      paramtrade.to = "";
      paramtrade.blockNum = this.props.navigation.state.params.transaction.block_num;
    }else if(this.props.navigation.state.params.ramtransaction){
      paramtrade.disptype = 2;
      paramtrade.type = this.props.navigation.state.params.ramtransaction.action_name;
      paramtrade.quantity = this.props.navigation.state.params.ramtransaction.eos_qty;
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = this.props.navigation.state.params.ramtransaction.record_date;
      paramtrade.transactionId = this.props.navigation.state.params.ramtransaction.trx_id;
      paramtrade.from = this.props.navigation.state.params.ramtransaction.payer;
      paramtrade.to = this.props.navigation.state.params.ramtransaction.receiver;
      paramtrade.blockNum = this.props.navigation.state.params.ramtransaction.block_num;  
    }
    else{
      //防止出错，正常情况，不应该到这里
      paramtrade.disptype = 0;
      paramtrade.type = "";
      paramtrade.quantity = "";
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = "";
      paramtrade.transactionId = "";
      paramtrade.from = "";
      paramtrade.to = "";
      paramtrade.blockNum = 0;  
    }
    WeChat.registerApp('wxc5eefa670a40cc46');
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
       trade: paramtrade,
    };
  }

  _rightTopClick = () =>{
    this.refs.viewShot.capture().then(uri => {
      WeChat.isWXAppInstalled().then((isInstalled) => {
          EasyShowLD.dialogClose();
          if (isInstalled) {
            WeChat.shareToSession({ type: 'imageFile', imageUrl: uri })
              .catch((error) => {
                EasyToast.show(error.message);
              });
          } else {
            EasyToast.show('没有安装微信软件，请您安装微信之后再试');
          }
        });
    });
  }

  componentDidMount() {
        //alert('trade: '+JSON.stringify(this.props.navigation.state.params.trade));
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount(); 
  }

  prot(key, data = {}) {
    if (key == 'transactionId') {
      // Linking.openURL(UrlHead + 'tx/' + this.state.trade.transactionId);
      Linking.openURL(UrlHead + this.state.trade.transactionId);
    }else  if (key == 'from') {
      // Linking.openURL(UrlHead + 'account/' + this.state.trade.from);
      Linking.openURL(UrlHead + this.state.trade.from);
    }else  if (key == 'to') {
      // Linking.openURL(UrlHead  + 'account/' + this.state.trade.to);
      Linking.openURL(UrlHead + this.state.trade.to);
    }else  if (key == 'blockNum') {
      if(this.state.trade.blockNum == null || this.state.trade.blockNum == ""){
        return;
      }
      // Linking.openURL(UrlHead  + 'block/' + this.state.trade.blockNum);
      Linking.openURL(UrlHead + this.state.trade.blockNum);
    }
  }

  copyaccount(key, data = {}) {
    if(key == 'from'){
      Clipboard.setString(this.state.trade.from);
      EasyToast.show('账号复制成功');
    }else if(key == 'to'){
      Clipboard.setString(this.state.trade.to);
      EasyToast.show('账号复制成功');
    }
  }

  copy = (trade) => {
    Clipboard.setString( UrlHead + trade.transactionId);
    EasyToast.show("复制成功");
  }
  
  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
       <Header {...this.props} onPressLeft={true} title="交易详情" avatar={UImage.share_i} onPressRight={this._rightTopClick.bind()} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
      <ViewShot ref="viewShot" style={{backgroundColor:UColor.secdfont}}> 
        <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>
          {this.state.trade.disptype == 0 && <ImageBackground style={[styles.bgtopout,ScreenUtil.isIphoneX()?{minHeight:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}:{height:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}]} source={UImage.home_bg} resizeMode="stretch">
              <View style={[styles.headout]}>
                  {/* <Text style={[styles.quantitytext,{color: UColor.fontColor}]}>{this.state.trade.type=='转出'?'-':'+'} </Text> */}
                  <Text style={[styles.quantitytext,{color: UColor.fontColor}]}>{this.state.trade.quantity.replace(this.state.trade.code, "")} </Text>
                  {/* <Text style={[styles.headtext,{color: UColor.arrow}]}> {this.state.trade.code}</Text> */}
              </View>
              <Text style={[styles.description,{color: UColor.arrow}]}>({this.state.trade.description}{this.state.trade.bytes? this.state.trade.bytes + " bytes":""})</Text>
            </ImageBackground>
          }
          {this.state.trade.disptype == 1 && <ImageBackground style={[styles.bgtopout,ScreenUtil.isIphoneX()?{minHeight:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}:{height:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}]} source={UImage.home_bg} resizeMode="stretch">
              <View style={[styles.headout]}>
                  <Text style={[styles.quantitytext,{color: UColor.fontColor}]}>{this.state.trade.quantity}</Text>
              </View>
              <Text style={[styles.description,{color: UColor.arrow}]}>{this.state.trade.type == 'selltoken'?'(卖)':'(买)'}</Text>
            </ImageBackground>
          }
          {this.state.trade.disptype == 2 && <ImageBackground style={[styles.bgtopout,ScreenUtil.isIphoneX()?{minHeight:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}:{height:(ScreenWidth-ScreenUtil.autowidth(60))*0.3974}]} source={UImage.home_bg} resizeMode="stretch">
              <View style={[styles.headout]}>
                  <Text style={[styles.quantitytext,{color: UColor.fontColor}]}>{this.state.trade.quantity} </Text>
              </View>
              <Text style={[styles.description,{color: UColor.arrow}]}>{this.state.trade.type == 'buyram'?'(买)':'(卖)'}</Text>
            </ImageBackground>
          }
        </View>
        
        <View style={[styles.tradehint,]}>
          <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}>
            <Text style={[styles.contwotext,{color: UColor.arrow}]}>付款账户</Text>
            <Text style={[styles.blocktext,{color: UColor.tintColor}]} onPress={this.prot.bind(this, 'from')} onLongPress={this.copyaccount.bind(this, 'from')}>{this.state.trade.from}</Text>
          </View>
          <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}>
            <Text style={[styles.contwotext,{color: UColor.arrow}]}>收款账户</Text>
            <Text style={[styles.blocktext,{color: UColor.tintColor}]} onPress={this.prot.bind(this, 'to')} onLongPress={this.copyaccount.bind(this, 'to')}>{this.state.trade.to}</Text>
          </View>
          <View style={{height: ScreenUtil.autowidth(88), paddingVertical: ScreenUtil.autowidth(11), marginTop: 1,flexDirection: "row", alignItems: 'flex-start', justifyContent: 'center', backgroundColor: UColor.mainColor}}>
            <Text style={[styles.contwotext,{color: UColor.arrow}]}>备注(Memo)</Text>
            <Text style={[styles.blocktext,{lineHeight: ScreenUtil.autowidth(22), paddingRight: ScreenUtil.autowidth(15),color: UColor.arrow}]} numberOfLines={3} >{this.state.trade.memo}</Text>
          </View>
        </View>

        
        <View style={{flexDirection: "row", }}>
          <View style={styles.conout}>
            <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}>
              <Text style={[styles.context,{color: UColor.arrow}]}>交易号</Text> 
              <Text style={[styles.tintext,{color: UColor.tintColor}]} onPress={this.prot.bind(this, 'transactionId')}>{this.state.trade.transactionId.substring(0, 6) +"..."+ this.state.trade.transactionId.substr(this.state.trade.transactionId.length-6) }</Text>
            </View>
            <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}> 
              <Text style={[styles.context,{color: UColor.arrow}]}>是否确认</Text>
              {this.state.accepted? 
                <Text style={[styles.tintext,{color: UColor.startup}]}>已确认</Text>
              :
                <Text style={[styles.showytext,{color: UColor.showy}]}>未确认</Text>
              }
            </View>
            <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}>
              <Text style={[styles.context,{color: UColor.arrow}]}>交易时间</Text>
              <Text style={[styles.tintext,{color: UColor.startup}]}>{moment(this.state.trade.blockTime).add(8,'hours').format('YYYY-MM-DD HH:mm')}</Text>
            </View>
          </View>
        
          <View style={[styles.codeout,{backgroundColor: UColor.mainColor}]}>
            <View style={[styles.qrcode,{backgroundColor: UColor.btnColor}]}>
              <QRCode size={ScreenUtil.setSpText(80)}  value={UrlHead + this.state.trade.transactionId } 
                logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(20)} logoBorderRadius={5}/>
            </View>
            <Button onPress={this.copy.bind(this,this.state.trade)}>
              <View style={{backgroundColor: UColor.tintColor,borderRadius: 5,}}>
                <Text style={{ fontSize: ScreenUtil.setSpText(12),color: UColor.btnColor,paddingHorizontal: ScreenUtil.autowidth(15),paddingVertical: ScreenUtil.autoheight(5),}}>复制链接</Text>
              </View>
            </Button>
          </View>
        </View>
        <View style={[styles.conouttext,{backgroundColor: UColor.mainColor}]}>
          <Text style={[styles.contwotext,{color: UColor.arrow}]}>提示</Text>
          <Text style={[styles.blocktext,{color: UColor.startup}]}>扫码可获取区块交易状态</Text>
        </View>
        

        {/* <View style={styles.logout}>
            <Image source={UImage.bottom_log} style={styles.logimg}/>
            <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
        </View> */}
      </ViewShot>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },
  bgtopout: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ScreenUtil.autowidth(24),
    width: ScreenWidth-ScreenUtil.autowidth(60),
  },
  header: {
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: ScreenUtil.autowidth(20),
  },

  headout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ScreenUtil.autowidth(10),
  },
  quantitytext: {
    fontWeight: 'bold',
    fontSize: ScreenUtil.setSpText(28),
  },
  headtext: {
    fontSize: ScreenUtil.setSpText(15),
    paddingTop: ScreenUtil.autoheight(10),
  },
  description: {
    height: ScreenUtil.autoheight(35),
    fontSize: ScreenUtil.setSpText(14),
  },
  conout: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  conouttext: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autowidth(44),
  },
  context: {
    flex: 2.5,
    textAlign: 'left',
    paddingLeft: ScreenUtil.autowidth(15),
    fontSize: ScreenUtil.setSpText(16),
    
  },
  contwotext: {
    flex: 2.7,
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(16),
    paddingLeft: ScreenUtil.autowidth(15),
  },
  tradehint: {
    marginVertical: ScreenUtil.autowidth(20),
  },
  blocktext: {
    flex: 7,
    fontSize: ScreenUtil.setSpText(14),
    
  },
  showytext: {
    flex: 4,
    fontSize: ScreenUtil.setSpText(14),
  },
  tintext: {
    flex: 4,
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autowidth(44),
  },
  codeout: {
    alignItems: 'center',
    flexDirection: "column",
    justifyContent: 'center',
    paddingRight: ScreenUtil.autowidth(15),
  },
  qrcode: {
    marginBottom: ScreenUtil.autoheight(5),
    paddingVertical: ScreenUtil.autowidth(5),
    paddingHorizontal:ScreenUtil.autowidth(5),
  },
  logout:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(20),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(30),
  }
});

export default TradeDetails;