import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, ImageBackground, Dimensions,NativeModules, Image, Modal, ScrollView, DeviceEventEmitter, 
         InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, Platform,
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
      index: 0,
      h: ScreenWidth * 0.436,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [{ key: '', title: '' }],
      logRefreshing: false,
      selecttitle:"",
      selecturl:"",
      periodstext: '', //当前进行第几期活动
      periodsseq: '', //当前进行第几期下标
      isWriteListFlag:false,
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
    const { navigate } = this.props.navigation;
    navigate('Shareing', {news});
    // this.props.dispatch({ type: 'news/share', payload: { news: news } });
    // DeviceEventEmitter.emit('share', news);
    // AnalyticsUtil.onEvent('Forward');
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
      <ListView initialListSize={5}  style={{ backgroundColor: '#F9FAF9' }} enableEmptySections={true} onEndReachedThreshold={20}
        onEndReached={() => this.onEndReached(route.key)}
        refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh(route.key, true)}
          tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
        dataSource={this.state.dataSource.cloneWithRows(this.props.newsData[route.key] == null ? [] : this.props.newsData[route.key])}
        renderRow={(rowData) => (
          <TouchableHighlight onPress={() => { this.onPress(rowData) }} onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
              <View style={styles.rowFooter}>
                <View style={{flexDirection: "column",}}>
                  <Text style={[styles.pastTime,{color: '#808080'}]}>{moment(rowData.createdate).format('YYYY.MM.DD HH:mm')}</Text>
                  <LinearGradient colors={['#69B6FF','#3A42F1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width: ScreenUtil.autowidth(20),height: 1}}/>
                </View>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                  <Button onPress={this.onShare.bind(this, rowData)}>
                    <View style={styles.spotout}>
                      <Image style={{width:ScreenUtil.autowidth(18),height:ScreenUtil.autowidth(18)}} source={UImage.share_bright} />
                    </View>
                  </Button>
                </View>
              </View>
              <Text style={{ fontSize: ScreenUtil.setSpText(14), color: '#323232',fontWeight: "bold",lineHeight: ScreenUtil.autoheight(20),}}>{rowData.title}</Text>
              {route.type == 2 && <Text numberOfLines={rowData.row} style={[styles.journalism,{color: '#555555'}]} >{rowData.content}</Text>}
              {route.type == 2 && rowData.row == 10 && <Text style={[styles.moretext,{color: UColor.tintColor}]}>展开更多</Text>}
              {route.type != 2 && <Text style={[styles.journalism,{color: '#555555'}]}>{rowData.content}</Text>}
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
      <View style={[styles.container,{backgroundColor: '#F9FAF9'}]}>
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
    paddingVertical: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(15),
    marginHorizontal: ScreenUtil.autowidth(15),
    marginVertical: ScreenUtil.autoheight(10),
    borderRadius: 8,
  },
  rowFooter: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
    //marginTop: ScreenUtil.autoheight(10),
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
    marginTop: ScreenUtil.autoheight(10), 
    lineHeight: ScreenUtil.autoheight(17),
  },
  moretext: {
    textAlign: "right", 
    fontSize: ScreenUtil.setSpText(13), 
    lineHeight: ScreenUtil.autoheight(20), 
  },
  pastTime: {
    fontSize: ScreenUtil.setSpText(12), 
    lineHeight: ScreenUtil.autoheight(20), 
    // marginTop: ScreenUtil.autoheight(10),
    // paddingBottom: ScreenUtil.autoheight(10), 
  },
  spotout: {
    flex: 1, 
    flexDirection: "row", 
    paddingVertical: ScreenUtil.autowidth(5)
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