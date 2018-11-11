import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, DeviceEventEmitter, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import Ionicons from 'react-native-vector-icons/Ionicons'
import {AlertModal,AlertModalView} from '../../components/modals/AlertModal'
import JPushModule from 'jpush-react-native';


@connect(({ wallet }) => ({ ...wallet }))
class WalletWelcome extends BaseComponent {

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


    // 创建钱包
    goCreateWallet() {
        if (this.props.walletList != null) {
            for (var i = 0; i < this.props.walletList.length; i++) {
                if (!this.props.walletList[i].isactived) {
                    var unActiveWallet = this.props.walletList[i];
                    AlertModal.show("提示", "当前有末激活的EOS账号，是否前往激活", '确认', '删除', (resp) => {
                        if (resp) {
                            this.activeWalletOnServer(unActiveWallet);
                        } else {
                            // this.deleteWarning(unActiveWallet);
                            this.deletionDirect(unActiveWallet);
                        }
                    });
                    return;
                }
            }
        }
        const {
            navigate
        } = this.props.navigation;
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

});

export default WalletWelcome;
