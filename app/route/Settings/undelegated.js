import React from "react";
import { connect } from "react-redux";
import { Dimensions,  StyleSheet, Image, View, Text, TextInput} from "react-native";
import UImage from "../../utils/Img";
import UColor from "../../utils/Colors";
import { Eos } from "react-native-eosjs";
import Header from '../../components/Header'
import Button from "../../components/Button";
import Constants from '../../utils/Constants';
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class undelegated extends BaseComponent {

  static navigationOptions = {
      headerTitle: "赎回问题",
      header:null,
  };
 
  //组件加载完成
  componentDidMount() {
    const c = this.props.navigation;
    this.props.dispatch({
      type: "wallet/getDefaultWallet",
      callback: data => {}
    });
    this.setState({
      toAccount: this.props.defaultWallet.account,
    });
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  // 构造函数
  constructor(props) {
    super(props);
    this.state = {
      toAccount: "",
      amount: "",
      memo: "",
      defaultWallet: null
    };
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  undelegatedRefund = () => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
       this.setState({ error: true,errortext: '请先创建并激活钱包' });
       EasyToast.show("请先创建并激活钱包");
       return;
    }; 
    this.dismissKeyboardClick();
    const view =
    <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
            selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
            style={[styles.inptpass,{ color: UColor.tintColor, backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]} 
            placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />

    </View>
    EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
    if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
        EasyToast.show('密码长度至少4位,请重输');
        return;
    }
    var privateKey = this.props.defaultWallet.activePrivate;
    try {
        var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
        var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
        if (plaintext_privateKey.indexOf('eostoken') != -1) {
            plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
            EasyShowLD.loadingShow();
            Eos.transaction({
                actions: [
                    {
                        account: "eosio",
                        name: "refund", 
                        authorization: [{
                        actor: this.props.defaultWallet.account,
                        permission: 'active'
                        }], 
                        data: {
                            owner: this.props.defaultWallet.account,
                        }
                    },
                ]
            }, plaintext_privateKey, (r) => {
                EasyShowLD.loadingClose();
                if(r.isSuccess){
                    EasyToast.show("赎回成功");
                }else{
                    if(r.data){
                      if(r.data.code){
                        var errcode = r.data.code;
                        if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                            || errcode == 3081001)
                        {
                          this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                            if(resp.code == 608)
                            { 
                                //弹出提示框,可申请免费抵押功能
                                const view =
                                <View style={styles.Explainout}>
                                  <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                  <Text style={[styles.Explaintext,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                </View>
                                EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                    
                                const { navigate } = this.props.navigation;
                                navigate('FreeMortgage', {});
                                // EasyShowLD.dialogClose();
                                }, () => { EasyShowLD.dialogClose() });
                            }
                        }});
                        }
                   　　 }
                        if(r.data.msg){
                            EasyToast.show(r.data.msg);
                        }else{
                            EasyToast.show("赎回失败");
                        }
                    }else{
                        EasyToast.show("赎回失败");
                    }
                }
            });

        } else {
            EasyShowLD.loadingClose();
            EasyToast.show('密码错误');
        }
    } catch (e) {
        EasyShowLD.loadingClose();
        EasyToast.show('未知异常');
    }
    // EasyShowLD.dialogClose();
    }, () => { EasyShowLD.dialogClose() });
  };

  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>   
          <Header {...this.props} onPressLeft={true} title="赎回问题" />  
          <View style={[styles.taboutsource,{backgroundColor: UColor.mainColor}]}>
              <Text style={[styles.accountTitle,{color: UColor.fontColor}]}>温馨提示：</Text>
              <Text style={[styles.accountText,{color: UColor.arrow}]}>主网赎回EOS存在少量网络冲突问题，可能导致</Text>
              <Text style={[styles.accountText,{color: UColor.arrow}]}>您的EOS赎回中途卡顿，如遇此情况请点击下面</Text>
              <Text style={[styles.accountText,{color: UColor.arrow}]}>按钮再次激活赎回指令!</Text>
              <Button onPress={this.undelegatedRefund.bind()} style={styles.btnnextstep}>
                <View style={[styles.nextstep,{backgroundColor: UColor.tintColor}]}>
                  <Text style={[styles.nextsteptext,{color: UColor.btnColor}]}>确认赎回</Text>
                </View>
              </Button>
          </View>
            <View style={styles.logout}>
                <Image source={UImage.bottom_log} style={styles.logimg}/>
                <Text style={[styles.logtext,{color: UColor.arrow}]}>ET 交易所</Text>
            </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  passoutsource: {
   flexDirection: 'column', 
    alignItems: 'center'
  },
  inptpass: {
    textAlign: "center",
    borderBottomWidth: 1,
    height: ScreenUtil.autoheight(45),
    fontSize: ScreenUtil.setSpText(16),
    paddingBottom: ScreenUtil.autoheight(5),
    width: ScreenWidth-ScreenUtil.autowidth(100),
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  taboutsource: {
    flexDirection: "column",
    padding: ScreenUtil.autowidth(10),
    marginTop: ScreenUtil.autoheight(20),
  },
  accountTitle: {
    textAlign: "left",
    height: ScreenUtil.autoheight(40),
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
    lineHeight: ScreenUtil.autoheight(20),
  },
  accountText: {
    textAlign: "left",
    height: ScreenUtil.autoheight(30),
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
    lineHeight: ScreenUtil.autoheight(20),
  },
  btnnextstep: {
    height: ScreenUtil.autoheight(85),
  },
  nextstep: {
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    height: ScreenUtil.autoheight(45),
    marginVertical: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(120),
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
  Explainout: {
    flexDirection: 'column', 
    alignItems: 'flex-start'
  },
  Explaintext: {
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30), 
  },
});
export default undelegated;
