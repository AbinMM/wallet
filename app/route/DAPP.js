import React, { Component } from 'react'
import { WebView, StyleSheet, TextInput, Image, View, NativeModules, Text, Platform, DeviceEventEmitter, BackAndroid, AppState, Linking, Dimensions, ScrollView, Animated, Easing} from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment';
import Header from '../components/Header'
import Button from '../components/Button'
import ViewShot from "react-native-view-shot";
require('moment/locale/zh-cn');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyToast } from "../components/Toast"
import { EasyShowLD } from "../components/EasyShow"
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import ScreenUtil from '../utils/ScreenUtil'
import { redirect } from '../utils/Api'
import Constants from '../utils/Constants'
import BaseComponent from "../components/BaseComponent";

let g_props;
@connect(({ news ,wallet,vote}) => ({ ...news, ...wallet, ...vote}))
export default class DAPP extends BaseComponent {

  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.state.params.title,
      header:null, 
  
      // headerRight: (navigation.state.params.news && <Button onPress={navigation.state.params.onPress}>
      //   <View style={{ padding: 15 }}>
      //     <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
      //   </View>
      // </Button>
      // ),
    }
  }

  constructor(props) {
    super(props)
    g_props = props;
  }

  componentDidMount() {
    if(Platform.OS === 'ios')
    {
      NativeModules.SDKModule.presentViewControllerFromReactNative('TestActivity',this.props.navigation.state.params.url);
   
    }else(Platform.OS === 'android')
    {
      NativeModules.SDKModule.startActivityFromReactNative(this.props.navigation.state.params.url);

      DeviceEventEmitter.addListener('CallToRN', (data) => {
        if(data){
          //  alert(data);
           try {
            var obj = JSON.parse(data);
            callMessage(obj.methodName,obj.params,obj.callback);
           } catch (error) {

           }
        }
      });
      
    }
  }



  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.mainColor }}>
        <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.title}/>
  
        {/* <Button onPress={this._openGame.bind(this)}>
               <View style={{backgroundColor: UColor.mainColor,borderRadius: 25,}}>
                 <Text style={{ fontSize: ScreenUtil.setSpText(24),color: UColor.arrow,paddingHorizontal: ScreenUtil.autowidth(10),paddingVertical: ScreenUtil.autoheight(2),}}>点击开启游戏</Text>
               </View>
        </Button> */}
        {/* 
        <View style={[styles.infoPage, this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <Animated.View style={[styles.progress, { width: this.state.progress }]}></Animated.View> */}
      </View>
    )
  }
}

function callbackToSDK(methodName,callback, resp){
  NativeModules.SDKModule.callbackFromReactNative(methodName,callback, resp);
}

//输入密码,取私钥
function inputPwd(defaultWallet,callback)
{
  var password ="";
  const view =
      <View style={styles.passoutsource}>
          <TextInput autoFocus={true} onChangeText={(pwd) => {password = pwd}} returnKeyType="go" 
              selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass}  maxLength={Constants.PWD_MAX_LENGTH} 
              placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
      </View>
      EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
          
      if (password == "" || password.length < Constants.PWD_MIN_LENGTH) {
          EasyToast.show('密码长度至少4位,请重输');
          return;
      }
      // 解析密钥
      var plaintext_privateKey = "";
      try {
          var privateKey = defaultWallet.activePrivate;
          var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, password + defaultWallet.salt);
           plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
          if (plaintext_privateKey.indexOf('eostoken') != -1) {
              plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
          } else {
              EasyToast.show('密码错误');
              plaintext_privateKey = "";
          }
      } catch (error) {
          EasyToast.show('密码错误');
          plaintext_privateKey = "";
      }

      EasyShowLD.dialogClose();
      if (callback)  callback(plaintext_privateKey);
  }, () => {
    EasyShowLD.dialogClose(); 
    if (callback)  callback("");});
}


