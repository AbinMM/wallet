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
class Discover extends React.Component {

  static navigationOptions = {
    tabBarLabel: '发现',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='stretch'
          source={focused ? UImage.tab_3_h : UImage.tab_3} style={{width: ScreenUtil.autowidth(18), height: ScreenUtil.autowidth(21),}}
      />
    ),
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      refresh: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),

    };
  }

  //组件加载完成
  componentDidMount() {

  }

  componentWillUnmount() {
  }

  bannerPress() {

  }

  //渲染页面
  renderScene = ({ route }) => {
    if (route.key == '') {
      return (<View></View>)
    }

    const v = (
      <ListView initialListSize={5}  style={{ backgroundColor: UColor.secdColor }} enableEmptySections={true} onEndReachedThreshold={20}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 1, backgroundColor: UColor.secdColor }} />}
        onEndReached={() => this.onEndReached(route.key)}
        renderHeader = {()=><View style={{ height: this.state.h }}>
        {/* {Constants.isNetWorkOffline &&
          <Button onPress={() => {NativeUtil.openSystemSetting();}}>
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
        // refreshControl={<RefreshControl refreshing={this.state.refresh} onRefresh={}
        //   tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
        // dataSource={this.state.dataSource.cloneWithRows([])}
        // renderRow={} 
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
            renderHeader={(props) => <LinearGradient colors={UColor.Navigation} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={[{width:ScreenWidth,height: ScreenUtil.autoheight(45) + Constants.FitPhone,}]}>
            <TabBar onTabPress={this._handleTabItemPress} 
            labelStyle={[styles.labelStyle,{color:UColor.btnColor}]} 
            indicatorStyle={[styles.indicatorStyle,{width: ScreenWidth / this.state.routes.length - ScreenUtil.autowidth(40),backgroundColor: UColor.fonttint}]} 
            style={[{paddingTop: Constants.FitPhone,alignItems: 'center',justifyContent: 'center',backgroundColor:UColor.transport}]} 
            tabStyle={{ width: ScreenWidth / this.state.routes.length, padding: 0, margin: 0 }} 
            scrollEnabled={true} {...props} />
            </LinearGradient>}
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