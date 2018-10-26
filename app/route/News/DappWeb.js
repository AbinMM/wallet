import React, { Component } from 'react'
import {Platform,BackHandler,DeviceEventEmitter,Clipboard,InteractionManager,Text,View,WebView,Animated,TextInput,Dimensions,StyleSheet,Modal,TouchableOpacity,Image} from 'react-native'
import UColor from '../../utils/Colors'
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import UImage from '../../utils/Img'
import RenderScatter from './RenderScatter';
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { connect } from 'react-redux';
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import {formatEosQua} from '../../utils/FormatUtil';

import CustomWebView from './CustomWebView.android';

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet }) => ({ ...wallet }))
export default class DappWeb extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
      return {title:navigation.state.params.title,
        header:null,
    }
  }

  constructor(props) {
    super(props)
    this.props.dispatch({
        type: "wallet/getDefaultWallet",
        callback: data => {}
      });
      
    this.props.navigation.setParams({ onPress: this.share });
    this.state = {
      showAuth: false,   //授权
      showTx: false,     //transaction
      showActions: false,   //actions
      show: false,      //转账
      walletArr:null,
      tranferInfo:{fromAccount:"",toAccount:"","amount":"",memo:""},
      transactionInfo:{fromAccount:"",op_type:"",actions:"",params:{}},
      scatterAuth:{privateKey:"",data:"",whatfor:"",isHash:false},
      name: '',
      key: '', 
      password:'',
      progress: new Animated.Value(10),
      error: false,
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      optionShow:false,
      closeIcon:false,
      backButtonEnabled:false,
    }
    let noop = () => { }
    this.__onLoad = this.props.onLoad || noop
    this.__onLoadStart = this.props.onLoadStart || noop
    this.__onError = this.props.onError || noop
    // 添加返回键监听(对Android原生返回键的处理)
    this.addBackAndroidListener(this.props.navigation);
  }

  componentWillUnmount(){
      //结束页面前，资源释放操作
    if(this.refs.refWebview)
    {
        this.refs.refWebview.stopLoading();
    }
  }


  onNavigationStateChange = (navState) => {
    this.setState({
        backButtonEnabled: navState.canGoBack,
        // closeIcon: navState.canGoBack,
    });
};
// 显示/隐藏 右上角的更多选项 modal  
onRightFun() {
    // if (this.state.backButtonEnabled) {
        this.refs['refWebview'].goBack();
    // } else {//否则返回到上一个页面
    //     this.props.navigation.goBack();
    // }
}
// 监听原生返回键事件
addBackAndroidListener(navigator) {
    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
}

