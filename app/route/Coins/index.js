import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,NativeModules,ImageBackground, InteractionManager,ListView,StyleSheet,Image,View,RefreshControl,Text,Platform,Linking,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const pages = [];
let loadMoreTime = 0;
let currentLoadMoreTypeId;
let timer;
let currentTab=0;

@connect(({wallet, sticker}) => ({...wallet, ...sticker}))
class Coins extends React.Component {

  static navigationOptions = {
    title: '行情',
    header: null, 
    tabBarLabel: '行情',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='stretch'
          source={focused ? UImage.tab_2_h : UImage.tab_2} style={{width: ScreenUtil.autowidth(21), height: ScreenUtil.autowidth(17),}}
      />
    ),
  }; 
  
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      routes: [
        { key: '0', title: '自选'},
        { key: '1', title: '市值'},
        { key: '2', title: '涨跌'},
        { key: '3', title: '成交'},
      ]
    };
  }

  //组件加载完成
  componentDidMount() {
    const {dispatch}=this.props;
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }});
    InteractionManager.runAfterInteractions(() => {
      dispatch({type: 'sticker/list',payload:{type:-1}});
      this.startTick(0);
    });
    var th = this;
    DeviceEventEmitter.addListener('changeTab', (tab) => {
       if(tab=="Coins" || tab=="Coin"){
        th.startTick(th.state.index);
       }else{
        if(timer){
          clearInterval(timer);
        }
       }
    });
    DeviceEventEmitter.addListener('coinSlefChange', (tab) => {
      dispatch({type:'sticker/list',payload:{type:0},callback:()=>{
        
      }});
   });
   //推送初始化
   const { navigate } = this.props.navigation;
   DeviceEventEmitter.addListener('changeTab', (tab) => {
    const { navigate } = this.props.navigation;
  })
  }

  componentWillUnmount(){
    if(timer){
      clearInterval(timer);
    }
    DeviceEventEmitter.removeListener('changeTab');
  }

  startTick(index){
    const {dispatch}=this.props;
    InteractionManager.runAfterInteractions(() => {
      clearInterval(timer);
      timer=setInterval(function(){
        dispatch({type:'sticker/list',payload:{type:index}});
      },7000);
    });
  }

  onRefresh(key){
    this.startTick(this.getRouteIndex(key));
  }

  //获得typeid坐标
  getRouteIndex(typeId){
    for(let i=0;i<this.state.routes.length;i++){
        if(this.state.routes[i].key==typeId){
            return i;
        }
    }
  }

  //点击
  onPress = (coins) => {
    // const { navigate } = this.props.navigation;
    // navigate('Coin', { coins });
    EasyToast.show("暂不支持行情查看~");
    AnalyticsUtil.onEvent('Details_money');
  };

  //切换tab
  _handleIndexChange = index => {
    this.startTick(index);
    // this.setState({index});
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({index});
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

  //渲染页面
  renderScene = ({route}) => {
    if(route.key==''){
      return (<View></View>)
    }
    const v = (
      <ListView
        initialListSize={10}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{height:0.5,backgroundColor: UColor.secdColor}} />}
        style={{backgroundColor:UColor.secdColor}}
        enableEmptySections={true}
        renderHeader = {()=><View>  
          {Constants.isNetWorkOffline &&
            <Button onPress={this.openSystemSetting.bind(this)}>
              <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
                <Text style={[styles.systemSettingText,{color: UColor.fontColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                  <Ionicons style={[styles.systemSettingArrow,{color: UColor.fontColor}]} name="ios-arrow-forward-outline" size={20} />
              </View>
            </Button>
          }
        </View>}
        refreshControl={
          <RefreshControl
            refreshing={this.props.loading}
            onRefresh={() => this.onRefresh(route.key)}
            tintColor={UColor.fontColor}
            colors={[UColor.tintColor]} 
            progressBackgroundColor={UColor.btnColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.props.coinList[route.key]==null?[]:this.props.coinList[route.key])}
        renderRow={(rowData) => (
          <Button onPress={this.onPress.bind(this,rowData)}>
            <View style={[styles.row,{backgroundColor:UColor.mainColor}]}>
              <View style={[styles.eoslogout,{backgroundColor: UColor.titletop}]}>
                <Image source={{uri:rowData.img}} style={{width: ScreenUtil.autowidth(25),height: ScreenUtil.autowidth(25),}} />
              </View>
              <View style={{flex:1,flexDirection:"column",alignItems:'flex-start',}}>
                <Text style={{fontSize:ScreenUtil.setSpText(18),color:UColor.fontColor}}>{rowData.name}</Text>
                <Text style={{fontSize:ScreenUtil.setSpText(10),color:UColor.arrow}}>市值${formatterUnit(rowData.value)}</Text>
              </View>
              <View style={{flex:1,flexDirection:"column",alignItems:'flex-end',}}>
                <Text style={{fontSize:ScreenUtil.setSpText(18),color:UColor.fontColor}}>￥{rowData.price}</Text>
                <Text style={{fontSize:ScreenUtil.setSpText(10),color:UColor.arrow}}>量 {formatterNumber(rowData.txs)}</Text>
              </View>
              <View style={[styles.cupcdo,{backgroundColor:rowData.increase>0?UColor.fallColor:UColor.riseColor}]}>
                <Text style={[styles.cupcdotext,{color:UColor.btnColor}]}>{rowData.increase>0?'+'+rowData.increase:rowData.increase}%</Text>
              </View>
            </View>
          </Button>
        )}
      />
    );
    return (v);
  }
  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
      <Header {...this.props} onPressLeft={false} title="行情" /> 
        <TabViewAnimated
        lazy={true}
        navigationState={this.state}
        renderScene={this.renderScene.bind(this)}
        renderHeader={(props)=> <LinearGradient colors={UColor.Navigation} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width:ScreenWidth,height:ScreenWidth*0.1013,}}>
        <TabBar onTabPress={this._handleTabItemPress} 
        labelStyle={[styles.labelStyle,{color:UColor.btnColor}]} 
        indicatorStyle={[styles.indicatorStyle,{backgroundColor: UColor.fonttint}]} 
        style={{alignItems: 'center',justifyContent: 'center',backgroundColor:UColor.transport}} 
        tabStyle={{width: ScreenWidth / 4,padding:0,margin:0,}} 
        scrollEnabled={true} {...props}/>
        </LinearGradient>}
        onIndexChange={this._handleIndexChange}
        initialLayout={{height:0,width:ScreenWidth}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  labelStyle: {
    margin: 0, 
    fontSize: ScreenUtil.setSpText(15), 
  },
  indicatorStyle: {
    marginLeft: ScreenUtil.autowidth(20),
    marginBottom: ScreenUtil.autoheight(1),
    width: ScreenWidth / 4 - ScreenUtil.autowidth(40), 
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  row:{
    flex:1,
    flexDirection:"row",
    alignItems: 'center',
    justifyContent:"center",
    height: ScreenUtil.autoheight(62),
    padding: ScreenUtil.autowidth(10),
  },
  eoslogout: {
    borderRadius: 25,
    flexDirection:"row",
    alignItems: 'center',
    marginHorizontal:ScreenUtil.autowidth(15),
  },
  cupcdo:{
    borderRadius: 3,
    alignItems: 'center',
    padding: ScreenUtil.autowidth(5),
    minWidth: ScreenUtil.autowidth(60),
    maxHeight: ScreenUtil.autoheight(25),
    marginLeft: ScreenUtil.autowidth(20),
  },
  cupcdotext: {
    fontSize: ScreenUtil.setSpText(12),
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

export default Coins;
