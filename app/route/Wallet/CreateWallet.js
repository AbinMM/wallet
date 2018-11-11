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
import PasswordInput from '../../components/PasswordInput'
import TextButton from '../../components/TextButton'
import CheckMarkCircle from '../../components/CheckMarkCircle'

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
      isChecked: this.props.isChecked || false,
      integral: 0,
      weak: false,
      medium: false,
      strong: false,
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

  backupWallet(wallet) {
     // 备份私钥
     const { navigate } = this.props.navigation;
     navigate('BackupsWarning', {wallet: wallet, password: this.state.walletPassword, entry: "createWallet"});     
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
          var arr_key = [];
          var words_key = [];
          var wordsStr_key = '';
          for (var i = 0; i < 15; i++) {
            var randomNum = this.getx(arr_key);
            words_key.push(english[randomNum]);
          }
          for (var i = 0; i < arr_key.length; i++) {
            words_key[i] = english[arr_key[i]];
            wordsStr_key = wordsStr_key + "," + words_key[i];
          }
          
          Eos.seedPrivateKey(wordsStr_key, wordsStr_key, (result) => {
            if (result.isSuccess) {
              var salt;
              Eos.randomPrivateKey((r) => {
                salt = r.data.ownerPrivate.substr(0, 18);
                result.data.words = wordsStr_key;
                result.data.words_active = wordsStr_key;
                result.password = this.state.walletPassword;
                result.name = this.state.walletName;
                result.account = this.state.walletName;
                result.passwordNote = this.state.passwordNote;
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
    navigate('Web', { title: "服务及隐私条款", url: "http://news.eostoken.im/html/reg.html" });
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
        this.state.strong = true;
        this.state.medium = false;
        this.state.weak = false;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else{
          this.state.strong = false;
          this.state.medium = false;
          this.state.weak = true;
        }
      }
    }else{
      this.state.strong = false;
      this.state.medium = false;
      this.state.weak = false;
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
    return <View style={{flex: 1,flexDirection: 'column',backgroundColor: UColor.secdfont,}}>  
    <Header {...this.props} onPressLeft={true} title="创建钱包" />  
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : null} style={{flex: 1}}>
    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1}}>
        <View style={styles.header}>

          <View >
            <View style={styles.subTitleView} >
              <Text style={[styles.inputTitleStyle,{color: '#323232'}]}>账号名称</Text>
            </View>
            <View style={[styles.subTitleView,{backgroundColor: UColor.mainColor}]} >
              <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',}}>
                <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
                  selectionColor={UColor.tintColor} style={styles.inputTextStyle} placeholderTextColor={'#D9D9D9'} 
                  placeholder="输入a-z小写字母和1-5数字组合字符" underlineColorAndroid="transparent" onChange={this.intensity()} 
                  keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName:this.chkAccount(walletName) })} />
              </View>
            </View>

            <View style={styles.subTitleView} >
              <PasswordInput password={this.state.walletPassword} onCallbackFun={(walletPassword) => this.setState({ walletPassword })} 
              repeatpassword={this.state.reWalletPassword} onCallbackFunRepeat={(reWalletPassword) => this.setState({ reWalletPassword })}/>
            </View>

            <View style={[styles.subTitleView,]} >
              <Text style={[styles.inputTitleStyle,{color: '#323232'}]}>设置密码提示</Text>
            </View>
            <View style={[styles.subTitleView,{backgroundColor: UColor.mainColor}]} >
              <TextInput ref={(ref) => this._lnote = ref} value={this.state.passwordNote} selectionColor={UColor.tintColor} maxLength={40}
                returnKeyType="go" placeholderTextColor={'#D9D9D9'} placeholder="密码提示信息(可不填)"  style={styles.inputTextStyle} 
                underlineColorAndroid="transparent" onChangeText={(passwordNote) => this.setState({ passwordNote })}  />
            </View>
          </View>

          <View style={{flexDirection: 'row',marginTop: ScreenUtil.autowidth(15),marginBottom: ScreenUtil.autowidth(10),marginHorizontal: ScreenUtil.autowidth(20),}}>
            <CheckMarkCircle  width={ScreenUtil.autowidth(13)} height={ScreenUtil.autowidth(13)} selected={this.state.isChecked} onPress={() => this.checkClick()}/>
            <Text style={{fontSize: ScreenUtil.setSpText(12),lineHeight: ScreenUtil.autoheight(14),color: UColor.arrow}} > 我已经仔细阅读并同意 <Text onPress={() => this.prot()} style={{fontSize: ScreenUtil.setSpText(12),color: UColor.arrow}}>【服务及隐私条款】</Text></Text>
          </View>


          <View style={{flexDirection: "column",paddingVertical: ScreenUtil.autowidth(5),paddingHorizontal: ScreenUtil.autowidth(15),backgroundColor: UColor.mainColor}}>
            <Text style={[styles.warningTextStyle,{color: UColor.turnout_eos}]} >• 密码用于保护私钥和交易授权，建议设置高强度密码；</Text>
            <Text style={[styles.warningTextStyle,{color: UColor.turnout_eos}]} >• EosToken不存储密码，也无法帮您找回，请务必牢记。</Text>
          </View>

        <View style={{flex: 1, justifyContent: 'flex-end', marginHorizontal: ScreenUtil.autowidth(16), marginTop: ScreenUtil.autowidth(24),}}>
            <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',}}>
            <TextButton onPress={() => this.checkAccountAndCreateWallet()} textColor="#FFFFFF" text="确认"  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
          </View>
        </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  </View>
  }
}

const styles = StyleSheet.create({
  header: { 
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: ScreenUtil.autowidth(15),
    marginTop: ScreenUtil.autowidth(10),
    marginBottom: ScreenUtil.autowidth(23),
    borderRadius: 12,
    backgroundColor: UColor.mainColor,
    paddingBottom:ScreenUtil.autowidth(55),
  },

  warningTextStyle: {
    marginLeft: ScreenUtil.autowidth(10),
    fontSize: ScreenUtil.setSpText(10), 
    lineHeight: ScreenUtil.autoheight(25),
  },
  subTitleView: {
    paddingTop:ScreenUtil.autowidth(15),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },

  inputTitleStyle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(16),
    lineHeight: ScreenUtil.autoheight(23),
    // fontWeight:"bold"
  },
  inputTextStyle: {
    flex: 1,
    paddingVertical: 0,
    borderBottomWidth:0.5,
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
    paddingTop: ScreenUtil.autowidth(10), 
    color: '#808080',
    borderBottomColor: '#D5D5D5'
  },

});

export default createWallet;