import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, ScrollView, Image, Platform, TextInput, TouchableOpacity, TouchableHighlight, KeyboardAvoidingView } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import { english } from '../../utils/english';
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class createWallet extends BaseComponent {

  static navigationOptions = {
    title: '创建钱包',
    header:null,  
  };
  
  constructor(props) {
    super(props);
    this.state = {
      walletName: "",
      walletPassword: "",
      reWalletPassword: "",
      passwordNote: "",
      isChecked: this.props.isChecked || true,
      integral: 0,
      weak: UColor.arrow,
      medium: UColor.arrow,
      strong: UColor.arrow,
      CreateButton:  UColor.mainColor,
      errorcode: '',
      errormsg: '',
    }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
      this.setState({integral: data.data});
    } });
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  importKey() {
     // 钱包
     const { navigate } = this.props.navigation;
    navigate('ImportKey', {});
  }
  
  importWallet() {
    // 导入钱包
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey',{});
    // EasyToast.show('测试网络暂不开放');
  }
  backupWallet(wallet) {
     // 备份私钥
     const { navigate } = this.props.navigation;
     navigate('BackupsPkey', {wallet: wallet, password: this.state.walletPassword, entry: "createWallet"});
  }
  importAPkey() {
     // 账号支付激活
     const { navigate } = this.props.navigation;
     navigate('APactivation', {});
  }

  checkAccountAndCreateWallet(){
    AnalyticsUtil.onEvent('Create_wallet');
    const { dispatch } = this.props;
    if (this.state.walletName == "") {
      EasyToast.show('请输入钱包名称');
      return;
    }
    if(this.state.walletName.length != 12 ){
      EasyToast.show("钱包名称只能输入12位小写字母a-z和数字1-5");
      return;
    }
    if(this.state.walletName.length == 12 && !/^[1-5a-z.]+$/.test(this.state.walletName)){
      EasyToast.show("钱包名称只能输入12位小写字母a-z和数字1-5");
      return;
    }
    if (this.state.walletPassword == "" || this.state.walletPassword.length < 8) {
      EasyToast.show('钱包密码长度至少8位,请重输');
      return;
    }
    if (this.state.reWalletPassword == "" || this.state.reWalletPassword.length < 8) {
      EasyToast.show('钱包密码长度至少8位,请重输');
      return;
    }
    if (this.state.walletPassword != this.state.reWalletPassword) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.isChecked == false) {
      EasyToast.show('请确认已阅读并同意条款');
      return;
    }

    try {
      // 检测账号是否已经在EOS主网上存在
      EasyShowLD.loadingShow();
      this.props.dispatch({type: 'wallet/isExistAccountName', payload: {account_name: this.state.walletName}, callback: (resp) => {
        EasyShowLD.loadingClose();
        if(resp.code == '0'){ 
          // 账户已被注册, 异常处理
          EasyToast.show("账号已被别人占用，请换个账号吧！");
        }else if(resp.code == 500){
          EasyToast.show(resp.msg);
        }else{
          // 创建未激活钱包，并进入备份私钥流程
          var arr_owner = [];
          var arr_active = [];
          var words_owner = [];
          var words_active = [];
          var wordsStr_owner = '';
          var wordsStr_active = '';
          for (var i = 0; i < 15; i++) {
            var randomNum = this.getx(arr_owner);
            words_owner.push(english[randomNum]);
          }
          for (var i = 0; i < arr_owner.length; i++) {
            words_owner[i] = english[arr_owner[i]];
            wordsStr_owner = wordsStr_owner + "," + words_owner[i];
          }
          for (var i = 0; i < 15; i++) {
            var randomNum = this.getx(arr_active);
            words_active.push(english[randomNum]);
          }
          for (var i = 0; i < arr_active.length; i++) {
            words_active[i] = english[arr_active[i]];
            wordsStr_active = wordsStr_active + "," + words_active[i];
          }
          Eos.seedPrivateKey(wordsStr_owner, wordsStr_active, (result) => {
            if (result.isSuccess) {
              var salt;
              Eos.randomPrivateKey((r) => {
                salt = r.data.ownerPrivate.substr(0, 18);
                result.data.words = wordsStr_owner;
                result.data.words_active = wordsStr_active;
                result.password = this.state.walletPassword;
                result.name = this.state.walletName;
                result.account = this.state.walletName;
                result.salt = salt;
                result.isactived = false;
                result.isBackups = false;
                this.props.dispatch({
                  type: 'wallet/saveWallet',
                  wallet: result,
                  callback: (wallet) => {
                    EasyShowLD.loadingClose();
                    this.backupWallet(wallet);
                  }
                });
              });
            }
          });
        }
      }});
    } catch (error) {
      EasyToast.show(error);
      EasyShowLD.loadingClose();
    }
  }

  ExplainPopup(){
    EasyShowLD.dialogShow("EOS账号创建说明", (<View>
      <View style={{flexDirection: 'column', marginBottom: 10,}}>
        <Text style={{textAlign: 'left', color: UColor.showy,}}>生成账号失败：{this.state.errormsg}</Text>
        <Text style={{textAlign: 'left', color: UColor.showy,}}>错误码：{this.state.errorcode}</Text>
      </View>
      <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>1.如果您没有注册EosToken账号，创建的EOS钱包将无法激活</Text>
      <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>2.激活EOS钱包需达到{this.state.integral}点积分（每个用户仅限一个）</Text>
      <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>3.活跃用户每天均可获得对应的积分（详情参考积分细则）</Text>
      <Text style={[styles.Becarefultext,{color: UColor.showy}]}>注意：不要向未激活的钱包进行转账！</Text>
    </View>), "知道了", null, () => {
      EasyShowLD.dialogClose();
      this.props.navigation.goBack();
    }, () => { EasyShowLD.dialogClose() });
  }

  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
    this._lrpass.blur();
    this._lnote.blur();
  }

  getx(arr) {
    for (var i = 0; i > -1; i++) {
      var flag = true;
      var num = Math.floor(Math.random() * english.length);
      for (var i in arr) {
        if (arr[i] == num) {
          flag = false;
          break;
        }
      }
      if (flag == true) {
        arr.push(num);
        return arr;
      }
    }
  }

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
  }


  checkClick() {
    this.setState({
      isChecked: !this.state.isChecked
    });
  }

  intensity() {
    let string = this.state.walletPassword;
    if(string.length >=8) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.strong = UColor.tintColor;
        this.state.medium = UColor.arrow;
        this.state.weak = UColor.arrow;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else{
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.arrow;
          this.state.weak = UColor.tintColor;
        }
      }
     }else{
      this.state.strong = UColor.arrow;
      this.state.medium = UColor.arrow;
      this.state.weak = UColor.arrow;
     }
    if(this.state.walletName != "" && this.state.walletPassword != "" && this.state.reWalletPassword != ""){
      this.state.CreateButton = UColor.tintColor;
    }else{
      this.state.CreateButton = UColor.invalidbtn;
    }
  }

  chkAccount(obj) {
    var charmap = '12345abcdefghijklmnopqrstuvwxyz';
    for(var i = 0 ; i < obj.length;i++){
        var tmp = obj.charAt(i);
        for(var j = 0;j < charmap.length; j++){
            if(tmp == charmap.charAt(j)){
                break;
            }
        }
        if(j >= charmap.length){
            //非法字符
            obj = obj.replace(tmp, ""); 
            EasyToast.show('请输入正确的账号');
        }
    }

    return obj;
}

  random() {
    var data=['1','2','3','4','5','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']         
    for(var j=0;j<500;j++){
      var result=""; 
      for(var i=0;i<12;i++){  
        r=Math.floor(Math.random()*31); 
        result+=data[r];         
      } 
      this.setState({walletName:result})
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{ backgroundColor: UColor.secdColor,}]}>  
    <Header {...this.props} onPressLeft={true} title="创建钱包" />  
    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
          <View style={[styles.significantout,{backgroundColor: UColor.mainColor,borderColor: UColor.riseColor}]}>
            <View style={{flexDirection: 'row',alignItems: 'center',}}>
              <Image source={UImage.warning_h} style={styles.imgBtn} />
              <Text style={[styles.statementtext,{color: UColor.riseColor}]} >重要声明</Text>
            </View>
            <Text style={[styles.significanttext,{color: UColor.riseColor}]} >密码用于保护私钥和交易授权，建议设置高强度密码；EosToken不存储密码，也无法帮您找回，请务必牢记。</Text>
          </View>
          <View style={{backgroundColor: UColor.mainColor,}}>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderBottomColor: UColor.secdColor}]} >
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}>账号名称</Text>
              <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',}}>
                <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                  placeholder="输入a-z小写字母和1-5数字组合字符" underlineColorAndroid="transparent" onChange={this.intensity()} 
                  keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName:this.chkAccount(walletName) })} />
                <Button onPress={() => this.random()}>
                  <View style={{width: ScreenUtil.autowidth(60), height: ScreenUtil.autoheight(35),justifyContent: 'center',alignItems: 'center',borderRadius: 3, backgroundColor: UColor.tintColor,}}>
                    <Text style={[styles.createWallet,{color: UColor.btnColor}]}>随机</Text>
                  </View>
                </Button>
              </View>
            </View>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderBottomColor: UColor.secdColor}]} >
                <View style={{flexDirection: 'row',}}>
                  <Text style={[styles.inptitle,{color: UColor.fontColor}]}>设置密码</Text>
                  <View style={{flexDirection: 'row',}}>
                      <Text style={{color:this.state.weak, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>弱</Text>
                      <Text style={{color:this.state.medium, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>中</Text>
                      <Text style={{color:this.state.strong, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>强</Text>
                  </View>
                </View>
                <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletPassword}  returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow}  
                    onChangeText={(walletPassword) => this.setState({walletPassword})} onChange={this.intensity()} autoFocus={false}
                    placeholder="输入密码至少8位,建议大小字母与数字混合" underlineColorAndroid="transparent" secureTextEntry={true} 
                    maxLength={Constants.PWD_MAX_LENGTH}/>
            </View>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderBottomColor: UColor.secdColor}]} >
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}>确认密码</Text>
              <TextInput ref={(ref) => this._lrpass = ref} value={this.state.reWalletPassword} returnKeyType="next"
                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow}
                placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} onChange={this.intensity()} 
                onChangeText={(reWalletPassword) => this.setState({ reWalletPassword })}  autoFocus={false} editable={true}
                maxLength={Constants.PWD_MAX_LENGTH}/>
            </View>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderBottomColor: UColor.secdColor}]} >
              <TextInput ref={(ref) => this._lnote = ref} value={this.state.passwordNote} selectionColor={UColor.tintColor} maxLength={40}
                returnKeyType="go" placeholderTextColor={UColor.arrow} placeholder="密码提示(可不填)"  style={[styles.inpt,{color: UColor.arrow}]} 
                underlineColorAndroid="transparent" onChangeText={(passwordNote) => this.setState({ passwordNote })}  />
            </View>
          </View>
          <View style={styles.clauseout}>
            <TouchableHighlight  onPress={() => this.checkClick()} activeOpacity={0.5} underlayColor={UColor.secdColor}>
              <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={styles.clauseimg} />
            </TouchableHighlight>
            <Text style={[styles.welcome,{color: UColor.arrow}]} >我已经仔细阅读并同意 <Text onPress={() => this.prot()} style={[styles.clausetext,{color: UColor.tintColor}]}>服务及隐私条款</Text></Text>
          </View>
        </KeyboardAvoidingView>
        <Button onPress={() => this.checkAccountAndCreateWallet()}>
          <View style={styles.createWalletout} backgroundColor = {this.state.CreateButton}>
            <Text style={[styles.createWallet,{color: UColor.btnColor}]}>创建钱包</Text>
          </View>
        </Button>
      </TouchableOpacity>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
  inptpasstext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(20),
    marginBottom: ScreenUtil.autoheight(15),
  },
  Becarefultext: {
     fontSize: ScreenUtil.setSpText(12),
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  significantout: {
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center', 
    flexDirection: "column",
    padding: ScreenUtil.autowidth(5),
    marginVertical: ScreenUtil.autoheight(16),
    marginHorizontal: ScreenUtil.autowidth(20),
  },
  imgBtn: {
    width: ScreenUtil.autowidth(25),
    height: ScreenUtil.autowidth(25),
    marginRight: ScreenUtil.autowidth(10),
  },
  statementtext: {
    fontWeight: "bold",
    fontSize: ScreenUtil.setSpText(16), 
  },
  significanttext: {
    fontSize: ScreenUtil.setSpText(12), 
    lineHeight: ScreenUtil.autoheight(20),
  },
  inptout: {
    borderBottomWidth: 1,
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  inptitle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(5),
    lineHeight: ScreenUtil.autoheight(30),
  },
  inpt: {
    flex: 1,
    height: ScreenUtil.autoheight(50),
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  clauseout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ScreenUtil.autoheight(20),
  },
  clauseimg: { 
    width: ScreenUtil.autowidth(20), 
    height: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(10), 
  },
  welcome: {
    fontSize: ScreenUtil.setSpText(14),
  },
  clausetext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  createWalletout: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(45),
    marginHorizontal: ScreenUtil.autowidth(20),
    marginVertical: ScreenUtil.autoheight(20),
  },
  createWallet: {
    fontSize: ScreenUtil.setSpText(15),
  },
});

export default createWallet;