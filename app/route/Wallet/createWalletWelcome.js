import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, DeviceEventEmitter, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
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
import {AlertModal,AlertModalView} from '../../components/modals/AlertModal'
import JPushModule from 'jpush-react-native';

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
        super.componentWillUnmount();
    }


    activeWalletOnServer(walletUnactive){
        const { navigate } = this.props.navigation;
        // let wallet = this.props.navigation.state.params.data
        var wallet=walletUnactive;
        let name = walletUnactive.account;
        let owner = walletUnactive.ownerPublic;
        let active = walletUnactive.activePublic;
        try {
          EasyShowLD.loadingShow('正在请求');
          //检测账号是否已经激活
          this.props.dispatch({
            type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
              EasyShowLD.loadingClose();
                if(result.code == 0 && result.data == true){
                    wallet.isactived = true
                    this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                    //msg:success,data:true, code:0 账号已存在
                    EasyShowLD.dialogShow("恭喜激活成功", (<View>
                        <Text style={{fontSize: ScreenUtil.setSpText(20), color: UColor.showy, textAlign: 'center',}}>{name}</Text>
                        {/* <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>您申请的账号已经被***激活成功</Text> */}
                    </View>), "知道了", null,  () => { EasyShowLD.dialogClose() });
                }else if(result.code == 500){ // 网络异常
                  EasyToast.show(result.msg);
                }else if(result.code == 515){
                  EasyToast.show("账号已被别人占用，请换个账号吧！");
                }else{
                  navigate('ActivationAt', {parameter:wallet, entry: "activeWallet"});
                }
            }
        });
        } catch (error) {
          EasyShowLD.loadingClose();
          navigate('ActivationAt', {parameter:wallet});
          return false;
        }
      
      }



      //已激活账号需要验证密码
  deleteWallet (paramsdata) {
    EasyShowLD.dialogClose();
    AuthModal.show(paramsdata.account, (authInfo) => {
      try {
          if(authInfo.isOk){
              var data = paramsdata;
              var ownerPrivateKey = paramsdata.ownerPrivate;
              var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), authInfo.password + paramsdata.salt);
              var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
              if (plaintext_words.indexOf('eostoken') != - 1) {
                plaintext_words = plaintext_words.substr(8, plaintext_words.length);
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
                //删除tags
                JPushModule.deleteTags([data.name],map => {
                  if (map.errorCode === 0) {
                    console.log('Delete tags succeed, tags: ' + map.tags)
                  } else {
                    console.log(map)
                    console.log('Delete tags failed, error code: ' + map.errorCode)
                  }
                });
                DeviceEventEmitter.addListener('delete_wallet', (tab) => {
                  this.props.navigation.goBack();
                });
              } else {
                EasyToast.show('您输入的密码不正确');
              }
          }
          EasyShowLD.dialogClose();
      } catch (error) {
        EasyShowLD.dialogClose();
        EasyToast.show('未知异常');
      }
    });
  }
    //未激活账号直接删除
    deletionDirect (paramsdata) {
        EasyShowLD.dialogClose();
        var data = paramsdata;
        this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
        //删除tags
        JPushModule.deleteTags([data.name],map => {
            if (map.errorCode === 0) {
                console.log('Delete tags succeed, tags: ' + map.tags)
            } else {
                console.log(map)
                console.log('Delete tags failed, error code: ' + map.errorCode)
            }
        });
        DeviceEventEmitter.addListener('delete_wallet', (tab) => {
            this.props.navigation.goBack();
        });
    }

    deleteWarning(c){
        AlertModal.show("免责声明","删除过程中会检测您的账号是否已激活，如果您没有备份私钥，删除后将无法找回！请确保该账号不再使用后再删除！",'下一步','返回钱包',(resp)=>{
          if(resp){
            EasyShowLD.loadingShow();
            //检测账号是否已经激活
            this.props.dispatch({
                type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: c.name, owner: c.ownerPublic, active: c.activePublic}, callback:(result) =>{
                  EasyShowLD.dialogClose();
                  if(result.code == 0 && result.data == true){
                    AlertModal.show("免责声明","系统检测到该账号已经激活!如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','返回钱包',(resp)=>{
                      if(resp){
                          this.deleteWallet(c);
                        }
                        EasyShowLD.dialogClose();
                      });
                  }else if(result.code == 521){
                    AlertModal.show("免责声明","系统检测到该账号还没激活，如果您不打算激活此账号，建议删除。",'删除','取消',(resp)=>{
                      if(resp){
                        this.deletionDirect(c);
                        }
                        EasyShowLD.dialogClose();
                      });
                  }else if(result.code == 515){
                    AlertModal.show("免责声明","系统检测到该账号已经被别人抢注，强烈建议删除。",'删除','取消',(resp)=>{
                      if(resp){
                        this.deletionDirect(c);
                        }
                        EasyShowLD.dialogClose();
                      });
                  }else {
                    AlertModal.show("免责声明","网络异常, 暂不能检测到账号是否已经激活, 建议暂不删除此账号, 如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','取消',(resp)=>{
                      if(resp){
                        this.deletionDirect(c);
                        }
                        EasyShowLD.dialogClose();
                      });
                  }
                }
            })
          }
        });
      }

    // 创建钱包
    goCreateWallet() {
        if(this.props.walletList != null){
            for(var i = 0; i < this.props.walletList.length; i++){
            if(!this.props.walletList[i].isactived){
                var unActiveWallet=this.props.walletList[i];
            //   EasyToast.show("您已有未激活钱包,不能再创建!");
                AlertModal.show("提示","当前有末激活的EOS账号，是否前往激活",'确认','删除',(resp)=>{
                if(resp){
                    this.activeWalletOnServer(unActiveWallet);
                    }else{
                    // this.deleteWarning(unActiveWallet);
                    this.deletionDirect(unActiveWallet);
                    }
                });
                return;
            }
            }
        }
        const { navigate } = this.props.navigation;
        navigate('CreateWallet', {});
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

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
         <Header {...this.props} onPressLeft={true} title="创建钱包" />

            <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),paddingHorizontal:ScreenUtil.autowidth(15), paddingTop: ScreenUtil.autowidth(22),color: "#262626"}}>我是老手有钱包</Text>
            <Button onPress={()=>this.importWallet()}>
                <View style={{marginTop: ScreenUtil.autowidth(15),marginHorizontal:ScreenUtil.autowidth(15),height: ScreenUtil.autowidth(70),borderRadius: 8,flexDirection: 'row',backgroundColor: "#FFFFFF"}}>
                    <View style={{paddingLeft:ScreenUtil.autowidth(18),flexDirection: "row",alignItems: "center",}}>  
                        <Image source={UImage.walletIcon} style={ {width: ScreenUtil.autowidth(41),height: ScreenUtil.autowidth(35),}} />
                    </View> 
                    <View style={{paddingVertical:ScreenUtil.autowidth(16),paddingHorizontal: ScreenUtil.autowidth(24),flexDirection: 'column',justifyContent: "space-between",}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(16),lineHeight: ScreenUtil.autoheight(23),color: "#323232"}}>导入已有钱包</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: "#808080"}}>通过私钥导入您的现有钱包</Text>
                    </View>
                    <View style={{paddingLeft:ScreenUtil.autowidth(80),flexDirection: "row",alignItems: "center",}}>  
                        <Ionicons color={'#808080'} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(20)} />  
                    </View> 
                </View>
            </Button>


            <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),paddingHorizontal:ScreenUtil.autowidth(15), paddingTop: ScreenUtil.autowidth(22),color: "#262626"}}>我是小白没钱包</Text>
            <Button onPress={()=>this.goCreateWallet()}>
                <View style={{marginTop: ScreenUtil.autowidth(15),marginHorizontal:ScreenUtil.autowidth(15),height: ScreenUtil.autowidth(70),borderRadius: 8,flexDirection: 'row',backgroundColor: "#FFFFFF"}}>
                    <View style={{paddingLeft:ScreenUtil.autowidth(18),flexDirection: "row",alignItems: "center",}}>  
                        <Image source={UImage.love} style={ {width: ScreenUtil.autowidth(40),height: ScreenUtil.autowidth(38),}} />
                    </View> 
                    <View style={{paddingVertical:ScreenUtil.autowidth(16),paddingLeft:ScreenUtil.autowidth(24),flexDirection: 'column',justifyContent: "space-between",}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(16),lineHeight: ScreenUtil.autoheight(23),color: "#323232"}}>1分钟快速创建</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: "#808080"}}>填写关键信息后，让好友帮忙或微信支付来创建</Text>
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
