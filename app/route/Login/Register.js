import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Dimensions, View, Text, ScrollView, Image, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import UImage from '../../utils/Img';
import {kapimg} from '../../utils/Api'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import {encryptedMsg} from '../../utils/AlgoUtil';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import LinearGradient from 'react-native-linear-gradient'
import BaseComponent from "../../components/BaseComponent";

import PasswordInput from '../../components/PasswordInput'
var tick=60;
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({login}) => ({...login}))
class Register extends BaseComponent {

  static navigationOptions = {
    title: '注册',
    header:null, 
  };

  state = {
    phone:"",
    code:"",
    password:"",
    repeatpassword: "",
    invite: "",
    capture:'获取验证码',
    img:Constants.rootaddr+kapimg,
    kcode:"",
    captureState: false,

    weak: false,
    medium: false,
    strong: false,
    statetext: "",
  }

  constructor(props) {
    super(props);
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  regSubmit = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.code == "") {
      EasyToast.show('请输入验证码');
      return;
    }
    if (this.state.password == "" || this.state.password.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
      return;
    }
    EasyShowLD.loadingShow('注册中...');
    this.props.dispatch({
      type: 'login/register', payload: { phone: encryptedMsg(this.state.phone), password: encryptedMsg(this.state.password), code: this.state.code, invite: this.state.invite }, callback: (data) => {
        EasyShowLD.loadingClose();
        if (data.code == 0) {
          EasyToast.show("注册成功");
          this.props.navigation.goBack();
          AnalyticsUtil.onEvent('register_ok');
        } else {
          EasyToast.show(data.msg);
        }
      }
    })
  }

  refresh = () =>{
    EasyShowLD.dialogClose();
    this.kcaptrue();
  }

  loaderror = () =>{
    EasyToast.show('未能获取图形验证码，请检查网络！');
  }

  kcaptrue = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    if (this.state.password == "" || this.state.password.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.repeatpassword == "" || this.state.repeatpassword.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.password != this.state.repeatpassword) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if(this.state.captureState){
      return;
    }
    let img = Constants.rootaddr+kapimg+this.state.phone+"?v="+Math.ceil(Math.random()*100000);
    const view = 
      <View style={styles.countout}>
          <Button onPress={()=>{this.refresh()}}>
             <Image onError={(e)=>{this.loaderror()}} style={styles.countimg} source={{uri:img}} />
          </Button>
          <TextInput autoFocus={true} onChangeText={(kcode) => this.setState({kcode})} returnKeyType="go" 
              selectionColor={UColor.tintColor} keyboardType="ascii-capable"  maxLength={8}
              style={[styles.countinpt,{color: UColor.tintColor,backgroundColor: UColor.riceWhite,}]} 
              placeholderTextColor={UColor.inputtip} placeholder="请输入计算结果" underlineColorAndroid="transparent" 
          />
      </View>
      EasyShowLD.dialogShow("计算结果",view,"获取","取消",()=>{
      if(this.state.kcode==""){
        EasyToast.show('请输入计算结果');
        return;
      }
      this.getCapture();
    },()=>{EasyShowLD.dialogClose()});
  }

  getCapture = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
    }
    if (this.state.kcode == "") {
      EasyToast.show('请输入验证码');
      return;
    }
    if (this.state.captureState) {
      return;
    }
    var th = this;
    EasyShowLD.loadingShow('查询中...');
    this.props.dispatch({
      type: 'login/existRegisteredUser', payload: { phone: this.state.phone, code: this.state.kcode }, callback: (data) => {
        EasyShowLD.loadingClose();
        if (data.code == '0' && data.data == false) {
          EasyShowLD.loadingShow('获取中...');
          this.props.dispatch({
            type: 'login/getCapture', payload: { phone: this.state.phone, code: this.state.kcode }, callback: (data) => {
              EasyShowLD.loadingClose();
              if (data.code == 0) {
                EasyToast.show("验证码已发送，请注意查收");
                th.setState({ capture: "60s", captureState: true });
                th.doTick();
                EasyShowLD.dialogClose();
              } else {
                EasyToast.show(data.msg);
                if (data.code != 505) {
                  EasyShowLD.dialogClose();
                }
              }
            }
          });

        } else {
          EasyToast.show("该号码已被注册过");
        }
      }
    });
  }

  kcaptrue = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
      return;
    }
    if (this.state.password == "" || this.state.password.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.repeatpassword == "" || this.state.repeatpassword.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.password != this.state.repeatpassword) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.captureState) {
      return;
    }
    let img =Constants.rootaddr+ kapimg + this.state.phone + "?v=" + Math.ceil(Math.random() * 100000);
    const view = <View style={{ flexDirection: 'row' }}>
    <Button onPress={() => { this.refresh() }}>
      <Image onError={(e) => { this.loaderror() }} style={styles.butimg} source={{ uri: img }} />
    </Button>
    <TextInput autoFocus={true} onChangeText={(kcode) => this.setState({ kcode })} returnKeyType="go" placeholderTextColor={UColor.inputtip}
      selectionColor={UColor.tintColor} style={[styles.inp,{ color: UColor.tintColor,backgroundColor: UColor.riceWhite,}]}   
      keyboardType="phone-pad" placeholder="请输入计算结果" underlineColorAndroid="transparent" maxLength={8} />
    </View>
    EasyShowLD.dialogShow("计算结果", view, "获取", "取消", () => {
      if (this.state.kcode == "") {
        EasyToast.show('请输入计算结果');
        return;
      }
      EasyShowLD.dialogClose();
      this.getCapture();
    }, () => { EasyShowLD.dialogClose() });
  }

  regSubmit = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
      return;
    }
    if (this.state.password == "" || this.state.password.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.repeatpassword == "" || this.state.repeatpassword.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.password != this.state.repeatpassword) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.code == "") {
      EasyToast.show('请输入验证码');
      return;
    }
    
    EasyShowLD.loadingShow('注册中...');
    this.props.dispatch({
      type: 'login/register', payload: { phone: encryptedMsg(this.state.phone), password: encryptedMsg(this.state.password), code: this.state.code, invite: this.state.invite }, callback: (data) => {
        EasyShowLD.loadingClose();
        if (data.code == 0) {
          EasyToast.show("注册成功");
          this.props.navigation.goBack();
          AnalyticsUtil.onEvent('register_ok');
        } else {
          EasyToast.show(data.msg);
        }
      }
    })
  }

  intensity() {
    let string = this.state.password;
    if(string.length >=7) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.statetext = '很棒';
        this.state.strong = true;
        this.state.medium = true;
        this.state.weak = true;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else{
          this.state.statetext = '还行';
          this.state.strong = false;
          this.state.medium = false;
          this.state.weak = true;
        }
      }
    }else{
      this.state.statetext = "";
      this.state.strong = false;
      this.state.medium = false;
      this.state.weak = false;
    }
   
  }

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "注册协议", url: "http://news.eostoken.im/html/reg.html" });
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (<View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
    <Header {...this.props} onPressLeft={true} title="注册" />
    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
        <View style={[styles.outsource,{backgroundColor: '#FFFFFF'}]}>
          <Text style={[styles.inptitle,{color: '#323232'}]}>手机号</Text>
          <TextInput ref={(ref) => this._rphone = ref} value={this.state.phone} returnKeyType="next" 
            selectionColor={UColor.tintColor} style={[styles.inpt,{color: '#D9D9D9',borderBottomWidth:0.5, borderBottomColor: '#D5D5D5'}]} placeholderTextColor={UColor.inputtip} 
            placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
            onChangeText={(phone) => this.setState({ phone })}/>
            
            <PasswordInput password={this.state.password} onCallbackFun={(password) => this.setState({ password })} 
            repeatpassword={this.state.repeatpassword} onCallbackFunRepeat={(repeatpassword) => this.setState({ repeatpassword })}/>
        
          <View style={[styles.vfanout,]}>
            <View style={styles.vfantext} >
              <Text style={[styles.inptitle,{color: '#323232'}]}>验证码</Text>
              <TextInput ref={(ref) => this._rcode = ref} value={this.state.code} returnKeyType="next" 
                selectionColor={UColor.tintColor} style={[styles.inpt,{color: '#D9D9D9'}]} placeholderTextColor={UColor.inputtip}
                placeholder="请输入验证码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={6}
                onChangeText={(code) => this.setState({ code })}/>
            </View>
            <View style={styles.verificationout}>
              <Button onPress={() => this.kcaptrue()}>
                <View style={[styles.verification,{borderColor: '#3B80F4'}]}>
                  <Text style={[styles.verificationtext,{color: '#3B80F4'}]}>{this.state.capture}</Text>
                </View>
              </Button>
            </View>
          </View>
          <View style={[styles.separate,{backgroundColor: '#D5D5D5'}]} />
          <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',}}>
              <Button onPress={() => this.regSubmit()}>
                <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.butout} >
                  <Text style={[styles.buttext,{color: '#FFFFFF'}]}>注册</Text>
                </LinearGradient>
              </Button>
          </View>
          <View style={styles.readout}>
            <Text style={[styles.readtext,{color: '#808080'}]}>注册即表示同意</Text>
            <Text onPress={() => this.prot()} style={[styles.servicetext,{color: '#3B80F4'}]}>EosToken用户协议</Text>
          </View>
        </View>
    </TouchableOpacity>
  </View>)
  }
}