const styles = StyleSheet.create({
  webview_style: {
    flex: 1,
    backgroundColor: UColor.fontColor,
  },
  progress: {
    position: "absolute",
    height: 2,
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: UColor.tintColor
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
    backgroundColor: UColor.secdColor
  },
  showInfo: {
    transform: [
      { translateX: 0 }
    ]
  },
  passoutsource: {
    flexDirection: 'column', 
    alignItems: 'center'
  },
  inptpass: {
    color: UColor.tintColor,
    height:  ScreenUtil.autoheight(45),
    width: ScreenUtil.screenWidth-100,
    paddingBottom:  ScreenUtil.autoheight(5),
    fontSize: ScreenUtil.setSpText(16),
    backgroundColor: UColor.fontColor,
    borderBottomColor: UColor.baseline,
    borderBottomWidth: 1,
  },
})

/**
 * 实现et.js/tp.js库对应的SDK 接口方法
 */

function eosTokenTransfer(params, callback)
{
    var str_res = '{"result":false,"data":{}}';
    var obj_param;
    try {
      obj_param = JSON.parse(params);
      if (!obj_param || !obj_param.from || !obj_param.to || !obj_param.amount || !obj_param.tokenName 
             || !obj_param.contract || !obj_param.precision) {
        console.log('eosTokenTransfer:missing params; "from", "to", "amount", "tokenName","contract", "precision" is required ');
        if (callback)  callbackToSDK('eosTokenTransfer',callback,str_res);
        return;
      }
    } catch (error) {
      console.log("eosTokenTransfer error: %s",error.message);
      if (callback)  callbackToSDK('eosTokenTransfer',callback,str_res);
      return ;
    }
    //可选项
    obj_param.memo = obj_param.memo ? obj_param.memo : "";
    obj_param.address = obj_param.address ? obj_param.address : "";

    var res = new Object();
    res.result = false;
    res.data = {};

    new Promise(function(resolve, reject){
      g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
          if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
            reject({message:"get walletList error"});
          }else{
            for(var i = 0;i < walletArr.length;i++)
            {
              if(walletArr[i].account == obj_param.from)
              {
                break;
              }
            }

            if(i >= walletArr.length)
            {
              reject({message:"from account is not exist"});
            }else{
              resolve(walletArr[i]);
            }
          }
        }
      });
    })
    .then((rdata)=>{
        return  new Promise(function(resolve, reject){
          inputPwd(rdata,(data) => {
            if(data){
              //密码正确 ,返回私钥
              resolve(data);
            }else{
              //密码错误或取消
              reject({message:"inputPwd error"});
            }
          });
        });
    })
    .then((rdata)=>{
        var plaintext_privateKey = rdata; 
        EasyShowLD.loadingShow();          
        Eos.transfer(obj_param.contract, obj_param.from, obj_param.to, formatEosQua(obj_param.amount + " " + obj_param.tokenName,obj_param.precision), obj_param.memo, plaintext_privateKey, true, (r) => {
            EasyShowLD.loadingClose();
            try {
              if(r && r.isSuccess)
              {
                g_props.dispatch({type: 'wallet/pushTransaction', payload: { from: obj_param.from, to: obj_param.to, amount: formatEosQua(obj_param.amount + " " + obj_param.tokenName,obj_param.precision), memo: obj_param.memo, data: "push"}});
                res.result = true;
                res.data.transactionId = r.data.transaction_id ? r.data.transaction_id : "";
                console.log("transfer ok");
              }else{
                var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
                console.log("transfer %s",errmsg);
                res.result = false;
                res.msg = errmsg;
              }
              str_res = JSON.stringify(res);
              if (callback)  callbackToSDK('eosTokenTransfer',callback,str_res);
            } catch (error) {
              console.log("eosTokenTransfer error: %s",error.message);
              if (callback)  callbackToSDK('eosTokenTransfer',callback,str_res);
            }
        });
    })
    .catch((error)=>{
        console.log("eosTokenTransfer error: %s",error.message);
        if (callback)  callbackToSDK('eosTokenTransfer',callback,str_res);
    });

}

