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
class BackupsPkey extends BaseComponent {

    static navigationOptions =  {
        headerTitle: '备份私钥',
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

    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    }

    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }
    
    dismissKeyboardClick() {
      dismissKeyboard();
    }

    checkClick() {
    this.setState({
        show: false
    });
    }

    prot(key, data = {}) {
        const { navigate } = this.props.navigation; 
        if(key == 'activePk'){
            Clipboard.setString(this.state.activePk);
            if(this.state.samePk){
                EasyToast.show('钱包私钥已复制成功');
            }else{
                EasyToast.show('Active私钥已复制成功');
            }
        } else if(key == 'ownerPk'){
          Clipboard.setString(this.state.ownerPk);
          EasyToast.show('Owner私钥已复制成功');
        }else  if(key == 'problem') {
          navigate('Web', { title: "什么是私钥", url: "http://news.eostoken.im/html/Keystore.html" });   
        }
    }

    nextStep() {
        const { navigate } = this.props.navigation;
        var entry = this.props.navigation.state.params.entry;
        var wallet = this.props.navigation.state.params.wallet;
        var password = this.props.navigation.state.params.password;
        navigate('BackupsAOkey', {wallet:wallet, password:password, entry: entry});
    }

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
         <Header {...this.props} onPressLeft={true} title="备份私钥" />
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.scrollView}>
            <View style={styles.header}>
            {/* <View style={{flexDirection: 'row'}}> */}
            <View style={{paddingTop: ScreenUtil.autowidth(20), flexDirection: 'row', alignItems: 'center',justifyContent: 'center',} }>
                <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),fontWeight:"bold", 
                color: "#262626"}}>抄写下您的钱包私钥</Text>
            </View>
       
            <Text style={{fontSize: ScreenUtil.setSpText(13),lineHeight: ScreenUtil.autoheight(18),paddingHorizontal:ScreenUtil.autowidth(15), 
            paddingTop: ScreenUtil.autowidth(15),color: "#808080"}}>私钥用于回复钱包或充值钱包密码，请将它准确抄写在之上，并存放在只有你知道的安全的地方。</Text>

            <View style={{paddingTop: ScreenUtil.autowidth(20), flexDirection: 'row',alignContent: 'center',justifyContent: 'center',} }>
                <TouchableHighlight style={{flexDirection: 'row',alignContent: 'center',justifyContent: 'center',}} onPress={this.prot.bind(this, 'activePk')}>
                    <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),paddingHorizontal:ScreenUtil.autowidth(16), textAlign: 'center',
                    color: "#323232"}}>{""+this.state.activePk.replace(/(.{4})/g,'$1 ')}</Text>
                </TouchableHighlight>
            </View>

            <View style={{flex: 1, marginHorizontal: ScreenUtil.autowidth(16), paddingTop:ScreenUtil.autowidth(150)}}>
                <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',} }>
                    <TextButton onPress={() => this.nextStep()} textColor="#FFFFFF" text="下一步"  shadow={true}  style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                </View>
            </View>
       
            </View>
        </TouchableOpacity>
         
    </View>)
    }
}

const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        textAlign: "center",
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(15),
        marginTop: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autowidth(23),
        borderRadius: 12,
        backgroundColor: UColor.mainColor,
        paddingBottom:ScreenUtil.autowidth(55),
    },
    inptoutbg: {
        marginBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    inptitle: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        width: ScreenWidth-40,
        flexDirection: "column",
        alignItems: 'center', 
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    significanttextHead: {
        fontWeight:"bold",
        fontSize: ScreenUtil.setSpText(16), 
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    inptoutgo: {
        paddingBottom: ScreenUtil.autoheight(15),
    },
    inptgo: {
        height: ScreenUtil.autoheight(60),
        paddingHorizontal: ScreenUtil.autowidth(10),
        width: ScreenWidth - ScreenUtil.autowidth(40),
    },
    inptext: {
        flexWrap: 'wrap',
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    readtext: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(15),
    },
    importPriout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        marginTop: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    importPritext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    logout:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: ScreenUtil.autoheight(20),
    },
    logimg: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50),
    },
    logtext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(30),
    },
});

export default BackupsPkey;
