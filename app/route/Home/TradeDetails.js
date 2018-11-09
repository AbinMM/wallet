import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, Image, Clipboard, Linking, Dimensions, ImageBackground} from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import HeaderWhite from '../../components/HeaderWhite'
import QRCode from 'react-native-qrcode-svg';
import ViewShot from "react-native-view-shot";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const UrlHead = "https://eoseco.com/search?q=";

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
      paramtrade.receivertitle = "收款账户";
    }else if(this.props.navigation.state.params.transaction){
      //来自转账界面
      paramtrade.receivertitle = "收款账户";
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
      //来自交易所界面
      paramtrade.receivertitle = "接受账户";
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
      paramtrade.receivertitle = "收款账户";
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
    this.state = {
      trade: paramtrade,
    };
  }



  componentDidMount() {
    //alert('trade: '+JSON.stringify(this.props.navigation.state.params));
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount(); 
  }

  prot(key, data = {}) {
    if (key == 'transactionId') {
      Linking.openURL(UrlHead + this.state.trade.transactionId);
    }else  if (key == 'from') {
      if(this.state.trade.from == null || this.state.trade.from == ""){
        return;
      }
      Linking.openURL(UrlHead + this.state.trade.from);
    }else  if (key == 'to') {
      if(this.state.trade.to == null || this.state.trade.to == ""){
        return;
      }
      Linking.openURL(UrlHead + this.state.trade.to);
    }else  if (key == 'blockNum') {
      if(this.state.trade.blockNum == null || this.state.trade.blockNum == ""){
        return;
      }
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
  
  getValueFromQuantity(quantity){

    var value ;
    try {
      var index = quantity.lastIndexOf(" ");
      if(index > 0)
      {
        value = quantity.substring(0,index);
        var unit =  quantity.substring(index+1,quantity.length);
      }else{
        value = quantity;
      }
    } catch (error) {
      value = quantity;
    }
 
    return value;
  }
  getUnitFromQuantity(quantity){
    var unit = '';
    try {
      var index = quantity.lastIndexOf(" ");
      if(index > 0)
      {
        unit =  quantity.substring(index+1,quantity.length);
      }else{
        unit = '';
      }
    } catch (error) {
      unit = '';
    }
 
    return unit;
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
       <HeaderWhite {...this.props} onPressLeft={true} title="交易详情" backgroundColors={UColor.transport} imgWidth={ScreenUtil.autowidth(21)} imgHeight={ScreenUtil.autowidth(21)}/>  
       <ImageBackground style={{width: ScreenWidth, height: ScreenWidth*0.7893,position:'absolute',top: 0,}} source={UImage.home_bg}/>
        <View style={[styles.header,]}>
          <View style={[styles.headout]}>
              <View style={ {flexDirection: 'row'}}>
              <Text style={[styles.quantitytext,{color: UColor.mainColor}]}>{this.getValueFromQuantity(this.state.trade.quantity)} </Text>
              <Text style={[{marginTop: ScreenUtil.autoheight(15),fontSize: ScreenUtil.setSpText(16),color: UColor.mainColor}]}>{this.getUnitFromQuantity(this.state.trade.quantity)} </Text>
              </View>
          </View>
          {this.state.trade.disptype == 0 && 
              <Text style={[styles.description,{color: UColor.mainColor}]}>({this.state.trade.description}{this.state.trade.bytes? this.state.trade.bytes + " bytes":""})</Text>
          }
          {this.state.trade.disptype == 1 && 
              <Text style={[styles.description,{color: UColor.mainColor}]}>{this.state.trade.type == 'selltoken'?'(卖)':'(买)'}</Text>
          }
          {this.state.trade.disptype == 2 && 
              <Text style={[styles.description,{color: UColor.mainColor}]}>{this.state.trade.type == 'buyram'?'(买)':'(卖)'}</Text>
          }
        </View>
      <View style={styles.taboutsource}>
          <View style={[styles.conouttext]}>
            <Text style={[styles.contwotext]}>{this.state.trade.receivertitle}</Text>
            <Text style={[styles.blocktext,{flex: 7}]} onPress={this.prot.bind(this, 'to')} onLongPress={this.copyaccount.bind(this, 'to')}>{this.state.trade.to}</Text>
          </View>
          <View style={[styles.conouttext]}>
            <Text style={[styles.contwotext]}>付款账户</Text>
            <Text style={[styles.blocktext,{flex: 7}]} onPress={this.prot.bind(this, 'from')} onLongPress={this.copyaccount.bind(this, 'from')}>{this.state.trade.from}</Text>
          </View>
          <View style={{height: ScreenUtil.autowidth(88), paddingVertical: ScreenUtil.autowidth(11), marginTop: 1,flexDirection: "row", alignItems: 'flex-start', justifyContent: 'center', backgroundColor: UColor.mainColor}}>
            <Text style={[styles.contwotext]}>备注(Memo)</Text>
            <Text style={[styles.blocktext,{flex: 7,lineHeight: ScreenUtil.autowidth(22), paddingRight: ScreenUtil.autowidth(15),color: UColor.arrow}]} numberOfLines={3} >{this.state.trade.memo}</Text>
          </View>
          <View style={[styles.conouttext,{  marginTop: 10,}]}>
            <Text style={[styles.contwotext,{ fontSize: ScreenUtil.setSpText(12),}]}>交易号</Text> 
            <Text style={[styles.tintext]} onPress={this.prot.bind(this, 'transactionId')}>{this.state.trade.transactionId.substring(0, 6) +"..."+ this.state.trade.transactionId.substr(this.state.trade.transactionId.length-6) }</Text>
          </View>
          <View style={[styles.conouttext,{ fontSize: ScreenUtil.setSpText(12),}]}> 
            <Text style={[styles.contwotext,{ fontSize: ScreenUtil.setSpText(12),}]}>区块高度</Text>
            <Text style={[styles.tintext]}>{(this.state.trade.blockNum != null || this.state.trade.blockNum != "") ? this.state.trade.blockNum : ""}</Text>
          </View>
          <View style={[styles.conouttext,]}>
            <Text style={[styles.contwotext,{ fontSize: ScreenUtil.setSpText(12),}]}>交易时间</Text>
            <Text style={[styles.tintext]}>{moment(this.state.trade.blockTime).add(8,'hours').format('YYYY-MM-DD HH:mm')}</Text>
          </View>
          <View style={[styles.conouttext]}>
            <Text style={[styles.contwotext,{ fontSize: ScreenUtil.setSpText(12),}]}>提示</Text>
            <Text style={[styles.tintext]}>扫码可获取区块交易状态</Text>
          </View>

        <View style={[styles.logout]}>
            <View style={[styles.qrcode,{backgroundColor: UColor.btnColor}]}>
              <QRCode size={ScreenUtil.setSpText(60)}  value={UrlHead + this.state.trade.transactionId } 
                logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(10)} logoBorderRadius={5}/>
            </View>
            <Text style={{ fontSize: ScreenUtil.setSpText(10),color: '#3B80F4',paddingHorizontal: ScreenUtil.autowidth(15),paddingVertical: ScreenUtil.autoheight(5),}}
                onPress={this.copy.bind(this,this.state.trade)}>复制链接</Text>
        </View>
      </View>
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
    // paddingVertical: ScreenUtil.autowidth(5),
    top:ScreenUtil.autoheight(15),
  },

  headout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: ScreenUtil.autowidth(10),
  },
  quantitytext: {
    fontWeight: '400',
    fontSize: ScreenUtil.setSpText(32),
  },
  headtext: {
    fontSize: ScreenUtil.setSpText(15),
    paddingTop: ScreenUtil.autoheight(10),
  },
  description: {
    height: ScreenUtil.autoheight(35),
    fontSize: ScreenUtil.setSpText(12),
  },
  conout: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  conouttext: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autowidth(36),
  },
  context: {
    flex: 2.5,
    textAlign: 'left',
    paddingLeft: ScreenUtil.autowidth(15),
    fontSize: ScreenUtil.setSpText(16),
    color: UColor.arrow,
  },
  contwotext: {
    fontWeight: '600',
    flex: 2.7,
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(15),
    color: UColor.tradedetail_prompt,
  },

  blocktext: {
    fontSize: ScreenUtil.setSpText(14),
    color: UColor.arrow,
  },
  showytext: {
    
    fontSize: ScreenUtil.setSpText(14),
  },
  tintext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autowidth(44),
    flex: 9,
    color: UColor.arrow,
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
    justifyContent: 'center',
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(30),
  },

  taboutsource: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.mainColor,
    marginTop:ScreenUtil.autoheight(24),
    marginHorizontal:ScreenUtil.autowidth(12),
    marginBottom:ScreenUtil.autowidth(16),
    borderRadius: 5,
},
});

export default TradeDetails;