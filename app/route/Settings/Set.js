import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,StyleSheet,View,Text,Dimensions,Image,Platform,Linking,Switch} from 'react-native';
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
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
        AnalyticsUtil.onEvent('Sign_out');
      }});
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
    var th = this;
    this.props.dispatch({type:'login/changethemeSwitching',callback:(theme)=>{
      this.setState({
        skin:theme.theme,
      });
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
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
      <Header {...this.props} onPressLeft={true} title="系统设置" />
      <View style={styles.scrollView}>
          <Button onPress={() => this.gesturepass()}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
                <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                  <View style={styles.scrollView}>
                    <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>货币单位</Text>
                  </View>
                  <View style={styles.listInfoRight}>            
                    <Font.Ionicons name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
                  </View>
                </View>
              </View>
          </Button>
          <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
              <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                <View style={styles.scrollView}>
                  <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>手势密码</Text>
                </View>
                <View style={styles.listInfoRight}>
                  <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.btnColor}
                  value={this.state.gesture} onValueChange={(gesture)=>{this.setState({gesture:gesture,});this.gesturepass(gesture);}}/>
                </View>
              </View>
          </View>
          <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
              <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                <View style={styles.scrollView}>
                  <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>消息推送</Text>
                </View>
                <View style={styles.listInfoRight}>
                  <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.btnColor}
                  value={this.state.value} onValueChange={(value)=>{ this.setState({ value:value, });this.changeJpush(value);}}/>
                </View>
              </View>
          </View>
          
          {/* <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
              <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                <View style={styles.scrollView}>
                  <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>夜间模式</Text>
                </View>
                <View style={styles.listInfoRight}>
                  <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.secdColor}
                  value={this.state.skin} onValueChange={(value)=>{ this.setState({ skin:value, });this.changeTheme(value);}}/>
                </View>
              </View>
          </View> */}
          <Button onPress={() => this.checkVersion()}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
                <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                  <View style={styles.scrollView}>
                    <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>检查新版本</Text>
                  </View>
                  {/* <View style={styles.listInfoRight}>            
                    <Font.Ionicons name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
                  </View> */}
                </View>
              </View>
          </Button>
      </View>
      <View style={{flex: 1,}}>
        <View style={styles.btnout}>
          <Button onPress={() => this.logout()}>
            <View style={[styles.btnloginUser,{backgroundColor: UColor.tintColor}]}>
              <Text style={[styles.btntext,{color: UColor.btnColor}]}>{this.props.loginUser?"退出登陆":"登陆"}</Text>
            </View>
          </Button>
        </View>
        <View style={styles.logout}>
          <Image source={UImage.bottom_log} style={styles.logimg}/>
          <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
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
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: {
    borderTopWidth:1,
    width: ScreenWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height:  ScreenUtil.autoheight(55),
    paddingHorizontal: ScreenUtil.autowidth(16),
   
  },
  listInfoTitle: {
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
  logout:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(20),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(30),
  }
  
});

export default Set;
