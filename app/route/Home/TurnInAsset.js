import React from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter, Clipboard, StyleSheet, Image, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import UImage from "../../utils/Img";
import UColor from "../../utils/Colors";
import Header from '../../components/Header'
import QRCode from "react-native-qrcode-svg";
import Button from "../../components/Button";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
let dismissKeyboard = require("dismissKeyboard");

@connect(({ wallet }) => ({ ...wallet }))
class TurnInAsset extends BaseComponent {

  static navigationOptions = {
    headerTitle: "收款信息",
    header:null, 
  };

  _rightTopClick = () => {
    DeviceEventEmitter.emit(
      "turninShare",
      '{"toaccount":"' +
        this.props.defaultWallet.account +
        '","amount":"' +
        this.state.amount +
        '","symbol":"' +
        this.state.symbol +
        '", "contractAccount":"' +
        this.state.contractAccount +
        '"}'
    );
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
        <Header {...this.props} onPressLeft={true} title="收款信息" avatar={UImage.share_i} onPressRight={this._rightTopClick.bind()} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/> 
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.tab}>
          <View style={styles.taboutsource}>
            <View style={[styles.outsource,{backgroundColor:UColor.secdfont}]}>
              <View style={[styles.inptoutsource,{backgroundColor: UColor.mainColor}]}>
                <View style={{paddingHorizontal: ScreenUtil.autowidth(20),borderRightColor: UColor.secdColor,borderRightWidth: 1,}}>
                  {this.state.Choicesymbol ? 
                  <TouchableOpacity onPress={() => this.openChoiceToken()} style={{alignSelf: 'flex-end',justifyContent: "flex-end",}}>    
                      <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center',}}>                              
                          <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.arrow, marginRight: ScreenUtil.autowidth(5),lineHeight: ScreenUtil.autowidth(36),}}>{this.state.symbol}</Text>
                          <Ionicons color={UColor.fontColor} name="ios-arrow-down-outline" size={20} />
                      </View>
                  </TouchableOpacity>
                  :
                  <Text style={[styles.tokenText,{color: UColor.arrow}]}>{this.state.symbol}</Text>
                  }
                </View>
                <TextInput autoFocus={false} onChangeText={amount => this.setState({ amount: this.chkPrice(amount) })}
                  value = {this.state.amount} maxLength = {15} returnKeyType="go" selectionColor={UColor.tintColor}
                  style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip} placeholder="请输入金额(可不填)"
                  underlineColorAndroid="transparent" secureTextEntry={false} keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.codeout,{backgroundColor: UColor.mainColor}]}>
                <Text style={[styles.accountText,{color: UColor.fontColor}]}> 账户：{this.props.defaultWallet == null ? "" : this.props.defaultWallet.account}</Text>
                <View style={[styles.qrcode,{backgroundColor: UColor.btnColor,borderColor: UColor.secdColor }]}>
                  <QRCode size={170} style={{ width: 170 }} value = {this.getQRCode()} logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(35)} logoBorderRadius={5}/>
                </View>
                <Text style={[styles.prompttext,{color: UColor.fontColor}]}>扫描二维码向我付款</Text>
              </View>
              <Button onPress={this.copy.bind()} style={styles.btnnextstep}>
                <View style={[styles.nextstep,{backgroundColor: '#6DA0F8'}]}>
                  <Text style={[styles.nextsteptext,{color: UColor.btnColor}]}>复制账户</Text>
                </View>
              </Button>
              {/* <View style={styles.logout}>
                  <Image source={UImage.bottom_log} style={styles.logimg}/>
                  <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
              </View> */}
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
    flexDirection: "column"
  },
  outsource: {
    flexDirection: "column",
    //padding: ScreenUtil.autowidth(20),
    flex: 1
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
    marginTop: ScreenUtil.autoheight(10),
  },
  inptoutsource: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ScreenUtil.autoheight(12),
    marginVertical: ScreenUtil.autoheight(30),
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
    marginTop: ScreenUtil.autowidth(50),
    marginHorizontal: ScreenUtil.autowidth(20),
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
  },
  tab: {
    flex: 1
  },
});
export default TurnInAsset;
