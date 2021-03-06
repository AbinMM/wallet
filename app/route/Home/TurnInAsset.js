import React from "react";
import { connect } from "react-redux";
import {Dimensions, Platform, DeviceEventEmitter, Clipboard, StyleSheet, Image, ImageBackground, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import UImage from "../../utils/Img";
import UColor from "../../utils/Colors";
import Header from '../../components/Header'
import QRCode from "react-native-qrcode-svg";
import Button from "../../components/Button";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
import TextButton from '../../components/TextButton';
let dismissKeyboard = require("dismissKeyboard");
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet }) => ({ ...wallet }))
class TurnInAsset extends BaseComponent {

  static navigationOptions = {
    headerTitle: "收款信息",
    header:null, 
  };

  _rightTopClick = () => {
    // DeviceEventEmitter.emit(
    //   "turninShare",
    //   '{"toaccount":"' +
    //     this.props.defaultWallet.account +
    //     '","amount":"' +
    //     this.state.amount +
    //     '","symbol":"' +
    //     this.state.symbol +
    //     '", "contractAccount":"' +
    //     this.state.contractAccount +
    //     '"}'
    // );

    var  turninAsset = {
      toaccount: this.props.defaultWallet.account,
      amount: this.state.amount,
      symbol: this.state.symbol,
      contractAccount: this.state.contractAccount
    }

    const { navigate } = this.props.navigation;
    navigate('Shareing', {turninAsset});
  };

  // 构造函数
  constructor(props) {
    super(props);
    this.state = {
      toAccount: "", //钱包账户
      symbol: "", //币种
      amount: "", //数量
      contractAccount: "", //契约帐户
      Choicesymbol: this.props.navigation.state.params.Choicesymbol, //是否具有选择币种功能
    };
  }

