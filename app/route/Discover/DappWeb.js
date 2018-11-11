import React, { Component } from 'react'
import {Platform,BackHandler,DeviceEventEmitter,Clipboard,InteractionManager,Text,View,WebView,Animated,TextInput,Dimensions,StyleSheet,Modal,TouchableHighlight,TouchableOpacity,Image} from 'react-native'
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
import TextButton from '../../components/TextButton'
import CustomWebView from './CustomWebView.android';
import {DappSignModal} from '../../components/modals/DappSignModal'
import {AuthModal} from '../../components/modals/AuthModal'
import {AlertModal} from '../../components/modals/AlertModal'

@connect(({ wallet,dapp,vote }) => ({ ...wallet,...dapp,...vote }))
export default class DappWeb extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
      return {title:navigation.state.params.title,
        header:null,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      authTempOwner: [],
      authTempActive: [],
      progress: new Animated.Value(10),
      error: false,
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      optionShow:false,
      backButtonEnabled:false,

    }
    this.props.dispatch({type: "wallet/getDefaultWallet",callback: data => {
        if(data && data.defaultWallet && data.defaultWallet.account){
            this.props.dispatch({ type: 'vote/getAuthInfo', payload: { page:1,username: data.defaultWallet.account},callback: (resp) => {
                if(resp && resp.code == '0'){
                    var authTempOwner=resp.data.permissions[1].required_auth.keys
                    var authTempActive=resp.data.permissions[0].required_auth.keys

                    this.setState({
                        authTempOwner: authTempOwner,
                        authTempActive: authTempActive,
                    });
                }
            } });
        }

        }
    });

    this.props.navigation.setParams({ onPress: this.share });

    let noop = () => { }
    this.__onLoad = this.props.onLoad || noop
    this.__onLoadStart = this.props.onLoadStart || noop
    this.__onError = this.props.onError || noop
    // 添加返回键监听(对Android原生返回键的处理)
    this.addBackAndroidListener(this.props.navigation);

    //保存我的dapp
    this.props.dispatch({ type: 'dapp/saveMyDapp', payload: this.props.navigation.state.params.data });
  }
   //根据公钥获取对应的私钥
   getPrivateKeyByPublicKey(publicKey)
   {
       if(this.props.defaultWallet.activePublic == publicKey){
           return this.props.defaultWallet.activePrivate;
       }

       if(this.props.defaultWallet.ownerPublic == publicKey)
       {
           return this.props.defaultWallet.ownerPrivate;
       }

        //查询是否为授权账户的公钥
        for(var i=0;i<this.state.authTempActive.length;i++){
            if(this.state.authTempActive[i].key == publicKey){
               return  this.props.defaultWallet.activePrivate;
            }
        }
        for(var i=0;i<this.state.authTempOwner.length;i++){
            if(this.state.authTempOwner[i].key == publicKey){
                return this.props.defaultWallet.ownerPrivate;
            }
        }

        return '';
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
    });
};
// 显示/隐藏 右上角的更多选项 modal
onRightFun() {
    // if (this.state.backButtonEnabled) {
        try {
            this.refs['refWebview'].goBack();

        } catch (error) {

        }
    // } else {//否则返回到上一个页面
    //     this.props.navigation.goBack();
    // }
}

onLeftCloseFun() {
    try {
        this.setState({
            backButtonEnabled: false,
        });
        this.props.navigation.goBack();
        if (this.props.navigation.state.params.callback) {
            this.props.navigation.state.params.callback()
        }
        DeviceEventEmitter.emit('access_dappweb',true);
    } catch (error) {

    }
}
// 监听原生返回键事件
addBackAndroidListener(navigator) {
    if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
}