function pushEosAction(params, callback)
{
    var str_res = '{"result":false,"data":{}}';
    var obj_param;
    try{
      obj_param = JSON.parse(params);
      if (!obj_param || !obj_param.actions || !obj_param.account || !obj_param.address) {
          console.log('pushEosAction:missing params; "actions", "account", "address" is required ');
          if (callback)  callbackToSDK('pushEosAction',callback,str_res);
          return;
      }
    }catch(error){
      console.log("pushEosAction error: %s",error.message);
      if (callback)  callbackToSDK('pushEosAction',callback,str_res);
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};
    
    new Promise(function(resolve, reject){
      g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
          if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
            reject({message:"get walletList error"});
          }else{
            for(var i = 0;i < walletArr.length;i++)
            {
              if(walletArr[i].account == obj_param.account)
              {
                break;
              }
            }

            if(i >= walletArr.length)
            {
              reject({message:"account is not exist"});
            }else{
              resolve(walletArr[i]);
            }
          }
        }
      });
    })
    .then((rdata)=>{
        return  new Promise(function(resolve, reject){
          inputPwd(rdata,(data) => {
            if(data){
              //密码正确 ,返回私钥
              resolve(data);
            }else{
              //密码错误或取消
              reject({message:"inputPwd error"});
            }
          });
        });
    })
    .then((rdata)=>{
        var plaintext_privateKey = rdata;
        EasyShowLD.loadingShow();          
        Eos.transaction({actions: obj_param.actions}, plaintext_privateKey, (r) => {
          EasyShowLD.loadingClose();
          try {
            if(r && r.isSuccess)
            {
              res.result = true;
              res.data.transactionId = r.data.transaction_id ? r.data.transaction_id : "";
              console.log("pushEosAction ok");
            }else{
              var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
              console.log("pushEosAction %s",errmsg);
              res.result = false;
              res.msg = errmsg;
            }
            str_res = JSON.stringify(res);
            if (callback)  callbackToSDK('pushEosAction',callback,str_res);
          } catch (error) {
            console.log("pushEosAction error: %s",error.message);
            if (callback)  callbackToSDK('pushEosAction',callback,str_res);
          }
        
      });
    })
    .catch((error)=>{
        console.log("pushEosAction error: %s",error.message);
        if (callback)  callbackToSDK('pushEosAction',callback,str_res);
    });

}
function getEosBalance(params, callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account || !obj_param.contract || !obj_param.symbol) {
        console.log('getEosBalance:missing params; "account", "contract", "symbol" is required ');
        if (callback)  callbackToSDK('getEosBalance',callback,str_res);
        return;
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};
    g_props.dispatch({
      type: 'wallet/getBalance', payload: { contract: obj_param.contract, account: obj_param.account, symbol: obj_param.symbol }, callback: (resp) => {
        try {
          if (resp && resp.code == '0') {
            if (resp.data == "") {
              res.data.balance = '0.0000';
            } else {
              res.data.balance = resp.data;
            }
            res.result = true;
            res.data.symbol = obj_param.symbol;
            res.data.contract = obj_param.contract;
            res.data.account = obj_param.account;
            res.msg = "success";
          } else {
              var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "");
              console.log("getEosBalance %s",errmsg);
              res.result = false;
              res.msg = errmsg;
          }
          str_res = JSON.stringify(res);
          if (callback)  callbackToSDK('getEosBalance',callback,str_res);
        } catch (error) {
          console.log("getEosBalance error: %s",error.message);
          if (callback)  callbackToSDK('getEosBalance',callback,str_res);
        }
      }
    })

  }catch(error){
    console.log("getEosBalance error: %s",error.message);
    if (callback)  callbackToSDK('getEosBalance',callback,str_res);
  }

}

