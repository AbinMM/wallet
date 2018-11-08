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
import TextButton from '../../components/TextButton'
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
            weak: false,
            medium: false,
            strong: false,
            statetext: "",
            password: "",
            newPassword: "",
            newRePassword: "",
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

    render() {
        return <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
            <Header {...this.props} onPressLeft={true} title="更改密码" />
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex:1}}>
                <View style={[styles.outsource,{backgroundColor: '#FFFFFF'}]}>
                    <Text style={[styles.texttitle,{color: '#323232'}]}>当前密码</Text>
                    <TextInput ref={(ref) => this._lphone = ref} value={this.state.password} returnKeyType="next"
                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#D9D9D9'}]} placeholderTextColor={UColor.inputtip}
                        secureTextEntry={true} placeholder="请输入您当前的密码"  underlineColorAndroid="transparent" autoFocus={false} maxLength = {20}
                        editable={true} onChangeText={(password) => this.setState({ password })}   onChange={this.intensity()} />

                    <View style={{marginBottom: ScreenUtil.autowidth(20),marginTop: ScreenUtil.autowidth(50),flexDirection: 'row'}}>
                        <Text style={{flex: 1,fontSize: ScreenUtil.setSpText(16), color: '#323232'}}>设置密码</Text>
                        <View style={{flexDirection: 'row',alignItems: 'center'}}>
                            <Text style={{fontSize: ScreenUtil.setSpText(10), color: '#3B80F4', paddingHorizontal: ScreenUtil.autowidth(5),}}>{this.state.statetext}</Text>
                            <View style={{width: ScreenUtil.autowidth(10), flexDirection: 'column',}}>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.strong ? '#3B80F4' : '#D8D8D8',}}/>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.strong ? '#3B80F4' : '#D8D8D8',}}/>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.medium ? '#3B80F4' : '#D8D8D8',}}/>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.medium ? '#3B80F4' : '#D8D8D8',}}/>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.weak ? '#3B80F4' : '#D8D8D8',}}/>
                                <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.weak ? '#3B80F4' : '#D8D8D8',}}/>
                            </View>
                        </View>
                    </View>
                    <TextInput ref={(ref) => this._lpass = ref} value={this.state.newPassword} returnKeyType="next" onChange={this.intensity()}
                        style={[styles.textinpt,{color: '#D9D9D9'}]} placeholderTextColor={UColor.inputtip} maxLength={Constants.PWD_MAX_LENGTH}
                        secureTextEntry={true}  placeholder="输入密码至少8位，建议大小写字母混合" underlineColorAndroid="transparent" selectionColor={UColor.tintColor}
                        editable={true} onChangeText={(newPassword) => this.setState({ newPassword })} autoFocus={false} />
                    <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} underlineColorAndroid="transparent"
                        value={this.state.newRePassword} onChangeText={(newRePassword) => this.setState({ newRePassword })} returnKeyType="next"
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: '#D9D9D9', borderBottomColor: '#D5D5D5'}]} placeholderTextColor={UColor.inputtip} 
                        placeholder="重复输入密码"  secureTextEntry={true}  onChange={this.intensity()}  maxLength={Constants.PWD_MAX_LENGTH}/>

                    <Text style={[styles.texttitle,{marginTop: ScreenUtil.autowidth(50), color: '#323232'}]}>设置密码提示</Text>
                    <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} underlineColorAndroid="transparent" 
                        style={[styles.textinpt,{color: '#D9D9D9'}]} placeholderTextColor={UColor.inputtip} onChange={this.intensity()} 
                        placeholder="密码提示信息（可不填）" returnKeyType="next" />
                    <View style={styles.btnout}>
                        <Text style={[styles.servicetext,{color: '#808080'}]}>忘记密码? 导入私钥可重置密码 </Text>
                        <Text onPress={() => this.importEosKey()}  style={[styles.servicetext,{paddingLeft: ScreenUtil.autowidth(5),color: '#3B80F4'}]}>马上导入</Text>
                    </View>
                </View>
                <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',}}>
                    <TextButton onPress={() => this.updatePassword()} textColor="#FFFFFF" text="确认更改"  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
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
        borderRadius: 6,
        flexDirection: 'column',
        marginHorizontal: ScreenUtil.autowidth(15),
        marginTop: ScreenUtil.autowidth(15),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    texttitle:{
        fontSize: ScreenUtil.setSpText(16),
        marginVertical: ScreenUtil.autowidth(20),
    },
    textinpt: {
        paddingVertical: 0,
        borderBottomWidth:0.5, 
        borderBottomColor: '#D5D5D5',
        fontSize: ScreenUtil.setSpText(14),
        paddingLeft: ScreenUtil.autowidth(2),
    },
    inpt: {
        paddingVertical: 0,
        borderBottomWidth:0.5,
        fontSize: ScreenUtil.setSpText(14),
        paddingLeft: ScreenUtil.autowidth(2),
        paddingTop: ScreenUtil.autowidth(24), 
    },
    btnout: {
        flexDirection: 'row', 
        justifyContent: 'center',
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(50),
    },
    servicetext: {
        fontSize: ScreenUtil.setSpText(12),
    },
   
});

export default ModifyPassword;