onBackAndroid = () => {
    if (this.state.backButtonEnabled) {
        try {
            this.refs['refWebview'].goBack();
        } catch (error) {
        }
        return true;
    }else{
        this.setState({
            backButtonEnabled: false,
        });

        if (this.props.navigation.state.params.callback) {
            this.props.navigation.state.params.callback()
        }
        DeviceEventEmitter.emit('access_dappweb',true);
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
        Clipboard.setString(this.props.navigation.state.params.data.url);
        EasyToast.show("复制成功!");
    }

    pressShare(){
        this.moreOption();
        DeviceEventEmitter.emit('dappShare', this.props.navigation.state.params.data.url);
    }

    pressBrowser() {

    }

    pressCollection(){
        this.setState({ optionShow:false })
        EasyToast.show("已收藏");
        this.props.dispatch({ type: 'dapp/saveCollectionDapp', payload: this.props.navigation.state.params.data }, );
    } 

  sendMessageToWebview(strinfo)
  {
    if(this.refs.refWebview)
    {
        this.refs.refWebview.postMessage(strinfo);
    }
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

            case 'authenticate':
                this.scatter_authenticate(result);
                break;

            case 'suggestNetwork':
                this.scatter_suggestNetwork(result);
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
    if(!result.params.publicKey)
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
    if(!result.params.contract)
    {
        EasyToast.show('getContract参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }
    this.props.dispatch({
        type: 'dapp/getContract', payload: {account_name:result.params.contract }, callback: (resp) => {
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
    if(!result.params.code  || !result.params.account || !result.params.symbol)
    {
        EasyToast.show('getCurrencyBalance参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({
        type: 'dapp/getBalance', payload: { code: result.params.code, account: result.params.account, symbol: result.params.symbol }, callback: (resp) => {
         
            try {
                var array = new Array();
                if (resp) {
                    array = resp;
                } 
                 this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:array}));
            } catch (error) {
                EasyToast.show("eos_getCurrencyBalance:" +error.message);
                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            }
        }
      })
  }
  eos_getAccount(result){
    if(!result.params.account)
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

    if(!result.params.actions || result.params.actions.length < 1
        || !result.params.actions[0].authorization || result.params.actions[0].authorization.length < 1)
    {
        EasyToast.show('actions,authorization参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{
        try {
         if (!walletArr || walletArr.length < 1) {
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
              DappSignModal.show(result.params.actions,(resp)=>{
                if(resp){
                     AuthModal.show(result.params.actions[0].authorization[0].actor,(resp)=>{
                         if(resp && resp.isOk){
                            Eos.transaction({
                                actions: result.params.actions
                            }, resp.pk, (r) => {
                                var resp_data = "";
                                if(r && r.isSuccess){
                                    // this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.state.tranferInfo.fromAccount, to: this.state.tranferInfo.toAccount, amount: this.state.tranferInfo.amount + " EOS", memo: this.state.tranferInfo.memo, data: "push"}});
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
                                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                            });
                         }else{
                            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                         }
                     });
                }else{
                    this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                }
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
    if(!result.params.from || !result.params.to || !result.params.amount || !result.params.memo)
    {
        EasyToast.show('transfer参数非法');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    this.props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{
        try {
            if (!walletArr || walletArr.length < 1) {
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
                var actions = [
                    {
                        account: "eosio.token",
                        name: "transfer",
                        authorization: [{
                        actor: result.params.from,
                        permission: 'active',
                        }],
                        data: {
                            from: result.params.from,
                            to: result.params.to,
                            quantity: formatEosQua(tmp_amount + " EOS"),
                            memo: result.params.memo,
                        }
                    },
                ];

                DappSignModal.show(actions,(resp)=>{
                    if(resp){
                         AuthModal.show(result.params.from,(resp)=>{
                             if(resp && resp.isOk){
                                Eos.transaction({
                                    actions: actions
                                }, resp.pk, (r) => {
                                    var resp_data = "";
                                    if(r && r.isSuccess){
                                        this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: result.params.from, to: result.params.to,
                                              amount: tmp_amount + " EOS", memo: result.params.memo, data: "push"}});
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
                                    this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                                });
                             }else{
                                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                             }
                         });
                    }else{
                        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                    }
                });

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
        type: 'dapp/getEosTableRows', payload: result.params.obj_param, callback: (resp) => {
          try {
            var obj = new Object();
            if (resp && resp.code == '0') {
                obj = resp.data;
            } else {
                obj = null;
            }
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:obj}));
          } catch (error) {
            console.log("getEosTableRows error: %s",error.message);
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
          }
        }
      });
  }
  scatter_authenticate(result){
    {
        if(!result.params.random || result.params.random.length != 12)
        {
            EasyToast.show('authenticate参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }

        var title = '授权';
        var acc1 = this.props.defaultWallet.account ? this.props.defaultWallet.account : '';
        var memo1 = '获取您的钱包账户信任';
        var content = '账户：'+ acc1 + ' Memo:' + memo1;
        AlertModal.show(title,content,'确认','取消',(resp)=>{
        if(resp){
            AuthModal.show(this.props.defaultWallet.account,(resp)=>{
                if(resp && resp.isOk){
                    Eos.sign(result.params.random, resp.pk, (r) => {
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
                        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                    });
                }else{
                this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                }
            });

        }else{
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        }
        });
      }
  }
  scatter_suggestNetwork(result)
  {
      try {
          if(!result.params.network)
          {
              EasyToast.show('suggestNetwork参数非法');
              this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:false}));
              return ;
          }

          if((result.params.network.blockchain != 'eos') || (result.params.network.chainId != Constants.EosChainId)){
              EasyToast.show('network参数非法');
              this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:false}));
              return ;
          }
          this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:true}));
      } catch (error) {
          this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:false}));
      }
}
  scatter_getArbitrarySignature(result)
  {
    if(!result.params.publicKey || !result.params.data || 
        !result.params.hasOwnProperty('whatfor') || !result.params.hasOwnProperty('isHash'))
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

    var privateKey = this.getPrivateKeyByPublicKey(result.params.publicKey);
    if(privateKey == '')
    {
        EasyToast.show('公钥不匹配');
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
        return ;
    }

    var title = '授权';
    var acc1 = this.props.defaultWallet.account ? this.props.defaultWallet.account : '';
    var memo1 = result.params.whatfor ? result.params.whatfor : '获取您的钱包账户信任';
    var content = '账户：'+ acc1 + ' Memo:' + memo1;
    AlertModal.show(title,content,'确认','取消',(resp)=>{
      if(resp){
        AuthModal.show(this.props.defaultWallet.account,(resp)=>{
            if(resp && resp.isOk){
                // if(!result.params.isHash)
                {
                    Eos.sign(result.params.data, resp.pk, (r) => {
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
                        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                    });
                }
                // else{
                //     // hashsign
                //     Eos.signHash(result.params.data, resp.pk, (r) => {
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
                //         this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                //     });
                // }
            }else{
               this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            }
        });

      }else{
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
      }
    });

  }

