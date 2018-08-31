import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Image, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import ScreenUtil from '../../utils/ScreenUtil'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img';
import Header from '../../components/Header'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyToast } from '../../components/Toast';
import { kapimg } from '../../utils/Api'
import { EasyShowLD } from "../../components/EasyShow"
import Constants from '../../utils/Constants'
import BaseComponent from "../../components/BaseComponent";
import {encryptedMsg} from '../../utils/AlgoUtil';
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
      index: 0,
      capture: '获取验证码',
      captureState: false,
      routes: [{ key: '1', title: '登陆' }, { key: '2', title: '注册' }],
      phone: "",
      password: "",
      code: "",
      invite: "",
      loginPhone: "",
      loginPwd: "",
      img: Constants.rootaddr+kapimg,
      kcode: "",
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
  
  //切换tab
  _handleIndexChange = index => {
    this.setState({ index });
  };

  focusNextField = (nextField) => {
    this.refs[nextField].focus();
  };


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
        <Image onError={(e) => { this.loaderror() }} style={{ width: ScreenUtil.autowidth(100), height: ScreenUtil.autoheight(45) }} source={{ uri: img }} />
      </Button>
      <TextInput autoFocus={true} onChangeText={(lcode) => this.setState({ lcode })} returnKeyType="go" placeholderTextColor={UColor.arrow}
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

  clearFoucs = () => {
    this._lphone.blur();
    this._lpass.blur();
    this._rpass.blur();
    this._rrpass.blur();
    this._rphone.blur();
    this._rcode.blur();
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

  refresh = () => {
    EasyShowLD.dialogClose();
    this.kcaptrue();
  }

  loaderror = () => {
    // EasyToast.show('操作过于频繁，为保障用户安全，请一小时后尝试');
    EasyToast.show('未能获取图形验证码，请检查网络！');
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
    if (this.state.captureState) {
      return;
    }
    let img =Constants.rootaddr+ kapimg + this.state.phone + "?v=" + Math.ceil(Math.random() * 100000);

    const view = <View style={{ flexDirection: 'row' }}>
    <Button onPress={() => { this.refresh() }}>
      <Image onError={(e) => { this.loaderror() }} style={styles.butimg} source={{ uri: img }} />
    </Button>
    <TextInput autoFocus={true} onChangeText={(kcode) => this.setState({ kcode })} returnKeyType="go" placeholderTextColor={UColor.arrow}
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

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "注册协议", url: "http://static.eostoken.im/html/reg.html" });
  }

  forget = () => {
    const { navigate } = this.props.navigation;
    navigate('Forget');
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  //渲染页面
  renderScene = ({ route }) => {
    if (route.key == '1') {
      return (<ScrollView  keyboardShouldPersistTaps="always">
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
            <View style={[styles.outsource,{backgroundColor: UColor.secdColor}]}>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]}>
                <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 手机号</Text>
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true} 
                  value={this.state.loginPhone} returnKeyType="next" 
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                  placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                  onChangeText={(loginPhone) => this.setState({ loginPhone })} />
              </View>
              <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]}>
                <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 密码</Text>
                <TextInput ref={(ref) => this._lpass = ref}  
                  value={this.state.loginPwd} returnKeyType="go" autoFocus={false} editable={true}
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                  placeholder="输入密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                  onSubmitEditing={() => this.loginKcaptrue()} onChangeText={(loginPwd) => this.setState({ loginPwd })}
                />
              </View>
            </View>
            <View style={styles.forgetpass}>
              <Text style={[styles.forgettext,{color: UColor.tintColor}]} onPress={() => this.forget()}>忘记密码</Text>
            </View>
            <Button onPress={() => this.loginKcaptrue()}>
              <View style={[styles.butout,{backgroundColor: UColor.tintColor}]}>
                <Text style={[styles.buttext,{color: UColor.btnColor}]}>登陆</Text>
              </View>
            </Button>
            <View style={styles.logoutone}>
              <Image source={UImage.bottom_log} style={styles.logimg}/>
              <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
            </View>
        </TouchableOpacity>
      </ScrollView>)
    } else {
      return (<ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
          <View style={[styles.outsource,{backgroundColor: UColor.secdColor}]}>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]}>
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 手机号</Text>
              <TextInput ref={(ref) => this._rphone = ref} value={this.state.phone} returnKeyType="next" 
                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                onChangeText={(phone) => this.setState({ phone })}/>
            </View>
            <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
            <View style={[styles.vfanout,{backgroundColor: UColor.mainColor}]}>
              <View style={styles.vfantext} >
                <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 验证码</Text>
                <TextInput ref={(ref) => this._rcode = ref} value={this.state.code} returnKeyType="next" 
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                  placeholder="请输入验证码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={6}
                  onChangeText={(code) => this.setState({ code })}/>
              </View>
              <View style={styles.verificationout}>
                <Button onPress={() => this.kcaptrue()}>
                  <View style={[styles.verification,{backgroundColor: UColor.tintColor}]}>
                    <Text style={[styles.verificationtext,{color: UColor.btnColor}]}>{this.state.capture}</Text>
                  </View>
                </Button>
              </View>
            </View>
            <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]} >
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 密码</Text>
              <TextInput ref={(ref) => this._rpass = ref} value={this.state.password} returnKeyType="next" 
                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                placeholder="输入密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                onChangeText={(password) => this.setState({ password })}/>
            </View>
            <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
            <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]} >
              <Text style={[styles.inptitle,{color: UColor.fontColor}]}> 邀请码</Text>
              <TextInput ref={(ref) => this._rrpass = ref} value={this.state.invite} returnKeyType="go" 
                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                placeholder="输入邀请码(非必填)" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                maxLength={8} onSubmitEditing={() => this.regSubmit()} onChangeText={(invite) => this.setState({ invite })}
              />
            </View>
          </View>
          <View style={styles.readout}>
            <Text style={[styles.readtext,{color: UColor.arrow}]}>注册即表示同意</Text>
            <Text onPress={() => this.prot()} style={[styles.servicetext,{color: UColor.tintColor}]}>EosToken用户协议</Text>
          </View>
          <Button onPress={() => this.regSubmit()}>
            <View style={[styles.butout,{backgroundColor: UColor.tintColor}]}>
              <Text style={[styles.buttext,{color: UColor.btnColor}]}>注册</Text>
            </View>
          </Button>
          <View style={styles.logouttow}>
            <Image source={UImage.bottom_log} style={styles.logimg}/>
            <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
          </View>
      </TouchableOpacity>
    </ScrollView>)
    }
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="登陆/注册" />
        <View style={{ backgroundColor: UColor.mainColor, height: 0 }}></View>
        <TabViewAnimated
          lazy={true}
          navigationState={this.state}
          renderScene={this.renderScene.bind(this)}
          renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} 
          labelStyle={{ fontSize: ScreenUtil.setSpText(15), margin: 0, marginVertical: ScreenUtil.autowidth(15), color: UColor.arrow, }} 
          indicatorStyle={{ backgroundColor: UColor.tintColor, width: ScreenWidth / 2 }} 
          style={{ backgroundColor: UColor.mainColor, }} tabStyle={{ width: ScreenWidth / 2, padding: 0, margin: 0 }} 
          scrollEnabled={true} {...props} />}
          onIndexChange={this._handleIndexChange}
          initialLayout={{ height: 0, width: ScreenWidth }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  butimg: { 
    width: ScreenUtil.autowidth(100), 
    height: ScreenUtil.autoheight(45), 
  },
  inp: {
    textAlign: "center",
    marginLeft: ScreenUtil.autowidth(10),
    width: ScreenUtil.autowidth(120),
    height: ScreenUtil.autoheight(45),
    fontSize: ScreenUtil.setSpText(15),
  },

  container: {
    flex: 1,
    flexDirection: 'column',
  },
  
  outsource: {
    flexDirection: 'column',
  },

  inptout: {
    padding: ScreenUtil.autowidth(20), 
    height: ScreenUtil.autoheight(80), 
  },
  inpt: {
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  inptitle: {
    fontSize: ScreenUtil.setSpText(14), 
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
      padding: ScreenUtil.autowidth(20),
      height: ScreenUtil.autoheight(80),
      width: ScreenUtil.autowidth(200),
    },
  verificationout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end",
    marginRight: ScreenUtil.autowidth(10),
  },
  verification: {
    borderRadius: 5,
    width: ScreenUtil.autowidth(100),
    height: ScreenUtil.autoheight(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ScreenUtil.autoheight(15),
  },
  verificationtext: {
    fontSize: ScreenUtil.setSpText(15),
  },

  butout: {
    height: ScreenUtil.autoheight(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: ScreenUtil.autoheight(20),
    marginHorizontal: ScreenUtil.autowidth(20),
    borderRadius: 5
  },
  buttext: {
    fontSize: ScreenUtil.setSpText(15),
  },

  readout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ScreenUtil.autoheight(20),
  },
  readtext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(5),
  },

  logoutone:{
    height: ScreenUtil.autoheight(320),
    alignItems: 'center',
    justifyContent: 'flex-end',
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
