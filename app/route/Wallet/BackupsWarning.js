import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants';
import ScreenUtil from '../../utils/ScreenUtil'
import {NavigationActions} from 'react-navigation';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import TextButton from '../../components/TextButton'
import CheckMarkCircle from '../../components/CheckMarkCircle'


const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class BackupsWarning extends BaseComponent {
    
    static navigationOptions =  {
        headerTitle: '备份钱包',
        header:null,
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            ownerPk: '',
            activePk: '',
            samePk:false,
            show: false,
        }
    }

     //组件加载完成
     componentDidMount() {
         var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
         var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
         var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
         var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
        if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            if(plaintext_words_owner==plaintext_words_active){
                this.setState({
                    activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
                    samePk:true,
                })
            }else{
                this.setState({
                    ownerPk: plaintext_words_owner.substr(8, plaintext_words_owner.length),
                    activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
                    samePk:false,
                })
            }
        }
    }

    componentWillUnmount(){
        // var entry = this.props.navigation.state.params.entry;
        // if(entry == "createWallet"){
        //     this.pop(1, true);
        // }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }


    nextStep() {
        const { navigate } = this.props.navigation;
        var entry = this.props.navigation.state.params.entry;
        var wallet = this.props.navigation.state.params.wallet;
        var password = this.props.navigation.state.params.password;
        navigate('BackupsPkey', {wallet:wallet, password:password, entry: entry});
        // navigate('BackupsPkey', {wallet: wallet, password: this.state.walletPassword, entry: "createWallet"});
    }

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
         <Header {...this.props} onPressLeft={true} title="备份钱包" />

         <View style={styles.header}>
                <View style={{paddingTop: ScreenUtil.autowidth(110),paddingHorizontal:ScreenUtil.autowidth(134),flexDirection: 'column',}}>
                    <Image source={UImage.nophone} style={ {width: ScreenUtil.autowidth(78),height: ScreenUtil.autowidth(67),}} />
                    <Text style={[styles.inptitle,{color: "#323232"}]}>请勿截图</Text>
                </View>
                
                <View style={styles.significantout}>
                    <Text style={[styles.significanttext,{color: UColor.arrow}]} >• 如果有人拿到了你的私钥将直接获取你的财产</Text>
                    <Text style={[styles.significanttext,{color: UColor.arrow}]} >• 请抄写下私钥并存放在安全的地方</Text>
                </View>

                <View style={{flex: 1,  marginHorizontal: ScreenUtil.autowidth(16), marginTop: ScreenUtil.autowidth(24),}}>
                    <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',}}>
                        <TextButton onPress={() => this.nextStep()} textColor="#FFFFFF" text="我知道了"  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                    </View>
                </View>
        </View>
    </View>)
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    header: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(15),
        marginTop: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autowidth(23),
        borderRadius: 12,
        backgroundColor: UColor.mainColor,
        // paddingBottom:ScreenUtil.autowidth(55),
    },

    significantout: {
        flexDirection: "column",
        paddingLeft:ScreenUtil.autowidth(60),
        paddingVertical: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },

    significanttext: {
        // marginLeft: ScreenUtil.autowidth(10),
        fontSize: ScreenUtil.setSpText(10), 
        lineHeight: ScreenUtil.autoheight(25),
    },

    inptitle: {
        // flex: 1,
        fontSize: ScreenUtil.setSpText(18),
        lineHeight: ScreenUtil.autoheight(25),
        fontWeight:"bold",
        paddingTop: ScreenUtil.autowidth(22),
    },
    
});

export default BackupsWarning;