function getTableRows(params, callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || obj_param.json == undefined || !obj_param.code || !obj_param.scope || !obj_param.table) {
        console.log('getTableRows:missing params; "json", "code", "scope", "table" is required ');
        if (callback)  callbackToSDK('getTableRows',callback,str_res);
        return;
    }

  var res = new Object();
  res.result = false;
  res.data = {};

  var objpayload = new Object();
  objpayload.json = obj_param.json;
  objpayload.code = obj_param.code;
  objpayload.scope = obj_param.scope;
  objpayload.table = obj_param.table;
  if(obj_param.table_key)  
  {
    objpayload.table_key = obj_param.table_key;
  }
  if(obj_param.lower_bound)
  {
    objpayload.lower_bound = obj_param.lower_bound;
  }
  else if(obj_param.upper_bound)
  {
    objpayload.upper_bound = obj_param.upper_bound;
  }
  objpayload.limit = obj_param.limit ? obj_param.limit : 10;
  g_props.dispatch({
    type: 'wallet/getTableRows', payload: objpayload, callback: (resp) => {
      try {
        if (resp && resp.code == '0') {
          res.result = true;
          var obj = JSON.parse(resp.data);
          res.data.rows = obj.rows;
          res.msg = "success";
        } else {
            var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "error");
            console.log("getTableRows %s",errmsg);
            res.result = false;
            res.msg = errmsg;
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK('getTableRows',callback,str_res);
      } catch (error) {
        console.log("getTableRows error: %s",error.message);
        if (callback)  callbackToSDK('getTableRows',callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getTableRows error: %s",error.message);
    if (callback)  callbackToSDK('getTableRows',callback,str_res);
  }

}
function getEosTableRows(params, callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.json || !obj_param.code || !obj_param.scope || !obj_param.table) {
        console.log('getEosTableRows:missing params; "json", "code", "scope", "table" is required ');
        if (callback)  callbackToSDK('getEosTableRows',callback,str_res);
        return;
    }

  var res = new Object();
  res.result = false;
  res.data = {};

  var objpayload = new Object();
  objpayload.json = obj_param.json;
  objpayload.code = obj_param.code;
  objpayload.scope = obj_param.scope;
  objpayload.table = obj_param.table;
  if(obj_param.table_key)  
  {
    objpayload.table_key = obj_param.table_key;
  }
  if(obj_param.lower_bound)
  {
    objpayload.lower_bound = obj_param.lower_bound;
  }
  else if(obj_param.upper_bound)
  {
    objpayload.upper_bound = obj_param.upper_bound;
  }
  objpayload.limit = obj_param.limit ? obj_param.limit : 10;
  g_props.dispatch({
    type: 'wallet/getEosTableRows', payload: objpayload, callback: (resp) => {
      try {
        if (resp && resp.code == '0') {
          res.result = true;
          var obj = JSON.parse(resp.data);
          res.data.rows = obj.rows;
          res.msg = "success";
        } else {
            var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "error");
            console.log("getEosTableRows %s",errmsg);
            res.result = false;
            res.msg = errmsg;
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK('getEosTableRows',callback,str_res);
      } catch (error) {
        console.log("getEosTableRows error: %s",error.message);
        if (callback)  callbackToSDK('getEosTableRows',callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getEosTableRows error: %s",error.message);
    if (callback)  callbackToSDK('getEosTableRows',callback,str_res);
  }

}

function getEosAccountInfo(params, callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account) {
        console.log('getEosAccountInfo:missing params; "account" is required ');
        if (callback)  callbackToSDK('getEosAccountInfo',callback,str_res);
        return;
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};

    g_props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: obj_param.account},callback: (resp) => {
      try {
        if(resp){
          res.result = true;
          res.data = resp;
          res.msg = "success";
        }else{
          res.result = false;
          res.msg = "fail";
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK('getEosAccountInfo',callback,str_res);
      } catch (error) {
        console.log("getEosAccountInfo error: %s",error.message);
        if (callback)  callbackToSDK('getEosAccountInfo',callback,str_res);
      }
    } });

  }catch(error){
    console.log("getEosAccountInfo error: %s",error.message);
    if (callback)  callbackToSDK('getEosAccountInfo',callback,str_res);
  }
}
function getEosTransactionRecord(params, callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account || obj_param.start == undefined || obj_param.count == undefined || !obj_param.sort) {
        console.log('getEosTransactionRecord:missing params; "account","start","count","sort" is required ');
        if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
        return;
    }
    if(obj_param.count < 1 || obj_param.start < 0){
      console.log('getEosTransactionRecord:params; "count","start" is error ');
      if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
      return;
    }
    if(obj_param.sort){
        if(!(obj_param.sort == 'desc' || obj_param.sort == 'asc'))
        {
            throw new Error('sort should be desc or asc');
            console.log('getEosTransactionRecord:sort should be desc or asc ');
            if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
            return;
        }
    }else{
      obj_param.sort = 'desc';
    }
    obj_param.token = obj_param.token ? obj_param.token : "";
    obj_param.contract = obj_param.contract ? obj_param.contract : "";

  var res = new Object();
  res.result = false;
  res.data = {};

  var objpayload = new Object();
  objpayload.account = obj_param.account;
  objpayload.start = obj_param.start;
  objpayload.count = obj_param.count;
  objpayload.sort = obj_param.sort;
  if(obj_param.token)
  {
    objpayload.token = obj_param.token;
  }
  if(obj_param.contract)
  {
    objpayload.contract = obj_param.contract;
  }

  g_props.dispatch({
    type: 'wallet/getEosTransactionRecord', payload: objpayload, callback: (resp) => {
      try {
        if (resp && resp.code == '0') {
          res.result = true;
          res.data = resp.data;
          res.msg = "success";
        } else {
            var errmsg = ( resp.msg ? resp.msg : "");
            console.log("getEosTransactionRecord %s",errmsg);
            res.result = false;
            res.msg = errmsg;
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
      } catch (error) {
        console.log("getEosTransactionRecord error: %s",error.message);
        if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getEosTransactionRecord error: %s",error.message);
    if (callback)  callbackToSDK('getEosTransactionRecord',callback,str_res);
  }

}


function getAppInfo(callback)
{
  var str_res = '{"result":false,"data":{}}';
  try{
    var res = new Object();
    res.result = true;
    res.data = {name:"EosToken",system:"",version:"",sys_version:"26"};
    if(Platform.OS === 'ios')
    {
      res.data.system = "ios";
    }else{
      res.data.system = "android";
    }
    res.data.version =  DeviceInfo.getVersion();
    res.msg = "success";
    str_res = JSON.stringify(res);
    if (callback)  callbackToSDK('getAppInfo',callback,str_res);
  }catch(error){
    console.log("getAppInfo error: %s",error.message);
    if (callback)  callbackToSDK('getAppInfo',callback,str_res);
  }

}

function getWalletList(params, callback)
{
  var str_res = '{wallets:{eos:[]}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.type) {
        console.log('getWalletList:missing params; "type" is required ');
        if (callback)  callbackToSDK('getWalletList',callback,str_res);
        return;
    }
    var res = new Object();
    res.wallets = {eos:[]};
    // res.result = false;
    // res.data = {eos:[]};
    g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
      try {
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          // res.result = false;
        }else{
          // res.result = true;
          var objarray = new Array();
          for(var i = 0;i < walletArr.length;i++)
          {
             //激活账户才返回
            if(walletArr[i].isactived)
            {
              var tmpobj = new Object();
              tmpobj.name = walletArr[i].name;
              tmpobj.address = walletArr[i].account;
              // tmpobj.tokens = {eos:walletArr[i].balance}; 
              var floatbalance = 0;
              try {
                  floatbalance = parseFloat(walletArr[i].balance);
              } catch (error) {
                floatbalance = 0;
              }
              tmpobj.tokens = {eos:floatbalance}; 

              objarray[i] = tmpobj;
            }
          }
          // res.data.eos = objarray;
          res.wallets.eos = objarray;
          str_res = JSON.stringify(res);
        }
        if (callback)  callbackToSDK('getWalletList',callback,str_res);
      } catch (error) {
        console.log("walletList error: %s",error.message);
        if (callback)  callbackToSDK('getWalletList',callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getWalletList error: %s",error.message);
    if (callback)  callbackToSDK('getWalletList',callback,str_res);
  }
 
}
function getDeviceId(callback)
{
  var str_res = '{"device_id":""}';
  try{
    var res = new Object();
    // res.result = true;
    // res.data = {device_id:"dexa23333"};
    res.device_id = 'dexa23333';
    str_res = JSON.stringify(res);
  }catch(error){
    console.log("getDeviceId error: %s",error.message);
  }

  if (callback)  callbackToSDK('getDeviceId',callback,str_res);
}

function shareNewsToSNS(params)
{
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.title || !obj_param.desc || !obj_param.url || !obj_param.previewImage) {
        console.log('shareNewsToSNS:missing params; "title","desc","url","previewImage" is required ');
        return;
    }
    //待分享 ,暂不实现

  }catch(error){
    console.log("shareNewsToSNS error: %s",error.message);
  }
}
function invokeQRScanner(callback){
  // var str_res = '{"result":false,"data":{}}';
  var str_res = '';
  try{
    // var res = new Object();
    // res.result = false;
    // res.data = {qrResult:""};
    var res = '';

    const { navigate } = g_props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});

    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data && data.toaccount){
        // res.result = true;
        // res.data = {qrResult:data.toaccount};
        res = data.toaccount;
      }else{
        // res.result = false;
      }

      str_res = res;
      // str_res = JSON.stringify(res);
      if (callback)  callbackToSDK('invokeQRScanner',callback,str_res);
    }); 

  }catch(error){
    console.log("invokeQRScanner error: %s",error.message);
    if (callback)  callbackToSDK('invokeQRScanner',callback,str_res);
  }

}

