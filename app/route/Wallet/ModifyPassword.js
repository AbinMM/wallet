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
import PasswordInput from '../../components/PasswordInput'
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

    render() {
        return <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
            <Header {...this.props} onPressLeft={true} title="更改密码" />
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex:1}}>
                <View style={[styles.outsource,{backgroundColor: '#FFFFFF'}]}>
                    <Text style={[styles.texttitle,{fontWeight:"bold", color: '#323232'}]}>当前密码</Text>
                    <TextInput ref={(ref) => this._lphone = ref} value={this.state.password} returnKeyType="next"
                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#808080'}]} placeholderTextColor={'#D9D9D9'}
                        secureTextEntry={true} placeholder="请输入您当前的密码"  underlineColorAndroid="transparent" autoFocus={false} maxLength = {20}
                        editable={true} onChangeText={(password) => this.setState({ password })}  />

                    <View style={{marginTop: ScreenUtil.autowidth(30), }} >
                        <PasswordInput password={this.state.newPassword} onCallbackFun={(newPassword) => this.setState({ newPassword })} 
                        repeatpassword={this.state.newRePassword} onCallbackFunRepeat={(newRePassword) => this.setState({ newRePassword })}/>
                    </View>

                    <Text style={[styles.texttitle,{marginTop: ScreenUtil.autowidth(50), fontWeight:"bold", color: '#323232'}]}>设置密码提示</Text>
                    <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} returnKeyType="next" 
                        style={[styles.textinpt,{color: '#808080'}]}  underlineColorAndroid="transparent"   
                        placeholder="密码提示信息（可不填" placeholderTextColor={'#D9D9D9'} />

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
