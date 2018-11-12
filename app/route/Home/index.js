import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, NativeModules, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView, RefreshControl,Linking, TouchableWithoutFeedback, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button' 
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import NativeUtil from '../../utils/NativeUtil'
import TextButton from '../../components/TextButton'
import CheckMarkCircle from '../../components/CheckMarkCircle'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import LinearGradient from 'react-native-linear-gradient'
import Ionicons from 'react-native-vector-icons/Ionicons'
import WalletWelcome from '../Wallet/WalletWelcome'

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet, assets }) => ({ ...wallet, ...assets }))
class Home extends React.Component {

  static navigationOptions = {
    tabBarLabel: '钱包',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='contain' source={focused ? UImage.tab_1_h : UImage.tab_1} style={{width: ScreenUtil.autowidth(22), height: ScreenUtil.autowidth(20)}}/>
    ),
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      fadeAnim: new Animated.Value(15),  //设置初始值
      
      balance: '0',
      account: 'xxxx',
      show: false,
      invalidWalletList: [],
      totalBalance: '0.00',
      adjustTotalBalance: '0.00',
      increase:0,
      Invalid: false,
      arr1: 0,
      isChecked: true,
      isEye: true,
      assetRefreshing: false,
      mortgage: '0',
      allowance: '0',
      listmodal: false,
      fadeOpacity: new Animated.Value(0),
      zIndex: 0,
      modalwl: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      
    };
  }

  componentDidMount() {
    //加载地址数据
    this.props.dispatch({type:'assets/getReveal',callback:(reveal)=>{
      this.setState({isEye:reveal.reveal,});
    }});

    this.props.dispatch({ type: 'wallet/updateInvalidState', payload: {Invalid: false}});
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.setState({assetRefreshing: true});
      this.props.dispatch({ type: 'assets/setCurrentAccount', payload: { accountName: (this.props.defaultWallet ? this.props.defaultWallet.name : "") }});
      this.getDefaultWalletEosBalance( () => {
        this.setState({assetRefreshing: false});
      });
      this.getAllWalletEosBalance();
      this.getIncrease();
      this.getMyAssetsInfo(() => {}, true);
      this.getResourcesinfo();
    }});
    this.props.dispatch({ type: 'wallet/walletList' });
    this.props.dispatch({ type: 'wallet/invalidWalletList',  callback: (invalidWalletList) => {
      if(invalidWalletList != null){
        this.setState({
          Invalid: true,
          arr1 : invalidWalletList.length,
          invalidWalletList : invalidWalletList
         })
      }
    }});

    Animated.timing(
      this.state.fadeAnim,  //初始值
      {
        toValue: 22,            //结束值
        duration: 2000,        //动画时间
        easing: Easing.linear,
      },
    ).start();               //开始
    // DeviceEventEmitter.addListener('wallet_info', (data) => {
    //   this.getDefaultWalletEosBalance();
    //   this.getAllWalletEosBalance();
    //   this.getMyAssetsInfo();
    // });
    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.props.dispatch({ type: 'assets/setCurrentAccount', payload: { accountName: (this.props.defaultWallet ? this.props.defaultWallet.name : "") }});
        this.getDefaultWalletEosBalance(); // 默认钱包余额
        this.getAllWalletEosBalance();
        this.getMyAssetsInfo(() => {}, true);
      } });
    });

    this.listener = RCTDeviceEventEmitter.addListener('createWallet',(value)=>{
      this.createWallet();
    });

    DeviceEventEmitter.addListener('eos_increase', (data) => {
      if(data == null || data == undefined){
        reurn;
      }
      this.setState({increase: data});
    });

    DeviceEventEmitter.addListener('eos_balance', (data) => {
      if(this.props.walletList == null || this.props.walletList.length == 0){
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      }
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssets', (data) => {
      if(this.props.defaultWallet && this.props.defaultWallet.name){
        this.props.dispatch({ type: 'assets/getMyAssetList', payload: { accountName: this.props.defaultWallet.name}, callback:()=>{
          this.getAssetBalance();
        }});
      }
    });

    // DeviceEventEmitter.addListener('updateMyAssetsBalance', (data) => {
    //   this.calTotalBalance();
    // });

    // DeviceEventEmitter.addListener('updateMyAssetsPrice', (data) => {
    //   this.calTotalBalance();
    // });

    DeviceEventEmitter.addListener('refreshWalletInfo', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        // this.getDefaultWalletEosBalance(); // 默认钱包余额
        // this.getAllWalletEosBalance();
        this.getMyAssetsInfo();
        this.getIncrease();
      } });
    });
  }

  //获取资源详情
  getResourcesinfo() {
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: (this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name},callback: (resources) => {
      if(resources != null){
        this.setState({
          assetRefreshing: false,
          mortgage: resources.self_delegated_bandwidth ? Math.floor(resources.self_delegated_bandwidth.cpu_weight.replace("EOS", "")*100 + resources.self_delegated_bandwidth.net_weight.replace("EOS", "")*100)/100 : '0',
          allowance: resources.display_data ? resources.display_data.ram_left.replace("kb", "") : '0',
        })
      }
    }});
  }

  componentWillUnmount(){
    this.listener.remove();
    this._plusDimss ();
  }

  getMyAssetsInfo(getAssetsInfoCallback, init = false){
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({ type: 'assets/myAssetInfo', payload: { page: 1, isInit: init, accountName: this.props.defaultWallet.name}, callback: (myAssets) => {
      this.calTotalBalance();
      this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
        this.getAssetBalance(getAssetsInfoCallback);
      }});
    }});
  }

  calTotalBalance(){
    if(!this.props.myAssets){
      return;
    }
    var sum = 0;
    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].balance == null || this.props.myAssets[i].asset.value == null){
          continue;
        }
        var total = this.props.myAssets[i].balance.replace(this.props.myAssets[i].asset.name, "") * this.props.myAssets[i].asset.value;
        sum = sum + total;
    }

    this.setState({totalBalance: sum.toFixed(2)});
    this.setState({adjustTotalBalance: this.adjustTotalBalance(sum.toFixed(2))});
  }

  adjustTotalBalance(obj){
    var dispassert;
    // obj = '12345678911.01';
    if(obj >= 10000.00){
      dispassert = (obj/10000.00).toFixed(2);
      dispassert += '万';
    }else{
      dispassert = obj;
    }
    if(dispassert == null){
      return this.state.totalBalance;
    }
    dispassert = dispassert === 'NaN' ? '0.00' : dispassert;
    return dispassert;
  }

  getIncrease(){
    this.props.dispatch({ type: 'sticker/listincrease', payload: { type: 0}, callback: (data) => {
        if(data == undefined || data == null){
          reurn;
        }
        if(data[0].increase){
          this.setState({increase: data[0].increase});
        }
    } });
  }

  getDefaultWalletEosBalance(callback) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      if(callback) callback();
      return;
    }

    this.props.dispatch({
      type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name , symbol: 'EOS' }, callback: () => {
        if(callback) callback();
      }
    });
  }

  getAllWalletEosBalance(){
    if(this.props.walletList == null){
      return;
    }

    for(var i = 0; i < this.props.walletList.length; i++) {
      if (this.props.walletList[i] != null && this.props.walletList[i].name != null && (this.props.walletList[i].isactived && this.props.walletList[i].hasOwnProperty('isactived'))) {
        this.props.dispatch({
          type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.walletList[i].name, symbol: 'EOS' }
        })

      }
    }
  }

  getAssetBalance(callback){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
      // EasyShowLD.loadingClose();
      this.calTotalBalance();
      if(callback) callback();

    }});
  }

  // 显示/隐藏
  _setModalInvalid() {
    this.props.dispatch({ type: 'wallet/updateInvalidState', payload: {Invalid: false}});
  }

 delInvalidWallet() {
    if(this.props.invalidWalletList == null || this.props.invalidWalletList.length == 0){
      return;
    }
    var arr = [];
    for(var i = 0; i < this.props.invalidWalletList.length; i++){
        if(this.props.invalidWalletList[i].isChecked == true){
          arr.push(this.props.invalidWalletList[i]);
        }
    }
    this.props.dispatch({ type: 'wallet/delWalletList', payload: { walletList: arr } });
    EasyToast.show("删除无效账号成功！");
    this._setModalInvalid();
  }


  gotoCpuNet(){
    const { navigate } = this.props.navigation;
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }
    navigate('CpuNet', {});
  }

  gotoRam(){
    const { navigate } = this.props.navigation;
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }
    navigate('Ram', {});
  }

  onPress(key, data = {}) {
    this._plusDimss ();
    const { navigate } = this.props.navigation;
    if(this.props.defaultWallet != null && this.props.defaultWallet.name != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(this.props.defaultWallet);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });

      return;
    }

    if (key == 'Receivables') {
      AnalyticsUtil.onEvent('Receipt_code');
      if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && (this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        navigate('TurnInAsset', {coins:this.props.myAssets[0],Choicesymbol: true, });
      } else {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
      }
    }else if (key == 'transfer') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
        return;
      }
      navigate('TurnOutAsset', { coins:this.props.myAssets[0], Choicesymbol: true, getbalance: true });
    }else if (key == 'CpuNet') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
        return;
      }
      navigate('CpuNet', {});
    }else if(key == 'addAssets'){
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
        return;
      }
      navigate('AddAssets', {});
    } else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  scan() {
    this._plusDimss ();
    if(this.props.defaultWallet != null && this.props.defaultWallet.name != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(this.props.defaultWallet);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }
    AnalyticsUtil.onEvent('Scavenging_transfer');
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived')) {
      const { navigate } = this.props.navigation;
      navigate('BarCode', {});
    } else {
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
    }
  }

  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  copy = () => {
    let address;
    if (this.props.defaultWallet != null && this.props.defaultWallet.account != null && (this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
      address = this.props.defaultWallet.account;
    } else {
      address = this.state.account;
    }
    this._wldimss();
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    // navigate('CreateWallet', {});
    navigate('createWalletWelcome', {});
    this._wldimss();
    this._plusDimss ();
    this._disableTipVisible();
  }

  // importWallet() {
  //   const { navigate } = this.props.navigation;
  //   navigate('ImportEosKey', {});
  //   this._wldimss ();
  //   this._plusDimss ();
  //   this._disableTipVisible();
  // }

  changeWallet(data) {
    this._wldimss();
    if(!data.isactived || !data.hasOwnProperty('isactived')){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(data);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
    }else {
      const { dispatch } = this.props;
      try {
        this.setState({assetRefreshing: true});
        this.props.dispatch({ type: 'wallet/changeWallet', payload: { data }, callback: () => {
          this.props.dispatch({ type: 'assets/setCurrentAccount', payload: { accountName: data.account }, callback: () => {
            this.getMyAssetsInfo(() => {
              this.setState({assetRefreshing: false});
            }, true);
          }});
        }});
        // this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: data.account },callback: (resources) => {
        //   if(resources != null){
        //     this.setState({
        //       mortgage: resources.self_delegated_bandwidth ? Math.floor(resources.self_delegated_bandwidth.cpu_weight.replace("EOS", "")*100 + resources.self_delegated_bandwidth.net_weight.replace("EOS", "")*100)/100 : '0',
        //       allowance: resources.display_data ? resources.display_data.ram_left.replace("kb", "") : '0',
        //     })
        //   }
        // } });
        this.getResourcesinfo(data.account);
        // this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      } catch (error) {
        this.setState({assetRefreshing: false});
      }
    }
  }

  assetInfo(asset) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }else {
      if(!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')){
        EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
          this.WalletDetail(this.props.defaultWallet);
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
        return;
      }
    }
    const { navigate } = this.props.navigation;
    navigate('AssetInfo', { asset, account: this.props.defaultWallet.name });
  }

  WalletDetail(data) {
    const { navigate } = this.props.navigation;
    var balance = "0.0000";
    if(this.props.myAssets && this.props.myAssets[0] && this.props.myAssets[0].balance)
    {
      balance = this.props.myAssets[0].balance;
    }

    //未激活
    if(!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))
    {
      balance = "0.0000";
    }
    navigate('WalletDetail', { data,balance:balance,isEye: this.state.isEye});
    this._wldimss ()
    this._disableTipVisible();
  }

  Establish() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    // navigate('CreateWallet', {entry: "wallet_home"});
    navigate('createWalletWelcome', {entry: "wallet_home"});
  }

  Import() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey', {});
  }

  getTodayIncrease(){
    var ret ;
    if(this.props.defaultWallet != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      ret = '+0.00';  //未激活直接返回
    }else{
      //ret = (this.state.totalBalance == null || this.state.increase == null) ? '0.00' : ((this.state.increase>=0? "+" : "") +(((this.state.totalBalance * this.state.increase) / 100).toFixed(2)))
      ret = this.state.increase == null ? '0.00' : ((this.state.increase>=0? "+" : "") +(this.state.increase.toFixed(2)))
    }
    return ret + '%';
  }

  copyname = (walletName) => {
    Clipboard.setString(walletName);
    EasyToast.show('账号复制成功');
  }

  onPressReveal() {
    this.props.dispatch({type:'assets/changeReveal',callback:(reveal)=>{
      this.setState({
        isEye:reveal.reveal,
      });
    }});
  }

  onRefresh(){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null){
      return;
    }

    this.setState({assetRefreshing: true});
    // this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
    //   this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
    //     this.setState({assetRefreshing: false});
    //   }});
    // }});

    // 默认钱包余额
    // this.getDefaultWalletEosBalance();

    //获取资源详情
    this.getResourcesinfo((this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name);

    // this.getMyAssetsInfo(() => {this.setState({assetRefreshing: false})});
    this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
      this.getAssetBalance(() => {this.setState({assetRefreshing: false})});
    }});
  }

  isTipShow() {
    if (Platform.OS == 'ios') {
      if(this.props.tipFlagIOS==true){
        if(this.props.defaultWallet!= null && this.props.defaultWallet.account!=null && this.props.defaultWallet.isBackups==false){
            return true;
        }
      }
    }
    return false;
  }

    // 显示/隐藏 tipIOS
    _disableTipVisible() {
      this.props.dispatch({ type: 'wallet/updateTipState', payload: {tipFlagIOS: false}});
    }


  WalletDetailBackup(data) {
    const { navigate } = this.props.navigation;
    navigate('WalletDetail', { data,balance:this.props.myAssets[0].balance,});
    this._disableTipVisible();
  }

  openSystemSetting(){
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }
  }

  _onScroll(event) {
    if(event.nativeEvent.contentOffset.y>50){
      if(this.showMenu){
        return;
      }
      this.showMenu = true;
      this.setState({zIndex:9999})
      Animated.timing(this.state.fadeOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,// 线性的渐变函数
      }).start();
    }else{
      if(!this.showMenu){
        return;
      }
      Animated.timing(this.state.fadeOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,// 线性的渐变函数
      }).start(() => {
        this.showMenu=false;
        this.setState({zIndex: 0})
      });
    }
  }

  iswlShowDimss () {
    if(this.state.modalwl){
      this._wldimss();
    }else{
      this._wlshow();
    }
  }

  _wlshow () {
    if(this.isShow)return;
    this.isShow = true;
    window.currentDialog = this;
    this.setState({modalwl:true});
    Animated.parallel([
      Animated.timing(this.state.mask,{toValue:0.6,duration:400}),
      Animated.timing(this.state.alert,{toValue:1,duration:300})
    ]).start(() => {});
  }

  _wldimss () {
    if(!this.isShow)return;
    window.currentDialog = null;
    Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0,duration:400}),
        Animated.timing(this.state.alert,{toValue:0,duration:300})
    ]).start(() => {
        this.setState({modalwl:false});
        this.isShow = false;
    });
  }

  isplusShowDimss () {
    if(this.state.listmodal){
      this._plusDimss();
    }else{
      this._plusShow();
    }
  }

  _plusShow () {
    if(this.isShow)return;
    this.isShow = true;
    window.currentDialog = this;
    this.setState({listmodal:true});
    Animated.parallel([
      Animated.timing(this.state.mask,{toValue:0.6,duration:400}),
      Animated.timing(this.state.alert,{toValue:1,duration:300})
    ]).start(() => {});
  }

  _plusDimss () {
    if(!this.isShow)return;
    window.currentDialog = null;
    Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0,duration:400}),
        Animated.timing(this.state.alert,{toValue:0,duration:300})
    ]).start(() => {
        this.setState({listmodal:false});
        this.isShow = false;
    });
  }

  _renderHeader() {
    return(<View style={{flex: 1, alignItems: 'center',backgroundColor: '#F9FAF9'}}>
        <View style={{overflow: 'hidden', justifyContent: 'center',}}>
          <ImageBackground style={{width: ScreenWidth, height: ScreenWidth*0.7893, paddingTop: Constants.FitPhone}} source={UImage.home_bg}>
            <View style={[styles.topbtn,]}>
              <TouchableOpacity onPress={()=>{this.iswlShowDimss()}} style={{flex: 1, height: ScreenUtil.autowidth(44), paddingHorizontal: ScreenUtil.autowidth(20),alignItems: 'flex-start',justifyContent: 'center', }}>
                <View style={{flexDirection: 'row',alignItems:"center"}}>
                  <Text style={{fontSize: ScreenUtil.setSpText(14), color: '#FFFFFF', marginRight: ScreenUtil.autowidth(5)}}>{this.props.defaultWallet.account}</Text>
                  <TouchableOpacity onPress={()=>{this.copy()}}> 
                    <Image source={UImage.copy} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12),marginHorizontal: ScreenUtil.autowidth(15),}} />
                  </TouchableOpacity>
                  <Ionicons color={'#FFFFFF'} style={{marginTop:4}} name={this.state.modalwl ? "md-arrow-dropdown" : "md-arrow-dropright"} size={18} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.isplusShowDimss()}} style={{flex: 1, height: ScreenUtil.autowidth(44), paddingHorizontal: ScreenUtil.autowidth(20), alignItems:'flex-end', justifyContent: 'center', }}>
                <Ionicons color={'#FFFFFF'} name={"ios-add-outline"} size={36} />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1, alignItems: 'center',justifyContent: 'space-around'}}>
              <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                <Text style={{fontSize: ScreenUtil.setSpText(14), color: '#FFF', }}>全部资产</Text>
                <TouchableOpacity onPress={this.onPressReveal.bind(this,this.state.isEye)}>
                  <Image source={this.state.isEye ? UImage.reveal : UImage.reveal_h} style={styles.imgTeOy}/>
                </TouchableOpacity>
              </View>
              <Text style={{fontSize: ScreenUtil.setSpText(32), color: '#FFFFFF', fontWeight: 'bold',lineHeight: ScreenUtil.autoheight(45),}}>¥ {this.state.isEye ? ((this.props.defaultWallet == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) ? '0.00' : "" + this.state.adjustTotalBalance) : '****'}</Text>
              <Text style={{fontSize: ScreenUtil.setSpText(12), color: '#FFFFFF',lineHeight: ScreenUtil.autoheight(30),}}>（已抵押 {this.state.mortgage} EOS）</Text>
              <View style={[styles.head,{flex: 1,}]}>
                <Button onPress={this.onPress.bind(this, 'transfer')} style={styles.headbtn}>
                  <View style={styles.headbtnout}>
                    <Image source={UImage.transfer_h} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: '#FEFEFE'}]}>转账</Text>
                  </View>
                </Button>
                <Button onPress={this.onPress.bind(this, 'Receivables')} style={styles.headbtn}>
                  <View style={styles.headbtnout}>
                    <Image source={UImage.qr_h} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: '#FEFEFE'}]}>收款</Text>
                  </View>
                </Button>
                <Button onPress={this.onPress.bind(this, 'CpuNet')} style={styles.headbtn}>
                  <View style={styles.headbtnout}>
                    <Image source={UImage.resources_h} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: '#FEFEFE'}]}>资源</Text>
                  </View>
                </Button>
              </View>
            </View>
          </ImageBackground>
        </View>
    </View>)
  }

  _renderFooter () {
    return(
      <View style={{marginBottom: ScreenUtil.autowidth(27), alignItems: 'center',justifyContent: 'center',}}>
        <TextButton onPress={this.onPress.bind(this, 'addAssets')} textColor="#FFFFFF" text="添加资产"  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
      </View>
      
    )
  }

  _renderRow = (rowData, sectionID, rowID) => {
    return(<View style={[{marginHorizontal: ScreenUtil.autowidth(15),marginBottom: ScreenUtil.autoheight(15), borderRadius: 8, overflow: 'hidden',},rowID == 0 && {marginTop: ScreenUtil.autowidth(10)}]}>
        <Button onPress={this.assetInfo.bind(this, rowData)}>
          <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
            <View style={styles.lefts}>
              <View style={{borderRadius: 25,backgroundColor: UColor.secdfont,marginRight: ScreenUtil.autowidth(15)}}> 
                <Image source={rowData.asset.icon==null ? UImage.eos : { uri: rowData.asset.icon }} style={styles.leftimg} />
              </View>
              <Text style={[styles.lefttext,{color: '#262626'}]}>{rowData.asset.name}</Text>
            </View>
            <View style={styles.rights}>
              <Text style={[styles.rightbalance,{color: '#262626'}]}>{this.state.isEye ? (rowData.balance==null || rowData.balance=="" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.0000" : rowData.balance.replace(rowData.asset.name, "") : '****'}</Text>
              <Text style={[styles.rightmarket,{color:  '#808080'}]}>{(rowData.balance==null || rowData.balance=="" || rowData.asset.value == null || rowData.asset.value == "" || rowData.asset.value == 0 || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? " " : this.state.isEye ? "≈" + (rowData.balance.replace(rowData.asset.name, "")*rowData.asset.value).toFixed(2) + "￥" : '****'}</Text>
            </View>
          </View>
        </Button>
    </View>)
  }

  render() {
    if(this.props.guide){
      return (
        <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
          <View style={{width:ScreenWidth,height:ScreenUtil.autoheight(44), marginTop:20,justifyContent:"center",backgroundColor: "#FFFFFF"}}>
            <Text style={{fontSize: ScreenUtil.setSpText(20),lineHeight: ScreenUtil.autoheight(25),textAlign: 'center',color: "#323232"}}>添加钱包</Text>
          </View>
          <WalletWelcome {...this.props}/>        
        </View>
      )
    }else{
      return (
        <View style={[styles.container,{backgroundColor: '#F7F8F9'}]}>
          {Constants.isNetWorkOffline && <Button onPress={this.openSystemSetting.bind(this)}>
                <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
                    <Text style={[styles.systemSettingText,{color: UColor.btnColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                    <Ionicons style={[styles.systemSettingArrow,{color: UColor.btnColor}]} name="ios-arrow-forward-outline" size={20} />
                </View>
          </Button>}
          <Animated.View style={{zIndex:this.state.zIndex,position:"absolute",top:0,left:0,width:ScreenWidth,opacity: this.state.fadeOpacity}}>
            <LinearGradient style={{width: ScreenWidth, height: Constants.FitPhone + ScreenUtil.autowidth(45), flexDirection: "row", justifyContent: "center",}}  paddingTop = {Constants.FitPhone} colors={['#3EA0FE', '#353CE0']}  start={{x: 0.25, y: 0.25}} end={{x: 0.75, y: 0.75}}>
              <TouchableOpacity onPress={this.onPress.bind(this, 'transfer')} style={{flexDirection: "row", alignItems: 'center', paddingHorizontal: ScreenUtil.autowidth(15),}}>
                  <Image resizeMode='contain' source={UImage.transfer_float} style={{width: ScreenUtil.autowidth(20),height: ScreenUtil.autowidth(20),marginRight: ScreenUtil.autowidth(7)}} />
                  <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#FFFFFF'}}>转账</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.onPress.bind(this, 'Receivables')} style={{flexDirection: "row", alignItems: 'center', paddingHorizontal: ScreenUtil.autowidth(15),}}>
                  <Image resizeMode='contain' source={UImage.receipt_float} style={{width: ScreenUtil.autowidth(20),height: ScreenUtil.autowidth(20),marginRight: ScreenUtil.autowidth(7)}} />
                  <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#FFFFFF'}}>收款</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.onPress.bind(this, 'CpuNet')} style={{flexDirection: "row", alignItems: 'center', paddingHorizontal: ScreenUtil.autowidth(15),}}>
                  <Image resizeMode='contain' source={UImage.resources_float} style={{width: ScreenUtil.autowidth(20),height: ScreenUtil.autowidth(20),marginRight: ScreenUtil.autowidth(7)}} />
                  <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#FFFFFF'}}>资源</Text>
              </TouchableOpacity>
              <View style={{flex:1}}/>
              <TouchableOpacity onPress={()=>{this.isplusShowDimss()}} style={{alignItems: 'center', justifyContent: "center", paddingHorizontal: ScreenUtil.autowidth(20), }}>
                <Ionicons color={'#FFFFFF'} name={"ios-add-outline"} size={36} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
          <ListView 
            refreshControl={<RefreshControl refreshing={this.state.assetRefreshing} onRefresh={() => this.onRefresh()}
            tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
            onScroll={(event) => this._onScroll(event)}  enableEmptySections={true} initialListSize={10}
            renderHeader={() => this._renderHeader()}  renderFooter={() => this._renderFooter()}
            dataSource={this.state.dataSource.cloneWithRows(this.props.myAssets == null ? [] : this.props.myAssets)}
            renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
          />

          {this.state.modalwl && <View style={styles.continer}>
            <TouchableWithoutFeedback onPress={()=>{this._wldimss()}}>
              <View style={[styles.content,]}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask,}]} />
                <View style={styles.alertContent}>
                  <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                    <View style={{paddingTop: ScreenUtil.autowidth(10),paddingLeft: ScreenUtil.autowidth(15),}}>
                     <Ionicons color={'#FFFFFF'} style={{position: 'absolute', top: Platform.OS === 'ios' ? - ScreenUtil.autowidth(7) : - ScreenUtil.autowidth(9), left: ScreenUtil.autowidth(20),}} name={'md-arrow-dropup'} size={30} />
                      <View style={[styles.touchableout,{backgroundColor:'#F9FAF9'}]}>
                        <ListView initialListSize={5} enableEmptySections={true} 
                          dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                          renderRow={(rowData) => (
                            (!rowData.isactived || !rowData.hasOwnProperty('isactived'))?null:
                            <TouchableOpacity onPress={this.changeWallet.bind(this, rowData)} >
                              <View style={[styles.walletlist]}>
                                <CheckMarkCircle markSize={ScreenUtil.autowidth(10)} width={ScreenUtil.autowidth(14)} height={ScreenUtil.autowidth(14)} 
                                selected={(this.props.defaultWallet == null || this.props.defaultWallet.name == rowData.account)} onPress={this.changeWallet.bind(this, rowData)}/>
                                <Text style={[styles.outname,{color: '#262626'}]}>{rowData.name}</Text>
                                <TouchableOpacity onPress={this.copyname.bind(this,rowData.name)}> 
                                  <Image source={UImage.copy_h} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12),marginHorizontal: ScreenUtil.autowidth(15),}} />
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>}

          {this.state.listmodal && <View style={styles.continer}>
            <TouchableWithoutFeedback onPress={()=>{this._plusDimss()}} >
              <View style={{alignItems: 'flex-end', justifyContent: 'flex-start',width: "100%",height:"100%",}}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask,}]} />
                <View style={{width:ScreenUtil.autowidth(112),height: ScreenUtil.autoheight(170), marginRight: ScreenUtil.autowidth(15), shadowColor: '#999999',shadowOffset:{height: 4,width: 0},shadowRadius: 12,shadowOpacity: 0.3,elevation: 5,}}>
                  <Animated.View style={{opacity:this.state.alert,}}>
                    <View style={{paddingTop: ScreenUtil.autowidth(10),}}>
                      <Ionicons color={'#FFFFFF'} style={{position: 'absolute', top: Platform.OS === 'ios' ? - ScreenUtil.autowidth(7) : - ScreenUtil.autowidth(9), right: ScreenUtil.autowidth(6)}} name={'md-arrow-dropup'} size={30} />
                      <View style={{width:ScreenUtil.autowidth(112),height: ScreenUtil.autoheight(120),backgroundColor: '#FFFFFF',borderRadius: 5,}}>
                        <Button onPress={() => this.scan()} >
                          <View style={[styles.establishout,{}]}>
                            <Image source={UImage.scan} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12)}} />
                            <Text style={[styles.establishtext,{color: '#262626'}]}>扫一扫</Text>
                          </View>
                        </Button>
                        <Button onPress={this.onPress.bind(this, 'addAssets')} >
                          <View style={[styles.establishout,{borderTopWidth: 0.5,borderTopColor: '#F0F0F0'}]}>
                            <Image source={UImage.xin_add} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12)}} />
                            <Text style={[styles.establishtext,{color: '#262626'}]}>添加资产</Text>
                          </View>
                        </Button>
                        <Button onPress={() => this.createWallet()} >
                          <View style={[styles.establishout,{borderTopWidth: 0.5,borderTopColor: '#F0F0F0'}]}>
                            <Image source={UImage.xin_qr} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12)}} />
                            <Text style={[styles.establishtext,{color: '#262626'}]}>添加钱包</Text>
                          </View>
                        </Button>
                        {/* <Button onPress={() => this.importWallet()} >
                          <View style={[styles.establishout,{borderTopWidth: 0.5,borderTopColor: '#F0F0F0'}]}>
                            <Image source={UImage.xin_import} style={{width: ScreenUtil.autowidth(12),height: ScreenUtil.autowidth(12)}} />
                            <Text style={[styles.establishtext,{color: '#262626'}]}>导入钱包</Text>
                          </View>
                        </Button> */}
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>}

          {/* <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.isTipShow()} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-20, backgroundColor: UColor.btnColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}>
                  <Button onPress={this._disableTipVisible.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <Text style={styles.contentText}>IOS用户重要提示</Text>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <Image source={UImage.warning_h} style={styles.imgBtn} />
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>亲爱的eostoken用户：由于App Store平台自身存在证书授权过期问题导致app无法打开的情况发生，造成数据丢失。当前系统检测到您尚未备份钱包，为了避免资产损失，请您及时备份。</Text>
                </View>
                <Button onPress={this.WalletDetailBackup.bind(this,this.props.defaultWallet)}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.btnColor}]}>立即备份</Text>
                    </View>
                </Button>
              </View>
            </TouchableOpacity>
          </Modal> */}

          <Modal style={styles.touchableouts} animationType={'slide'} transparent={true}  visible={this.props.Invalid} onRequestClose={()=>{}}>
            <TouchableOpacity style={styles.pupuo} activeOpacity={1.0}>
              <View style={[styles.modalStyle,{backgroundColor: UColor.fontColor}]}>
                <View style={styles.subView}>
                  <Text style={styles.titleText}/>
                  <Text style={styles.contentText}>无效账户删除提示</Text>
                  <Button onPress={this._setModalInvalid.bind(this)}>
                    <Text style={[styles.titleText,{color: UColor.baseline}]}>×</Text>
                  </Button>
                </View>
                <Text style={[styles.prompt,{color: UColor.showy}]}>警告：系统检测到您有无效账号残留，为了避免误转账至无效账户带来不必要的损失，请即时清理无效账户！</Text>
                <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true}
                    dataSource={this.state.dataSource.cloneWithRows(this.props.invalidWalletList == null ? [] : this.props.invalidWalletList)}
                    renderRow={(rowData, sectionID, rowID) => (
                      <View>
                          <Button >
                              <View style={[styles.codeout,{borderBottomColor: UColor.riceWhite}]} >
                                  <View style={styles.copyout}>
                                      <Text style={[styles.copytext,{color: UColor.secdColor}]}>{rowData.name}</Text>
                                  </View>
                                  <TouchableOpacity style={styles.taboue} >
                                      <View style={[styles.tabview,{borderColor: UColor.lightgray}]} >
                                          <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                      </View>
                                  </TouchableOpacity>
                              </View>
                          </Button>
                      </View>
                    )}
                  />
                  <Button onPress={this.delInvalidWallet.bind(this)}>
                      <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.fontColor}]}>一键删除</Text>
                      </View>
                  </Button>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )
    };
  }
}