const styles = StyleSheet.create({
  butimg: { 
    width: ScreenUtil.autowidth(100), 
    height: ScreenUtil.autowidth(45), 
  },
  inp: {
    textAlign: "center",
    width: ScreenUtil.autowidth(120),
    height: ScreenUtil.autoheight(45),
    fontSize: ScreenUtil.setSpText(15),
    marginLeft: ScreenUtil.autowidth(10),
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  outsource: {
    borderRadius: 6,
    flexDirection: 'column',
    marginTop: ScreenUtil.autowidth(15),
    marginHorizontal: ScreenUtil.autowidth(15),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },

  inptout: {
    marginVertical: ScreenUtil.autowidth(20),
  },
  
  textinpt: {
    paddingVertical: 0,
    borderBottomWidth:0.5,
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
    paddingTop: ScreenUtil.autowidth(24), 
  },
  inpt: {
    paddingVertical: 0,
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  inptitle: {
    fontSize: ScreenUtil.setSpText(16), 
    marginVertical: ScreenUtil.autowidth(20),
  },
  separate: {
    height: 0.5,
  },
  forgetpass: {
    flexDirection: "row",
    justifyContent: 'flex-end',
    padding: ScreenUtil.autowidth(20),
  },
  forgettext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  vfanout: {
    flexDirection: 'row',
  },
  vfantext: {
    flex: 1,
  },
  verificationout: {
    alignItems: 'center',
    justifyContent: "flex-end",
    paddingBottom:  ScreenUtil.autowidth(3),
  },
  verification: {
    borderRadius: 1,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(69),
    height: ScreenUtil.autoheight(18),
  },
  verificationtext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  butout: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(175),
    height: ScreenUtil.autoheight(42),
    borderRadius: ScreenUtil.autowidth(21),
  },
  buttext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ScreenUtil.autoheight(30),
  },
  readtext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(12),
    paddingLeft: ScreenUtil.autowidth(5),
  },

  logoutone:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: ScreenUtil.autoheight(320),
    paddingBottom: ScreenUtil.autoheight(100),
  },
  logouttow:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(100),
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

export default Register;
