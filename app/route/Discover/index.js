import React from 'react';
import { connect } from 'react-redux'
import { Dimensions,Image,  ScrollView,DeviceEventEmitter,TouchableOpacity,
         ListView, StyleSheet, View,  Text,  SectionList,
         Linking, } from 'react-native';

import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {AlertModal} from '../../components/modals/AlertModal'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Carousel from 'react-native-banner-carousel';
require('moment/locale/zh-cn');


var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet,banner, dapp,}) => ({ ...wallet,...banner,...dapp}))
class Discover extends React.Component {

  static navigationOptions = {
    tabBarLabel: '发现',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='contain' source={focused ? UImage.tab_2_h : UImage.tab_2} style={{width: ScreenUtil.autowidth(22), height: ScreenUtil.autowidth(20)}}/>
    ),
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      hotdappList:[],  //热门推荐
      advertisdapplist: [], //广告位
      holdallList: [], //所有热门推荐
      mydappBook: [],  //我的dapp
    }
  }
  
  //组件加载完成
  componentDidMount() {
    this.props.dispatch({ type: 'wallet/getDefaultWallet',});
    //获取banner图
    this.props.dispatch({ type: 'banner/list', payload: {} });
    //获取我的Dapp
    this.getMyDapp();
    DeviceEventEmitter.addListener('access_dappweb', (data) => {
      if(data)
      {
        this.getMyDapp();
      }
  });
    //获取热门推荐
    this.props.dispatch({ type: 'dapp/dappfindAllHotRecommend', 
      callback: (resp) => {
        if (resp && resp.code == '0') {
          if(resp.data){
            this.setState({
              hotdappList: resp.data,
            });
          }
        }
      }
    });
    //获取两个广告位
    this.props.dispatch({ type: 'dapp/dappAdvertisement', payload: {adPositionId: '1'},
      callback: (resp) => {
        if (resp && resp.code == '0') {
          if(resp.data){
            this.setState({
              advertisdapplist: resp.data,
            });
          }
        }
      } 
    });
    //获取DAPP所有列表
    this.props.dispatch({ type: 'dapp/dappfindAllRecommend', 
      callback: (resp) => {
        if (resp && resp.code == '0') {
          if(resp.data && resp.data.length > 0){
            this.setState({
              holdallList: resp.data,
            });
          }
        } 
      }
    });

    
  }

  componentWillUnmount() {

  }
  
  //更新我的Dapps
  getMyDapp = ()=>{
    this.props.dispatch({ type: 'dapp/mydappInfo', callback: (resp) => {
        if (resp) {
            this.setState({mydappBook: resp});
        } 
    } });
  };
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

  //广告
  onAdvertisement(data){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("请先导入已激活账号!");
      return;
    }

    this.props.dispatch({ type: 'dapp/dappAdvertisementDetail', payload: {adIdentifyId: data.adIdentifyId,adTop:data.adTop},
      callback: (resp) => {
        if (resp && resp.code == '0') {
          if(resp.data){
            this.accessDapp(resp.data);
          }
        }
      } 
    });
    
  }
  //点DAPP跳转
  onPressTool(data) {
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("请先导入已激活账号!");
      return;
    }
    this.accessDapp(data);
  }
  accessDapp(data){
    if(!data || !data.hasOwnProperty('name' || !data.hasOwnProperty('url') || !data.hasOwnProperty('icon'))){
      EasyToast.show("无效链接!");
      return;
    }

    const { navigate } = this.props.navigation;
    var title = '您所访问的页面将跳至第三方DApp' + data.name;
    var content = '提示：您所访问的页面将跳转至第三方DApp'+ data.name +'。您在第三方DApp上的使用行为将适用该第三方DApp的用户协议和隐私政策，由其直接并单独向您承担责任。';
    AlertModal.show(title,content,'确认','取消',(resp)=>{
      if(resp){
        navigate('DappWeb', { data: data});
      }
    });
  }

  onDappSearch ()  {
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("请先导入已激活账号!");
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Dappsearch', { });
  }

  onHistoryCollection() {
    const { navigate } = this.props.navigation;
    navigate('HistoryCollection', { });
  }
  onAllRecommendMore(data) {
    const { navigate } = this.props.navigation;
    navigate('DappAllList', {id:data.id,name:data.name});
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: '#F9FAF9',}]}>
        <ScrollView  keyboardShouldPersistTaps="always" style={{flex: 1,}}
            // refreshControl={<RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()}
            // tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor} style={{backgroundColor: UColor.transport}}/>}
          >
          <View style={{paddingBottom: ScreenUtil.autoheight(15), }}>
            <View style={{paddingTop: ScreenUtil.autoheight(10) +Constants.FitPhone,paddingBottom: ScreenUtil.autoheight(15), backgroundColor: '#FFFFFF', borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
               shadowColor: '#EFF4F8',shadowOffset:{height: 2,width: 0},shadowRadius: 5,shadowOpacity:1,elevation: 12,}}>
              <View style={{alignItems: 'center',paddingHorizontal: ScreenUtil.autowidth(20),}}>
                <View style={{width:ScreenWidth,  height: (ScreenWidth * 0.436) + ScreenUtil.autoheight(20), borderRadius: 7, overflow: 'hidden',}}>
                  <Carousel autoplay autoplayTimeout={5000} loop index={0} pageSize={ScreenWidth} 
                  pageIndicatorContainerStyle={{right: ScreenUtil.autowidth(25), bottom: ScreenUtil.autowidth(20), zIndex: 999}}
                  pageIndicatorStyle={{backgroundColor: '#EAEAEA', }} activePageIndicatorStyle={{backgroundColor:'#6DA0F8',}}>
                    {this.renderSwipeView()}
                  </Carousel>
                </View>
              </View>
              <TouchableOpacity onPress={this.onDappSearch.bind(this)}  style={[styles.inptout,{borderColor: '#D9D9D9',backgroundColor:'#FFFFFF',marginHorizontal: ScreenUtil.autowidth(20),}]} >
                <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
                <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#D9D9D9'}}>HASH FUN</Text>
              </TouchableOpacity> 
              {this.state.mydappBook && this.state.mydappBook.length > 0 &&<View>
                <View style={{marginVertical:ScreenUtil.autoheight(15),flexDirection: 'row',marginHorizontal: ScreenUtil.autowidth(20),}}>
                  <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(14),color: '#323232',fontWeight:'bold',}}>我的DApps</Text>
                  <TouchableOpacity onPress={this.onHistoryCollection.bind(this)} style={{flexDirection: 'row',}} >
                    <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#3B80F4',paddingRight: ScreenUtil.autowidth(5),}}>更多</Text>
                    <Ionicons name="ios-arrow-forward-outline" size={14} color='#3B80F4' />
                  </TouchableOpacity>
                </View>
                <ListView enableEmptySections = {true} contentContainerStyle={{flexDirection:'row',paddingHorizontal: ScreenUtil.autowidth(6),}}
                  dataSource={this.state.dataSource.cloneWithRows(this.state.mydappBook == null ? [] : this.state.mydappBook)} 
                  renderRow={(rowData) => (
                    <Button  onPress={this.onPressTool.bind(this, rowData)}  style={{width: (ScreenWidth -ScreenUtil.autowidth(14))/5, paddingBottom: ScreenUtil.autoheight(18),}}>
                      <View style={styles.headbtnout}>
                        <Image source={{uri: rowData.icon}}  style={styles.imgBtnDAPP} resizeMode='stretch' />
                        <Text numberOfLines={1} style={[{fontSize: ScreenUtil.setSpText(10), color: '#323232',textAlign: 'center',paddingHorizontal:ScreenUtil.autowidth(8)}]}>{rowData.name}</Text>
                      </View>
                    </Button>
                  )}
                />
              </View>}
              {this.state.hotdappList && this.state.hotdappList.list && this.state.hotdappList.list.length > 0 &&<View>
                <View style={{marginVertical:ScreenUtil.autoheight(15),marginHorizontal: ScreenUtil.autowidth(20),}}>
                  <Text style={{fontSize: ScreenUtil.setSpText(14),color: '#323232',fontWeight:'bold',}}>{this.state.hotdappList.name}</Text>
                </View>
                <ListView enableEmptySections = {true} contentContainerStyle={{flexDirection:'row', paddingHorizontal: ScreenUtil.autowidth(6),}}
                  dataSource={this.state.dataSource.cloneWithRows(this.state.hotdappList.list == null ? [] : this.state.hotdappList.list)}
                  renderRow={(rowData) => (
                    <Button  onPress={this.onPressTool.bind(this, rowData)}  style={{width: (ScreenWidth -ScreenUtil.autowidth(14))/5, paddingBottom: ScreenUtil.autoheight(18),}}>
                      <View style={styles.headbtnout}>
                        <Image source={{uri: rowData.icon}} style={styles.imgBtnDAPP} resizeMode='stretch'/>
                        <Text numberOfLines={1} style={[{fontSize: ScreenUtil.setSpText(10), color: '#323232',textAlign: 'center',paddingHorizontal:ScreenUtil.autowidth(8)}]}>{rowData.name}</Text>
                      </View>
                    </Button>
                  )}
                />
              </View>}
            </View>
          </View>
         
          <View style={{backgroundColor: '#F9FAF9',}}>
            <ListView enableEmptySections = {true} contentContainerStyle={{flexDirection:'row',paddingHorizontal: ScreenUtil.autowidth(12.5)}}
              dataSource={this.state.dataSource.cloneWithRows(this.state.advertisdapplist == null ? [] : this.state.advertisdapplist)}
              renderRow={(rowData) => (
                <Button  onPress={this.onAdvertisement.bind(this, rowData)}  style={{width: (ScreenWidth-ScreenUtil.autowidth(55))/2, marginHorizontal: ScreenUtil.autowidth(7.5)}}>
                  <View style={{alignItems: 'center', justifyContent: "center", backgroundColor: '#FFFFFF',borderRadius: 5,}}>
                    <Image source={{uri:rowData.adPhoto}} style={{width: (ScreenWidth-ScreenUtil.autowidth(55))/2,height: (ScreenWidth-ScreenUtil.autowidth(55))/2*0.5,}} resizeMode='stretch'/>
                  </View>
                </Button>
              )}
            />
            <SectionList
              contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-start',paddingBottom: ScreenUtil.autoheight(50),width: ScreenWidth,paddingHorizontal: ScreenUtil.autowidth(12.5),}}
              initialNumToRender={4}
              keyExtractor={(item, index) => index + item}
              sections={this.state.holdallList}
              renderSectionHeader={(info,index) => (
                <View style={[{width:ScreenWidth,flexDirection:"row", justifyContent: 'center',paddingHorizontal: ScreenUtil.autowidth(20),paddingTop: ScreenUtil.autoheight(15)}]}>
                  <Text style={{width:ScreenWidth,color: '#B5B5B5',fontWeight:'bold', fontSize: ScreenUtil.setSpText(14),flex:1 }}>{info.section.name}</Text>
                  {info.section.is_there_more && <TouchableOpacity onPress={this.onAllRecommendMore.bind(this,info.section)} style={{flexDirection: 'row',}} >
                    <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#3B80F4',paddingRight: ScreenUtil.autowidth(5),}}>更多</Text>
                    <Ionicons name="ios-arrow-forward-outline" size={14} color='#3B80F4' />
                  </TouchableOpacity>
                  }
                </View>
                )}
              renderItem={ (rowData) => (
                <TouchableOpacity  onPress={this.onPressTool.bind(this, rowData.item)}  style={{width: (ScreenWidth - ScreenUtil.autowidth(25))/2, paddingHorizontal: ScreenUtil.autowidth(7.5),paddingTop: ScreenUtil.autoheight(15),}}>
                  <View style={{ flexDirection: 'row',alignItems: 'center', justifyContent: "center", backgroundColor: '#FFFFFF',paddingHorizontal:ScreenUtil.autowidth(13),paddingVertical:ScreenUtil.autoheight(20),borderRadius: 5, }}>
                    <Image source={{uri: rowData.item.icon}} style={{width: ScreenUtil.autowidth(40),height: ScreenUtil.autowidth(40),}} resizeMode='stretch'/>
                    <View style={{flex: 1, paddingLeft:  ScreenUtil.autowidth(10),}}>
                      <Text style={[styles.headbtntext,{color: '#262626'}]} numberOfLines={1}>{rowData.item.name}</Text>
                      <Text style={[styles.descriptiontext,{color: '#808080'}]} numberOfLines={1}>{rowData.item.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>)
              }
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inptout: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    height: ScreenUtil.autoheight(30),
  },
  headleftimg: {
    width: ScreenUtil.autowidth(16),
    height: ScreenUtil.autowidth(16),
    marginHorizontal: ScreenUtil.autowidth(10),
  },
  inpt: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ScreenUtil.setSpText(12),
  },
 
  headbtnout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: "center",
  },
  imgBtnDAPP: {
    width: ScreenUtil.autowidth(45),
    height: ScreenUtil.autowidth(45),
    marginBottom: ScreenUtil.autoheight(5)
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(8),
    lineHeight: ScreenUtil.autoheight(20),
  },
  descriptiontext: {
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(14),
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
    borderRadius: 7,
    width: ScreenWidth - ScreenUtil.autowidth(40),
    height: (ScreenWidth-ScreenUtil.autowidth(40)) * 0.436,
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