const styles = StyleSheet.create({
  continer:{
    left:0,
    top:ScreenUtil.autoheight(34) + Constants.FitPhone,
    position: 'absolute',
    zIndex: 99999,
    flex: 1,
    width:"100%",
    height:"100%"
  },
  content:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    flex:1,
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 0,
    width:"100%",
    height:"100%",
  },
  alertContent:{
    width:"100%",
    height:"100%",
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor:"rgba(0, 0, 0, 0.0)",
  },
  alert:{
    flex:1,
    width:"100%",
    borderRadius:4,
    flexDirection: 'column',
  },
  title:{
    color:"#1A1A1A",
    fontWeight:"bold",
    textAlign:"center",
    lineHeight:ScreenUtil.setSpText(26),
    fontSize:ScreenUtil.setSpText(16),
    marginTop:ScreenUtil.setSpText(18),
    margin:ScreenUtil.setSpText(10)
  },
  ctx:{
    color:"#808080",
    marginBottom:ScreenUtil.setSpText(10),
    marginHorizontal:ScreenUtil.setSpText(20),
    lineHeight:ScreenUtil.setSpText(24),
    fontSize:ScreenUtil.setSpText(12.5),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(49),
    marginTop:ScreenUtil.autowidth(10)
  },

  container: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: ScreenUtil.autowidth(20),
    paddingVertical: ScreenUtil.autowidth(15),
  },

  topbtn: {
    width: ScreenWidth,

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
  },
  toptext: {
    textAlign: "center",
    height: ScreenUtil.autoheight(40),
    fontSize: ScreenUtil.setSpText(18),
    lineHeight: ScreenUtil.autoheight(40),
  },
  bgtopout: {
    width:ScreenWidth,
  },

  bgout: {
    width:ScreenWidth-ScreenUtil.autowidth(30),
  },
  head: {
    flexDirection: "row",
    width: ScreenWidth,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  
  headbtnout: {
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: "center",
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  resourceout: {
    flex: 1,
    flexDirection: "column",
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratiotext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  recordtext: {
    fontSize: ScreenUtil.setSpText(12),
  },

  addto: {
    top: ScreenUtil.autowidth(215),
    position: "absolute",
    flexDirection: "column",
    justifyContent: "center",
    width: ScreenWidth-ScreenUtil.autowidth(20),
    paddingLeft: ScreenUtil.autowidth(25),
    paddingRight: ScreenUtil.autowidth(8),
    paddingBottom: ScreenUtil.autowidth(18),
  },
  addout: {
    flexDirection: "row",
    alignItems: 'center',
  },

  backoractivestyle: {
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(18),
  },
  accountText: {
    fontSize: ScreenUtil.setSpText(16),
  },
  addtotext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  imgTeOy: {
    width: ScreenUtil.autowidth(19),
    height: ScreenUtil.autowidth(13),
    margin: ScreenUtil.autowidth(8),
  },
  imgoney: {
    width: ScreenUtil.autowidth(15),
    height: ScreenUtil.autowidth(10),
    margin: ScreenUtil.autowidth(8),
  },
  addtoouttop: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  addtoouttext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  addtoout: {
    flexDirection: "row",
    alignItems: 'center',
  },

  addbtnout: {
    flex:1,
    alignItems: 'center',
    justifyContent: "center",
  },

  touchableouts: {
    flex: 1,
    flexDirection: "column",
  },
  touchable: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  touchableout: {
    borderRadius: 3,
    alignItems: 'center',
    paddingBottom: ScreenUtil.autowidth(1),
    width: ScreenUtil.autowidth(180),
  },

  imgBtn: {
    margin: ScreenUtil.autowidth(10),
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
  },

  walletlist: {
    flexDirection: "row",
    alignItems: 'center',
    height: ScreenUtil.autoheight(48),
    width: ScreenUtil.autowidth(180),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },

  outname: {
    flex: 1,
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
    marginLeft: ScreenUtil.autowidth(10),
  },
  stopoutBackupsout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(18),
  },
  stopoutBackups: {
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(12),
  },

  notactivedout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notactived: {
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(10),
  },

  walletaccount: {
    flex:1,
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(12),
  },

  btnout: {
    width: '100%',
    alignItems: 'center',
    flexDirection: "column",
  },
  estabwallet: {
    flexDirection: "row",
    alignItems: 'center',
    height: ScreenUtil.autoheight(60),
  },

  establishout: {
    flexDirection: "row",
    alignItems: 'center',
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(16),
  },
  establishimg:{
    width: ScreenUtil.autowidth(17),
    height: ScreenUtil.autowidth(18),
  },
  establishtext: {
    flex: 1,
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(13),
    paddingLeft: ScreenUtil.autowidth(15),
  },

  pupuo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalStyle: {
      width: ScreenWidth,
      height: ScreenHeight * 2 / 3,
  },
  subView: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(30),
    marginVertical: ScreenUtil.autoheight(15),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  titleText: {
    textAlign: 'center',
    width: ScreenUtil.autowidth(40),
    fontSize: ScreenUtil.setSpText(28),
  },
  contentText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(18),
    paddingBottom: ScreenUtil.autoheight(20),
  },
  buttonView: {
    alignItems: 'flex-end',
  },
  prompt: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(12),
    marginBottom: ScreenUtil.autoheight(20),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  codeout: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: 'center',
    height: ScreenUtil.autoheight(50),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  copyout: {
    flex: 1,
    paddingLeft: ScreenUtil.autowidth(30),
  },
  copytext: {
    fontSize: ScreenUtil.setSpText(15),
  },

  lefts: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  leftimg: {
    width: ScreenUtil.autowidth(39), 
    height: ScreenUtil.autowidth(39),
  },
  lefttext: {
    fontSize: ScreenUtil.setSpText(16),
  },
  rights: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: "column",
    justifyContent: "center",
  },

  rightbalance: {
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(18), 
  },
  rightmarket: {
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(10),
  },

  incdocupout: {
    borderBottomLeftRadius: 25,
    borderTopLeftRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  cupcdo:{
    fontSize: ScreenUtil.setSpText(14),
  },
  imgTop: {
    width: ScreenUtil.autowidth(121),
    height: ScreenUtil.autowidth(121),
 },
 btnestablish: {
   flex: 2,
   alignItems: 'center',
   justifyContent: 'center',
 },
 btnimport: {
   borderRadius: 5,
   borderWidth: 0.5,
   alignItems: 'center',
   justifyContent: 'center',
   height: ScreenUtil.autoheight(50),
   marginVertical: ScreenUtil.autoheight(10),
   marginHorizontal: ScreenUtil.autowidth(20),
   width: ScreenWidth-ScreenUtil.autowidth(40),
 },
 btntext: {
   fontSize: ScreenUtil.setSpText(18),
 },

 taboue: {
  alignItems: 'center',
  justifyContent: 'center',
},
tabview: {
  borderWidth: 1,
  margin: ScreenUtil.autowidth(5),
  width: ScreenUtil.autowidth(24),
  height: ScreenUtil.autowidth(24),
},
tabimg: {
  width: ScreenUtil.autowidth(24),
  height: ScreenUtil.autowidth(24),
},

deleteout: {
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
  height: ScreenUtil.autoheight(45),
  marginVertical: ScreenUtil.autoheight(15),
  marginHorizontal: ScreenUtil.autowidth(60),
},
deletetext: {
  fontSize: ScreenUtil.setSpText(16),
},

pupuoBackup: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

headout: {
  paddingTop: ScreenUtil.autoheight(20),
  paddingBottom: ScreenUtil.autoheight(15),
},
warningout: {
  borderWidth: 1,
  borderRadius: 5,
  flexDirection: "row",
  alignItems: 'center',
  marginHorizontal: ScreenUtil.autowidth(15),
  width: ScreenWidth-ScreenUtil.autowidth(50),
},
imgBtnBackup: {
  width: ScreenUtil.autowidth(30),
  height: ScreenUtil.autowidth(30),
},

headtitle: {
  flex: 1,
  fontSize: ScreenUtil.setSpText(14),
  lineHeight: ScreenUtil.autoheight(25),
  paddingLeft: ScreenUtil.autowidth(10),
},

  subViewBackup: {
    flexDirection: "row",
    alignItems: 'center',
  },
  subViewBackup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(30),
    width: ScreenWidth-ScreenUtil.autowidth(20),
  },
  buttonView2: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(30),
  },

  systemSettingTip: {
    width: ScreenWidth,
    flexDirection: "row",
    alignItems: 'center',
    height: ScreenUtil.autoheight(40),

  },
  systemSettingText: {
    flex: 1,
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(14)
  },
  systemSettingArrow: {
    marginRight: ScreenUtil.autowidth(5)
  },
});

export default Home;