onBackAndroid = () => {
    if (this.state.backButtonEnabled) {
        this.refs['refWebview'].goBack();
        return true;
    }else{
        return false;
    }
};

  _onLoad() {
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth,
      duration: 200
    }).start(() => {
      setTimeout(() => {
        this.state.progress.setValue(0);
      }, 300)
    })
    this.__onLoad()
  }
  _onLoadStart() {
    this.state.progress.setValue(0);
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth * .7,
      duration: 5000
    }).start()
    this.__onLoadStart()
  }
  _onError() {
    setTimeout(() => {
      this.state.progress.setValue(0);
    }, 300)
    this.setState({ error: true })
    this.__onError()
  }
  _onLoadEnd(){
    // EasyToast.show("_onLoadEnd!");
  }
  _renderError(){
    // EasyToast.show("_renderError!");
  }

  _btnCancelModal(){
    this._setModalVisible();
    this.callbackToWebview("");
  }
  _btnCancelModalTx(){
    this._setModalVisible_Tx();
    this.callbackToWebview("");
  }
  _btnCancelModalAuth(){
    this._setModalVisible_Auth();
    this.callbackToWebview("");
  }
        // 显示/隐藏 右上角的更多选项 modal  
    moreOption() {
        let isShow = this.state.optionShow;
        this.setState({
            optionShow: !isShow,
        });
    }

    //
    pressRefalsh(){
        this.moreOption();
        if(this.refs.refWebview)
        {
            this.refs.refWebview.reload();
        }
    }

    //
    pressCopyUrl(){
        this.moreOption();
        Clipboard.setString(this.props.navigation.state.params.url);
        EasyToast.show("复制成功!");
    }

    pressShare(){
        this.moreOption();
        DeviceEventEmitter.emit('dappShare', this.props.navigation.state.params.url);
    }

    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
    inputPwd = (isTransfer) => {
        if(isTransfer){
            this._setModalVisible();
        }else{
            this._setModalVisible_Tx();
        }
        const view =
            <View style={styles.passout}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH} 
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}  
                    placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var actions;
            var permission;
            var privateKey;
            //关闭订单详情
            if(isTransfer){
                // this._setModalVisible();
                actions = [
                    {
                        account: "eosio.token",
                        name: "transfer", 
                        authorization: [{
                        actor: this.state.tranferInfo.fromAccount,
                        permission: permission,
                        }], 
                        data: {
                            from: this.state.tranferInfo.fromAccount,
                            to: this.state.tranferInfo.toAccount,
                            quantity: formatEosQua(this.state.tranferInfo.amount + " EOS"),
                            memo: this.state.tranferInfo.memo,
                        }
                    },
                ];
                privateKey = this.state.walletArr.activePrivate;
                permission = 'active';  //transfer 用 active
            }else{
                // this._setModalVisible_Tx();
                actions = this.state.transactionInfo.params.actions;

                permission = this.state.transactionInfo.params.actions[0].authorization[0].permission;
                if(permission == 'owner')
                {
                    privateKey = this.state.walletArr.ownerPrivate;
                }else{
                    privateKey = this.state.walletArr.activePrivate;
                }
            }
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.state.walletArr.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                // if(plaintext_privateKey == "eostoken"){ // active私钥为空时使用owner私钥
                //     bytes_privateKey = CryptoJS.AES.decrypt(this.state.walletArr.ownerPrivate, this.state.password + this.state.walletArr.salt);
                //     plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                //     permission = "owner"; 
                // }

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    // EasyShowLD.loadingShow();
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transaction({
                        actions: actions
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();

                        var resp_data = "";
                        if(r && r.isSuccess){
                            this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.state.tranferInfo.fromAccount, to: this.state.tranferInfo.toAccount, amount: this.state.tranferInfo.amount + " EOS", memo: this.state.tranferInfo.memo, data: "push"}});
                            resp_data = r.data;
                        }else{
                            if(r && r.data){
                                if(r.data.msg){
                                    EasyToast.show(r.data.msg);
                                }else{
                                    EasyToast.show("交易失败");
                                }
                            }else{
                                EasyToast.show("交易失败");
                            }
                        }
                        this.callbackToWebview(resp_data);
                    });
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                    this.callbackToWebview("");
                }
            } catch (error) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
                this.callbackToWebview("");
            }
            // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose(); this.callbackToWebview("");});
    }
