import React from 'react';
import { Platform, StyleSheet,Animated, Text, TouchableWithoutFeedback, View,Image,TextInput,KeyboardAvoidingView} from 'react-native';
import ScreenUtil from '../../utils/ScreenUtil';
import TextButton from '../TextButton';
import Security from '../../utils/Security';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import RadioButton from '../RadioButton';
import { EasyToast } from '../Toast';
import { connect } from 'react-redux';

export class AuthModal {

  static bind(AuthModal) {
    this.map["AuthModal"] = AuthModal;
  }

  static unBind() {
    this.map["AuthModal"] = null;
    delete this.map["AuthModal"];
  }

  static show(account,callback) {
    this.map["AuthModal"].show(account,callback);
  }

}

AuthModal.map = {};

@connect(({wallet}) => ({}))
export class AuthModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      action:"password",
      password:"",
      checkTouch:false
    };

    constructor(props) {
      super(props);
      AuthModal.bind(this);
    }

    show = (account,callback) =>{
      if(!account){
        EasyToast.show("参数错误");
        return;
      }
      if(this.isShow)return;
      this.isShow = true;
      this.AuthModalCallback = callback;
      //如果需要支持返回关闭，请添加这句，并且实现dimss方法
      window.currentDialog = this;
      //如果本地有密码，并且有指纹，则显示指纹验证
      if(Security.hasPayPass(account) && Security.hasTouchID){
        this.setState({action:"finger",modalVisible:true});
        FingerprintScanner.authenticate({onAttempt:this.handleAuthenticationAttempted}).then(() => {
          this.doAuth(Security.getPayPass(account));
        });
      }else{
        this.setState({action:"password",modalVisible:true});
      }
      this.setState({account,hasPayPass:Security.hasPayPass(account),hasTouchID:Security.hasTouchID});
      Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0.6,duration:500}),
        Animated.timing(this.state.alert,{toValue:1,duration:200})
      ]).start(() => {});
    }

    dimss = () => {
      if(!this.isShow)return;
      window.currentDialog = null;
      FingerprintScanner.release();
      Animated.parallel([
          Animated.timing(this.state.mask,{toValue:0,duration:500}),
          Animated.timing(this.state.alert,{toValue:0,duration:200})
      ]).start(() => {
          this.setState({data:null,modalVisible:false,action:"password",password:"",checkTouch:false});
          this.isShow = false;
      });
    }

    componentWillUnmount() {
      FingerprintScanner.release();
    }

    //输入密码
    inputPass = () => {
      this.setState({action:"password"});
      FingerprintScanner.release();
    }

    //密码确认
    okPass = () =>{
      this.doAuth(this.state.password);
    }

    //验证密码
    doAuth = (password) =>{
      this.props.dispatch({ type: 'wallet/getWalletByAccount', payload: { account:this.state.account}, callback: (wallet) => {
        if(wallet){
          try{
            var privateKey = wallet.activePrivate;
            var permission = 'active';
            var plaintext_privateKey = Security.decrypt(privateKey,password+wallet.salt);
            if(plaintext_privateKey == "eostoken"){ // active私钥为空时使用owner私钥
              plaintext_privateKey =Security.decrypt(wallet.ownerPrivate, password+ wallet.salt);
              permission = "owner";
            }
            if (plaintext_privateKey.indexOf('eostoken') ===0 ) {
              plaintext_privateKey = plaintext_privateKey.substr(8);
              if(this.state.checkTouch){
                this.setState({action:"setFinger"});
                FingerprintScanner.authenticate({onAttempt:this.handleAuthenticationAttempted}).then(() => {
                  Security.savePayPass(this.state.account,password);
                  this.AuthModalCallback && this.AuthModalCallback({isOk:true,pk:plaintext_privateKey,permission});
                  this.dimss();
                });
              }else{
                this.AuthModalCallback && this.AuthModalCallback({isOk:true,pk:plaintext_privateKey,permission});
                this.dimss();
              }
            }else{
              EasyToast.show("密码错误，请重新输入");
            }
          }catch(e){
            EasyToast.show("密码错误，请重新输入");
          }
        }else{
          EasyToast.show("账户异常");
        }
      }});
    }

    //指纹错误
    handleAuthenticationAttempted = (error) => {
      EasyToast.show("指纹验证失败，请重试");
    };

    onChange = (value) =>{
      this.setState({checkTouch:value});
    }

    cancel = () =>{
      this.dimss();
      this.AuthModalCallback && this.AuthModalCallback({isOk:false});
    }

    render() {
        return (
          this.state.modalVisible && <View style={styles.continer}>
            <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
              <View style={styles.content}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask}]}></Animated.View>

                  <View style={styles.alertContent}>
                    <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                      <Text style={styles.title}>{this.state.action == "password"?"身份验证":"指纹验证"}</Text>
                      <View style={styles.ctx}>
                        {
                          this.state.action == "finger" && <View style={{flexDirection:"column",justifyContent:"center",alignItems:"center",height:ScreenUtil.autowidth(100)}}>
                            <Image style={{width:ScreenUtil.autowidth(62),height:ScreenUtil.autowidth(64)}} source={require("../../img/modals/finger.png")} />
                          </View>
                        }
                        {
                          this.state.action == "password" && <View style={{flexDirection:"column",justifyContent:"center",width:"100%",paddingBottom:ScreenUtil.autowidth(5),height:ScreenUtil.autowidth(100)}}>
                            <View style={[styles.input,{marginTop:ScreenUtil.autowidth(15)}]}>
                              <TextInput autoFocus={true} secureTextEntry={true} style={{width:"100%",paddingHorizontal:7,fontSize:ScreenUtil.setSpText(13),color:"#1A1A1A",opacity: 0.8}} ref={(ref)=>this._i1=ref} defaultValue={this.state.password} maxLength={20} returnKeyType="go" onSubmitEditing={() => this.okPass()}  onChangeText={(password) => this.setState({password})} selectionColor={"#6DA0F8"} underlineColorAndroid="transparent" placeholder="请输入密码" placeholderTextColor="#999" />
                            </View>
                            {
                              this.state.hasTouchID && !this.state.hasPayPass && <RadioButton onChange={this.onChange} text="开启指纹付款" />
                            }
                          </View>
                        }
                        {
                          this.state.action == "setFinger" && <View style={{flexDirection:"column",justifyContent:"center",alignItems:"center",height:ScreenUtil.autowidth(100)}}>
                            <Image style={{width:ScreenUtil.autowidth(62),height:ScreenUtil.autowidth(64)}} source={require("../../img/modals/finger.png")} />
                          </View>
                        }
                      </View>
                      <View style={styles.bottom}>
                        {
                          this.state.action == "finger" && <View style={{flexDirection:'row'}}>
                            <View style={{width:"50%"}}>
                              <TextButton onPress={()=>{this.cancel()}} bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                            </View>
                            <View style={{width:"50%"}}>
                              <TextButton onPress={()=>{this.inputPass()}} bgColor="#6DA0F8" textColor="#fff" text="输入密码" style={{height:ScreenUtil.setSpText(49),borderBottomRightRadius:4}} />
                            </View>
                          </View>
                        }
                        {
                          this.state.action == "password" && <View style={{flexDirection:'row'}}>
                            <View style={{width:"50%"}}>
                              <TextButton onPress={()=>{this.cancel()}} bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                            </View>
                            <View style={{width:"50%"}}>
                              <TextButton onPress={()=>{this.okPass()}} bgColor="#6DA0F8" textColor="#fff" text="确定" style={{height:ScreenUtil.setSpText(49),borderBottomRightRadius:4}} />
                            </View>
                          </View>
                        }
                        {
                          this.state.action == "setFinger" && <View style={{flexDirection:'row'}}>
                            <View style={{width:"100%"}}>
                              <TextButton onPress={()=>{this.cancel()}} bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                            </View>
                          </View>
                        }
                      </View>
                    </Animated.View>
                  </View>

              </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        )
    }
}

