import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from '../../components/Button'
import QRCode from 'react-native-qrcode-svg';
import JPushModule from 'jpush-react-native';
import Constants from '../../utils/Constants';
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {NavigationActions} from 'react-navigation';
import { EasyShowLD } from "../../components/EasyShow"
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
import {AlertModal,AlertModalView} from '../../components/modals/AlertModal'
import TextButton from '../../components/TextButton'
import CheckMarkCircle from '../../components/CheckMarkCircle'


const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var WeChat = require('react-native-wechat');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({wallet, login }) => ({ ...wallet, ...login }))
class ActivationAt extends BaseComponent {
    static navigationOptions = {                    
        headerTitle:'激活账户',
        header:null,                
    };
  
    constructor(props) { 
        super(props);
        this.state = {
            cpu:"0.1",
            net:"0.1",
            ram:"1",
            name:"",
            password: "",
            ownerPk: '',
            activePk: '',
            ownerPublic: '',
            activePublic: '',
            show: false,
            password: '',
        };
    }

    componentDidMount() {
        var params = this.props.navigation.state.params.parameter;
        this.setState({
            name:  params.name,
            ownerPublic: params.ownerPublic,
            activePublic: params.activePublic
        });
    }

    componentWillUnmount(){
        var entry = this.props.navigation.state.params.entry;
        if(entry == "walletDetails"){
            this.pop(3, true);
        }else if(entry == "createWallet"){
            this.pop(3, true);
        }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
    
    //返回上一页面
    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    getQRCode() { 
        // this.state.name == "" || this.state.ownerPublic == "" || this.state.activePublic == ""
        if(this.state.name == null || this.state.ownerPublic == null || this.state.activePublic == null ){
            EasyToast.show("生成二维码失败：公钥错误!");
            return;
        }
        // var  qrcode='activeWallet:' + this.state.name + '?owner=' + this.state.ownerPublic +'&active=' + this.state.activePublic+'&cpu=' + this.state.cpu +'&net=' + this.state.net +'&ram=' + this.state.ram;
        var  qrcode= '{"action":"' + 'activeWallet'  + '","account":"' + this.state.name + '","owner":"' + this.state.ownerPublic + '","active":"' + this.state.activePublic  + '","cpu":"' + this.state.cpu  + '","net":"' + this.state.net  + '","ram":"' + this.state.ram + '"}';
        return qrcode;
    }
 
    //查询激活状态
    checkAccountActive(){
        const wallet = this.props.navigation.state.params.parameter;
        var name = wallet.name;
        var owner = wallet.ownerPublic;
        var active = wallet.activePublic
        try {
            EasyShowLD.loadingShow();
            this.props.dispatch({
                type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, 
                callback:(result) =>{
                    if(result && result.code == 0 && result.data == true){
                        EasyShowLD.loadingClose();

                        wallet.isactived = true;
                        this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                        AlertModal.show("恭喜激活成功",""+name,'知道了',null,(resp)=>{
                            EasyShowLD.dialogClose();
                        });

                    }else {
                        this.props.dispatch({
                            type: "wallet/getcheckBy", payload: {accountName: this.state.name, ownerPublicKey: this.state.ownerPublic}, 
                            callback:(result) =>{
                                EasyShowLD.loadingClose();

                                if(result && result.code == 0){ // 创建账号成功, 修改钱包状态
                                    wallet.isactived = true;
                                    this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                                    AlertModal.show("恭喜激活成功",""+name,'知道了',null,(resp)=>{
                                        EasyShowLD.dialogClose();
                                    });
                                    return;
                                }

                                // 未成功创建账号情况, 包括支付成功但未创建
                                AlertModal.show("温馨提示",""+result.msg,'知道了',null,(resp)=>{
                                    EasyShowLD.dialogClose();
                                });
                            }
                        })
                    }
                }
            });
        } catch (error) {
            EasyShowLD.loadingClose();
        }
    }

    //微信支付激活
    contactWeChataide() {
        try {
            EasyShowLD.loadingShow();
            this.props.dispatch({
                type: "wallet/getcreateWxOrder", payload: {accountName: this.state.name, ownerPublicKey: this.state.ownerPublic, activePublicKey: this.state.activePublic}, 
                callback:(result) =>{
                    if(result && result.code=='0'){
                        WeChat.isWXAppInstalled().then((isInstalled) => {
                            if (isInstalled) {
                                WeChat.pay(
                                    {
                                        partnerId: result.data.partnerid,  // 商家向财付通申请的商家id
                                        prepayId: result.data.prepayid,   // 预支付订单
                                        nonceStr: result.data.noncestr,   // 随机串，防重发
                                        timeStamp: result.data.timestamp,  // 时间戳，防重发
                                        package: result.data.package,    // 商家根据财付通文档填写的数据和签名
                                        sign: result.data.sign      // 商家根据微信开放平台文档对数据做的签名
                                    }
                                ).then((success)=>{
                                    EasyToast.show("支付成功");
                                }).catch((error)=>{
                                    EasyToast.show("支付失败");
                                })
                                EasyShowLD.loadingClose();
                            }else {
                                EasyShowLD.loadingClose();
                                EasyToast.show('没有安装微信软件，请您安装微信之后再试');
                            }
                        })
                    }else{
                        EasyShowLD.loadingClose();
                    }

                }
            })
        } catch (e) {
            EasyShowLD.loadingClose();
            EasyToast.show("支付失败");
        }
    }

    onShareFriend = () => {
        DeviceEventEmitter.emit('Activation','{"account_name":"' + this.state.name + '","owner":"' + this.state.ownerPublic + '","active":"' + this.state.activePublic + '","cpu":"' + this.state.cpu + '","net":"' + this.state.net + '","ram":"'+ this.state.ram +'"}');
    }

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="激活账户" avatar={UImage.share_i} onPressRight={this.onShareFriend.bind(this)}/>
        <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <View style={[styles.inptoutbg,{backgroundColor: UColor.mainColor}]}>
                    <View style={[styles.codeout,{borderColor: UColor.secdColor}]}>
                        <View style={[styles.qrcode,{backgroundColor: UColor.btnColor}]}>
                            <QRCode size={ScreenUtil.setSpText(109)} value = {this.getQRCode()} logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(29)} logoBorderRadius={5}/>
                        </View>
                        <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fontColor }}>使用ET钱包扫一扫可激活此账号</Text>
                    </View> 
                    <View style={{paddingHorizontal: ScreenUtil.autowidth(18),paddingVertical: ScreenUtil.autowidth(20)}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor}}>激活说明：</Text>
                        <View style={{paddingTop: ScreenUtil.autoheight(20),paddingHorizontal: ScreenUtil.autowidth(18),flexDirection: 'row'}}>
                            {/* <Image source={UImage.account_jh} style={styles.accountimg}/> */}
                            <View style={styles.headout}>
                                {/* <Text style={[styles.inptitle,{paddingBottom: ScreenUtil.autoheight(5),color: UColor.fontColor}]}>激活账号，消耗EOS</Text> */}
                                <Text style={[styles.headtitle,{color: UColor.lightgray}]}>根据EOS规则，激活主网账号会消耗一定量的EOS，具体数额会根据EOS和RAM的价格波动而变化。</Text>
                            </View>  
                        </View>
                        <View style={{paddingTop: ScreenUtil.autoheight(20),paddingHorizontal: ScreenUtil.autowidth(18),flexDirection: 'row'}}>
                            {/* <Image source={UImage.character_jh} style={styles.characterimg}/> */}
                            <View style={styles.headout}>
                                {/* <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autoheight(25),color: UColor.fontColor}]}>微信支付，官方激活</Text> */}
                                <Text style={[styles.headtitle,{color: UColor.lightgray}]}>您可以通过点击下方的“微信支付激活”按钮，支付购买资源的费用，ET会帮您完成激活。</Text>
                            </View>  
                        </View>
                        <View style={{paddingTop: ScreenUtil.autoheight(20),paddingHorizontal: ScreenUtil.autowidth(18),flexDirection: 'row'}}>
                            {/* <Image source={UImage.share_jh} style={styles.shareimg}/> */}
                            <View style={styles.headout}>
                                {/* <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autoheight(25),color: UColor.fontColor}]}>分享二维码给好友，协助注册</Text> */}
                                <Text style={[styles.headtitle,{color: UColor.lightgray}]}>您也可以点击屏幕右上角的分享按钮，请朋友使用ET钱包扫描二维码，完成激活。</Text>
                            </View>  
                        </View>


                        <View style={{flex: 1, marginHorizontal: ScreenUtil.autowidth(16), paddingTop:ScreenUtil.autowidth(20)}}>
                            <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',} }>
                                <TextButton onPress={() => this.contactWeChataide()} avatar={UImage.Icons_WeChat}  textColor="#FFFFFF" text="微信支付激活"  shadow={true}  style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                            </View>
                        </View>

                        <View style={{flex: 1, marginHorizontal: ScreenUtil.autowidth(16), paddingTop:ScreenUtil.autowidth(10)}}>
                            <View style={{alignItems: 'center',justifyContent: 'center',} }>
                                <View style={{borderRadius: 25,borderWidth: 1,alignItems: 'center',justifyContent: 'center',width: ScreenUtil.autowidth(175),height:ScreenUtil.autowidth(42),borderColor: '#3B80F4'} }>
                                    <TextButton onPress={() => this.checkAccountActive()} avatar={UImage.lookup} textColor="#3B80F4" text="查询激活状态"  shadow={false}  style={{width: ScreenUtil.autowidth(171), height: ScreenUtil.autowidth(38),borderRadius: 25}} />
                                </View>
                            </View>
                        </View>

  
                    </View> 
                </View> 
            </TouchableOpacity>
        </ScrollView> 
     
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
    inptoutbg: {
        //paddingHorizontal: ScreenUtil.autowidth(20),
        // flex: 1,
        // justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(15),
        // marginTop: ScreenUtil.autowidth(10),
        // marginBottom: ScreenUtil.autowidth(23),
        borderRadius:12,
        // borderTopLeftRadius:12,
        // borderTopRightRadius:12,
        // backgroundColor: UColor.mainColor,
        // paddingBottom:ScreenUtil.autowidth(55),
    },


    accountimg: {
        width: ScreenUtil.autowidth(22),
        height: ScreenUtil.autowidth(22),
        marginRight: ScreenUtil.autowidth(10),
    },
    characterimg: {
        width: ScreenUtil.autowidth(22),
        height: ScreenUtil.autowidth(22)*1.1428,
        marginRight: ScreenUtil.autowidth(10),
    },
    shareimg: {
        width: ScreenUtil.autowidth(22),
        height: ScreenUtil.autowidth(22)*1.1875,
        marginRight: ScreenUtil.autowidth(10),
    },
    headout: {
        flex: 1,
        //paddingTop: ScreenUtil.autoheight(10),
    },
    ionicout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    prompttext: {
        fontSize: ScreenUtil.setSpText(15),
        marginRight: ScreenUtil.autowidth(10),
        marginVertical: ScreenUtil.autoheight(5),
    },
    inptitle: {
        fontSize: ScreenUtil.setSpText(15),
    },
    inptgo: {
        paddingTop: ScreenUtil.autoheight(15),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(20),
    },
    codeout: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: ScreenUtil.autoheight(10),
    },
    qrcode: {
        marginVertical: ScreenUtil.autowidth(18),
    },
    importPriout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        marginBottom: ScreenUtil.autoheight(15),
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    importPritext: {
        fontSize: ScreenUtil.setSpText(15),
    },


    footer:{
        borderRadius: 5,
        left: 0,
        right: 0,
        bottom: 0,
        position:'absolute',
        flexDirection:'row',  
        height: ScreenUtil.autoheight(50),   
        paddingTop: ScreenUtil.autoheight(1),
    },
    footoutsource:{
        flex:1, 
        flexDirection:'row',
        alignItems: 'center', 
        justifyContent: 'center', 
    },
    delete: { 
        fontSize: ScreenUtil.setSpText(16), 
    },
});

export default ActivationAt;