// 显示/隐藏 modal  
_setModalVisible_Tx() {
    let isShow = this.state.showTx;
    this.setState({
        showTx: !isShow,
    });
}
_handleActions() {
    let showActions = this.state.showActions;
    this.setState({
        showActions: !showActions,
    });
}
_setModalVisible_Auth() {
    let isShowAuth = this.state.showAuth;
    this.setState({
        showAuth: !isShowAuth,
    });
}

  sendMessageToWebview(strinfo)
  {
    if(this.refs.refWebview)
    {
        this.refs.refWebview.postMessage(strinfo);
    }
  }
  callbackToWebview(retResult)
  {
    var obj_result = new Object();
    obj_result.scatter = this.state.name;
    obj_result.key = this.state.key;
    obj_result.data = retResult;
    this.sendMessageToWebview(JSON.stringify(obj_result));
  }
  onMessage = (e) =>{
      try {
        let result = JSON.parse(e.nativeEvent.data);
        switch(result.scatter)
        {
            case 'getInfo':
                this.eos_getInfo(result);
                break;

            case 'getKeyAccounts':
                this.eos_getKeyAccounts(result);
                break;

            case 'contract':
                this.eos_getContract(result);
                break;
    
            case 'getCurrencyBalance':
                this.eos_getCurrencyBalance(result);
                break;
            
            case 'getAccount':
                this.eos_getAccount(result);
                break;
    
            case 'transaction':
                this.eos_transaction(result);
                break;
    
            case 'transfer':
                this.eos_transfer(result);
                break;
    
            case 'getTableRows':
                this.eos_getTableRows(result);
                break;
    
            case 'noaccount':
                EasyToast.show('请导入账户');
                InteractionManager.runAfterInteractions(() => {
                    // WalletList.show(Globle.wallet,false,(select)=>{
                    
                    // });
                });
                break;    

            case 'getArbitrarySignature':    
                this.scatter_getArbitrarySignature(result);
                break;
          
            case 'requestTransfer':
                this.scatter_requestTransfer(result);
                break;

            case 'linkAccount':
                this.scatter_linkAccount(result);
                break;

            default:
                break;
        }
      } catch (error) {
          
      }
  }
  eos_getInfo(result){
    this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,
        data:{chain_id:Constants.EosChainId}}));

  }
  eos_getKeyAccounts(result){
    if(result.params.publicKey == null || result.params.publicKey == '')
    {
        EasyToast.show('getKeyAccounts参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({ type: 'wallet/getAccountsByPuk', payload: { public_key: result.params.publicKey},callback: (resp) => {
        if(resp && resp.code == '0'){
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp.data}));
        }else{
            EasyToast.show('账户获取失败');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        }
    } });
  }

  eos_getContract(result){
    if(result.params.contract == null || result.params.contract == '')
    {
        EasyToast.show('getContract参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }
    this.props.dispatch({
        type: 'wallet/getContract', payload: {account_name:result.params.contract }, callback: (resp) => {
            try {
                if(resp){
                    var respabi = {abi:resp.abi};
                    var obj_data = {fc:respabi};
                    this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:obj_data}));
                }else{
                    EasyToast.show('合约获取失败');
                    this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                }      
            } catch (error) {
                  EasyToast.show("eos_getContract:" + error.message);
            }
        }
      })
  }
  eos_getCurrencyBalance(result){
    if(result.params.contract == null || result.params.contract == ''
       || result.params.name == null || result.params.name == ''
       || result.params.coin == null || result.params.coin == '')
    {
        EasyToast.show('getCurrencyBalance参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: result.params.contract, account: result.params.name, symbol: result.params.coin }, callback: (resp) => {
          try {
                var tmp_balance = "";
                if (resp && resp.code == '0') {
                    if (resp.data == "") {
                        tmp_balance = '0.0000';
                    } else {
                        tmp_balance = resp.data;
                    }
                } else {
                    var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "");
                    EasyToast.show("eos_getCurrencyBalance:" +errmsg);
                }
                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:tmp_balance}));
                
            } catch (error) {
                EasyToast.show("eos_getCurrencyBalance:" +error.message);
                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            }
        }
      })
  }
  eos_getAccount(result){
    if(result.params.account == null || result.params.account == '')
    {
        EasyToast.show('getAccount参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: result.params.account},callback: (resp) => {
        if(resp){
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp}));
        }else{
            EasyToast.show('账户获取失败');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        }
    } });
  }
  eos_transaction(result){
    this.setState({
        walletArr: null,
        transactionInfo:{fromAccount:"",op_type:"",actions:"",params:{}},
        name: '',
        key: '',
    });
    if(result.params.actions == null || result.params.actions.length < 1
        || result.params.actions[0].authorization == null || result.params.actions[0].authorization.length < 1)
    {
        EasyToast.show('actions,authorization参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
        try {
         if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
            EasyToast.show("get walletList error");
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
          }else{
            for(var i = 0;i < walletArr.length;i++)
            {
              //激活的账户
              if((walletArr[i].isactived) && (walletArr[i].account == result.params.actions[0].authorization[0].actor))
              {
                  break;
              }
            }
  
            if(i >= walletArr.length)
            {
              EasyToast.show("actor is not exist or not actived");
              this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            }else{
              this._setModalVisible_Tx();
              var actions_detail = "";
              for(var j = 0;j < result.params.actions.length;j++){
                  var tmp = JSON.stringify(result.params.actions[j]);
                  actions_detail += tmp;
              }
              this.setState({
                  walletArr: walletArr[i],
                  transactionInfo:{
                      fromAccount:walletArr[i].account,
                      op_type: result.params.actions[0].account + ' -> ' + result.params.actions[0].name,
                      actions:actions_detail,
                      params: result.params},
                  name: result.scatter,
                  key: result.key,
              });
            }
          }
        } catch (error) {
            EasyToast.show("eos_transaction:" +error.message);
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        }

      }
    });
  }

  eos_transfer(result) {
    this.setState({
        walletArr: null,
        tranferInfo:{fromAccount:'',toAccount:'',amount: '',memo: ''},
        name: '',
        key: '',
    });
    if(result.params.from == null || result.params.from == '' 
         || result.params.to == null || result.params.to == '' 
         || result.params.amount == null || result.params.amount == '' 
         || result.params.memo == null)
    {
        EasyToast.show('transfer参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
        try {
            if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
                EasyToast.show("get walletList error");
                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
              }else{
                for(var i = 0;i < walletArr.length;i++)
                {
                  //激活的账户
                  if((walletArr[i].isactived) && (walletArr[i].account == result.params.from))
                  {
                      break;
                  }
                }
      
                if(i >= walletArr.length)
                {
                  EasyToast.show("from account is not exist or not actived");
                  this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                }else{
                  var tmp_amount = result.params.amount.replace(" EOS","");
                  tmp_amount = tmp_amount.replace("EOS","");
                  tmp_amount = tmp_amount.replace(" eos","");
                  tmp_amount = tmp_amount.replace("eos","");
                  this.setState({
                      walletArr: walletArr[i],
                      tranferInfo:{
                          fromAccount:result.params.from,
                          toAccount:result.params.to,
                          amount: tmp_amount,
                          memo: result.params.memo,
                      },
                      name: result.scatter,
                      key: result.key,
                  });
                  this._setModalVisible();
                }
            }
        } catch (error) {
            EasyToast.show("eos_transfer:" +error.message);
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        }

      }
    });
  }

  eos_getTableRows(result)
  {
    this.props.dispatch({
        type: 'wallet/getEosTableRows', payload: result.params.obj_param, callback: (resp) => {
          try {
            var rows;
            if (resp && resp.code == '0') {
              rows = resp.data.rows;
            } else {
              rows = [];  
            }
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:rows}));
          } catch (error) {
            console.log("getEosTableRows error: %s",error.message);
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:[]}));
          }
        }
      });
  }
  scatter_getArbitrarySignature(result)
  {
    this.setState({
        walletArr: null,
        scatterAuth:{
            publicKey:'',
            data:'',
            whatfor: '',
            isHash: false,
        },
        name: result.scatter,
        key: result.key,
    });
    
    if(result.params.publicKey == null || result.params.publicKey == '' 
         || result.params.data == null || result.params.data == '' 
         || result.params.whatfor == null
         || result.params.isHash == null)
    {
        EasyToast.show('getArbitrarySignature参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    if(result.params.isHash && result.params.data.length != 32){
        EasyToast.show('getArbitrarySignature参数data,不是hash');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;   
    }
    var privateKey = '';
    if(this.props.defaultWallet.activePublic == result.params.publicKey){
        privateKey = this.props.defaultWallet.activePrivate;
    }else if(this.props.defaultWallet.ownerPublic == result.params.publicKey){
        privateKey = this.props.defaultWallet.ownerPrivate;
    }else{
        EasyToast.show('getArbitrarySignature参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }
    this.setState({
        walletArr: this.props.defaultWallet,
        scatterAuth:{
            privateKey:privateKey,
            data:result.params.data,
            whatfor: result.params.whatfor,
            isHash: result.params.isHash,
        },
        name: result.scatter,
        key: result.key,
    });
    this._setModalVisible_Auth();
  }

  inputPwd_getArbitrarySignature = () => {
 
    this._setModalVisible_Auth();
    const view =
        <View style={styles.passout}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH} 
                style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}  
                placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>
        EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.state.scatterAuth.privateKey;

        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.state.walletArr.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);

            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                // EasyShowLD.loadingShow();
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                // if(!this.state.scatterAuth.isHash)
                {
                    Eos.sign(this.state.scatterAuth.data, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();

                        var resp_data = "";
                        if(r && r.isSuccess){
                            resp_data = r.data;
                        }else{
                            if(r && r.data){
                                if(r.data.msg){
                                    EasyToast.show(r.data.msg);
                                }else{
                                    EasyToast.show("交易失败");
                                }
                            }else{
                                EasyToast.show("交易失败");
                            }
                        }
                        this.callbackToWebview(resp_data);
                    });
                }
                // else{
                //     // hashsign
                //     Eos.signHash(this.state.scatterAuth.data, plaintext_privateKey, (r) => {
                //         EasyShowLD.loadingClose();

                //         var resp_data = "";
                //         if(r && r.isSuccess){
                //             resp_data = r.data;
                //         }else{
                //             if(r && r.data){
                //                 if(r.data.msg){
                //                     EasyToast.show(r.data.msg);
                //                 }else{
                //                     EasyToast.show("交易失败");
                //                 }
                //             }else{
                //                 EasyToast.show("交易失败");
                //             }
                //         }
                //         this.callbackToWebview(resp_data);
                //     });
                // }
            } else {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
                this.callbackToWebview("");
            }
        } catch (error) {
            EasyShowLD.loadingClose();
            EasyToast.show('密码错误');
            this.callbackToWebview("");
        }
        // EasyShowLD.dialogClose();
    }, () => { EasyShowLD.dialogClose(); this.callbackToWebview("");});
}
scatter_requestTransfer(result)
{
    try {
        if(result.params.network == null || result.params.to == null || result.params.to == ''
            || result.params.amount == null || result.params.amount == ''
            || result.params.tokenDetails == null
            || result.params.tokenDetails.contract == null
            || result.params.tokenDetails.symbol == null
            || result.params.tokenDetails.memo == null)
        {
            EasyToast.show('requestTransfer参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        if((result.params.network.blockchain != 'eos') || (result.params.network.chainId != Constants.EosChainId)){
            EasyToast.show('requestTransfer参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }

        if(result.params.tokenDetails.contract != 'eosio.token' || result.params.tokenDetails.symbol != 'EOS')
        {
            EasyToast.show('requestTransfer参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        var tmp_amount = result.params.amount.replace(" EOS","");
        tmp_amount = tmp_amount.replace("EOS","");
        tmp_amount = tmp_amount.replace(" eos","");
        tmp_amount = tmp_amount.replace("eos","");
        this.setState({
            walletArr: this.props.defaultWallet,
            tranferInfo:{
                fromAccount:this.props.defaultWallet.account,
                toAccount:result.params.to,
                amount: tmp_amount,
                memo: result.params.tokenDetails.memo,
            },
            name: result.scatter,
            key: result.key,
        });
    } catch (error) {
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
    }

}

scatter_linkAccount(result)
  {
      try {
        if(result.params.publicKey == null || result.params.publicKey == '' 
            || result.params.network == null)
        {
            EasyToast.show('linkAccount参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        if((result.params.network.blockchain != 'eos') || (result.params.network.chainId != Constants.EosChainId)){
            EasyToast.show('linkAccount参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }

        if(this.props.defaultWallet.activePublic == result.params.publicKey
            || this.props.defaultWallet.ownerPublic == result.params.publicKey){
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:true}));
        }else{
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:false}));
        }
      } catch (error) {
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:false}));
      }

  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.btnColor }}>
        <Header {...this.props} onPressLeft={true} onDappBackFalg={true} onPressRightFun={this.onRightFun.bind(this)} title={this.props.navigation.state.params.title} avatar={UImage.dapp_set} 
        onPressRight={this.moreOption.bind(this)} />
        
        {
            Platform.OS === 'android' &&   
        <CustomWebView
            ref="refWebview"
            // ref={(ref) => this._refWebview = ref}
            source={{uri:this.props.navigation.state.params.url}}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            scalesPageToFit={Platform.OS === 'ios'? true : false}
            injectedJavaScript = {RenderScatter(this.props)}
            style={[styles.webview_style,{backgroundColor: UColor.btnColor}]}
            onLoad={this._onLoad.bind(this)}
            onLoadStart={this._onLoadStart.bind(this)}
            onError={this._onError.bind(this)}
            onLoadEnd={this._onLoadEnd.bind(this)}
            renderError={this._renderError.bind(this)}
            onMessage={(e)=>{this.onMessage(e)}}
            onNavigationStateChange={this.onNavigationStateChange}
          >
        </CustomWebView>
        }
        {
            Platform.OS === 'ios' &&   
        <WebView
            ref="refWebview"
            // ref={(ref) => this._refWebview = ref}
            source={{uri:this.props.navigation.state.params.url}}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            scalesPageToFit={Platform.OS === 'ios'? true : false}
            injectedJavaScript = {RenderScatter(this.props)}
            style={[styles.webview_style,{backgroundColor: UColor.btnColor}]}
            onLoad={this._onLoad.bind(this)}
            onLoadStart={this._onLoadStart.bind(this)}
            onError={this._onError.bind(this)}
            onLoadEnd={this._onLoadEnd.bind(this)}
            renderError={this._renderError.bind(this)}
            onMessage={(e)=>{this.onMessage(e)}}
            onNavigationStateChange={this.onNavigationStateChange}
          >
        </WebView>
        }
        <View style={[styles.infoPage,{backgroundColor: UColor.secdColor},this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <View style={{backgroundColor: UColor.riceWhite,}}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => {}} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={{ width: ScreenWidth,backgroundColor: UColor.btnColor,}}>
                        <View style={styles.subView}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>订单详情</Text>
                            <Button  onPress={this._btnCancelModal.bind(this)} style={styles.buttonView}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                            <Text style={[styles.amounttext,{color:UColor.blackColor}]}>{this.state.tranferInfo.amount} </Text>
                            <Text style={[styles.unittext,{color:UColor.blackColor}]}> EOS</Text>
                        </View>
                        <View >
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>收款账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.tranferInfo.toAccount}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]}>
                                <Text style={[styles.explainText,{color: UColor.startup}]}>转出账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.tranferInfo.fromAccount}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>备注：</Text> 
                                <Text style={[styles.contentText,{color: UColor.startup}]} numberOfLines={1}>{this.state.tranferInfo.memo}</Text> 
                            </View>
                            
                            <Button onPress={() => { this.inputPwd(true) }}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确认</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal animationType={'slide'} transparent={true} visible={this.state.showTx} onShow={() => { }} onRequestClose={() => {}} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={{ width: ScreenWidth,backgroundColor: UColor.btnColor,}}>
                        <View style={styles.subView}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>订单详情</Text>
                            <Button  onPress={this._btnCancelModalTx.bind(this)} style={styles.buttonView}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View >
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>类型：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>actions</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]}>
                                <Text style={[styles.explainText,{color: UColor.startup}]}>账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.transactionInfo.fromAccount}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>{this.state.transactionInfo.op_type}</Text> 
                                <Text style={[styles.contentText,{color: UColor.tintColor}]} numberOfLines={1}
                                    onPress={this._handleActions.bind(this)}>Actions详情</Text> 
                            </View>
                            {this.state.showActions == true &&
                            <View >
                                <Text style={[styles.actionsdetail,{color: UColor.startup}]}>{this.state.transactionInfo.actions}</Text>
                            </View>}
                            
                            <Button onPress={() => { this.inputPwd(false) }}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确认</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal animationType={'slide'} transparent={true} visible={this.state.showAuth} onShow={() => { }} onRequestClose={() => {}} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={{ width: ScreenWidth,backgroundColor: UColor.btnColor,}}>
                        <View style={styles.subView}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>授权</Text>
                            <Button  onPress={this._btnCancelModalAuth.bind(this)} style={styles.buttonView}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View >
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.props.defaultWallet.account ? this.props.defaultWallet.account : ''}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]}>
                                <Text style={[styles.explainText,{color: UColor.startup}]}>Memo：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.scatterAuth.whatfor ? this.state.scatterAuth.whatfor : '获取您的钱包账户信任'}</Text>
                            </View>
                            <Button onPress={() => { this.inputPwd_getArbitrarySignature() }}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确认</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
        <Animated.View style={[styles.progress, {backgroundColor: UColor.fallColor, width: this.state.progress }]}></Animated.View>
     
 <View style={{backgroundColor: UColor.riceWhite,}}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.optionShow} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity onPress={() => {{
                                    this.setState({
                                        optionShow:false
                                    })
                                }}}

                style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={[styles.head,{ width: ScreenWidth,backgroundColor: UColor.btnColor,}]}>

                        <Button onPress={this.pressRefalsh.bind(this)} style={styles.headbtn}>
                        <View style={styles.headbtnout}>
                            <Image source={UImage.refresh_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: UColor.arrow}]}>刷新</Text>
                        </View>
                        </Button>
                        <Button onPress={this.pressCopyUrl.bind(this)} style={styles.headbtn}>
                        <View style={styles.headbtnout}>
                            <Image source={UImage.copy_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: UColor.arrow}]}>复制URL</Text>
                        </View>
                        </Button>
                        <Button  onPress={this.pressShare.bind(this)}  style={styles.headbtn}>
                        <View style={styles.headbtnout}>
                            <Image source={UImage.share_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: UColor.arrow}]}>分享</Text>
                        </View>
                        </Button>

                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    passout: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        borderBottomWidth: 1,
        textAlign: "center",
        width: ScreenWidth-100,
        height:  ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom:  ScreenUtil.autoheight(5),
    },
    webview_style: {
      flex: 1,
      marginBottom:ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(20):0,
    },
    progress: {
      position: "absolute",
      height: 5,
      left: 0,
      top: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(87):ScreenUtil.autoheight(63),
      overflow: "hidden",
    },
    infoPage: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      paddingTop: 50,
      alignItems: "center",
      transform: [
        { translateX: ScreenWidth }
      ],
    },
    showInfo: {
      transform: [
        { translateX: 0 }
      ]
    },
    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    subView: {
        flexDirection: "row", 
        alignItems: 'center',
        height:  ScreenUtil.autoheight(50), 
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center', 
    },
    buttontext: {
        textAlign: 'center',
        width:  ScreenUtil.autoheight(50),
        fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
        flex: 1,
        fontWeight: 'bold', 
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
    },
    explainText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(18),
    },
    contentText: {
        flex: 1,
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(18),
    },
    separationline: {
        alignItems: 'center',
        flexDirection: "row",
        borderBottomWidth: 0.5,
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(50),
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    amounttext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(25),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(15), 
    },
    unittext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(13),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(10), 
    },
    btnoutsource: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(45),
        marginVertical: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autoheight(15),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    
    actionsdetail: {
        fontSize: ScreenUtil.setSpText(10),
    },

    btnnextstep: {
        height:  ScreenUtil.autoheight(85),
        marginTop:  ScreenUtil.autoheight(30),
    },
    nextstep: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(20),
        height:  ScreenUtil.autoheight(45),
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center', 
        flexDirection: "column",
        marginVertical: ScreenUtil.autoheight(10),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
        marginHorizontal:  ScreenUtil.autoheight(20),
    },
    warningoutShow: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "column",
        marginTop: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(20),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    imgBtnBig: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
        margin: ScreenUtil.autowidth(5),
    },
    headtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(14), 
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight:  ScreenUtil.autoheight(20),
    },
    head: {
        flexDirection: "row",
        borderBottomWidth: 2,
        height: ScreenUtil.autoheight(70), 
        marginBottom:ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(20):0,
      },
    headbtn: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: "center", 
        padding: ScreenUtil.autowidth(5),
      },

    headbtnout: {
        flex:1, 
        alignItems: 'center', 
        justifyContent: "center",
    },
    headbtntext: {
        fontSize: ScreenUtil.setSpText(12),
    },
  })