const styles = StyleSheet.create({
  continer:{
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 99999,
    flex: 1,
    width:"100%",
    height:"100%"
  },
  content:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(0, 0, 0, 0.0)"
  },
  mask: {
    flex:1,
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 0,
    width:"100%",
    height:"100%",
    backgroundColor:"#000",
  },
  alertContent:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(0, 0, 0, 0.0)",
    padding:ScreenUtil.autowidth(40)
  },
  alert:{
    flex:1,
    flexDirection: 'column',
    borderRadius:4,
    width:"100%",
    backgroundColor:"#fff"
  },
  title:{
    color:"#1A1A1A",
    textAlign:"center",
    lineHeight:ScreenUtil.setSpText(26),
    fontSize:ScreenUtil.setSpText(16),
    fontWeight:"bold",
    marginTop:ScreenUtil.setSpText(18),
    margin:ScreenUtil.setSpText(10)
  },
  ctx:{
    paddingHorizontal:ScreenUtil.autowidth(20)
  },
  ctx_account:{
    marginTop:ScreenUtil.autowidth(10),
    flexDirection:"row",
    justifyContent:"space-between"
  },
  ctx_txt:{
    color:"#1A1A1A",
    marginHorizontal:ScreenUtil.autowidth(10),
    fontSize:ScreenUtil.setSpText(14),
  },
  input:{
    marginBottom:ScreenUtil.autowidth(11),
    borderColor:"#E6E6E6",
    borderWidth:ScreenUtil.autowidth(0.4),
    borderRadius:4,
    backgroundColor:"#F7F8F9",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    height:ScreenUtil.autowidth(45),
    width:"100%"
  },
  input_right:{
    color:"#808080",
    marginRight:ScreenUtil.autowidth(10),
    fontSize:ScreenUtil.setSpText(12.5),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(49),
    marginTop:ScreenUtil.autowidth(10)
  },
  input:{
    marginBottom:ScreenUtil.autowidth(11),
    borderColor:"#E6E6E6",
    borderWidth:ScreenUtil.autowidth(0.4),
    borderRadius:4,
    backgroundColor:"#F7F8F9",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    height:ScreenUtil.autowidth(45),
  }
});