function getCurrentWallet(callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var res = new Object();
    res.result = false;
    res.data = {name:"",address:"",blockchain_id:4};

    g_props.dispatch({
      type: 'wallet/getDefaultWallet', callback: (data) => {
          try {
            if (data != null && data.defaultWallet.account != null) {
              res.result = true;
              res.data.name = data.defaultWallet.name;
              res.data.address = data.defaultWallet.account;
              res.msg = "success";
            } else {
                res.result = false;
                res.msg = "fail";
            }
            str_res = JSON.stringify(res);
            if (callback)  callbackToSDK('getCurrentWallet',callback,str_res);
          } catch (error) {
            console.log("getDefaultWallet error: %s",error.message);
            if (callback)  callbackToSDK('getCurrentWallet',callback,str_res);
          }
      }
    });

  }catch(error){
    console.log("getCurrentWallet error: %s",error.message);
    if (callback)  callbackToSDK('getCurrentWallet',callback,str_res);
  }

}
function getWallets(callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var res = new Object();
    res.result = true;
    res.data = [];

    g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
       try {
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          res.result = false;
          res.msg = "fail";
        }else{
          res.result = true;
          var objarray = new Array();
          for(var i = 0;i < walletArr.length;i++)
          {
            var tmpobj = new Object();
            tmpobj.name = walletArr[i].name;
            tmpobj.address = walletArr[i].account;
            // tmpobj.isactived = walletArr[i].isactived;
            tmpobj.blockchain_id = 26;

            objarray[i] = tmpobj;
          }
          res.data = objarray;
          res.msg = "success";
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK('getWallets',callback,str_res);
       } catch (error) {
        console.log("getWallets error: %s",error.message);
        if (callback)  callbackToSDK('getWallets',callback,str_res);
       }
    }

  });
    
  }catch(error){
    console.log("getWallets error: %s",error.message);
    if (callback)  callbackToSDK('getWallets',callback,str_res);
  }

}

