import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, ImageBackground, Dimensions,NativeModules, Image, Modal, ScrollView, DeviceEventEmitter, 
         InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, Platform,SectionList,
         TouchableHighlight, Linking, TouchableOpacity } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';

import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Swiper from 'react-native-swiper';
import Button from '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import LinearGradient from 'react-native-linear-gradient'
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
var sections = {msg: "succcess",data:[
  { key: 1540411105000, data: [
    { 
      title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", 
      row: 3, isUp: false, isDown: false, 
      content: "1.REX 已开发完成，B1 的钱包也很快就会推出。至于为什么让社区等了这么长时间，他解释道：迅速、低成本开发、保证质量，三者只能择其二，我们选择花费更长时间创造一个优质的应用程序。2.目前 Block.one 都会针对 EOSIO 的主要性能推出补丁更新。3.预估下一次发布时将会进行多线程签名验证。签名确认最多可缩短至验证时间的 50％。 这应该会显着减少中继时间，使实时性得到进一步优化。4.多线程签名确认和 REX 将会帮助缓解 CPU 分配问题。", up: '1023', down: '56',createdate: 1540981805000}, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000}, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000}
  ] },
  { key: 1540521205000, data: [
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }
  ] },
  { key: 1540631305000, data: [
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }
  ] },
  { key: 1540741405000, data: [
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }
  ] },
  { key: 1540851505000, data: [
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 },
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "动态 | EOS区块生产者shEOS引入跨链协议EOS21", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }, 
    { title: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", row: 3, isUp: false, isDown: false, content: "据 IMEOS 报道，BM 今晚现身 EOS 电报群答疑，透露 Block.one 近期的工作进展", up: '1023', down: '56',createdate: 1540981805000 }
  ] },
], code: "0"}

@connect(({ banner, newsType, news, wallet, vote, common,}) => ({ ...banner, ...newsType, ...news, ...wallet , ...vote, ...common,}))
class News extends React.Component {

