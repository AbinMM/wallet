import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Image, View, Text, TextInput, Dimensions, TouchableOpacity, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import {NavigationActions} from 'react-navigation';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import TextButton from '../../components/TextButton'
import CheckMarkCircle from '../../components/CheckMarkCircle'

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, login}) => ({...wallet, ...login}))
class BackupsAOkey extends BaseComponent {
    static navigationOptions = {
        headerTitle:'备份私钥',
        header:null,             
    };
    
    // 构造函数  
    constructor(props) { 
        super(props);
        this.state = {
            password: "",
            walletPK: '',
            txt_owner: '',
            txt_active: '',
        };
    }

  //组件加载完成
  componentDidMount() {
    var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
    var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
    var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
    var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
    if ((plaintext_words_active.indexOf('eostoken') != - 1)&&(plaintext_words_owner.indexOf('eostoken') != - 1))  {
        this.setState({
            txt_active: plaintext_words_active.substr(8, plaintext_words_active.length),
            txt_owner: plaintext_words_owner.substr(8, plaintext_words_owner.length),
        })
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  goToPayForActive(params){
    const { navigate } = this.props.navigation;
    navigate('ActivationAt', params);
  }

  activeWalletOnServer(){
    let entry = this.props.navigation.state.params.entry;
    var wallet = this.props.navigation.state.params.wallet;
    let name = wallet.account;
    let owner = wallet.ownerPublic;
    let active = wallet.activePublic;
    try {
    EasyShowLD.loadingShow('正在请求');
    //检测账号是否已经激活
    this.props.dispatch({
        type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
            if(result.code == 0 && result.data == true){
                EasyShowLD.loadingClose();
                wallet.isactived = true
                this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                    AlertModal.show("恭喜激活成功",""+{name},'关闭',"知道了",(resp)=>{
                        EasyShowLD.dialogClose();
                        this.pop(3, true);
                    });
            }else {
                EasyShowLD.loadingClose();
                this.goToPayForActive({parameter:wallet, entry: entry});
            }
        }
    });
    } catch (error) {
      EasyShowLD.loadingClose();
      this.goToPayForActive({parameter:wallet, entry: entry})
      return false;
    }
  
  }

  pop(nPage, immediate) {
    const action = NavigationActions.pop({
        n: nPage,
        immediate: immediate,
    });
    this.props.navigation.dispatch(action);
  }

  backupOK(){
    var wallet = this.props.navigation.state.params.wallet;
    wallet.isBackups = true;
    this.props.dispatch({type: 'wallet/updateWallet', wallet: wallet, callback: () => {
        // 跳转至下一步
        if(wallet.isactived){
            this.pop(3, true);// 已经激活，这时钱包为已激活已备份状态，则跳回至钱包管理页面
        }else{
            this.activeWalletOnServer();// 未激活，这时钱包为已备份未激活状态，则开始激活账号流程
        }
    }});
  }

  backupConfirm() {

      var walletPkTemp = this.state.walletPK.replace(/\s+/g, "");
      walletPkTemp = walletPkTemp.replace(/<\/?.+?>/g, "");
      walletPkTemp = walletPkTemp.replace(/[\r\n]/g, "");

      if (walletPkTemp == "") {
          EasyToast.show('请输入私钥');
          return;
      }

      if (walletPkTemp.length > 51) {
          EasyToast.show('active私钥有效长度不对!');
          return;
      }

      if (walletPkTemp != this.state.txt_active || walletPkTemp != this.state.txt_owner) {
          EasyToast.show('该私钥内容有误');
          return;
      }
      if (walletPkTemp == this.state.txt_active) {
          this.backupOK();
          return;
      }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>      
            <Header {...this.props} onPressLeft={true} title="备份私钥" />   
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
                <View style={styles.header}>

                    <View style={{paddingTop: ScreenUtil.autowidth(20), flexDirection: 'row', alignItems: 'center',justifyContent: 'center',} }>
                        <Text style={{fontSize: ScreenUtil.setSpText(18),lineHeight: ScreenUtil.autoheight(25),fontWeight:"bold", 
                        color: "#262626"}}>确认您的钱包私钥</Text>
                    </View>

                    <Text style={{fontSize: ScreenUtil.setSpText(13),lineHeight: ScreenUtil.autoheight(18),paddingHorizontal:ScreenUtil.autowidth(40), 
                    paddingTop: ScreenUtil.autowidth(15),color: "#808080"}}>请输入钱包私钥，验证备份的私钥是否正确</Text>

                    <View style={{paddingTop: ScreenUtil.autowidth(50),marginHorizontal: ScreenUtil.autowidth(16), flexDirection: 'row',alignContent: 'center',justifyContent: 'center',} }>
                        <TextInput ref={(ref) => this._lphone = ref} value={this.state.walletPK} returnKeyType="next" editable={true}
                            selectionColor={UColor.tintColor} placeholderTextColor={'#D9D9D9'} autoFocus={false} maxLength={64}
                            style={[styles.inputTextStyle,{color: UColor.arrow}]} 
                            onChangeText={(walletPK) => this.setState({ walletPK })}   keyboardType="default"
                            placeholder="请输入或粘贴您的私钥" underlineColorAndroid="transparent"  multiline={true}  />
                    </View>

                    <View style={{flex: 1, marginHorizontal: ScreenUtil.autowidth(16), paddingTop:ScreenUtil.autowidth(150)}}>
                        <View style={{paddingVertical: ScreenUtil.autowidth(16), alignItems: 'center',justifyContent: 'center',} }>
                            <TextButton onPress={() => this.backupConfirm()} textColor="#FFFFFF" text="下一步"  shadow={true}  style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                        </View>
                    </View>

                </View>
            </TouchableOpacity>
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
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(15),
        marginTop: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autowidth(23),
        borderRadius: 12,
        backgroundColor: UColor.mainColor,
        paddingBottom:ScreenUtil.autowidth(55),
    },

    inputTextStyle: {
        flex: 1,
        paddingVertical: 0,
        borderBottomWidth:0.5,
        fontSize: ScreenUtil.setSpText(18),
        paddingLeft: ScreenUtil.autowidth(2),
        color: '#808080',
        borderBottomColor: '#323232',
      },
});
export default BackupsAOkey;