import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,StyleSheet,View,Text,Dimensions,Image,Platform,Linking,Switch,TouchableOpacity} from 'react-native';
import UImage from '../../utils/Img'
import JPush from 'jpush-react-native'
import UColor from '../../utils/Colors'
import JPushModule from 'jpush-react-native'
import Header from '../../components/Header'
import codePush from 'react-native-code-push'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import Upgrade from 'react-native-upgrade-android';
import { EasyToast } from '../../components/Toast';
import TextButton from '../../components/TextButton'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
var DeviceInfo = require('react-native-device-info');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const Font = { Ionicons }

@connect(({login,jPush}) => ({...login,...JPush}))
class Set extends BaseComponent {

  static navigationOptions = {
    title: '系统设置',
    header:null,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: true,
      gesture: false,
      skin: false,
    }
  }

  componentDidMount() {
    const {dispatch}=this.props;
    dispatch({type:'login/getJpush',callback:(jpush)=>{
      this.setState({
        value:jpush.jpush,
      });
    }});
    dispatch({type:'login/getthemeSwitching',callback:(theme)=>{

      this.setState({
        skin:theme.theme,
      });
    }});

    //APK更新
    if (Platform.OS !== 'ios') {
      Upgrade.init();
      DeviceEventEmitter.addListener('progress', (e) => {
        if (e.code === '0000') { // 开始下载
          EasyShowLD.startProgress();
        } else if (e.code === '0001') {
          EasyShowLD.progress(e.fileSize, e.downSize);
        } else if (e.code === '0002') {
          EasyShowLD.endProgress();
        }
      });
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  logout = () =>{
    if(this.props.loginUser){
      EasyShowLD.dialogShow("提示", "您确定要退出登录？", "是", "否", () => {
        this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
          this.props.navigation.goBack();
          AnalyticsUtil.onEvent('Sign_out');
        }});
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    }
  }

  gesturepass(){
    EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
  }

  changeJpush(state){
    const {dispatch}=this.props;
    dispatch({type:'login/changeJpush',callback:(jpush)=>{
      this.setState({
        value:jpush.jpush,
      });
    }});
    if(state){
      JPushModule.addTags(['newsmorningbook'], map => {
      })
    }else{
      JPushModule.deleteTags(['newsmorningbook'], map => {
      });
    }
  }

  changeTheme() {
    const {dispatch}=this.props;
    dispatch({type:'login/changethemeSwitching',callback:(theme)=>{
      this.setState({skin:theme.theme,});
      codePush.restartApp();
    }})

  }

  doUpgrade = (url, version) => {
    if (Platform.OS !== 'ios') {
      this.setState({ visable: false });
      Upgrade.startDownLoad(url, version, "eostoken");
    } else {
      Linking.openURL(url);
    }
  }

  checkVersion(){
    //升级
    this.props.dispatch({
      type: 'common/upgrade', payload: { os: DeviceInfo.getSystemName() }, callback: (data) => {
        if (data.code == 0) {
          if (DeviceInfo.getVersion() < data.data.version) {
            if (data.data.must == 1) {
              EasyShowLD.dialogShow("版本更新", data.data.intr, "升级", null, () => { this.doUpgrade(data.data.url, data.data.version) })
            } else {
              EasyShowLD.dialogShow("版本更新", data.data.intr, "升级", "取消", () => { this.doUpgrade(data.data.url, data.data.version) },() => { EasyShowLD.dialogClose() })
            }
          }else{
            EasyToast.show("当前已是最新版本");
          }
        }
      }
    });
  }

  render() {
    return <View style={[styles.container,{backgroundColor:'#FAFAF9'}]}>
      <Header {...this.props} onPressLeft={true} title="系统设置" />
      <View style={[styles.scrollView,{backgroundColor: '#FFFFFF'}]}>
        <View style={[styles.listItem,{borderBottomColor: '#FAFAF9'}]}>
          <Text style={[styles.listInfoTitle,{color:'#323232'}]}>消息推送</Text>
          <View style={styles.listInfoRight}>
            <Switch  tintColor={'#D9D9D9'} onTintColor={'#3B80F4'} thumbTintColor={'#EDEDED'}
            value={this.state.value} onValueChange={(value)=>{ this.setState({ value:value, });this.changeJpush(value);}}/>
          </View>
        </View>

        <View style={[styles.listItem,{borderBottomColor: '#FAFAF9'}]}>
          <Text style={[styles.listInfoTitle,{color:'#323232'}]}>夜间模式</Text>
          <View style={styles.listInfoRight}>
            <Switch  tintColor={'#D9D9D9'} onTintColor={'#3B80F4'} thumbTintColor={'#EDEDED'}
              value={this.state.skin} onValueChange={(value)=>{this.setState({skin:value}); this.changeTheme(value);}}
            />
          </View>
        </View>
        <View style={[styles.listItem,{borderBottomColor: '#FAFAF9'}]}>
          <Text style={[styles.listInfoTitle,{color:'#323232'}]}>手势密码</Text>
          <View style={styles.listInfoRight}>
            <Switch  tintColor={'#D9D9D9'} onTintColor={'#3B80F4'} thumbTintColor={'#EDEDED'}
            value={this.state.gesture} onValueChange={(gesture)=>{this.setState({gesture:gesture,});this.gesturepass(gesture);}}/>
          </View>
        </View>

        <TouchableOpacity onPress={() => this.checkVersion()}>
          <View style={[styles.listItem,{borderBottomColor: '#FAFAF9'}]}>
            <Text style={[styles.listInfoTitle,{color:'#323232'}]}>检查新版本</Text>
            {/* <View style={styles.listInfoRight}>
              <Font.Ionicons name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
            </View> */}
          </View>
        </TouchableOpacity>
      </View>
      <View style={{flex: 1,alignItems: 'center',justifyContent: 'flex-end',}}>
        <View style={{paddingBottom: ScreenUtil.autowidth(20), alignItems: 'center',justifyContent: 'center',}}>
          <TextButton onPress={() => this.logout()} textColor="#FFFFFF" text={this.props.loginUser?"退出登陆":"登陆"}  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
        </View>
      </View>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },
  scrollView: {
    flex: 1,
    paddingTop: ScreenUtil.autoheight(8),
    paddingBottom: ScreenUtil.autoheight(99),
  },
  listItem: {
    borderBottomWidth:0.5,
    width: ScreenWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: ScreenUtil.autoheight(50),
    paddingHorizontal: ScreenUtil.autowidth(30),
  },
  listInfoTitle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(16),
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnout: {
    height:  ScreenUtil.autoheight(80),
    marginBottom:  ScreenUtil.autoheight(30),
  },
  btnloginUser: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: ScreenUtil.autowidth(20),
    height:  ScreenUtil.autoheight(45),
  },
  btntext: {
    fontSize: ScreenUtil.setSpText(15),
  },

});

export default Set;
