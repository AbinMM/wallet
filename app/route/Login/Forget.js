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
var tick=60;
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({login}) => ({...login}))
class Forget extends BaseComponent {

  static navigationOptions = {
    title: '忘记密码',
    header:null, 
  };

  state = {
    phone:"",
    password:"",
    code:"",
    capture:'获取验证码',
    img:Constants.rootaddr+kapimg,
    kcode:"",
    captureState: false,
  }

  constructor(props) {
    super(props);
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  regSubmit = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.code==""){
      EasyToast.show('请输入验证码');
      return;
    }
    if(this.state.password=="" || this.state.password.length < 8){
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    EasyShowLD.loadingShow('修改中...');
    this.props.dispatch({type:'login/changePwd',payload:{phone:encryptedMsg(this.state.phone),password:encryptedMsg(this.state.password),code:this.state.code},callback:(data)=>{
      EasyShowLD.loadingClose();
      if(data.code==0){
        EasyToast.show("修改成功");
        this.props.navigation.goBack();
      }else{
        EasyToast.show(data.msg);
      }
    }})
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

  getCapture = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    if(this.state.kcode==""){
      EasyToast.show('请输入验证码');
      return;
    }
    if(this.state.captureState){
      return;
    }
    var th = this;
    EasyShowLD.loadingShow('获取中...');
    this.props.dispatch({type:'login/getCapture',payload:{phone:this.state.phone,code:this.state.kcode},callback:(data)=>{
        EasyShowLD.loadingClose();
        if(data.code==0){
          EasyToast.show("验证码已发送，请注意查收");
          th.setState({capture:"60s", captureState: true});
          th.doTick();
          EasyShowLD.dialogClose();
        }else{
          EasyToast.show(data.msg);
          if(data.code!=505){
            EasyShowLD.dialogClose();
          }
        }
    }});
  }

  doTick = () =>{
    var th = this;
    setTimeout(function(){
      if(tick==0){
        tick=60;
        th.setState({capture:"获取验证码", captureState: false});
      }else{
        tick--;
        th.setState({capture:tick+"s", captureState: true});
        th.doTick();
      }
    },1000);
  }

  clearFoucs = () =>{
    this._rpass.blur();
    this._rphone.blur();
    this._rcode.blur();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
      <Header {...this.props} onPressLeft={true} title="忘记密码" />
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
        <View style={[styles.outsource,{backgroundColor: '#FFFFFF'}]}>
          <Text style={[styles.texttitle,{color: '#323232'}]}> 手机号</Text>
          <TextInput ref={(ref) => this._rphone = ref}  value={this.state.phone}  returnKeyType="next" 
            selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#D9D9D9',borderBottomWidth:0.5, borderBottomColor: '#D5D5D5'}]}  placeholderTextColor={UColor.inputtip}
            placeholder="请输入您注册时的手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
            onChangeText={(phone) => this.setState({phone})}
          />
          <View style={[styles.codeoutsource,{backgroundColor: UColor.mainColor}]}>
              <View style={styles.codeout} >
                  <Text style={[styles.texttitle,{color: '#323232'}]}> 验证码</Text>
                  <TextInput  value={this.state.code} ref={(ref) => this._rcode = ref}  returnKeyType="next" 
                    selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#D9D9D9'}]} placeholderTextColor={UColor.inputtip} 
                    placeholder="输入验证码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={6}
                    onChangeText={(code) => this.setState({code})}
                  />
              </View>
              <View style={styles.btnoutsource}>
                <Button onPress={() => this.kcaptrue()}>
                  <View style={[styles.btnout,{borderColor: '#D9D9D9'}]}>
                    <Text style={[styles.btntext,{color: '#D9D9D9'}]}>{this.state.capture}</Text>
                  </View>
                </Button>
              </View>
          </View>
          <View style={[styles.separate,{backgroundColor: '#D5D5D5'}]}></View>
          <Text style={[styles.texttitle,{color: '#323232'}]}> 新密码</Text>
          <TextInput ref={(ref) => this._rpass = ref}  value={this.state.password} returnKeyType="next" 
            selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#D9D9D9',borderBottomWidth:0.5, borderBottomColor: '#D5D5D5'}]}  placeholderTextColor={UColor.inputtip} 
            placeholder="设置新的登录密码"  underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
            onChangeText={(password) => this.setState({password})}
          />
          <View style={{paddingVertical: ScreenUtil.autowidth(62), alignItems: 'center',justifyContent: 'center',}}>
            <Button onPress={() => this.regSubmit()}>
              <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.referbtn} >
                <Text style={[styles.refertext,{color: UColor.btnColor}]}>提交</Text>
              </LinearGradient>
            </Button>
          </View>
        </View>
        
        {/* <View style={styles.logout}>
          <Image source={UImage.bottom_log} style={styles.logimg}/>
          <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
        </View> */}
      </TouchableOpacity>
  </View>
  }
}

const styles = StyleSheet.create({
  countout: {
    flexDirection:'row'
  },
  countimg: {
    width: ScreenUtil.autowidth(100),
    height: ScreenUtil.autowidth(45),
  },   
  countinpt: {
    textAlign: "center",
    width: ScreenUtil.autowidth(120),
    height: ScreenUtil.autoheight(45),
    fontSize: ScreenUtil.setSpText(15),
    marginLeft: ScreenUtil.autowidth(10),
  },
  container: {
    flex: 1,
    flexDirection:'column',
  },
  outsource: {
    borderRadius: 6,
    flexDirection: 'column',
    marginHorizontal: ScreenUtil.autowidth(15),
    marginTop: ScreenUtil.autowidth(15),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  phoneoue: {
    height: ScreenUtil.autoheight(75),
  },

  texttitle:{
    marginVertical: ScreenUtil.autowidth(15),
    fontSize: ScreenUtil.setSpText(16),
  },
  codeoutsource: {
    flexDirection:'row',
  },
  codeout: {
    flex: 1,
    // width: ScreenUtil.autowidth(200),
    // height: ScreenUtil.autoheight(80),
    // padding: ScreenUtil.autowidth(20),
  },
  textinpt: {
    
    paddingVertical: 0,
    //height: ScreenUtil.autoheight(40),
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),

  },
  btnoutsource: {
    alignItems: 'center',
    justifyContent: "flex-end",
    paddingBottom:  ScreenUtil.autowidth(3),
  },
  btnout: {
    borderRadius: 1,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(69),
    height: ScreenUtil.autoheight(18),
  },
  btntext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  separate: {
    height: 0.5,
  },
  referbtn: {
    borderRadius: ScreenUtil.autowidth(21),
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(175),
    height: ScreenUtil.autoheight(42),
  },
  refertext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  logout:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: ScreenUtil.autoheight(300),
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

export default Forget;
