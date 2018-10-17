import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, ImageBackground, Dimensions,NativeModules, Image, Modal, ScrollView, DeviceEventEmitter, 
         InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, FlatList, Platform,
         Clipboard, TouchableHighlight, Linking, TouchableOpacity } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import {sdkOpenDapp,sdkListenMessage,sdkRemoveListener} from '../News/DappSDK';

import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Swiper from 'react-native-swiper';
import Button from '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Carousel from 'react-native-banner-carousel';
require('moment/locale/zh-cn');


const pages = [];
let loadMoreTime = 0;
let currentLoadMoreTypeId;
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
var cangoback = false;
var ITEM_HEIGHT = 100;

let g_props;
@connect(({ banner, newsType, news, wallet,vote}) => ({ ...banner, ...newsType, ...news, ...wallet , ...vote}))
class News extends React.Component {

  static navigationOptions = {
    tabBarLabel: '发现',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='stretch'
          source={focused ? UImage.tab_3_h : UImage.tab_3} style={{width: ScreenUtil.autowidth(20), height: ScreenUtil.autowidth(20),}}
      />
    ),
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      h: ScreenWidth * 0.436,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [{ key: '', title: '' }],
      theme: false,    //白色版
      dappPromp: false,
      Tokenissue: false,
      logRefreshing: false,
      selecttitle:"",
      selecturl:"",
      dappList: [],
      holdallList: [
        {icon: UImage.ManualSearch,name:'手动搜索DAPP',description:'手动搜索DAPP,可添加到收藏夹'},
        {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
        {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
        {icon: UImage.Currency_my,name:'一键发币',description:'帮助大家自助地发行基于EOS代币。价格比大家自己发币便宜了13倍！'},
      ],
      periodstext: '', //当前进行第几期活动
      periodsseq: '', //当前进行第几期下标
    };
    g_props = props;    
  }

