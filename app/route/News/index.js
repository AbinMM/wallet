import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, ImageBackground, Dimensions,NativeModules, Image, Modal, ScrollView, DeviceEventEmitter, 
         InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, Platform,
         TouchableHighlight, Linking, TouchableOpacity } from 'react-native';
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
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
var newsPage=1;

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
      WHratio: '',
      newsData: [],
      SysteminfoImg: '',
      SysteminfoUrl: '',
      SysteminfoModal: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
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
    
    //页面加载先去获取一次资讯
    newsPage=1;
    this.loadNews(newsPage);
    
  }

  componentWillUnmount() {

  }

  loadNews = (page) =>{
    this.props.dispatch({ type: 'news/newlists', payload: {page,pageSize: 10,},callback: (lists) => {
      if(lists.code==0){
        if(page==1){
          this.setState({ newsData: lists.data});
        }else{
          let old = this.state.newsData;
          let news = old.concat(lists.data);
          this.setState({ newsData: news});
        }
      }
    }});
  }

  //加载更多
  onEndReached () {
    newsPage=newsPage+1;
    this.loadNews(newsPage);
  };

  //下拉刷新
  onRefresh () {
    newsPage=1;
    this.loadNews(newsPage);
  };
 
  onShare = (news) => {
    const { navigate } = this.props.navigation;
    navigate('Shareing', {news});
    // this.props.dispatch({ type: 'news/share', payload: { news: news } });
    // DeviceEventEmitter.emit('share', news);
    // AnalyticsUtil.onEvent('Forward');
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
      <View style={[styles.container,{backgroundColor: '#FFFFFF',paddingTop: Constants.FitPhone}]}>
        <ListView initialListSize={5}  style={{ backgroundColor: '#F9FAF9' }} enableEmptySections={true} 
          onEndReachedThreshold={20}   onEndReached={() => this.onEndReached()}
          refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh()}
            tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
          dataSource={this.state.dataSource.cloneWithRows(this.state.newsData == null ? [] : this.state.newsData)}
          renderRow={(rowData) => (
            <TouchableHighlight onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.5} underlayColor={'#F9FAF9'}>
              <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                <View style={styles.rowFooter}>
                  <View style={{flexDirection: "column",}}>
                    <Text style={[styles.pastTime,{color: '#808080'}]}>{moment(rowData.createdate).format('YYYY.MM.DD HH:mm')}</Text>
                    <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width: ScreenUtil.autowidth(20),height: 1}}/>
                  </View>
                  <View style={{flex: 1, justifyContent: "flex-end", alignItems: 'flex-end', }}>
                    <TouchableOpacity onPress={this.onShare.bind(this, rowData)} style={styles.spotout}>
                        <Image style={{width:ScreenUtil.autowidth(18),height:ScreenUtil.autowidth(18)}} source={UImage.share_bright} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{fontSize: ScreenUtil.setSpText(14), color: '#323232',fontWeight: "bold",lineHeight: ScreenUtil.autoheight(20),}}>{rowData.title}</Text>
                <Text style={[styles.journalism,{color: '#555555'}]} >{rowData.content}</Text>
                {rowData.imgurl != null &&<View style={{justifyContent: 'center',alignItems: 'center',marginVertical:  ScreenUtil.autoheight(10) }}>
                    <Image style={{width: ScreenWidth - ScreenUtil.autoheight(60),height: ScreenUtil.autoheight(150)}} source={{uri: rowData.imgurl}} resizeMode='contain'/>
                </View>}
              </View>
            </TouchableHighlight>
          )} 
        />
        <Modal animationType='slide' transparent={true} visible={this.state.SysteminfoModal} onShow={() => { }} onRequestClose={() => { }} >
          <TouchableOpacity onPress={this._setModalVisible.bind(this)} style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
            <View style={styles.subView} >
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
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    borderRadius: 8,
    flexDirection: "column",
    paddingVertical: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(15),
    marginHorizontal: ScreenUtil.autowidth(15),
    marginVertical: ScreenUtil.autoheight(10),
  },
  rowFooter: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
  },
  journalism: {
    fontSize: ScreenUtil.setSpText(12),  
    lineHeight: ScreenUtil.autoheight(17),
    marginVertical: ScreenUtil.autoheight(10), 
  },
  pastTime: {
    fontSize: ScreenUtil.setSpText(12), 
    lineHeight: ScreenUtil.autoheight(20), 
  },
  spotout: {
    flex: 1, 
    flexDirection: "row", 
    paddingVertical: ScreenUtil.autowidth(5)
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