scatter_requestTransfer(result)
{
    try {
        if(!result.params.network || !result.params.to 
            || !result.params.amount 
            || !result.params.tokenDetails
            || !result.params.tokenDetails.contract
            || !result.params.tokenDetails.symbol
            || !result.params.tokenDetails.hasOwnProperty('memo'))
        {
            EasyToast.show('requestTransfer参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        if((result.params.network.blockchain != 'eos') || (result.params.network.chainId != Constants.EosChainId)){
            EasyToast.show('blockchain,chainid,参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }

        if(result.params.tokenDetails.contract != 'eosio.token' || result.params.tokenDetails.symbol != 'EOS')
        {
            EasyToast.show('contract,symbol参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        var tmp_amount = result.params.amount.replace(" EOS","");
        tmp_amount = tmp_amount.replace("EOS","");
        tmp_amount = tmp_amount.replace(" eos","");
        tmp_amount = tmp_amount.replace("eos","");
        var actions = [
          {
              account: "eosio.token",
              name: "transfer",
              authorization: [{
              actor: this.props.defaultWallet.account,
              permission: 'active',
              }],
              data: {
                  from: this.props.defaultWallet.account,
                  to: result.params.to,
                  quantity: formatEosQua(tmp_amount + " EOS"),
                  memo: result.params.tokenDetails.memo,
              }
          },
      ];

      DappSignModal.show(actions,(resp)=>{
          if(resp){
               AuthModal.show(result.params.from,(resp)=>{
                   if(resp && resp.isOk){
                      Eos.transaction({
                          actions: actions
                      }, resp.pk, (r) => {
                          var resp_data = "";
                          if(r && r.isSuccess){
                              this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.props.defaultWallet.account, to: result.params.to,
                                    amount: tmp_amount + " EOS", memo: result.params.tokenDetails.memo, data: "push"}});
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
                          this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:resp_data}));
                      });
                   }else{
                      this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
                   }
               });
          }else{
              this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
          }
      });

    } catch (error) {
        this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
    }

}

