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
import Ionicons from 'react-native-vector-icons/Ionicons'

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class createWalletWelcome extends BaseComponent {
    
    static navigationOptions =  {
        headerTitle: '创建钱包',
        header:null,
    };

    constructor(props) {
        super(props);
    }

     //组件加载完成
     componentDidMount() {

    }

    componentWillUnmount(){
        // var entry = this.props.navigation.state.params.entry;
        // if(entry == "createWallet"){
        //     this.pop(1, true);
        // }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
    // app/route/Wallet/CreateWallet.js

    goCreateWallet(){
        const { navigate } = this.props.navigation;
        navigate('CreateWallet', {});
        // navigate('BackupsPkey', {wallet: wallet, password: this.state.walletPassword, entry: "createWallet"});
    }

  // 导入钱包
  importWallet() {
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey',{});
  }
    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: "服务及隐私条款", url: "http://news.eostoken.im/html/reg.html" });
      }
    
    // love
    // walletIcon
    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
         <Header {...this.props} onPressLeft={true} title="创建钱包" />

            <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),fontWeight:"bold",paddingHorizontal:ScreenUtil.autowidth(15), paddingTop: ScreenUtil.autowidth(22),color: "#262626"}}>我是老手有钱包</Text>
            <Button onPress={()=>this.importWallet()}>
                <View style={{marginTop: ScreenUtil.autowidth(15),marginHorizontal:ScreenUtil.autowidth(15),height: ScreenUtil.autowidth(70),borderRadius: 8,flexDirection: 'row',backgroundColor: "#FFFFFF"}}>
                    <View style={{paddingLeft:ScreenUtil.autowidth(18),flexDirection: "row",alignItems: "center",}}>  
                        <Image source={UImage.walletIcon} style={ {width: ScreenUtil.autowidth(41),height: ScreenUtil.autowidth(35),}} />
                    </View> 
                    <View style={{paddingVertical:ScreenUtil.autowidth(16),paddingHorizontal: ScreenUtil.autowidth(24),flexDirection: 'column',justifyContent: "space-between",}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(16),lineHeight: ScreenUtil.autoheight(23),fontWeight:"bold",color: "#323232"}}>导入已有钱包</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: "##808080"}}>通过私钥导入您的现有钱包</Text>
                    </View>
                    <View style={{paddingLeft:ScreenUtil.autowidth(80),flexDirection: "row",alignItems: "center",}}>  
                        <Ionicons color={'#808080'} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(20)} />  
                    </View> 
                </View>
            </Button>


            <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),fontWeight:"bold",paddingHorizontal:ScreenUtil.autowidth(15), paddingTop: ScreenUtil.autowidth(22),color: "#262626"}}>我是小白没钱包</Text>
            <Button onPress={()=>this.goCreateWallet()}>
                <View style={{marginTop: ScreenUtil.autowidth(15),marginHorizontal:ScreenUtil.autowidth(15),height: ScreenUtil.autowidth(70),borderRadius: 8,flexDirection: 'row',backgroundColor: "#FFFFFF"}}>
                    <View style={{paddingLeft:ScreenUtil.autowidth(18),flexDirection: "row",alignItems: "center",}}>  
                        <Image source={UImage.love} style={ {width: ScreenUtil.autowidth(41),height: ScreenUtil.autowidth(35),}} />
                    </View> 
                    <View style={{paddingVertical:ScreenUtil.autowidth(16),paddingLeft:ScreenUtil.autowidth(24),flexDirection: 'column',justifyContent: "space-between",}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(16),lineHeight: ScreenUtil.autoheight(23),fontWeight:"bold",color: "#323232"}}>1分钟快速创建</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: "##808080"}}>填写关键信息后，让好友帮忙或微信支付来创建</Text>
                    </View>
                    <View style={{paddingLeft:ScreenUtil.autowidth(10),flexDirection: "row",alignItems: "center",}}>  
                        <Ionicons color={'#808080'} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(20)} />  
                    </View> 
                </View>
            </Button>

            <View style={{marginHorizontal:ScreenUtil.autowidth(104),paddingTop:ScreenUtil.setSpText(20),flexDirection: "row",alignItems: "center",}}>  
                <Text onPress={() => this.prot()} style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: "#3B80F4"}}>看不懂吗？这里是《创建教程》</Text>
            </View> 
    </View>)
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },



    textTitle: {
        // flex: 1,
        fontSize: ScreenUtil.setSpText(18),
        lineHeight: ScreenUtil.autoheight(25),
        fontWeight:"bold",
        paddingTop: ScreenUtil.autowidth(22),
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

export default createWalletWelcome;
