import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, Clipboard, ImageBackground, ScrollView, KeyboardAvoidingView,Linking } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import { Eos } from "react-native-eosjs";
import Constants from '../../utils/Constants'
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");



@connect(({ vote, wallet}) => ({ ...vote, ...wallet}))
class AuthExchange extends React.Component {

  static navigationOptions = {
    title: '交易授权',  
    header:null,  
  };
  
  constructor(props) {
    super(props);
    this.state = {
        isAuth:false,
        accName:'',
        activeAuth:'',//更改的数据组
        password:''
      }
  }

  //加载地址数据
  componentDidMount() {
    this.setState({
        accName:this.props.navigation.state.params.wallet.name,
    });
      this.getAuthInfo();  
  }

//获取账户信息
getAuthInfo(){
    EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'vote/getAuthInfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (resp) => {
        EasyShowLD.loadingClose();
        console.log("resp.data.permissions[0].required_auth.keys=%s",JSON.stringify(resp.data.permissions[0].required_auth.keys))
        if(resp && resp.code == '0'){
            var authFlag=false;
            var authTempActive={
                account: "eosio",
                name: "updateauth", 
                authorization: [{
                actor: '',//操作者 account
                permission: 'active'// active
                }], 
                data: {
                    account: '',//操作者 account
                    permission: 'active',// active
                    parent: "owner",// owner
                    auth: {
                        threshold: '',//总阀值 1
                        keys: [],//公钥组 Keys
                        accounts: [
                        // {
                        //     permission: {
                        //         actor: "etbexchanger",
                        //         permission: "eosio.code",
                        //     },
                        //     weight: 1,
                        // }
                        ],//帐户组 Accounts
                    }
                }
            };
            //active 
            authTempActive.authorization[0].actor=this.props.navigation.state.params.wallet.name;
            authTempActive.data.account=this.props.navigation.state.params.wallet.name;
            authTempActive.data.parent=resp.data.permissions[0].parent;
            authTempActive.data.auth.threshold=resp.data.permissions[0].required_auth.threshold;
            authTempActive.data.auth.keys=resp.data.permissions[0].required_auth.keys;
            authTempActive.data.auth.accounts=resp.data.permissions[0].required_auth.accounts;
            //账户
            for(var i=0;i<resp.data.permissions[0].required_auth.accounts.length;i++){
                if("etbexchanger" == resp.data.permissions[0].required_auth.accounts[i].permission.actor){
                    authFlag=true;
                }
            }
            
            this.setState({
                isAuth: authFlag,
                activeAuth:authTempActive,
            });
        }else{
            this.setState({isAuth: false});
        }
    } });

}
EosUpdateAuth = (account, pvk,authActiveArr, callback) => { 
    if (account == null) {
        if(callback) callback("无效账号");
        return;
    };
    // console.log("authActiveArr=%s",JSON.stringify(authActiveArr))
    Eos.transaction({
        actions: [
            authActiveArr,
        ]
    }, pvk, (r) => {
       if(callback) callback(r);
    });
};

changeAuth(authTempActive){
    AuthModal.show(this.props.navigation.state.params.wallet.account, (authInfo) => {
        try {
            EasyShowLD.loadingShow();
            this.setState({password: ''});
            this.EosUpdateAuth(this.props.navigation.state.params.wallet.account, authInfo.pk,authTempActive,(r) => {
                EasyShowLD.loadingClose();
                console.log("r=%s",JSON.stringify(r))
                if(r.isSuccess==true){
                    EasyToast.show('交易授权变更成功！');
                    this.props.navigation.goBack();
                }else{
                    EasyToast.show('交易授权变更失败！');
                }
                this.getAuthInfo();//刷新一下
            });
        } catch (error) {
            EasyShowLD.loadingClose();
            EasyToast.show('未知异常');
        }
    });
}

authExchangeCtr= () =>{ 
        //当前钱包账户，校验是否有激活
    var authTemp=JSON.parse(JSON.stringify(this.state.activeAuth));
    var isChange=false;

        if(this.state.isAuth==false){
            authTemp.data.auth.accounts.push({permission: {actor: "etbexchanger",permission: "eosio.code"},weight:1,});
            isChange=true;
        }else{
            for (var i = 0; i < authTemp.data.auth.accounts.length; i++) {
                if (authTemp.data.auth.accounts[i].permission.actor =="etbexchanger") {
                    authTemp.data.auth.accounts.splice(i, 1);
                    isChange=true;
                }
            }
        }

        if(isChange==true){
            this.changeAuth(authTemp);
        }

}

goToGithub(){
    Linking.openURL("https://github.com/eostoken");
}

    dismissKeyboardClick() {
        dismissKeyboard();
    }

   
  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="交易授权" />

        <View style={styles.head}>
            <ImageBackground style={styles.bgout} source={UImage.authFrame} resizeMode="cover">
                <Text style={[styles.Explaintext,{color: UColor.arrow}]}>使用ET交易平台进行交易时,必须授权于智能合约,否则无法交易!交易结束后,可取消授权。</Text>
                <Text style={[styles.Explaintextmiddle,{color: UColor.arrow}]}>注:智能合约并不会记录或保留您的任何信息,请放心交易。(ET交易APP代码已开源)</Text>
                <Button onPress={() => this.goToGithub()}>
                    <Text style={[styles.Tipstext2,{ color: UColor.tintColor}]}>开源地址：https://github.com/eostoken</Text>
                </Button>
            </ImageBackground>
        </View>

        <View style={styles.btnout}>
            <Text style={[styles.Applytext,{color: UColor.showy}]}>{this.state.isAuth==false?"":"当前已授权"}</Text>
        </View>
        
        <View style={styles.header}>  
          <TouchableOpacity onPress={this.authExchangeCtr.bind(this)} style={[styles.Applyout,{backgroundColor: UColor.tintColor}]}>  
              <Text style={[styles.canceltext,{color: UColor.btnColor}]}>{this.state.isAuth==false?"授权":"取消授权"}</Text>
          </TouchableOpacity>   
        </View> 

        <AuthModal {...this.props} />

    </View>
    );
  }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    head: {
        // flexDirection: "column",
        paddingVertical: ScreenUtil.autoheight(41),
        paddingHorizontal: ScreenUtil.autowidth(10)
    },
    bgout: {
        paddingTop: ScreenUtil.autoheight(70),
        paddingHorizontal: ScreenUtil.autowidth(20),
        width: ScreenWidth - ScreenUtil.autowidth(20),
        height: (ScreenWidth - ScreenUtil.autowidth(20))*0.8437,
    },
    Explaintext: {
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autoheight(60),
        lineHeight: ScreenUtil.autoheight(20), 
    },
    Explaintextmiddle: {
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autoheight(20),
        lineHeight: ScreenUtil.autoheight(20), 
    },

    Tipstext2: {
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autoheight(20),
    },
    btnout: {
        alignItems: 'flex-end',
        paddingTop: ScreenUtil.autoheight(60),
        paddingRight: ScreenUtil.autowidth(15)
    },

    Applyout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width:ScreenWidth - ScreenUtil.autowidth(20),
        height: ScreenUtil.autoheight(45),
    },
    Applytext: {
        fontSize: ScreenUtil.setSpText(12),
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: ScreenUtil.autoheight(10),
    },

    canceltext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(17),
        paddingHorizontal:ScreenUtil.autowidth(8),
    },

    passoutsource: {
        alignItems: 'center',
        flexDirection: 'column', 
    },
    inptpass: {
        textAlign: "center",
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },
});
export default AuthExchange;