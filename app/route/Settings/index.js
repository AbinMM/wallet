import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter,NativeModules, InteractionManager,Modal, ListView, StyleSheet, View, TouchableOpacity, Text, ScrollView, Image, Platform, ImageBackground, TextInput,Linking, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Item from '../../components/Item'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import NativeUtil from '../../utils/NativeUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import LinearGradient from 'react-native-linear-gradient'
import Ionicons from 'react-native-vector-icons/Ionicons'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var DeviceInfo = require('react-native-device-info');

@connect(({ wallet, login, news}) => ({ ...wallet, ...login, ...news}))
class Setting extends React.Component {

  static navigationOptions = {
    title: "我的",
    header:null,
    tabBarLabel: '我的',
    tabBarIcon: ({ focused}) => (
      <Image resizeMode='contain' source={focused ? UImage.tab_4_h : UImage.tab_4} style={{width: ScreenUtil.autowidth(22), height: ScreenUtil.autowidth(20)}}/>
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      isquery: false,
      show: false,
      walletName: '',
      status: false,
      Sign_in: false,
    };
    this.config = [
      //{ avatar: this.state.status ? UImage.my_activityh : UImage.my_activity, first: true, name: "活动中心", onPress: this.goPage.bind(this, "activity") },
      // { avatar:UImage.my_help, name: "帮助中心", onPress: this.goPage.bind(this, "Helpcenter") },
      // { avatar:UImage.my_community, name: "ET社区", onPress: this.goPage.bind(this, "Community") },
      {first: 1, avatar:UImage.my_wallet, name: "钱包管理", onPress: this.goPage.bind(this, "WalletManage") },
      // {first: 1, avatar:UImage.my_record, name: "交易记录",  },
      {first: 1, avatar:UImage.my_share, name: "有奖邀请", onPress: this.goPage.bind(this, "share") },
      {first: 1, avatar:UImage.account_manage, name: "通讯录", onPress: this.goPage.bind(this, "AccountManage") },
      {first: 1, avatar:UImage.my_system, name: "系统设置",  onPress: this.goPage.bind(this, "set") },
      {avatar:UImage.my_aboutus, name: "关于我们", onPress: this.goPage.bind(this, "Community") },
    ];
  }

  //组件加载完成
  componentDidMount() {
    const {dispatch}=this.props;
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }});
    
    //获取签到状态
    this.props.dispatch({ type: 'login/isSigned', payload:{name: this.state.phone},callback: (data) => {
      this.setState({Sign_in: data.data});
    } });

    DeviceEventEmitter.addListener('nativeCallRn', (msg) => {
      title = "React Native界面,收到数据：" + msg;
      // ToastAndroid.show("发送成功", ToastAndroid.SHORT);
      alert(title);
    })
    this.eostRecord();
  }

  eostRecord() {
    if(this.props.loginUser){
      this.props.dispatch({type:'login/geteostRecord',payload:{},callback:(carry)=>{
        if(carry.code == 606){
          this.setState({isquery: false})
        }else if(carry.code == 0){
          this.setState({isquery: true})
        }else{
          this.setState({isquery: false})
        }
      }})
    }
  }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "share") {
      if (this.props.loginUser) {
        navigate('Share', {});
      } else {
        navigate('Login', {});
        EasyToast.show('请登陆');
      }
    } else if (key == 'WalletManage') {
      navigate('WalletManage', {});
    } else if(key == 'AccountManage') {
      navigate('addressManage', {});
    } else if (key == 'set') {
      navigate('Set', {});
    } else if (key == 'Community') {
      navigate('Community', {});
    }else if (key == 'Helpcenter') {
      // navigate('Helpcenter', {});
      //navigate('Web', { title: "ET官方客服", url: "https://static.meiqia.com/dist/standalone.html?_=t&eid=126524" });
      Linking.openURL( "https://static.meiqia.com/dist/standalone.html?_=t&eid=126524");
    }else if (key == 'activity') {
      navigate('Activity', {});
    } else{
      EasyShowLD.dialogShow("温馨提示", "暂未开放，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  skipNativeCall() {
    let phone = '123123123';
    NativeModules.commModule.rnCallNative(phone);
  }

  //Callback 通信方式
  callbackComm(msg) {
    NativeModules.commModule.rnCallNativeFromCallback(msg, (result) => {
      alert("CallBack收到消息:" + result);
    })
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  goProfile() {
    if(this.props.loginUser){
      return
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    }
  }

  signIn() {
    const { navigate } = this.props.navigation;
    if (this.props.loginUser) {
      navigate('SignIn', {});
    } else {
      navigate('Login', {});
      EasyToast.show('请登陆');
    }
  }

  render() {
    return <View style={[styles.container,{backgroundColor: '#F9FAF9',}]}>
      <View style={{paddingTop: Constants.FitPhone,backgroundColor: UColor.mainColor,}}>
        {Constants.isNetWorkOffline &&<Button onPress={() => {NativeUtil.openSystemSetting();}}>
          <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
              <Text style={[styles.systemSettingText,{color: UColor.fontColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
              <Ionicons style={[styles.systemSettingArrow,{color: UColor.fontColor}]} name="ios-arrow-forward-outline" size={20} />
          </View>
        </Button>}

        <View style={[styles.userHead,{borderBottomColor: UColor.secdColor,}]} >
          <TouchableOpacity style={styles.headout} onPress={this.goProfile.bind(this)}>
            <View style={[styles.headimgout, {backgroundColor:'#F7F8F9'}]}>
              <Image source={UImage.integral_bg} style={styles.headimg}/>
            </View>
            <Text style={[styles.headtext,{color: '#323232'}]}>{(this.props.loginUser) ? this.props.loginUser.nickname : "登陆"}</Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={this.signIn.bind(this)} >
            <LinearGradient colors={['#69B6FF','#3A42F1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.signedout} >
              <Text style={[styles.signedtext,{color: '#FFFFFF'}]}>签到</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={{backgroundColor: UColor.mainColor,paddingHorizontal: ScreenUtil.autowidth(25),paddingBottom: ScreenUtil.autoheight(20),}}>
          {this._renderListItem()}
        </View>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  userHead: {
    width: ScreenWidth,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.3,
    justifyContent: "center",
    paddingVertical: ScreenUtil.autoheight(22),
    paddingHorizontal: ScreenUtil.autowidth(35),
  },
  headout: {
    flex: 1,
    flexDirection:"row",
    alignItems: "center",
  },
  headimgout: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(50),
    marginRight: ScreenUtil.autowidth(10),
  },
  headimg: {
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(50),
  },
  headtext: {
    fontSize: ScreenUtil.setSpText(16),
    
  },
  signedout: {
    borderRadius: 25,
    alignSelf: 'center',
    justifyContent: "center",
    width: ScreenUtil.autowidth(48),
    height: ScreenUtil.autoheight(20),
  },
  signedtext: {
    fontSize: ScreenUtil.setSpText(12),
    textAlign: 'center',
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

export default Setting;
