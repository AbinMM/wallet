import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView,NativeModules, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView, RefreshControl,Linking, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter' 
import Ionicons from 'react-native-vector-icons/Ionicons'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet, assets }) => ({ ...wallet, ...assets }))
class Home extends React.Component {

  static navigationOptions = {
    tabBarLabel: '钱包',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='stretch'
          source={focused ? UImage.tab_1_h : UImage.tab_1} style={{width: ScreenUtil.autoheight(20), height: ScreenUtil.autoheight(20),}}
      />
    ),
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      fadeAnim: new Animated.Value(15),  //设置初始值
      modal: false,
      balance: '0',
      account: 'xxxx',
      show: false,
      invalidWalletList: [],
      totalBalance: '0.00',
      increase:0,
      Invalid: false,
      arr1: 0,
      isChecked: true,
      isEye: false,
      assetRefreshing: false,
    };
  }

  componentDidMount() {
    //加载地址数据
    this.props.dispatch({type:'assets/getReveal',callback:(reveal)=>{ this.setState({isEye:reveal.reveal,});}});
    this.props.dispatch({ type: 'wallet/updateInvalidState', payload: {Invalid: false}});
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.setState({assetRefreshing: true});
      this.getDefaultWalletEosBalance( () => {
        this.setState({assetRefreshing: false});
      });
      this.getAllWalletEosBalance();
      this.getIncrease();
      this.getMyAssetsInfo();
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
    DeviceEventEmitter.addListener('wallet_info', (data) => {
      this.getDefaultWalletEosBalance();
      this.getAllWalletEosBalance();
      this.getMyAssetsInfo();    
    });
    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getDefaultWalletEosBalance(); // 默认钱包余额
        this.getAllWalletEosBalance();
        this.getMyAssetsInfo();
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
      this.getAssetBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssetsBalance', (data) => {
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssetsPrice', (data) => {
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('refreshWalletInfo', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getDefaultWalletEosBalance(); // 默认钱包余额
        this.getAllWalletEosBalance();
        this.getMyAssetsInfo(); 
        this.getIncrease();
      } });
    });
  }

  componentWillUnmount(){
    this.listener.remove();  
  }

  getMyAssetsInfo(getAssetsInfoCallback){
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({ type: 'assets/myAssetInfo', payload: { page: 1, isInit: true, accountName: this.props.defaultWallet.name}, callback: (myAssets) => {
      this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
        if(getAssetsInfoCallback) getAssetsInfoCallback();
        this.getAssetBalance();    
      }});
    }});
  }

  calTotalBalance(){
    if(this.props.myAssets == null){
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

  getAssetBalance(){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
      // EasyShowLD.loadingClose();
    }});
  }

  onRequestClose() {
    this.setState({
      modal: false
    });
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


  onPress(key, data = {}) {
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
        // this._setModalVisible();
        navigate('TurnIn', {});
      } else {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
      }
    }else if (key == 'functionsMore') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('FunctionsMore', {data, balance: this.state.balance,account_name:(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name});
    }else if (key == 'transfer') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('TurnOut', { coins:'EOS', balance: this.state.balance });
    }else if (key == 'Resources') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('Resources', {account_name:(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name});
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
    this._setModalVisible();
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {});
    this.setState({modal: false});
    this._disableTipVisible();
  }
  importWallet() {
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey', {});
    this.setState({
      modal: false
    });
    this._disableTipVisible();
  }

  changeWallet(data) {
    this.setState({
      modal: false
    });
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
          // this.props.dispatch({ type: 'assets/clearBalance', payload: {accountName: this.props.defaultWallet.name}, callback: () => {
          //   this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
          //     this.setState({assetRefreshing: false});
          //   }});
          // }});
          this.getMyAssetsInfo(() => {
            this.setState({assetRefreshing: false});
          });
        }});
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
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
    navigate('WalletDetail', { data,balance:this.props.myAssets[0].balance,});
    this.setState({
      modal: false
    });
    this._disableTipVisible();
  }

  Establish() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {entry: "wallet_home"});
  }
  
  Import() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey', {});
  }

  getTodayIncrease()
  {
    var ret ;
    if(this.props.defaultWallet != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      ret = '+0.00';  //未激活直接返回
    }else{
      ret = (this.state.totalBalance == null || this.state.increase == null) ? '0.00' : ((this.state.increase>=0? "+" : "") +(((this.state.totalBalance * this.state.increase) / 100).toFixed(2)))
    }
    return ret + '￥';
  }

  copyname(wallet) {
    Clipboard.setString(wallet.name);
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
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.setState({assetRefreshing: true});
    this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
      this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
        this.setState({assetRefreshing: false});
      }});
    }});

    this.getDefaultWalletEosBalance(); // 默认钱包余额
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
    // console.log("go to set net!")
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }

  }

  render() {

    if(this.props.guide){
      return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Image source={UImage.guide} style={styles.imgTop} resizeMode="cover"/>
            <View style={styles.btnestablish}>
              <Button onPress={() => this.Establish()}>
                <View style={[styles.btnimport,{backgroundColor: UColor.tintColor}]}>
                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>创建账号</Text>
                </View>
              </Button>
              <Button onPress={this.Import.bind(this)}>
                <View style={[styles.btnimport,{backgroundColor: UColor.tintColor}]}>
                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>导入账号</Text>
                </View>
              </Button>
            </View>
        </View>
      )
    }else{
      return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
          <ImageBackground style={styles.bgout} source={UImage.home_bg} resizeMode="cover">
            <View style={styles.topbtn}>
              <Button onPress={() => this.scan()}>
                <Image source={UImage.scan} style={styles.imgBtn} />
              </Button>
              <Text style={[styles.toptext,{color: UColor.btnColor}]}>EOS资产</Text>
              <Button onPress={() => this.setState({ modal: !this.state.modal })}>
                <Image source={UImage.wallet_h} style={styles.imgBtn} />
              </Button>
            </View>

            {Constants.isNetWorkOffline &&<Button onPress={this.openSystemSetting.bind(this)}>
                <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
                    <Text style={[styles.systemSettingText,{color: UColor.btnColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                    <Ionicons style={[styles.systemSettingArrow,{color: UColor.btnColor}]} name="ios-arrow-forward-outline" size={20} />
                </View>
            </Button>}

            <View style={styles.addto}>
              <View style={styles.addtoouttop}>
                <Text style={{fontSize: ScreenUtil.setSpText(32), color: UColor.btnColor}}>≈ {this.state.isEye ? ((this.props.defaultWallet == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) ? '0.00' : this.adjustTotalBalance(this.state.totalBalance)) : '****'}</Text>
                <View style={[styles.incdocupout,(this.state.increase>=0 || this.state.totalBalance == "0.00")?{borderColor: UColor.fallColor,backgroundColor: UColor.fallColor}:{borderColor: UColor.riseColor,backgroundColor: UColor.riseColor}]}>
                  <Text style={[styles.cupcdo,{color: UColor.btnColor}]}>{this.state.isEye ? this.getTodayIncrease() : '****'}</Text>
                </View>
              </View>
              <View style={styles.addtoout} >
                <Text style={[styles.addtotext,{color: UColor.btnColor}]}> 总资产</Text>
                <Text style={[styles.addtoouttext,{color: UColor.btnColor}]}>(￥)</Text>
                  <TouchableOpacity onPress={this.onPressReveal.bind(this,this.state.isEye)}>
                    <Image source={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet} style={styles.imgTeOy}/>
                  </TouchableOpacity>
              </View>
              <View style={styles.addout} >
                <TouchableOpacity onPress={this.copyname.bind(this,this.props.defaultWallet)}>
                  <Text style={[styles.addtotext,{color: UColor.btnColor}]}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name}</Text>
                </TouchableOpacity>
                {(this.props.defaultWallet != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) 
                ? 
                <View style={[styles.backoractivestyle,{borderColor: UColor.showy}]}>
                  <Text style={[styles.notactived,{color:UColor.showy}]} onPress={this.WalletDetail.bind(this,this.props.defaultWallet)}>未激活</Text>
                </View>
                :
                ((this.props.defaultWallet == null || this.props.defaultWallet.name == null || (this.props.defaultWallet != null &&this.props.defaultWallet.isBackups)) 
                  ? null :  
                  <View style={[styles.backoractivestyle11,{borderColor: UColor.tintColor}]}>
                    <Text style={[styles.stopoutBackups,{color: UColor.tintColor}]} onPress={this.WalletDetail.bind(this,this.props.defaultWallet)}>未备份</Text>
                  </View>) }   
              </View>
            </View>
          </ImageBackground> 
          
          <View style={[styles.head,{backgroundColor:UColor.mainColor, borderBottomColor: UColor.tintColor}]}>
            <Button onPress={this.onPress.bind(this, 'addAssets')} style={styles.headbtn}>
              <View style={styles.headbtnout}>
                <Image source={UImage.add_h} style={styles.imgBtn} />
                <Text style={[styles.headbtntext,{color: UColor.arrow}]}>添加资产</Text>
              </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'Receivables')} style={styles.headbtn}>
              <View style={styles.headbtnout}>
                <Image source={UImage.qr_h} style={styles.imgBtn} />
                <Text style={[styles.headbtntext,{color: UColor.arrow}]}>收币</Text>
              </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'transfer')} style={styles.headbtn}>
              <View style={styles.headbtnout}>
                <Image source={UImage.transfer_h} style={styles.imgBtn} />
                <Text style={[styles.headbtntext,{color: UColor.arrow}]}>转账</Text>
              </View>
            </Button>
            <Button  onPress={this.onPress.bind(this, 'Resources')}  style={styles.headbtn}>
              <View style={styles.headbtnout}>
                <Image source={UImage.resources_h} style={styles.imgBtn} />
                <Text style={[styles.headbtntext,{color: UColor.arrow}]}>资源管理</Text>
              </View>
            </Button>
            <Button  onPress={this.onPress.bind(this, 'functionsMore')}  style={styles.headbtn}>
              <View style={styles.headbtnout}>
                <Image source={UImage.more_h} style={styles.imgBtn} />
                <Text style={[styles.headbtntext,{color: UColor.arrow}]}>更多</Text>
              </View>
            </Button>
          </View>
          
          <ListView initialListSize={1} enableEmptySections={true} 
            refreshControl={
              <RefreshControl
                refreshing={this.state.assetRefreshing}
                onRefresh={() => this.onRefresh()}
                tintColor={UColor.fontColor}
                colors={[UColor.lightgray, UColor.tintColor]}
                progressBackgroundColor={UColor.fontColor}
              />
            }
            dataSource={this.state.dataSource.cloneWithRows(this.props.myAssets == null ? [] : this.props.myAssets)} 
            renderRow={(rowData, sectionID, rowID) => (      
              <View style={[styles.listItem,{borderBottomColor: UColor.secdColor}]}>
                <Button onPress={this.assetInfo.bind(this, rowData)}>
                  <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                    <View style={styles.lefts}>
                      <View style={{borderRadius: 25,backgroundColor: UColor.titletop,marginRight: ScreenUtil.autowidth(10),}}> 
                        <Image source={rowData.asset.icon==null ? UImage.eos : { uri: rowData.asset.icon }} style={styles.leftimg} />
                      </View>
                      <Text style={[styles.lefttext,{color: UColor.fontColor}]}>{rowData.asset.name}</Text>
                    </View>
                    <View style={styles.rights}>
                      <View style={styles.rightout}>
                          <Text style={[styles.rightbalance,{color: UColor.fontColor}]}>{this.state.isEye ? (rowData.balance==null || rowData.balance=="" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.0000" : rowData.balance.replace(rowData.asset.name, "") : '****'}</Text>
                          <Text style={[styles.rightmarket,{color:  UColor.arrow}]}>≈（￥）{this.state.isEye ? (rowData.balance==null || rowData.balance=="" || rowData.asset.value == null || rowData.asset.value == "" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.00" : (rowData.balance.replace(rowData.asset.name, "")*rowData.asset.value).toFixed(2) : '****'}</Text>
                      </View>
                    </View>
                  </View>
                </Button>
              </View>
            )}                
          />  

          <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.isTipShow()} onRequestClose={()=>{}}>
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
          </Modal>

          <Modal style={styles.touchableouts} animationType={'none'} transparent={true} onRequestClose={() => { this.onRequestClose() }} visible={this.state.modal}>
            <TouchableOpacity onPress={() => this.setState({ modal: false })} style={[styles.touchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <TouchableOpacity style={[styles.touchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
                <View style={[styles.touchableout,{backgroundColor:UColor.secdColor}]}>
                  <ListView initialListSize={5} style={[styles.touchablelist,{borderBottomColor:UColor.mainColor}]}
                    renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
                    enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                    renderRow={(rowData) => (
                      <Button onPress={this.changeWallet.bind(this, rowData)}>
                        <View style={[styles.walletlist,{borderBottomColor: UColor.mainColor}]} backgroundColor={(this.props.defaultWallet == null || this.props.defaultWallet.name == rowData.account) && UColor.mainColor}>
                          <View style={styles.topout}>
                            <Text style={[styles.outname,{color: UColor.fontColor}]}>{rowData.name}</Text>
                            {(!rowData.isactived || !rowData.hasOwnProperty('isactived')) ? <View style={[styles.notactivedout,{borderColor: UColor.showy}]}><Text style={[styles.notactived,{color: UColor.showy}]} onPress={this.WalletDetail.bind(this, rowData)}>未激活</Text></View>:(rowData.isBackups ? null :  <View style={[styles.stopoutBackupsout,{borderColor: UColor.tintColor}]}><Text style={[styles.stopoutBackups,{color: UColor.tintColor}]} onPress={this.WalletDetail.bind(this, rowData)}>未备份</Text></View>)}  
                          </View>
                          <Text style={[styles.walletaccount,{color: UColor.lightgray}]} numberOfLines={1} ellipsizeMode='middle'>{this.state.isEye ? (rowData.isactived && rowData.balance != null && rowData.balance != ""? rowData.balance : '0.0000') : '****'} EOS</Text>
                        </View>
                      </Button> 
                    )}
                  />
                  <View style={styles.ebhbtnout}>
                    <Button onPress={() => this.createWallet()} style={[styles.btnout,{borderColor: UColor.lightgray}]}>
                      <View style={styles.establishout}>
                        <Image source={UImage.wallet_1} style={styles.establishimg} />
                        <Text style={[styles.establishtext,{color: UColor.lightgray}]}>创建钱包</Text>
                      </View>
                    </Button>
                    <Button onPress={() => this.importWallet()} style={[styles.btnout,{borderColor: UColor.lightgray}]}>
                      <View style={styles.establishout}>
                        <Image source={UImage.xin_import} style={styles.establishimg} />
                        <Text style={[styles.establishtext,{color: UColor.lightgray}]}>导入钱包</Text>
                      </View>
                    </Button>
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

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
  container: {
    flex: 1,
  },

  listout: {
    height: ScreenUtil.autoheight(70),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: ScreenUtil.autowidth(5),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  listItem: {
    borderBottomWidth: 1,
  },

  topbtn: {
    width: ScreenWidth,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    paddingTop: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  toptext: {
    textAlign: "center",
    height: ScreenUtil.autoheight(60),
    fontSize: ScreenUtil.setSpText(18),
    lineHeight: ScreenUtil.autoheight(60),
  },

  bgout: {
    width:ScreenWidth,
    height: ScreenWidth*0.54,
    justifyContent: "center",
  },
  head: {
    flexDirection: "row",
    borderBottomWidth: 2,
    height: ScreenUtil.autoheight(70), 
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
    fontSize: ScreenUtil.setSpText(14),
  },

  addto: {
    flex: 1, 
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: ScreenUtil.autowidth(20),
    paddingVertical:  ScreenUtil.autoheight(15),
  },
  addout: {
    flexDirection: "row",
    alignItems: 'center',
    marginTop: ScreenUtil.autoheight(20), 
  },

  backoractivestyle: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:ScreenUtil.autowidth(5),
  },
  backoractivestyle11: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:ScreenUtil.autowidth(5),
  },

  addtotext: { 
    fontSize: ScreenUtil.setSpText(16), 
  },
  imgTeOy: {
    width: ScreenUtil.autowidth(25),
    height: ScreenUtil.autoheight(15),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  addtoouttop: {
    flexDirection: "row",
    alignItems: 'center', 
    justifyContent: "center", 
  },
  addtoout: {
    flexDirection: "row",
    alignItems: 'center', 
    justifyContent: "center", 
  },
  addtoouttext: {
    fontSize: ScreenUtil.setSpText(20), 
  },
  addtobtn: {
    alignItems: 'center', 
    justifyContent: "center",
    width: ScreenUtil.autowidth(60), 
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
    justifyContent: 'center', 
  },
  touchableout: {
    width: ScreenWidth/2, 
    height: ScreenHeight,
    alignItems: 'center', 
    paddingTop: ScreenUtil.autoheight(50),
  },
  touchablelist: {
    width: '100%', 
    borderBottomWidth: 1, 
  },

  imgBtn: {
    margin: ScreenUtil.autowidth(5),
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
  },

  walletlist: {
    width: '100%',
    borderBottomWidth: 1, 
    height: ScreenUtil.autoheight(68),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },

  topout: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  outname: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
    marginRight: ScreenUtil.autowidth(10),
  },
  stopoutBackupsout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopoutBackups: {
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(10),
    paddingVertical: ScreenUtil.autoheight(3),
    paddingHorizontal: ScreenUtil.autowidth(5),
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
    paddingHorizontal: ScreenUtil.autowidth(5),
  },

  walletaccount: {
    flex:1,
    alignItems: 'center',
  },

 ebhbtnout: {
  width: '100%', 
  alignItems: 'center', 
  flexDirection: "column",  
  height: ScreenHeight/2.5, 
  paddingVertical: ScreenUtil.autoheight(10),
 },

 btnout: {
  borderRadius: 25, 
  borderWidth: 0.5,
  alignItems: 'center', 
  width: ScreenUtil.autowidth(140),
  height: ScreenUtil.autoheight(35),
  marginVertical: ScreenUtil.autoheight(10),
 },

  establishout: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  establishimg:{
    width: ScreenUtil.autowidth(25), 
    height: ScreenUtil.autowidth(25), 
  },
  establishtext: {
    fontSize: ScreenUtil.setSpText(15), 
    marginLeft: ScreenUtil.autowidth(10), 
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
    width: ScreenUtil.autowidth(25), 
    height: ScreenUtil.autowidth(25),
  },
  lefttext: {
    fontSize: ScreenUtil.setSpText(18),
    marginLeft: ScreenUtil.autowidth(20),
  },
  rights: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  rightout: {
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
    fontSize: ScreenUtil.setSpText(12),
    marginTop: ScreenUtil.autoheight(3),
  },

  incdocupout: {
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  cupcdo:{
    fontSize: ScreenUtil.setSpText(12), 
  },
  imgTop: {
    width: ScreenWidth,
    height: ScreenWidth*0.72,
 },
 btnestablish: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center',
 },
 btnimport: {
   borderRadius: 5,
   alignItems: 'center',
   justifyContent: 'center',
   height: ScreenUtil.autoheight(50),
   marginVertical: ScreenUtil.autoheight(10),
   marginHorizontal: ScreenUtil.autowidth(20),
   width: ScreenWidth-ScreenUtil.autowidth(40),
 },
 btntext: {
   fontSize: ScreenUtil.setSpText(17),
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
  height: ScreenUtil.autoheight(50),
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