function sign(params,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  var obj_param;
  try{
     obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.appid) {
        console.log('sign:missing params; "appid" is required ');
        if (callback)  callbackToSDK('sign',callback,str_res);
        return;
    }
  }catch(error){
    console.log("sign error: %s",error.message);
    if (callback)  callbackToSDK('sign',callback,str_res);
  }

  var res = new Object();
  res.result = false;
  res.data = {};

  new Promise(function(resolve, reject){
    g_props.dispatch({type:'wallet/getDefaultWallet',callback:(data)=>{ 
        if (data != null && data.defaultWallet.account != null)
        {
          resolve(data.defaultWallet);
        }
        else{
          reject({message:"getDefaultWallet error"});
        }
      }
    });
  })
  .then((rdata)=>{
      return  new Promise(function(resolve, reject){
        inputPwd(rdata,(data) => {
          if(data){
            //密码正确 ,返回私钥
            resolve(data);
          }else{
            //密码错误或取消
            reject({message:"inputPwd error"});
          }
        });
      });
  })
  .then((rdata)=>{
    var plaintext_privateKey = rdata;
    Eos.sign(obj_param.appid, plaintext_privateKey, (r) => {
        try {
          if(r && r.isSuccess)
          {
            res.result = true;
            res.data.deviceId = "123456789";  //TODO 
            res.data.appid = obj_param.appid;

            let  now = moment();
            res.data.timestamp = now.valueOf();
            res.data.sign = r.data;
            console.log("sign ok");
          }else{
            var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
            console.log("sign %s",errmsg);
            res.result = false;
            res.msg = errmsg;
          }
          str_res = JSON.stringify(res);
          if (callback)  callbackToSDK('sign',callback,str_res);
        } catch (error) {
          console.log("sign error: %s",error.message);
          if (callback)  callbackToSDK('sign',callback,str_res);
        }
    });
  })
  .catch((error)=>{
      console.log("sign error: %s",error.message);
      if (callback)  callbackToSDK('sign',callback,str_res);
  });

}

