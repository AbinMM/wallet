import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Image, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UImage from '../../utils/Img';
import UColor from '../../utils/Colors'
import { kapimg } from '../../utils/Api'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import {encryptedMsg} from '../../utils/AlgoUtil';
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from "../../components/EasyShow"
import LinearGradient from 'react-native-linear-gradient'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var tick = 60;
var dismissKeyboard = require('dismissKeyboard');

@connect(({ login }) => ({ ...login }))
class Login extends BaseComponent {

  static navigationOptions = {
    title: '登陆',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
      capture: '获取验证码',
      captureState: false,
      phone: "",
      password: "",
      code: "",
      loginPhone: "",
      loginPwd: "",
      img: Constants.rootaddr+kapimg,
      lcode: "",
    };
  }

  //组件加载完成
  componentDidMount() {

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
  
  refreshLcode = () => {
    EasyShowLD.dialogClose();
    this.loginKcaptrue();
  }

  loginKcaptrue = () => {
    if (this.state.loginPhone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.loginPwd == "" || this.state.loginPwd.length < Constants.PWD_MIN_LENGTH) {
      EasyToast.show('密码长度至少4位,请重输');
      return;
    }
    let img = Constants.rootaddr+kapimg + this.state.loginPhone + "?v=" + Math.ceil(Math.random() * 100000);
    const view = <View style={{ flexDirection: 'row' }}>
      <Button onPress={() => { this.refreshLcode() }}>
        <Image onError={(e) => { this.loaderror() }} style={styles.butimg} source={{ uri: img }} />
      </Button>
      <TextInput autoFocus={true} onChangeText={(lcode) => this.setState({ lcode })} returnKeyType="go" placeholderTextColor={UColor.inputtip}
        selectionColor={UColor.tintColor} style={[styles.inp,{ color: UColor.tintColor,backgroundColor: UColor.riceWhite,}]}   
        keyboardType="phone-pad" placeholder="请输入计算结果" underlineColorAndroid="transparent" maxLength={8} />
    </View>
    EasyShowLD.dialogShow("计算结果", view, "登陆", "取消", () => {

      if (this.state.lcode == "") {
        EasyToast.show('请输入计算结果');
        return;
      }
      EasyShowLD.dialogClose();
      this.loginSubmit();
      AnalyticsUtil.onEvent('Sign_inok');
    }, () => { EasyShowLD.dialogClose() });
  }

  loginSubmit = () => {
    if (this.state.loginPhone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.loginPwd == "" || this.state.loginPwd.length < Constants.PWD_MIN_LENGTH) {
      EasyToast.show('密码长度至少4位,请重输');
      return;
    }
    EasyShowLD.loadingShow('登陆中...');
    this.props.dispatch({
      type: 'login/login', payload: { phone: encryptedMsg(this.state.loginPhone), password: encryptedMsg(this.state.loginPwd), code: this.state.lcode }, callback: (data) => {
        if (data.code == 0) {
          EasyToast.show("登陆成功");
          this.props.navigation.goBack();
        } else {
          EasyToast.show(data.msg);
        }
        EasyShowLD.loadingClose();
      }
    })
  }

  clearFoucs = () => {
    this._lphone.blur();
    this._lpass.blur();
    this._rpass.blur();
    this._rrpass.blur();
    this._rphone.blur();
    this._rcode.blur();
  }

  loaderror = () => {
    // EasyToast.show('操作过于频繁，为保障用户安全，请一小时后尝试');
    EasyToast.show('未能获取图形验证码，请检查网络！');
  }

  doTick = () => {
    var th = this;
    setTimeout(function () {
      if (tick == 0) {
        tick = 60;
        th.setState({ capture: "获取验证码", captureState: false });
      } else {
        tick--;
        th.setState({ capture: tick + "s", captureState: true })
        th.doTick();
      }
    }, 1000);
  }

  forget = () => {
    const { navigate } = this.props.navigation;
    navigate('Forget');
  }

  regSubmit () {
    const { navigate } = this.props.navigation;
    navigate('Register', {});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="登陆" />
          <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
              <View style={[styles.outsource,{backgroundColor: '#FFFFFF'}]}>
                  <Text style={[styles.inptitle,{color: '#323232'}]}>手机号</Text>
                  <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true} 
                    value={this.state.loginPhone} returnKeyType="next"  placeholder="输入手机号" 
                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.inputtip}
                    underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                    onChangeText={(loginPhone) => this.setState({ loginPhone })} />

                  <Text style={[styles.inptitle,{color: '#323232'}]}>密码</Text>
                  <TextInput ref={(ref) => this._lpass = ref}  
                    value={this.state.loginPwd} returnKeyType="go" autoFocus={false} editable={true} 
                    selectionColor={UColor.tintColor} style={styles.inpt} placeholder="输入密码" 
                    underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                    onSubmitEditing={() => this.loginKcaptrue()} onChangeText={(loginPwd) => this.setState({ loginPwd })}
                  />
                <View style={styles.forgetpass}>
                  <Text style={[styles.forgettext,{color: '#3B80F4'}]} onPress={() => this.forget()}>忘记密码?</Text>
                </View>
                <Button onPress={() => this.loginKcaptrue()} style={styles.readout}>
                  <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.butout} >
                    <Text style={[styles.buttext,{color: '#FFFFFF'}]}>登陆</Text>
                  </LinearGradient>
                </Button>
                <Button onPress={() => this.regSubmit()} style={styles.submitout}>
                  <View style={{ alignItems: 'center',justifyContent: 'center',width: ScreenUtil.autowidth(60),height: ScreenUtil.autoheight(20),}}>
                    <Text style={[styles.buttext,{color: '#3B80F4'}]}>注册</Text>
                  </View>
                </Button>
                
              </View>
          </TouchableOpacity>
      </View>
    );
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
    padding: ScreenUtil.autowidth(20), 
    height: ScreenUtil.autoheight(80), 
  },

  inptitle: {
    fontSize: ScreenUtil.setSpText(16), 
    marginVertical: ScreenUtil.autowidth(18),
  },
  inpt: {
    color: '#D9D9D9',
    paddingVertical: 0,
    borderBottomWidth:0.5, 
    borderBottomColor: '#D5D5D5',
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  forgetpass: {
    flexDirection: "row",
    justifyContent: 'flex-end',
    paddingVertical: ScreenUtil.autowidth(7),
  },
  forgettext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  
  readout: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ScreenUtil.autowidth(115), 
  },
  submitout: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ScreenUtil.autowidth(17), 
    marginBottom: ScreenUtil.autowidth(26), 
  },
  butout: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(175),
    height: ScreenUtil.autoheight(42),
    borderRadius: ScreenUtil.autowidth(21),
  },
  buttext: {
    fontSize: ScreenUtil.setSpText(15),
  },


 
  readtext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(14),
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

export default Login;
