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
      { avatar: this.state.status ? UImage.my_activityh : UImage.my_activity, first: true, name: "活动中心", onPress: this.goPage.bind(this, "activity") },
      { avatar:UImage.my_wallet, name: "钱包管理", onPress: this.goPage.bind(this, "WalletManage") },
      { avatar:UImage.account_manage, first: true, name: "通讯录", onPress: this.goPage.bind(this, "AccountManage") },
      { avatar:UImage.my_share, first: true, name: "邀请注册", onPress: this.goPage.bind(this, "share") },
      { avatar:UImage.my_help, name: "帮助中心", onPress: this.goPage.bind(this, "Helpcenter") },
      { avatar:UImage.my_system, name: "系统设置",  onPress: this.goPage.bind(this, "set") },
      // { avatar:UImage.my_community, name: "ET社区", onPress: this.goPage.bind(this, "Community") },
      { avatar:UImage.my_aboutus, name: "关于我们", onPress: this.goPage.bind(this, "Community") },
    ];
  }

  //组件加载完成
  componentDidMount() {
    const {dispatch}=this.props;
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }});
    //获取活动状态
    this.props.dispatch({type: 'news/getInfo', payload:{activityId:"1"},callback: (datainfo) => {
      if(datainfo && datainfo != null){
        if(datainfo.status == 'doing'){
          this.setState({status: true})
        }else{
          this.setState({status: false})
        }
      }
    } })
    
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

  selectpoint(){
    if(this.props.defaultWallet != null && this.props.defaultWallet.name != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyToast.show("当前主网账号未激活，请重新导入EOS账号。");
      return;
    }
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived')) {
      EasyShowLD.loadingShow();
      const { navigate } = this.props.navigation;
      if(this.state.isquery){
        this.props.dispatch({type:'login/geteostRecord',payload:{},callback:(carry)=>{
          EasyShowLD.loadingClose();   
          if(carry.code == 0){
            navigate('WithdrawMoney', {carry});
          }else{
            EasyToast.show(carry && carry.msg ? carry.msg : "抱歉,未获取到您的奖励记录");
          }
        }})
      }else{
        if(this.props.loginUser){
          try {
            this.props.dispatch({type:'login/getselectPoint',payload:{},callback:(integral)=>{
              // EasyShowLD.loadingClose();
              if(integral.code == 605){
                const view = <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>您当前的积分还不符合领取条件,请继续努力！</Text>
                EasyShowLD.dialogShow("温馨提示", view, "查看", "关闭", () => {
                  navigate('Web', { title: "活动奖励领取条件", url: "http://news.eostoken.im/html/20180827/1535368470588.html" });
                  EasyShowLD.dialogClose()
                }, () => { EasyShowLD.dialogClose() });
              }else if(integral.code == 607){
                // const view = <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>您没有活动奖励可领取！</Text>
                // EasyShowLD.dialogShow("温馨提示",view,"知道了",null,()=>{EasyShowLD.dialogClose()}); 
                const view = <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>首批奖励领取已圆满结束，期待您的下次参与！</Text>
                EasyShowLD.dialogShow("温馨提示", view, "查看", "好的", () => {
                  navigate('Web', { title: "活动结束公告", url: "http://news.eostoken.im/html/20180831/1535698529506.html" });
                  EasyShowLD.dialogClose()
                }, () => { EasyShowLD.dialogClose() });
              }else if(integral.code == 0){         
                EasyShowLD.loadingClose();
                if (Platform.OS == 'ios') {
                  var th = this;
                    this.handle = setTimeout(() => {
                      th._setModalVisible();
                      th.setState({walletName: this.props.defaultWallet ? this.props.defaultWallet.name : ''}); 
                    }, 100);
                  }else{
                    this._setModalVisible();
                    this.setState({walletName: this.props.defaultWallet ? this.props.defaultWallet.name : ''}); 
                  }
                // this._setModalVisible();
                // this.setState({walletName: this.props.defaultWallet ? this.props.defaultWallet.name : ''}); 
              }else{
                EasyShowLD.loadingClose();
                EasyToast.show(integral && integral.msg ? integral.msg : "抱歉,您未达到奖励获取条件");
              }
            }})
          }catch (error) {
            EasyShowLD.dialogClose();
            EasyShowLD.loadingClose();
          }
        }
      }
    }else{
      EasyToast.show('请先导入钱包');
    }
  }

  eostreceive() {
    try {
      EasyShowLD.loadingShow();
      this.props.dispatch({type:'login/geteostReceive',payload:{eos_account:this.state.walletName},callback:(carry)=>{
        EasyShowLD.loadingClose();
        if(carry.code == 0 && carry.data == true){
          EasyToast.show('提交成功，将于3个工作日内审核并发放，感谢您的支持！');
          this.eostRecord();
        }else if(carry.code == 403){
          EasyToast.show('请重新登陆');
          navigate('Login', {});
        }else{
          EasyToast.show(carry && carry.msg ? carry.msg : "抱歉, 提交失败! 请稍后再试");
        }
        this._setModalVisible();
      }})
    }catch (error) {
      this._setModalVisible();
    }
  }

  // 显示/隐藏 modal  
  _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  render() {
    return <View style={[styles.container,{backgroundColor: '#F7F8F9'}]}>
      <ScrollView  keyboardShouldPersistTaps="always">
        <Header {...this.props} onPressLeft={false} title="我的" />
        {Constants.isNetWorkOffline &&
        <Button onPress={() => {NativeUtil.openSystemSetting();}}>
          <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
              <Text style={[styles.systemSettingText,{color: UColor.fontColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
              <Ionicons style={[styles.systemSettingArrow,{color: UColor.fontColor}]} name="ios-arrow-forward-outline" size={20} />
          </View>
        </Button>}
        
      
        <View style={[styles.userHead,{backgroundColor: UColor.mainColor}]} >
          <TouchableOpacity style={styles.headout} onPress={this.goProfile.bind(this)}>
            <View style={[styles.headimgout, {backgroundColor:'#F7F8F9'}]}> 
              {this.props.loginUser ?
              <Image source={UImage.logo} style={styles.headimg}/>
              :
              <Text style={{fontSize: ScreenUtil.setSpText(14.5), color: '#1A1A1A'}}>登陆</Text>
               }
              
            </View>
            <Text style={[styles.headtext,{color: '#1A1A1A'}]}>{(this.props.loginUser) ? this.props.loginUser.nickname : ""}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.signedout,{backgroundColor: this.state.Sign_in ? '#E6E6E6':'#6DA0F8'}]} onPress={this.signIn.bind(this)} >
            <Text style={{fontSize: ScreenUtil.setSpText(11), color: '#FFFFFF', textAlign: 'center'}}>签到</Text>
          </TouchableOpacity>
        </View>
        
        
        {/* <View style={[styles.eosbtnout,{backgroundColor: UColor.mainColor}]}>
          <View style={styles.eosout}>
            <Text style={[styles.eosbtntext,{color: UColor.arrow}]}>活动奖励</Text>
            <Text style={[styles.eostext,{color: UColor.fontColor}]}>{(this.props.loginUser) ? this.props.loginUser.eost : "0"} EOS</Text>
          </View>
          <View style={styles.Withdrawout}>
            {
              this.props.loginUser && <Button onPress={this.selectpoint.bind(this)} style={[styles.Withdrawbtn,{backgroundColor: UColor.tintColor}]}>
                <Text style={[styles.Withdrawtext,{color: UColor.btnColor}]}>{this.state.isquery ? '领取记录' : '领取'}</Text>
              </Button>
            }
          </View>
        </View> */}
        
        <View>
          {this._renderListItem()}
        </View>
        
        {/* <View style={styles.footer}>
          <Text style={[styles.foottext,{color: UColor.arrow}]}>© 2018 eostoken all rights reserved </Text>
          <Text style={[styles.foottext,{color: UColor.arrow}]}>EOS专业版钱包 V{DeviceInfo.getVersion()}</Text>
          <Text style={[styles.foottext,{color: UColor.arrow}]}>EOS专业版钱包 V2.3.8.1</Text>
        </View> */}
      
        <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.show} onRequestClose={()=>{}}>
          <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
            <View style={{ width: ScreenWidth-20, backgroundColor: UColor.fontColor, borderRadius: 5, }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible.bind(this)} style={styles.buttonView}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <View style={styles.warningout}>
                    <Text style={styles.contentText}>领取奖励</Text>
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>恭喜您！已符合领取条件。</Text>
                    <View style={styles.accountoue} >
                        <Text style={[styles.inptitle,{color: UColor.blackColor}]}>您的主网账号：</Text>
                        <Text style={[styles.inpt,{color: UColor.arrow}]}>{this.state.walletName}</Text>
                    </View>
                </View>
                <Button onPress={this.eostreceive.bind(this)} style={styles.butout}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.btnColor}]}>提交</Text>
                    </View>
                </Button> 
            </View> 
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  inptpasstext: {
    textAlign: "left",
    fontSize: ScreenUtil.setSpText(15),
    lineHeight: ScreenUtil.autoheight(30),
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  userHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: ScreenWidth,
    height: ScreenUtil.autoheight(75),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  headout: {
    flex: 1,
    flexDirection:"row",
    alignItems: "center",
  },
  headimgout: {
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    width: ScreenUtil.autowidth(48),
    height: ScreenUtil.autowidth(48),
  },
  headimg: {
    width: ScreenUtil.autowidth(32),
    height: ScreenUtil.autowidth(32),
  },
  headtext: {
    fontSize: ScreenUtil.setSpText(13),
    paddingTop: ScreenUtil.autoheight(5),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  signedout: {
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: "center",
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autoheight(25),
  },
 
  signedimg: {
    width: ScreenUtil.autowidth(40),
    height: ScreenUtil.autowidth(49)
  },
  eosbtnout: {
    width: ScreenWidth,
    flexDirection: "row",
    justifyContent: 'space-between',
    marginBottom: ScreenUtil.autoheight(8),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  eosout: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: ScreenUtil.autoheight(12)
  },
  eosbtntext: {
    fontSize: ScreenUtil.setSpText(11),
  },
  eostext: {
    fontSize: ScreenUtil.setSpText(15),
    marginTop: ScreenUtil.autoheight(10),
  },
  Withdrawout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end"
  },
  Withdrawbtn: {
    borderRadius: 5,
    paddingVertical: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  Withdrawtext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  footer: {
    flex: 1,
    flexDirection: 'column',
    marginVertical: ScreenUtil.autoheight(20),
  },
  foottext: {
    width: '100%',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(10),
    marginTop: ScreenUtil.autoheight(5),
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
  touchableouts: {
    flex: 1,
    flexDirection: "column",
  },
  pupuoBackup: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
  },
  subViewBackup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(30),
    width: ScreenWidth-ScreenUtil.autowidth(20),
  },
  buttonView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(30),
  },
  contentText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(18),
    paddingBottom: ScreenUtil.autoheight(20),
  },
  warningout: {
    paddingHorizontal: ScreenUtil.autowidth(30),
  }, 
  accountoue: {
    alignItems: 'center',
    flexDirection: "row",
    height: ScreenUtil.autoheight(45),
  },
  headtitle: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(25),
  },
  inptitle: {
    fontSize: ScreenUtil.setSpText(14),
  },
  inpt: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(14),
  },

  imgBtnBackup: {
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
  },
  butout: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteout: {
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(42),
    width: ScreenUtil.autowidth(100),
    marginVertical: ScreenUtil.autoheight(15),
  },
  deletetext: {
    fontSize: ScreenUtil.setSpText(16),
  },
});

export default Setting;