function callMessage(methodName, params, callback)
{
  var str_res = '{"result":false,"data":{}}';

   if(!methodName)
   {
       console.log("methodName is required");
       if (callback)  callbackToSDK('callMessage',callback,str_res);
       return;
   }
   var osType = (Platform.OS === 'ios') ? 1 : 0;

   console.log("callMessage %s",methodName);
   switch(methodName){
       case 'eosTokenTransfer':
           eosTokenTransfer(params, callback);
           break;

       case 'pushEosAction':
           pushEosAction(params, callback);
           break;

       case 'getEosBalance':
           getEosBalance(params, callback);
           break;

       case 'getTableRows':
           getTableRows(params, callback);
           break;

       case 'getEosTableRows':
           getEosTableRows(params, callback);
           break;

       case 'getEosAccountInfo':
           getEosAccountInfo(params, callback);
           break;

       case 'getEosTransactionRecord':
           getEosTransactionRecord(params, callback);
           break;

       //common
       case 'getAppInfo':
           getAppInfo(callback);
           break;    

       case 'getWalletList':
           getWalletList(params, callback);
           break;
       
       case 'getDeviceId':
           getDeviceId(callback);
           break;

       case 'shareNewsToSNS':
           shareNewsToSNS(params);
           break;

       case 'invokeQRScanner':
           invokeQRScanner(callback);
           break;

       case 'getCurrentWallet':
           getCurrentWallet(callback);
           break;

      case 'getWallets':
           getWallets(callback);
           break;     

      case 'sign':
           sign(params,callback);
           break;  
           
       default :
           console.log("methodName error");
          if (callback)  callbackToSDK('callMessage',callback,str_res);
           break;
   }
}

// //将函数注册到window对象里
// window['TPJSBrigeClient']['$'] = $;
// window['TPJSBrigeClient']['callMessage'] = callMessage;


