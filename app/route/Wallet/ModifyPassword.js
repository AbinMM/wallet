import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class ModifyPassword extends BaseComponent {

    static navigationOptions = {
        title: '修改密码',
        header:null,  
    };
    
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            newPassword: "",
            newRePassword: "",
            weak: UColor.arrow,
            medium: UColor.arrow,
            strong: UColor.arrow,
            CreateButton:  UColor.mainColor,
        }
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    updatePassword = () => {
        if (this.state.password == "") {
            EasyToast.show('请输入旧密码');
            return;
        }
        if (this.state.newPassword == "" || this.state.newPassword.length < 8) {
            EasyToast.show('密码长度至少8位，请重输');
            return;
        }
        if (this.state.newRePassword == "" || this.state.newRePassword.length < 8) {
            EasyToast.show('密码长度至少8位，请重输');
            return;
        }
        if (this.state.newRePassword != this.state.newPassword) {
            EasyToast.show('两次密码不一致');
            return;
        }
        var wallet = this.props.navigation.state.params;
        try {
            var ownerPrivateKey = wallet.ownerPrivate;
            var bytes_ownerPrivate = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + wallet.salt);
            var plaintext_ownerPrivate = bytes_ownerPrivate.toString(CryptoJS.enc.Utf8);
            if (plaintext_ownerPrivate.indexOf('eostoken') != - 1) {
                // plaintext_ownerPrivate = plaintext_ownerPrivate.substr(8, plaintext_ownerPrivate.length);
                //**************解密********* */
                var activePrivate = "";
                var plaintext_activePrivate = "";
                var _activePrivate = "";
                if (this.props.navigation.state.params.activePrivate != null) {
                    activePrivate = this.props.navigation.state.params.activePrivate;
                    var bytes_activePrivate = CryptoJS.AES.decrypt(activePrivate.toString(), this.state.password + this.props.navigation.state.params.salt);
                    plaintext_activePrivate = bytes_activePrivate.toString(CryptoJS.enc.Utf8);
                    _activePrivate = CryptoJS.AES.encrypt(plaintext_activePrivate, this.state.newPassword + this.props.navigation.state.params.salt);
                }
                var words = "";
                var plaintext_words = "";
                var _words = "";
                if (wallet.words != null) {
                    words = this.props.navigation.state.params.words;
                    var bytes_words = CryptoJS.AES.decrypt(words.toString(), this.state.password + wallet.salt);
                    plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
                    _words = CryptoJS.AES.encrypt(plaintext_words, this.state.newPassword + wallet.salt);
                }
                var words_active = "";
                var plaintext_words_active = "";
                var _words_active = "";
                if (wallet.words_active != null) {
                    words_active = this.props.navigation.state.params.words_active;
                    var bytes_words_active = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + wallet.salt);
                    plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
                    _words_active = CryptoJS.AES.encrypt(plaintext_words_active, this.state.newPassword + wallet.salt);
                }
                //**************加密********* */
                var _ownerPrivate = CryptoJS.AES.encrypt(plaintext_ownerPrivate, this.state.newPassword + wallet.salt);
                var _wallet = {
                    name: wallet.name,
                    account: wallet.account,
                    ownerPublic: wallet.ownerPublic,
                    activePublic: wallet.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isactived: wallet.isactived,
                    isBackups: wallet.isBackups
                }
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/modifyPassword', payload: { _wallet }, callback: () => {
                    EasyToast.show('密码修改成功');
                } });

                DeviceEventEmitter.addListener('modify_password', (data) => {
                    this.props.navigation.goBack();
                });
            } else {
                EasyToast.show('旧密码不正确');
            }
        } catch (error) {
            EasyToast.show('旧密码不正确');
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    // 导入钱包
    importEosKey() {
        this.props.navigation.goBack();                                 
        const { navigate } = this.props.navigation;
        navigate('ImportEosKey',{});
    }

    intensity() {
        let string = this.state.newPassword;
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
        if(this.state.password != "" && this.state.newPassword != "" && this.state.newRePassword != ""){
          this.state.CreateButton = UColor.tintColor;
        }else{
          this.state.CreateButton = UColor.invalidbtn;
        }
    }

    render() {
        return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="修改密码" />
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex:1}}>
                    <View style={[styles.outsource,{backgroundColor: UColor.mainColor}]}>
                        <View style={[styles.inptoutsource,{borderBottomColor: UColor.secdColor}]} >
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.password} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow}
                                secureTextEntry={true} placeholder="当前密码"  underlineColorAndroid="transparent" autoFocus={false} maxLength = {20}
                                editable={true} onChangeText={(password) => this.setState({ password })}   onChange={this.intensity()} />
                        </View>
                        <View style={[styles.inptoutsource,{borderBottomColor: UColor.secdColor}]} >
                            <TextInput ref={(ref) => this._lpass = ref} value={this.state.newPassword} returnKeyType="next" onChange={this.intensity()}
                                style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} maxLength={Constants.PWD_MAX_LENGTH}
                                secureTextEntry={true}  placeholder="新密码" underlineColorAndroid="transparent" selectionColor={UColor.tintColor}
                                editable={true} onChangeText={(newPassword) => this.setState({ newPassword })} autoFocus={false} />
                            <View style={{flexDirection: 'row', height: ScreenUtil.autoheight(50), alignItems: 'center', }}>
                                <Text style={{color:this.state.weak, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>弱</Text>
                                <Text style={{color:this.state.medium, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>中</Text>
                                <Text style={{color:this.state.strong, fontSize: ScreenUtil.setSpText(15), padding: ScreenUtil.autowidth(5),}}>强</Text>
                            </View>
                        </View>
                        <View style={[styles.inptoutsource,{borderBottomColor: UColor.secdColor}]} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} underlineColorAndroid="transparent"
                                value={this.state.newRePassword} onChangeText={(newRePassword) => this.setState({ newRePassword })} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                                placeholder="重复密码"  secureTextEntry={true}  onChange={this.intensity()}  maxLength={Constants.PWD_MAX_LENGTH}/>
                        </View>
                        <View style={[styles.inptoutsource,{borderBottomColor: UColor.secdColor}]} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} underlineColorAndroid="transparent" 
                                style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} onChange={this.intensity()} 
                                placeholder="密码提示(可不填)" returnKeyType="next" />
                        </View>
                    </View>
                    <View style={{paddingTop:  ScreenUtil.autoheight(20),paddingHorizontal: ScreenUtil.autowidth(20),paddingBottom: ScreenUtil.autoheight(60),}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.arrow, textAlign: 'left',paddingBottom: ScreenUtil.autoheight(10),}} >忘记密码? 导入助记词或私钥可重置密码。</Text>
                        <View style={{alignItems: "flex-end"}}>
                            <Text onPress={() => this.importEosKey()}  style={[styles.servicetext,{color: UColor.tintColor}]}>马上导入</Text>
                        </View>
                    </View>
                    <Button onPress={() => this.updatePassword()}>
                        <View style={styles.btnout} backgroundColor = {this.state.CreateButton}>
                            <Text style={[styles.buttext,{color: UColor.btnColor}]}>确认</Text>
                        </View>
                    </Button>
                    <View style={styles.logout}>
                        <Image source={UImage.bottom_log} style={styles.logimg}/>
                        <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
                    </View>
            </TouchableOpacity>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        marginTop: ScreenUtil.autoheight(30), 
    },
    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: ScreenUtil.autowidth(20), 
    },
    inpt: {
        flex: 1,
        height: ScreenUtil.autoheight(50),
        fontSize: ScreenUtil.setSpText(15), 
    },
    btnout: {
        borderRadius: 5,
        alignItems: 'center', 
        justifyContent: 'center', 
        height: ScreenUtil.autoheight(45), 
        marginHorizontal: ScreenUtil.autowidth(30),  
    },
    buttext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    servicetext: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(14),
    },
    logout:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: ScreenUtil.autoheight(130),
        paddingBottom: ScreenUtil.autoheight(20),
    },
    logimg: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50),
    },
    logtext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(30),
    }
});

export default ModifyPassword;