  static navigationOptions = {
    tabBarLabel: '资讯',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='contain' source={focused ? UImage.tab_3_h : UImage.tab_3} style={{width: ScreenUtil.autowidth(22), height: ScreenUtil.autowidth(20)}}/>
    ),
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      index: 1,
      h: ScreenWidth * 0.436,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [{ key: '', title: '' }],
      logRefreshing: false,
      selecttitle:"",
      selecturl:"",
      isWriteListFlag:false,
      periodstext: '', //当前进行第几期活动
      periodsseq: '', //当前进行第几期下标
      WHratio: '',
      SysteminfoImg: '',
      SysteminfoUrl: '',
      SysteminfoModal: false,
    };
  }

  //组件加载完成
  componentDidMount() {
    //获取系统通知
    this.props.dispatch({
      type: 'common/sysNotificationList',callback: (data) => {
        if(data.data != null){
          this.setState({
            SysteminfoImg: data.data.picurl,
            SysteminfoUrl: data.data.url,
          })
          this.gainImg(data.data.picurl);
        }else{
          this.setState({ SysteminfoModal: false, })
        }
      }
    });

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
    //alert(JSON.stringify(this.props.newsData[12][0]) ) 
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
      this.props.dispatch({ type: 'wallet/dappfindAllCategory', });
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
      // <ListView initialListSize={5}  style={{ backgroundColor: UColor.secdColor }} enableEmptySections={true} onEndReachedThreshold={20}
      //   renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 30, backgroundColor: UColor.secdColor }} />}
      //   onEndReached={() => this.onEndReached(route.key)}
      //   refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh(route.key, true)}
      //     tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
      //   renderSectionHeader={this.renderSectionHeader.bind(this)}
      //   dataSource={this.state.dataSource.cloneWithRows(this.props.newsData[route.key] == null ? [] : this.props.newsData[route.key])}
      //   renderRow={(rowData) => (
      //     <TouchableHighlight onPress={() => { this.onPress(rowData) }} onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.5} underlayColor={UColor.secdColor} >
      //       <View style={{flexDirection: 'row',backgroundColor: UColor.mainColor,paddingHorizontal: ScreenUtil.autowidth(15),}}>
      //         <View style={{paddingRight: ScreenUtil.autowidth(10), flexDirection: 'column',alignItems: 'center',}}>
      //           <View style={{width: 1,height: ScreenUtil.autoheight(17),backgroundColor: '#F7F8F9'}}/>
      //           <View style={{width: ScreenUtil.autowidth(6), height: 6, borderRadius: 25, backgroundColor: '#6DA0F8',borderColor: '#B4D0FF',borderWidth: 1,}}/>
      //           <View style={{flex: 1, width: 1,backgroundColor: '#F7F8F9'}}/>
      //         </View>
      //         <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
      //           <Text style={{ fontSize: ScreenUtil.setSpText(16), color: '#1A1A1A', lineHeight: ScreenUtil.autoheight(21), }}>{rowData.title}</Text>
      //           {route.type == 2 && <Text numberOfLines={rowData.row} style={[styles.journalism,{color: '#808080'}]} >{rowData.content}</Text>}
      //           {route.type == 2 && rowData.row == 3 && <Text style={[styles.moretext,{color: UColor.tintColor}]}>展开更多</Text>}
      //           {route.type != 2 && <Text style={[styles.journalism,{color: '#808080'}]}>{rowData.content}</Text>}
      //           <View style={styles.rowFooter}>
      //             <Text style={[styles.pastTime,{color: '#1A1A1A'}]}>{moment(rowData.createdate).format('HH:mm')}</Text>
      //             <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
      //               <Button onPress={this.onUp.bind(this, rowData)}>
      //                 <View style={styles.spotout}>
      //                   <Image style={styles.updownimg} source={rowData.isUp ? UImage.up_h : UImage.up} />
      //                   <Text style={[styles.updowntext,{color: '#6DA0F8'}]}>{rowData.up}</Text>
      //                 </View>
      //               </Button>
      //               <Button onPress={this.onDown.bind(this, rowData)}>
      //                 <View style={styles.spotout}>
      //                   <Image style={styles.updownimg} source={rowData.isDown ? UImage.down_h : UImage.down} />
      //                   <Text style={[styles.updowntext,{color: '#6DA0F8'}]}>{rowData.down}</Text>
      //                 </View>
      //               </Button>
      //               <Button onPress={this.onShare.bind(this, rowData)}>
      //                 <View style={styles.spotout}>
      //                   <Image style={{width:ScreenUtil.autowidth(16),height:ScreenUtil.autowidth(16)}} source={UImage.share_bright} />
      //                 </View>
      //               </Button>
      //             </View>
      //           </View>
      //         </View>
      //       </View>
      //     </TouchableHighlight>
      //   )} 
      // />
      <SectionList
      //   onEndReached={() => this.onEndReached(route.key)}
      //   refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh(route.key, true)}
      //      tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
          sections={sections.data}
          renderSectionHeader={this._sectionComp}
          renderItem={this._renderItem}
          keyExtractor = {this._extraUniqueKey} 
          extraData={this.state}
          // ItemSeparatorComponent={() => <View><Text></Text></View>}
        />
    );
    return (v);
  }
 
  _sectionComp = (info) => {
    var txt = info.section.key;
    return (<View style={{height: ScreenUtil.autoheight(30),backgroundColor: '#F7F8F9',justifyContent: 'center',paddingHorizontal: ScreenUtil.autowidth(15), }}>
      <Text style={{color: '#1A1A1A', fontSize: ScreenUtil.setSpText(14) }}>{moment(txt).format('YYYY-MM-DD')}</Text>
    </View>)
  }

  _renderItem = (info) => {
    var rowData = info.item;
    return ( 
      <TouchableHighlight onPress={() => { this.onPress(rowData) }} onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.5} underlayColor={UColor.secdColor} >
        <View style={{flexDirection: 'row',backgroundColor: UColor.mainColor,paddingHorizontal: ScreenUtil.autowidth(15),}}>
          <View style={{paddingRight: ScreenUtil.autowidth(10), flexDirection: 'column',alignItems: 'center',}}>
            <View style={{width: 1,height: ScreenUtil.autoheight(17),backgroundColor: '#F7F8F9'}}/>
            <View style={{width: ScreenUtil.autowidth(6), height: 6, borderRadius: 25, backgroundColor: '#6DA0F8',borderColor: '#B4D0FF',borderWidth: 1,}}/>
            <View style={{flex: 1, width: 1,backgroundColor: '#F7F8F9'}}/>
          </View>
          <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
            <Text style={{ fontSize: ScreenUtil.setSpText(14), color: '#1A1A1A', lineHeight: ScreenUtil.autoheight(21), }}>{rowData.title}</Text>
            <Text numberOfLines={5} style={[styles.journalism,{color: '#808080'}]} >{rowData.content}</Text>
            {rowData.row == 3 && <Text style={[styles.moretext,{color: UColor.tintColor}]}>展开更多</Text>}
            <View style={styles.rowFooter}>
              <Text style={[styles.pastTime,{color: '#1A1A1A'}]}>{moment(rowData.createdate).format('HH:mm')}</Text>
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                <Button onPress={this.onUp.bind(this, rowData)}>
                  <View style={styles.spotout}>
                    <Image style={styles.updownimg} source={rowData.isUp ? UImage.up_h : UImage.up} />
                    <Text style={[styles.updowntext,{color: '#6DA0F8'}]}>{rowData.up}</Text>
                  </View>
                </Button>
                <Button onPress={this.onDown.bind(this, rowData)}>
                  <View style={styles.spotout}>
                    <Image style={styles.updownimg} source={rowData.isDown ? UImage.down_h : UImage.down} />
                    <Text style={[styles.updowntext,{color: '#6DA0F8'}]}>{rowData.down}</Text>
                  </View>
                </Button>
                <Button onPress={this.onShare.bind(this, rowData)}>
                  <View style={styles.spotout}>
                    <Image style={{width:ScreenUtil.autowidth(14),height:ScreenUtil.autowidth(14)}} source={UImage.share_bright} />
                  </View>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  _extraUniqueKey(item ,index){
    return "index"+index+item;
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

  Openlink = (bannerurl) => {
    if(bannerurl && bannerurl != "" && bannerurl != null){
      let url = bannerurl.replace(/^\s+|\s+$/g, "");
      const { navigate } = this.props.navigation;
      this._setModalVisible();
      if(bannerurl.indexOf("app://") == 0){
        let appurl = url.replace("app://", "")
        navigate(appurl, {}); // app内部的js跳转
      }else if(bannerurl.indexOf("https://") == 0){
        navigate('Web', { title: '系统信息通知', url: url});
      }else if(bannerurl.indexOf("http://") == 0){
        navigate('Web', { title: '系统信息通知', url: url});
      }
    }
  }

  // 显示/隐藏 modal  
  _setModalVisible() {
    let isSysteminfoModal = this.state.SysteminfoModal;
    this.setState({
      SysteminfoModal: !isSysteminfoModal,
    });
  }
 
  //获取图片的宽高比
  gainImg(imageUri) {
    if(imageUri && imageUri != "" && imageUri != null){
      if((imageUri.indexOf("https://")) == 0 || (imageUri.indexOf("http://") == 0)){
        Image.getSize(imageUri,(width,height) => {
          this.setState({ WHratio: Math.floor((height/width)*10000)/10000 });
          setTimeout(() => { this._setModalVisible() }, 1000);
        })
      }
    }
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
        {this.state.routes && <TabViewAnimated 
            lazy={true} navigationState={this.state}
            renderScene={this.renderScene.bind(this)}
            renderHeader={(props) => <View style={[{width:ScreenWidth,height: ScreenUtil.autoheight(45) + Constants.FitPhone,backgroundColor: '#FFFFFF'}]}>
            <TabBar onTabPress={this._handleTabItemPress} 
            labelStyle={[styles.labelStyle,{color:'#080808'}]} 
            indicatorStyle={{width: ScreenUtil.autowidth(20),backgroundColor: '#080808',marginHorizontal: (ScreenWidth/this.state.routes.length -  ScreenUtil.autowidth(20))/2}} 
            style={[{paddingTop: Constants.FitPhone,alignItems: 'center',justifyContent: 'center',backgroundColor:UColor.transport}]} 
            tabStyle={{ width: ScreenWidth / this.state.routes.length, padding: 0, margin: 0 }} 
            scrollEnabled={true} {...props} />
            </View>}
            onIndexChange={this._handleIndexChange}
            initialLayout={{ height: 0, width: ScreenWidth }}
          />
        }
        <Modal animationType='slide' transparent={true} visible={this.state.SysteminfoModal} onShow={() => { }} onRequestClose={() => { }} >
          <TouchableOpacity onPress={this._setModalVisible.bind(this)} style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
            <View style={[styles.subView,{}]} >
              <Button onPress={this.Openlink.bind(this,this.state.SysteminfoUrl)}>
                <Image source={{uri:this.state.SysteminfoImg}} style={{width: ScreenWidth - ScreenUtil.autowidth(70), height: (ScreenWidth - ScreenUtil.autowidth(70))*this.state.WHratio, zIndex: 999,}} />
              </Button>
            </View>
            <View style={{paddingTop: ScreenUtil.autoheight(20),}}>
                <Ionicons color={UColor.btnColor} name="ios-close-circle" size={ScreenUtil.setSpText(40)}/>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outerViewStyle: {
    //占满窗口
    flex: 1,
},

headerViewStyle: {
    height: 64,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center'
},

rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 1 
},

rowImageStyle: {
    width: 70,
    height: 70,
},

sectionHeaderViewStyle: {
    backgroundColor: 'red',
    height: 30,
    justifyContent: 'center'
},

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
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(20), 
  },
  descriptiontext: {
   
    fontSize: ScreenUtil.setSpText(8),
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
    fontSize: ScreenUtil.setSpText(16), 
  },
 
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    flexDirection: "column",
    paddingTop: ScreenUtil.autoheight(10),
    //paddingHorizontal: ScreenUtil.autowidth(15),
  },
  rowFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: ScreenUtil.setSpText(12),  
    marginTop: ScreenUtil.autoheight(8), 
    lineHeight: ScreenUtil.autoheight(20),
  },
  moretext: {
    textAlign: "right", 
    fontSize: ScreenUtil.setSpText(13), 
    lineHeight: ScreenUtil.autoheight(20), 
  },
  pastTime: {
    fontSize: ScreenUtil.setSpText(12), 
    marginTop: ScreenUtil.autoheight(10),
    paddingBottom: ScreenUtil.autoheight(10), 
  },
  spotout: {
    flex: 1, 
    flexDirection: "row", 
    padding: ScreenUtil.autowidth(10)
  },
  updownimg: {
    width: ScreenUtil.autowidth(15), 
    height: ScreenUtil.autowidth(15)
  },
  updowntext: {
    fontSize: ScreenUtil.setSpText(12),
    marginLeft: ScreenUtil.autowidth(5), 
  },
  image: {
    marginRight: 2,
    height: "100%",
    width: ScreenWidth,
  },

  modalStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subView: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginHorizontal: ScreenUtil.setSpText(35),
  },
});

export default News;