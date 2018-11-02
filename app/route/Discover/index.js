import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, ImageBackground, Dimensions,NativeModules, Image, Modal, ScrollView, DeviceEventEmitter, 
         InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, Platform, SectionList,
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
class Discover extends React.Component {

  static navigationOptions = {
    tabBarLabel: '发现',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='stretch'
          source={focused ? UImage.tab_2_h : UImage.tab_2} style={{width: ScreenUtil.autowidth(24), height: ScreenUtil.autowidth(22),}}
      />
    ),
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      
      refresh: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      mydapplist: [],
      hotdappList:[],
      //holdallList: [],
      holdallList: [
        {key: '我的DApps', data: [
          {icon: UImage.ManualSearch,name:'手动搜索DAPPsdhjsdf',description:'手动搜索DAPP,可添加到收藏夹'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
          {icon: UImage.icon_vote,name:'节点投票',description:'eos节点投票'},
          {icon: UImage.ManualSearch,name:'手动搜索DAPP',description:'手动搜索DAPP,可添加到收藏夹'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
          {icon: UImage.icon_vote,name:'节点投票',description:'eos节点投票'},
        ]},
        {key: '糖果系列', data: [
          {icon: UImage.ManualSearch,name:'手动搜索DAPPsdhjsdf',description:'手动搜索DAPP,可添加到收藏夹'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
          {icon: UImage.icon_vote,name:'节点投票',description:'eos节点投票'},
          {icon: UImage.ManualSearch,name:'手动搜索DAPP',description:'手动搜索DAPP,可添加到收藏夹'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
          {icon: UImage.icon_vote,name:'节点投票',description:'eos节点投票'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.ManualSearch,name:'手动搜索DAPP',description:'手动搜索DAPP,可添加到收藏夹'},
        ]},
        {key: 'EOS工具', data: [
          {icon: UImage.ManualSearch,name:'手动搜索DAPPsdhjsdf',description:'手动搜索DAPP,可添加到收藏夹'},
          {icon: UImage.eospark,name:'eospark',description:'eos区块浏览器'},
          {icon: UImage.Freemortgage,name:'免费抵押',description:'免费抵押：计算资源,网络资源'},
        ]},
        {key: '第三方工具', data: [
          {icon: UImage.ManualSearch,name:'手动搜索DAPPsdhjsdf',description:'手动搜索DAPP,可添加到收藏夹'},
        ]},
      ],
    };
  }

  //组件加载完成
  componentDidMount() {
    //获取banner图
    this.props.dispatch({ type: 'banner/list', payload: {} });
    //获取DAPP列表
    this.props.dispatch({ type: 'wallet/dappfindAllRecommend', 
      callback: (resp) => {
        //alert(JSON.stringify(resp.data));
        if (resp && resp.code == '0') {
          if(resp.data && resp.data.length > 0){
            this.setState({
              mydapplist: resp.data[0],
              hotdappList: resp.data[1],
              //holdallList: resp.data,
            });
          }
        } else {
          // this.setState({logRefreshing: false});
          console.log("dappfindAllRecommend error");
        }
      } 
    });
  }

  componentWillUnmount() {

  }
 
  //点击banner图跳转
  bannerPress(banner) {
    if (banner && banner.url && banner.url != "") {
      const { navigate } = this.props.navigation;
      let url = banner.url.replace(/^\s+|\s+$/g, "");
      if(banner.url == "octactivity"){
        navigate('OCTactivity',{ periodstext:this.state.periodstext, periodsseq:this.state.periodsseq,});
        return;
      }
      // if((banner.url.indexOf("http://") != 0) && (banner.url.indexOf("https://") != 0)){
      //   try {
      //     navigate(banner.url, {}); // app内部的js跳转
      //   } catch (error) {
      //   }
      //   return;
      // }

      if(banner.url.indexOf("ext_viewer:") == 0){
        Linking.openURL(banner.url.substring("ext_viewer:".length)); // 外部浏览器打开
        return;
      }

      if((banner.url.indexOf("app:") == 0)){
        navigate(banner.url.substring("app:".length), {}); // app内部的js跳转
        return;
      }
      
      navigate('Web', { title: banner.title, url: url });
    }

  }


  //banner图
  renderSwipeView() {
    if (this.props.banners != null) {
      return this.props.banners.map((item, i) => {
        return (<Button key={i} onPress={this.bannerPress.bind(this, item)}>
          <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
            <View style={{paddingVertical:ScreenUtil.autoheight(10),shadowColor: '#606060',shadowOffset:{height: 3,width: 0},shadowRadius: 5,shadowOpacity:1,elevation: 12,}}>
            <Image style={styles.image} key={item} source={{ uri: item.img, width: ScreenWidth }} resizeMode="cover"/>
            </View>
          </View>
        </Button>)
      })
    } else {
      return (<View></View>)
    }
  }
  
  //点DAPP跳转
  onPressTool(data) {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: data.name, url:data.url});
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: '#FFFFFF',paddingTop: Constants.FitPhone}]}>
        <ScrollView  keyboardShouldPersistTaps="always" style={{flex: 1, paddingTop: ScreenUtil.autoheight(10),}}
            // refreshControl={<RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()} 
            // tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor} style={{backgroundColor: UColor.transport}}/>}
          >
          <View style={{alignItems: 'center',}}>
              <View style={{width:ScreenWidth,  height: (ScreenWidth) * 0.436 + ScreenUtil.autoheight(30), borderRadius: 7, overflow: 'hidden',}}>
                <Carousel autoplay autoplayTimeout={5000} loop index={0} pageSize={ScreenWidth} pageIndicatorContainerStyle={{bottom: -20, zIndex: 999}} 
                pageIndicatorStyle={{backgroundColor: '#EAEAEA', }} activePageIndicatorStyle={{backgroundColor:'#6DA0F8',}}>
                  {this.renderSwipeView()}
                </Carousel>
              </View>
            </View>
            <View style={{backgroundColor: '#FFFFFF'}}>
              <View style={{marginVertical:ScreenUtil.autoheight(15),flexDirection: 'row',}}>  
                <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(14),color: '#1A1A1A',fontWeight:'bold',paddingHorizontal: ScreenUtil.autowidth(16),}}>{this.state.mydapplist.name}</Text>
                <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#6DA0F8',paddingHorizontal: ScreenUtil.autowidth(16),}}>更多</Text>
              </View> 
            <View style={{paddingHorizontal: ScreenUtil.autowidth(16),}}>
              <ListView enableEmptySections = {true} horizontal={true} showsHorizontalScrollIndicator={false}
                dataSource={this.state.dataSource.cloneWithRows(this.state.mydapplist.listdapp == null ? [] : this.state.mydapplist.listdapp)} 
                renderRow={(rowData) => (  
                  <Button  onPress={this.onPressTool.bind(this, rowData)}  style={styles.headDAPP}>
                    <View style={styles.headbtnout}>
                      <Image source={{uri: rowData.icon}}  style={styles.imgBtnDAPP} resizeMode='contain' />
                    </View>
                  </Button>
                )}                
              /> 
            </View>
            <View style={{marginHorizontal: ScreenUtil.autowidth(15),marginVertical:ScreenUtil.autoheight(15),}}>  
              <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#1A1A1A',fontWeight:'bold',}}>{this.state.hotdappList.name}</Text>
            </View> 
            <ListView enableEmptySections = {true}
              contentContainerStyle={[styles.listViewStyle,{borderBottomColor:UColor.secdColor}]}
              dataSource={this.state.dataSource.cloneWithRows(this.state.hotdappList.listdapp == null ? [] : this.state.hotdappList.listdapp)} 
              renderRow={(rowData) => (  
                <Button  onPress={this.onPressTool.bind(this, rowData)}  style={{width: ScreenWidth/4, paddingBottom: ScreenUtil.autoheight(18),}}>
                  <View style={styles.headbtnout}>
                    <Image source={{uri: rowData.icon}} style={{width: ScreenUtil.autowidth(50),height: ScreenUtil.autowidth(50),marginBottom: ScreenUtil.autoheight(10),}} resizeMode='contain'/>
                    <Text numberOfLines={1} style={[styles.headbtntext,{width: ScreenUtil.autowidth(69), color: UColor.fontColor,textAlign: 'center'}]}>{rowData.name}</Text>
                  </View>
                </Button>
              )}                
            /> 
          </View>
          <View style={{backgroundColor: '#F7F8F9',}}>
            <SectionList
              contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-start',paddingBottom: ScreenUtil.autoheight(50)}}
              initialNumToRender={4}
              keyExtractor={(item, index) => index + item}
              sections={this.state.holdallList}
              renderSectionHeader={(info) => (
                <View style={{width:ScreenWidth, justifyContent: 'center',paddingHorizontal: ScreenUtil.autowidth(10),paddingTop: ScreenUtil.autoheight(10) }}>
                  <Text style={{width:ScreenWidth,color: '#8C8C8C', fontSize: ScreenUtil.setSpText(14) }}>{info.section.key}</Text>
                </View>
                )}
              renderItem={ (rowData) => (
                <Button  onPress={this.onPressTool.bind(this, rowData.item)}  style={{width: ScreenWidth/2, paddingHorizontal: ScreenUtil.autowidth(9),paddingVertical: ScreenUtil.autoheight(10)}}>
                  <View style={{ flexDirection: 'row',alignItems: 'center', justifyContent: "center", backgroundColor: '#FFFFFF',paddingHorizontal:ScreenUtil.autowidth(12),paddingVertical:ScreenUtil.autoheight(15),borderRadius: 5, }}>
                    <Image source={rowData.item.icon} style={{width: ScreenUtil.autowidth(39),height: ScreenUtil.autowidth(39),}} />
                    <View style={{flex: 1, paddingLeft:  ScreenUtil.autowidth(10),}}>
                      <Text style={[styles.headbtntext,{color: '#1A1A1A'}]} numberOfLines={1}>{rowData.item.name}</Text>
                      <Text style={[styles.descriptiontext,{color: '#8C8C8C'}]} numberOfLines={1}>{rowData.item.description}</Text>
                    </View>
                  </View>
                </Button>)
              }
            />
          </View>
        </ScrollView>
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
    flexDirection:'row',
    flexWrap:'wrap',
    //alignItems:'center', 
    alignItems:'flex-start',
  }, 
  headDAPP: {
    // paddingBottom: ScreenUtil.autoheight(15),
    // paddingHorizontal: ScreenUtil.autowidth(8),
  },
  headbtnout: {
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: "center",
  },
  imgBtnDAPP: { 
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(50),
    marginRight: ScreenUtil.autowidth(28),
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(20), 
  },
  descriptiontext: {
    fontSize: ScreenUtil.setSpText(12),
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
    //alignItems: 'center',
    //justifyContent: 'center',
    
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
    height: (ScreenWidth-ScreenUtil.autowidth(32)) * 0.436,
    width: ScreenWidth - ScreenUtil.autowidth(32),
    borderRadius: 7,
    
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

export default Discover;