  //组件加载完成
  componentDidMount() {
    this.props.dispatch({ type: "wallet/getDefaultWallet",callback: () => {}});
    var params = this.props.navigation.state.params.coins;
    if(params != null){
      this.setState({
        symbol: params.asset.name,
        contractAccount: params.asset.contractAccount,
        toAccount: this.props.defaultWallet == null ? "" : this.props.defaultWallet.account,
      });
    }
    
    //选择代币返回的数据
    DeviceEventEmitter.addListener('transfer_token_result', (data) => {
      this.setState({
          symbol:data.asset.name,
          contractAccount: data.asset.contractAccount,
      });
    });
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  copy = () => {
    let address = this.props.defaultWallet.account;
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  };
  
  chkPrice(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    try {
      value = parseFloat(obj);
    } catch (error) {
      value = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    return obj;
  }

  //生成二维码
  getQRCode(){ 
    var lowerstr;
    var upperstr;
    if(this.state.symbol == null || this.state.symbol == ""){
        lowerstr = "";
        upperstr = "";
    }else{
        lowerstr = this.state.symbol.toLowerCase();
        upperstr = this.state.symbol.toUpperCase();
    }
    var qrcode = lowerstr +':' + this.props.defaultWallet.account + '?amount=' + ((this.state.amount == "")?'0':this.state.amount) + '&contractAccount=' + this.state.contractAccount + '&token=' + upperstr ;
    return qrcode;
  }

  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
  };

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  // 选择代币
  openChoiceToken() {
    const { navigate } = this.props.navigation;
    navigate('ChoiceToken', {isTurnOut:true,coinType:this.state.symbol});
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
        <Header {...this.props} onPressLeft={true} title="收款" avatar={UImage.share_i} onPressRight={this._rightTopClick.bind()} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/> 
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex:1,}}>
          <View style={styles.taboutsource}>
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}>收款金额</Text>
              <View style={[styles.inptoutsource,{backgroundColor: UColor.mainColor,borderBottomColor: UColor.secdColor,}]}>
                <View style={{borderRightColor: UColor.secdColor,borderRightWidth: ScreenUtil.autowidth(1),}}>
                  {this.state.Choicesymbol ? 
                  <TouchableOpacity onPress={() => this.openChoiceToken()} style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center', paddingRight: ScreenUtil.autowidth(10),}}>    
                    <Text style={{fontSize: ScreenUtil.setSpText(14),color: UColor.fontColor, marginRight: ScreenUtil.autowidth(5),lineHeight: ScreenUtil.autowidth(25),}}>{this.state.symbol}</Text>
                    <Ionicons color={UColor.fontColor} name="md-arrow-dropdown" size={20} />
                  </TouchableOpacity>
                  :
                  <Text style={[styles.tokenText,{color: UColor.arrow}]}>{this.state.symbol}</Text>
                  }
                </View>
                <TextInput autoFocus={false} onChangeText={amount => this.setState({ amount: this.chkPrice(amount) })}
                  value = {this.state.amount} maxLength = {15} returnKeyType="go" selectionColor={UColor.tintColor}
                  style={[styles.inpt,{color: '#808080'}]} placeholderTextColor={'#D9D9D9'} keyboardType="numeric"
                  underlineColorAndroid="transparent" secureTextEntry={false}  placeholder="请输入收款金额" 
                />
              </View>
              <View style={{alignItems: 'center', justifyContent: 'center',paddingVertical: ScreenUtil.autoheight(40)}}>
                <View style={[styles.qrcode,{backgroundColor: UColor.btnColor,borderColor: UColor.secdColor }]}>
                  <QRCode size={ScreenUtil.autowidth(170)}  value = {this.getQRCode()} logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(35)} logoBorderRadius={5}/>
                </View>
              </View>
              
              <Text style={[styles.prompttext,{color: UColor.fontColor}]}>{this.state.toAccount}</Text>
              <View style={{marginTop: ScreenUtil.autowidth(19), justifyContent: 'center', alignItems:'center'}}>
                  <TextButton text='复制收款账号' onPress={this.copy.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
              </View>
              
          
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <ImageBackground style={{width: ScreenWidth - ScreenUtil.autowidth(30) , height: (ScreenWidth - ScreenUtil.autowidth(30))*0.2521}} source={UImage.bottom_turnin}>
                  <View style={styles.logout}>
                    <Text style={[styles.logtext,{color: UColor.mainfont, textAlign:"right"}]}>我也用ET钱包</Text>
                    <Text style={[styles.logtext,{color: UColor.mainfont, textAlign:"right", paddingBottom: ScreenUtil.autowidth(14),}]}>eostoken.im</Text>
                  </View>
              </ImageBackground>
            </View>
          </View>   
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    flexDirection: "column",
  },
  taboutsource: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: UColor.mainColor,
    marginTop: ScreenUtil.autowidth(10),
    marginBottom: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  accountoue: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: ScreenUtil.autowidth(20),
  },
  inptitle: {
    fontSize: ScreenUtil.setSpText(16),
    paddingTop: ScreenUtil.autoheight(26),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },

  accountText: {
    textAlign: "left",
    height: ScreenUtil.autoheight(40),
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
    lineHeight: ScreenUtil.autoheight(40),
  },
  codeout: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: ScreenUtil.autowidth(10),
  },
  qrcode: {
    padding: ScreenUtil.autowidth(5),
    borderRadius: 3,
    borderWidth:0.5,
  },
  prompttext: {
    textAlign: "center",
    height: ScreenUtil.autoheight(30),
    fontSize: ScreenUtil.setSpText(18),
    marginTop: ScreenUtil.autoheight(6),
  },
  inptoutsource: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth:ScreenUtil.autowidth(1),
    paddingVertical: ScreenUtil.autoheight(5),
    marginHorizontal: ScreenUtil.autowidth(20),
  },
  tokenText: {
    textAlign: "left",
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
    lineHeight: ScreenUtil.autoheight(36),
  },
  inpt: {
    flex: 1,
    textAlign: "left",
    paddingVertical: 0,
    fontSize: ScreenUtil.setSpText(16),
    paddingLeft: ScreenUtil.autowidth(15),
  },
  btnnextstep: {
    marginTop: ScreenUtil.autowidth(10),
    marginHorizontal: ScreenUtil.autowidth(20),
    alignItems: 'center',
  },
  nextstep: {
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    height: ScreenUtil.autoheight(50),
  },
  nextsteptext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  logout:{
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(10),
    paddingRight: ScreenUtil.autowidth(15),
  },
  tab: {
    flex: 1
  },
});
export default TurnInAsset;