  //组件加载完成
  componentDidMount() {
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.props.dispatch({ type: 'wallet/walletList', payload: {}, callback: (walletArr) => {
        if(walletArr == null || walletArr.length == 0){
          this.props.dispatch({ type: 'wallet/updateGuideState', payload: {guide: true}});
          return;
        }else{
          this.props.dispatch({ type: 'wallet/updateGuideState', payload: {guide: false}});
        }
      }
      });
    } });
    //页面加载先去获取一次ET快讯
    this.props.dispatch({ type: 'news/list', payload: { type: '12', page: 1, newsRefresh: false } });
    //切换tab完成后执行,不影响ui流畅度
    InteractionManager.runAfterInteractions(() => {
      let i = 0;
      if (this.props.types && this.props.types.length > 0) {
        this.props.types.map((route) => {
          if (i == 0) {
            //加载新闻
            this.props.dispatch({ type: 'news/list', payload: { type: route.key, page: 1, newsRefresh: false } });
            pages.push(1);
          } else {
            pages.push(0);
          }
          i++;
        });
        this.setState({
          routes: this.props.types
        });
      }
    });
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

    this.props.dispatch({type:'login/getthemeSwitching',callback:(theme)=>{
      if(!theme.theme){  
        //白色版
        this.setState({theme:false});
      }else{
        this.setState({theme:true});
      }
    }});
   

    sdkListenMessage(g_props);

    this.onRefreshing();

    this.props.dispatch({type: 'news/getActivityStages', payload:{activityId:"1"},callback: (periodsdata) => {
        try {
          let periodstext= '';
          let periodsseq= '';
          for(var i = 0; i < periodsdata.length; i++){
              if(periodsdata[i].status == 'doing'){
                  periodstext= periodsdata[i].name;
                  periodsseq= periodsdata[i].seq;
              }
          }
          this.setState({periodstext:periodstext,periodsseq:periodsseq});
        } catch (error) {
          
        }
    } })
  }

  componentWillUnmount() {
    sdkRemoveListener();
  }

  onBackAndroid = () => {
    if (cangoback) {
      let type = this.state.routes[this.state.index]
      let w = this.web[type.key];
      if (w) {
        w.goBack();
        return true;
      }
    }
  }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.props.types.length; i++) {
      if (this.props.types[i].key == typeId) {
        return i;
      }
    }
  }

  getCurrentRoute() {
    return this.props.types[this.state.index];
  }

  //加载更多
  onEndReached(typeId) {
    pages[index] += 1;
    currentLoadMoreTypeId = typeId;
    const time = Date.parse(new Date()) / 1000;
    const index = this.getRouteIndex(typeId);
    if (time - loadMoreTime > 1) {
      pages[index] += 1;
      this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: pages[index] } });
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  };

  //下拉刷新
  onRefresh = (typeId, refresh) => {
    //加载广告
    if (!this.props.banners || this.props.banners.length == 0) {
      this.props.dispatch({ type: 'banner/list', payload: {} });
    }

    this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: 1, newsRefresh: refresh } });
    const index = this.getRouteIndex(typeId);
    if (index >= 0) {
      pages[index] = 1;
    }
  };

  //点击新闻
  onPress = (news) => {
    AnalyticsUtil.onEvent('click_Journalism');
    let route = this.getCurrentRoute();
    if (route.type == 2) {
      this.props.dispatch({ type: 'news/openView', payload: { key: route.key, nid: news.id } });

    } else {
      const { navigate } = this.props.navigation;
      this.props.dispatch({ type: 'news/view', payload: { news: news } });
      if (news && news.url && news.url != "") {
        let url = news.url.replace(/^\s+|\s+$/g, "");
        navigate('Web', { title: news.title, url: url, news });
      }
    }
  };

  onDown = (news) => {
    this.props.dispatch({ type: 'news/down', payload: { news: news } });
    AnalyticsUtil.onEvent('step_on');
  }

  onUp = (news) => {
    this.props.dispatch({ type: 'news/up', payload: { news: news } });
    AnalyticsUtil.onEvent('Fabulous');
  }

  onShare = (news) => {
    this.props.dispatch({ type: 'news/share', payload: { news: news } });
    DeviceEventEmitter.emit('share', news);
    AnalyticsUtil.onEvent('Forward');
  }

  bannerPress = (banner) => {
    if (banner && banner.url && banner.url != "") {
      const { navigate } = this.props.navigation;
      let url = banner.url.replace(/^\s+|\s+$/g, "");
      if(banner.url == "octactivity"){
        navigate('OCTactivity',{ periodstext:this.state.periodstext, periodsseq:this.state.periodsseq,});
        return;
      }
      if((banner.url.indexOf("http://") != 0) && (banner.url.indexOf("https://") != 0)){
        try {
          navigate(banner.url, {}); // app内部的js跳转
        } catch (error) {
        }
        return;
      }
      navigate('Web', { title: banner.title, url: url });
    }
  }

  //切换tab
  _handleIndexChange = index => {
    if (pages[index] <= 0) {
      let type = this.state.routes[index]
      InteractionManager.runAfterInteractions(() => {
        this.onRefresh(type.key, false);
      });
    }
    this.setState({ index });
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({
      index
    });
  }

  webChange = (e) => {
    cangoback = e.canGoBack;
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

  onPressDapp(data) {
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null 
          || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("请先导入已激活账号!");
      return;
    }

    this.setState({
      dappPromp: true,
      selecttitle:data.name,
      selecturl: data.url
    });
  }

  _setModalVisible_DAPP() {  
    let dappPromp = this.state.dappPromp;  
    this.setState({  
        dappPromp:!dappPromp,  
    });  
  } 

  // 显示/隐藏 modal  
  _setModalVisible() {  
    let isTokenissue = this.state.Tokenissue;  
    this.setState({  
        Tokenissue:!isTokenissue,  
    });  
  } 

  openTokenissue() {
    this. _setModalVisible();
    const { navigate } = this.props.navigation;
    navigate('Web', { title: '莫与一键发币', url: "https://coincreate.github.io/EOS_coincreate/coincreate.html" });
  }

  openDAPP() {
    this. _setModalVisible_DAPP();
    sdkOpenDapp(this.state.selecturl,this.state.selecttitle,this.state.theme);
  }

  onPressTool(data) {
    const { navigate } = this.props.navigation;
    if(data.name == this.state.holdallList[1].name){
      navigate('Web', { title: 'eospark', url: "https://eospark.com" });
      return ;
    }

    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("请先导入已激活账号!");
      return;
    }
  
    if(data.name == this.state.holdallList[0].name){
      navigate('Dappsearch', {theme:this.state.theme});
    }else if(data.name == this.state.holdallList[2].name){
      navigate('FreeMortgage');
    }else if(data.name == this.state.holdallList[3].name){
      this. _setModalVisible();
    }else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  onAddto = (dappdata) =>{
    const c = this.props.navigation.state.params.coins;
    if(this.props.coinSelf && this.props.coinSelf[c.name.toLowerCase()]==1){
      this.props.dispatch({type:'news/doCoinSelf',payload:{action:"rem",name:dappdata.name.toLowerCase()},callback:function(){
        DeviceEventEmitter.emit('coinSlefChange',"");
      }});
      this.props.navigation.setParams({img:UImage.fav,onPress:this.onPress});
      EasyToast.show("已取消自选")
    }else{
      this.props.dispatch({type:'news/doCoinSelf',payload:{action:"add",name:dappdata.name.toLowerCase()},callback:function(){
        DeviceEventEmitter.emit('coinSlefChange',"");
      }});
      this.props.navigation.setParams({img:UImage.fav_h,onPress:this.onPress});
      EasyToast.show("已加入自选")
    }
  }

  onRefreshing() {
    try {
      this.setState({logRefreshing: true});
      this.props.dispatch({ type: 'wallet/dappfindAllRecommend', callback: (resp) => {
          if (resp && resp.code == '0') {
            if(resp.data && resp.data.length > 0){
              this.setState({dappList : resp.data,logRefreshing: false});
            }
          } else {
            this.setState({logRefreshing: false});
            console.log("dappfindAllRecommend error");
          }
      } });
    } catch (error) {
      console.log("dappfindAllRecommend error: %s",error.message);
    }
  }

  //渲染页面
  renderScene = ({ route }) => {
    if (route.key == '') {
      return (<View></View>)
    }
    if (route.title == 'DAPP') {   
      return (<View>
        <ScrollView  keyboardShouldPersistTaps="always"
          refreshControl={<RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()} 
          tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor} style={{backgroundColor: UColor.transport}}/>}
        >
        {Constants.isNetWorkOffline &&
          <Button onPress={this.openSystemSetting.bind(this)}>
            <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
                <Text style={[styles.systemSettingText,{color: UColor.btnColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                <Ionicons style={[styles.systemSettingArrow,{color: UColor.fontColor}]} name="ios-arrow-forward-outline" size={20} />
            </View>
          </Button>}
          <View style={{ height: this.state.h }}>
            <Carousel autoplay autoplayTimeout={5000} loop index={0} pageSize={ScreenWidth}>
              {this.renderSwipeView()}
            </Carousel>
          </View>
          <View style={{backgroundColor: UColor.mainColor}}>
            {/* <View style={{marginHorizontal: ScreenUtil.autowidth(5),marginVertical:ScreenUtil.autoheight(10),borderLeftWidth: ScreenUtil.autoheight(3),borderLeftColor: UColor.tintColor,}}>  
              <Text style={{fontSize: ScreenUtil.setSpText(18),color:UColor.fontColor,paddingLeft: ScreenUtil.autoheight(12) }}>常用DAPP</Text>
            </View>
            <ListView  enableEmptySections={true}  contentContainerStyle={[styles.selflist,{borderBottomColor:UColor.secdColor}]}
              dataSource={this.state.dataSource.cloneWithRows(this.state.dappList == null ? [] : this.state.dappList)} 
              renderRow={(rowData) => (  
                <Button  onPress={this.onPressDapp.bind(this, rowData)}  style={styles.selfDAPP}>
                    <View style={styles.selfbtnout}>
                      <Image source={{uri:rowData.icon}} style={styles.selfBtnDAPP} />
                      <Text style={[styles.headbtntext,{color: UColor.fontColor}]} >{rowData.name}</Text>
                    </View>
                </Button>
              )}                
            />  */}
            <View style={{marginHorizontal: ScreenUtil.autowidth(5),marginVertical:ScreenUtil.autoheight(15),borderLeftWidth: ScreenUtil.autoheight(3),borderLeftColor: UColor.tintColor,}}>  
              <Text style={{fontSize: ScreenUtil.setSpText(18),color:UColor.fontColor,fontWeight:'bold',paddingLeft: ScreenUtil.autoheight(12) }}>工具箱</Text>
            </View> 
            <ListView  enableEmptySections={true}  contentContainerStyle={[styles.listViewStyle,{borderBottomColor:UColor.secdColor}]}
              dataSource={this.state.dataSource.cloneWithRows(this.state.holdallList == null ? [] : this.state.holdallList)} 
              renderRow={(rowData) => (  
                <Button  onPress={this.onPressTool.bind(this, rowData)}  style={styles.headDAPP}>
                  <View style={styles.headbtnout}>
                    <Image source={rowData.icon} style={styles.imgBtnDAPP} />
                    <View style={{flex: 1}}>
                      <Text style={[styles.headbtntext,{color: UColor.fontColor}]}>{rowData.name}</Text>
                      <Text style={[styles.descriptiontext,{color: UColor.lightgray}]} numberOfLines={1}>{rowData.description}</Text>
                    </View>
                  </View>
                </Button>
              )}                
            /> 
            <View style={{marginHorizontal: ScreenUtil.autowidth(5),marginVertical:ScreenUtil.autoheight(15),borderLeftWidth: ScreenUtil.autoheight(3),borderLeftColor: UColor.tintColor,}}>  
              <Text style={{fontSize: ScreenUtil.setSpText(18),color:UColor.fontColor,fontWeight:'bold',paddingLeft: ScreenUtil.autoheight(12) }}>游戏娱乐</Text>
            </View>
            <ListView  enableEmptySections={true}  contentContainerStyle={[styles.listViewStyle,{borderBottomColor:UColor.secdColor}]}
              dataSource={this.state.dataSource.cloneWithRows(this.state.dappList == null ? [] : this.state.dappList)} 
              renderRow={(rowData) => (  
                <Button  onPress={this.onPressDapp.bind(this, rowData)}  style={styles.headDAPP}>
                  <View style={styles.headbtnout}>
                    <Image source={{uri:rowData.icon}} style={styles.imgBtnDAPP} />
                    <View style={{flex: 1}}>
                      <Text style={[styles.headbtntext,{color: UColor.fontColor}]}>{rowData.name}</Text>
                      <Text style={[styles.descriptiontext,{color: UColor.lightgray}]} numberOfLines={1}>{rowData.description}</Text>
                    </View>
                  </View>
                </Button>
              )}                
            /> 
          </View>
          <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.dappPromp} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-30, backgroundColor: UColor.btnColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible_DAPP.bind(this) } style={styles.buttonView2}>
                    <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={35} />
                  </Button>
                </View>
                <Text style={styles.contentText}>您接下来访问的页面将跳转至第三方应用DAPP {this.state.selecttitle}</Text>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                      <Image source={UImage.warning_h} style={styles.imgBtnBackup} />
                      <Text style={[styles.headtext,{color: UColor.riseColor}]} >免责声明</Text>
                    </View>
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>注意：您接下来访问的页面将跳转至第三方应用DAPP {this.state.selecttitle}。您在此应用上的所有行为应遵守该应用的用户协议和隐私政策，
                      并由DAPP {this.state.selecttitle}向您承担应有责任。</Text>
                </View>
                <Button onPress={this.openDAPP.bind(this)}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                      <Text style={[styles.deletetext,{color: UColor.btnColor}]}>我已阅读并同意</Text>
                    </View>
                </Button>  
              </View> 
            </TouchableOpacity>
          </Modal>
          <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.Tokenissue} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-30, backgroundColor: UColor.btnColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={35} />
                  </Button>
                </View>
                <Text style={styles.contentText}>使用说明</Text>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                        <Image source={UImage.warning_h} style={styles.imgBtnBackup} />
                        <Text style={[styles.headtext,{color: UColor.riseColor}]} >免责声明</Text>
                    </View>
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>本功能由第三方平台提供，不属于EosToken官方出品，《用户协议》和《应用风险》由该平台单独向您承担责任！</Text>
                </View>
                <View style={{ width: ScreenWidth-70,marginHorizontal: ScreenUtil.autowidth(20), marginVertical: ScreenUtil.autoheight(10),}}>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>3分钟，3EOS！最方便，最便宜的EOS自助发币DAPP。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>开发：清华大学计算机专业博士生莫与独立编写。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>功能：帮助大家自助地发行基于EOS代币。价格比大家自己发币便宜了13倍！</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>流程：</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>1.根据指导生成自己代币的MEMO。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>2.给指定合约账号转账3EOS，并备注之前生成的MEMO。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>3.在eostoken钱包中添加代币（添加公众号“深入浅出EOS”回复“eostoken”获取教程）</Text>
                </View>
                <Button onPress={this.openTokenissue.bind(this)} style={{}}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.btnColor}]}>我已阅读并同意</Text>
                    </View>
                </Button>  
              </View> 
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </View>)
    }
    if (route.type == 1) {
      let url = route.url ? route.url.replace(/^\s+|\s+$/g, "") : "";
      const w = (<WebView
        ref={(c) => {
          if (!this.web) {
            this.web = {};
          }
          this.web[route.key] = c;
        }}
        source={{ uri: url }}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        onNavigationStateChange={(e) => { this.webChange(e) }}
      />
      )
      return w;
    }
    const v = (
      <ListView initialListSize={5}  style={{ backgroundColor: UColor.secdColor }} enableEmptySections={true} onEndReachedThreshold={20}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 1, backgroundColor: UColor.secdColor }} />}
        onEndReached={() => this.onEndReached(route.key)}
        renderHeader = {()=><View style={{ height: this.state.h }}>
        {/* {Constants.isNetWorkOffline &&
          <Button onPress={this.openSystemSetting.bind(this)}>
            <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
                <Text style={[styles.systemSettingText,{color: UColor.btnColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                <Ionicons style={[styles.systemSettingArrow,{color: UColor.fontColor}]} name="ios-arrow-forward-outline" size={20} />
            </View>
          </Button>} */}
          {/* <Swiper height={this.state.h} loop={true} autoplay={true} horizontal={true} autoplayTimeout={5} 
            paginationStyle={{ bottom: ScreenUtil.autoheight(10) }}
            dotStyle={{ backgroundColor: 'rgba(255,255,255,.2)', width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6) }}
            activeDotStyle={{ backgroundColor: UColor.tintColor, width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6) }}>
            {this.renderSwipeView()}
          </Swiper> */}
          <Carousel autoplay autoplayTimeout={5000} loop index={0} pageSize={ScreenWidth}>
            {this.renderSwipeView()}
          </Carousel>
        </View>
        }
        refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh(route.key, true)}
          tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
        dataSource={this.state.dataSource.cloneWithRows(this.props.newsData[route.key] == null ? [] : this.props.newsData[route.key])}
        renderRow={(rowData) => (
          <TouchableHighlight onPress={() => { this.onPress(rowData) }} onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
              <Text style={{ fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,fontWeight: "bold"}}>{rowData.title}</Text>
              {route.type == 2 && <Text numberOfLines={rowData.row} style={[styles.journalism,{color: UColor.lightgray}]} >{rowData.content}</Text>}
              {route.type == 2 && rowData.row == 3 && <Text style={[styles.moretext,{color: UColor.tintColor}]}>展开更多</Text>}
              {route.type != 2 && <Text style={[styles.journalism,{color: UColor.lightgray}]}>{rowData.content}</Text>}
              <View style={styles.rowFooter}>
                <Text style={[styles.pastTime,{color: UColor.lightgray}]}>{moment(rowData.createdate).fromNow()}</Text>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                  <Button onPress={this.onUp.bind(this, rowData)}>
                    <View style={styles.spotout}>
                      <Image style={styles.updownimg} source={rowData.isUp ? UImage.up_h : UImage.up} />
                      <Text style={[styles.updowntext,{color: rowData.isUp ? UColor.tintColor : UColor.lightgray}]}>{rowData.up}</Text>
                    </View>
                  </Button>
                  <Button onPress={this.onDown.bind(this, rowData)}>
                    <View style={styles.spotout}>
                      <Image style={styles.updownimg} source={rowData.isDown ? UImage.down_h : UImage.down} />
                      <Text style={[styles.updowntext,{color: rowData.isDown ? UColor.tintColor : UColor.lightgray}]}>{rowData.down}</Text>
                    </View>
                  </Button>
                  <Button onPress={this.onShare.bind(this, rowData)}>
                    <View style={styles.spotout}>
                      <Image style={{width:ScreenUtil.autowidth(22),height:ScreenUtil.autowidth(22)}} source={UImage.share_bright} />
                    </View>
                  </Button>
                </View>
              </View>
            </View>
          </TouchableHighlight>
        )} 
      />
    );
    return (v);
  }

  renderSwipeView() {
    if (this.props.banners != null) {
      return this.props.banners.map((item, i) => {
        return (<Button key={i} onPress={this.bannerPress.bind(this, item)}>
          <Image style={styles.image} key={item} source={{ uri: item.img, width: ScreenWidth }} resizeMode="cover"/>
        </Button>)
      })
    } else {
      return (<View></View>)
    }
  }
  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        {this.state.routes && <TabViewAnimated 
            lazy={true} navigationState={this.state}
            renderScene={this.renderScene.bind(this)}
            renderHeader={(props) => <ImageBackground source={UImage.coinsbg1} resizeMode="stretch"  style={[{width:ScreenWidth,height:ScreenUtil.isIphoneX() ? ScreenWidth*0.1946:ScreenWidth*0.1546,}]}>
            <TabBar onTabPress={this._handleTabItemPress} 
            labelStyle={[styles.labelStyle,{color:UColor.btnColor}]} 
            indicatorStyle={[styles.indicatorStyle,{width: ScreenWidth / this.state.routes.length - ScreenUtil.autowidth(40),backgroundColor: UColor.fonttint}]} 
            style={[{paddingTop: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(35) : ScreenUtil.autoheight(20),alignItems: 'center',justifyContent: 'center',backgroundColor:UColor.transport}]} 
            tabStyle={{ width: ScreenWidth / this.state.routes.length, padding: 0, margin: 0 }} 
            scrollEnabled={true} {...props} />
            </ImageBackground>}
            onIndexChange={this._handleIndexChange}
            initialLayout={{ height: 0, width: ScreenWidth }}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selflist:{ 
    flexWrap:'wrap', 
    flexDirection:'row', 
    alignItems:'center', 
    width: ScreenWidth, 
    marginTop:ScreenUtil.autoheight(10),
    borderBottomWidth: 1,
  }, 
  selfDAPP: {
    width: ScreenWidth/4,
    paddingBottom: ScreenUtil.autoheight(10),
  },
  selfbtnout: {
    flex:1, 
    alignItems: 'center', 
    justifyContent: "center",
  },
  selfBtnDAPP: { 
    width: ScreenUtil.autowidth(40),
    height: ScreenUtil.autoheight(40),
    margin: ScreenUtil.autowidth(5),
  },
  listViewStyle:{ 
    flexDirection:'column', 
    width: ScreenWidth, 
    borderBottomWidth: 1,
  }, 
  headDAPP: {
    paddingBottom: ScreenUtil.autoheight(15),
    paddingHorizontal: ScreenUtil.autowidth(8),
  },
  headbtnout: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: "center",
  },
  imgBtnDAPP: { 
    width: ScreenUtil.autowidth(40),
    height: ScreenUtil.autowidth(40),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(20), 
  },
  descriptiontext: {
   
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(20), 
  },
  pupuoBackup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subViewBackup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(35),
    width: ScreenWidth - ScreenUtil.autowidth(30),
  },
  buttonView2: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(35),
  },
  contentText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(18),
    paddingBottom: ScreenUtil.autoheight(5),
    paddingHorizontal:  ScreenUtil.autowidth(15),
  },
  warningout: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "column",
    alignItems: 'center',
    padding: ScreenUtil.autowidth(5),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  imgBtnBackup: {
    width: ScreenUtil.autowidth(25),
    height: ScreenUtil.autoheight(25),
    marginRight: ScreenUtil.autowidth(10),
  },
  headtext: {
    fontWeight: "bold",
    fontSize: ScreenUtil.setSpText(16), 
  },
  headtitle: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(20),
  },
  deleteout: {
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(40),
    marginHorizontal: ScreenUtil.autowidth(100),
    marginVertical: ScreenUtil.autoheight(15),
  },
  deletetext: {
    fontSize: ScreenUtil.setSpText(16),
  },
  labelStyle: {
    margin: 0, 
    fontSize: ScreenUtil.setSpText(15), 
  },
  indicatorStyle: {
    marginLeft: ScreenUtil.autowidth(20),
    marginBottom: ScreenUtil.autoheight(1),
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    flexDirection: "column",
    paddingTop: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  rowFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: ScreenUtil.autoheight(10),
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
    fontSize: ScreenUtil.setSpText(14),
  },
  systemSettingArrow: {
    marginRight: ScreenUtil.autowidth(5),
  },

  journalism: {
    fontSize: ScreenUtil.setSpText(15),  
    marginTop: ScreenUtil.autoheight(10), 
    lineHeight: ScreenUtil.autoheight(25),
  },
  moretext: {
    textAlign: "right", 
    fontSize: ScreenUtil.setSpText(13), 
    lineHeight: ScreenUtil.autoheight(20), 
  },
  pastTime: {
    fontSize: ScreenUtil.setSpText(13), 
    marginTop: ScreenUtil.autoheight(10),
    paddingBottom: ScreenUtil.autoheight(10), 
  },
  spotout: {
    flex: 1, 
    flexDirection: "row", 
    padding: ScreenUtil.autowidth(10)
  },
  updownimg: {
    width: ScreenUtil.autowidth(18), 
    height: ScreenUtil.autowidth(18)
  },
  updowntext: {
    fontSize: ScreenUtil.setSpText(13),
    marginLeft: ScreenUtil.autowidth(5), 
  },
  image: {
    marginRight: 2,
    height: "100%",
    width: ScreenWidth,
  },
});

export default News;