scatter_linkAccount(result)
  {
      try {
        if(!result.params.publicKey || !result.params.network)
        {
            EasyToast.show('linkAccount参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }
        if((result.params.network.blockchain != 'eos') || (result.params.network.chainId != Constants.EosChainId)){
            EasyToast.show('network参数非法');
            this.sendMessageToWebview(JSON.stringify({key:result.key,scatter:result.scatter,data:null}));
            return ;
        }

        var privateKey = this.getPrivateKeyByPublicKey(result.params.publicKey);
        if(privateKey != ''){
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
        <Header {...this.props} onPressLeft={true} onDappBackFalg={true} onPressRightFun={this.onRightFun.bind(this)} title={this.props.navigation.state.params.data.name} avatar={UImage.dapp_set}
        onPressRight={this.moreOption.bind(this)} onLeftCloseFun={this.onLeftCloseFun.bind(this)} />
        {
            Platform.OS === 'android' &&
        <CustomWebView
            ref="refWebview"
            // ref={(ref) => this._refWebview = ref}
            source={{uri:this.props.navigation.state.params.data.url}}
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
            source={{uri:this.props.navigation.state.params.data.url}}
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

        <Animated.View style={[styles.progress, {backgroundColor: UColor.fallColor, width: this.state.progress }]}></Animated.View>

        <View style={{backgroundColor: UColor.riceWhite,}}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.optionShow} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity onPress={() => {{ this.setState({ optionShow:false }) }}}
                style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>
                <View style={{width: ScreenWidth, backgroundColor: '#FFFFFF',paddingTop:  ScreenUtil.autoheight(5), borderTopLeftRadius: 6, borderTopRightRadius: 6,}}>
                    <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#808080', lineHeight: ScreenUtil.autoheight(17),textAlign: 'center',}}>此服务由eostoken.com提供</Text> 
                    <View style={[styles.head,{paddingVertical:  ScreenUtil.autoheight(28),}]}>
                        <TouchableOpacity onPress={this.pressRefalsh.bind(this)} style={styles.headbtnout}>
                            <Image source={UImage.refresh_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: '#808080'}]}>刷新</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.pressCopyUrl.bind(this)} style={styles.headbtnout}>
                            <Image source={UImage.copy_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: '#808080'}]}>复制URL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity  onPress={this.pressShare.bind(this)}  style={styles.headbtnout}>
                            <Image source={UImage.share_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: '#808080'}]}>分享</Text>
                        </TouchableOpacity>
                        <TouchableOpacity  onPress={this.pressBrowser.bind(this)}  style={styles.headbtnout}>
                            <Image source={UImage.browser_dapp} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: '#808080'}]}>浏览器打开</Text>
                        </TouchableOpacity>
                        <TouchableOpacity  onPress={this.pressCollection.bind(this)}  style={styles.headbtnout}>
                            <Image source={UImage.collection} style={styles.imgBtnBig} />
                            <Text style={[styles.headbtntext,{color: '#808080'}]}>收藏</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{paddingBottom: ScreenUtil.autowidth(30), alignItems: 'center',justifyContent: 'center',}}>
                        <TextButton onPress={() => {{ this.setState({ optionShow:false }) }}} textColor="#FFFFFF" text="取消"  bgColor="#D9D9D9" style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                    </View>
                </View>
                </TouchableOpacity>
            </Modal>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    webview_style: {
      flex: 1,
      marginBottom:ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(20):0,
    },
    progress: {
      position: "absolute",
      height: 5,
      left: 0,
      top: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(87):ScreenUtil.autoheight(63),
    // top: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(77):ScreenUtil.autoheight(53),
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
        marginBottom: ScreenUtil.autoheight(5),
    },
    headtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(14),
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(20),
    },
    head: {
        width: ScreenWidth,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    headbtn: {
        alignItems: 'center',
        justifyContent: "center",
    },

    headbtnout: {
        alignItems: 'center',
        justifyContent: "center",
    },
    headbtntext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(17),
    },

    modalStyleWrite: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subViewWrite: {
        borderRadius: 10,
        width:ScreenWidth-20,
        alignSelf: 'stretch',
        justifyContent:'center',
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    titleTextWrite:{
        fontWeight:'bold',
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
        marginTop: ScreenUtil.autoheight(10),
        marginBottom: ScreenUtil.autoheight(10),
    },
    contextTextWrite:{
        fontWeight:'normal',
        textAlign:'left',
        fontSize: ScreenUtil.setSpText(10),
        marginTop: ScreenUtil.autoheight(5),
        marginBottom: ScreenUtil.autoheight(5),
        marginHorizontal: ScreenUtil.autoheight(10),
    },
    buttonWrite: {
        alignItems: 'center',
        flexDirection: "row",
        // borderBottomWidth: 0.5,
        justifyContent: 'center',
        // height:  ScreenUtil.autoheight(50),
        // marginHorizontal: ScreenUtil.autowidth(20),
    },

    readout: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(20),
        marginRight:ScreenUtil.autowidth(20),
      },
      readoutimg: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
      },
      readtext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autowidth(30),
      },
      servicetext: {
        fontSize: ScreenUtil.setSpText(12),
      },
  })
