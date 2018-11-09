import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, StyleSheet, View, Text, Image, ImageBackground, TouchableHighlight,Linking} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var DeviceInfo = require('react-native-device-info');

@connect(({login}) => ({...login}))
class Community extends BaseComponent {

  static navigationOptions = {
    title: '关于我们',
    header:null, 
  };
  
  constructor(props) {
    super(props);
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
  
  render() {
    return (<View style={styles.container}>    
      <Header {...this.props} onPressLeft={true} title="关于我们" />
      <View style={{backgroundColor: '#FFFFFF',padding: ScreenUtil.autowidth(15), }}>
        <View style={styles.header}>
          <Image source={UImage.logo} style={styles.headimg}/>
          <Text style={styles.foottext}>当前版本： V{DeviceInfo.getVersion()}</Text>
        </View>
        <Text style={styles.slogotext}>EosToken钱包APP由崇尚开源精神的极客团队打造，旨在为用户提供一款安全好用的EOS数字资产钱包.</Text>
        <View style={styles.qrcodeout}>
          <Image source={UImage.qrcode_wechat} style={styles.qrcodeimg}/>
          <Text style={styles.foottext}>客服微信：eostokenim</Text>
        </View>
        <View style={styles.qrcodeout}>
          <Image source={UImage.qrcode_public} style={styles.qrcodeimg}/>
          <Text style={styles.foottext}>公众号：EosToken钱包</Text>
        </View>
        <Text style={styles.foottext}>微博：weibo.com/eostoken</Text>
        <Text style={styles.foottext}>代码开源地址：github.com/eostoken/wallet</Text>
        <Text style={styles.foottext}>官网：eostoken.im</Text>
      </View>
    </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAF9'
  },
  header: {
    alignItems: 'center', 
    paddingVertical: ScreenUtil.autowidth(10),
  },
  headimg: {
    width:ScreenUtil.autowidth(45),
    height: ScreenUtil.autowidth(45),
    marginVertical:  ScreenUtil.autowidth(10),
  },
  slogotext: {
    color: '#808080',
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(17),
  },
  qrcodeout: {
    alignItems: 'center',
    paddingTop:ScreenUtil.autowidth(10), 
  },
  qrcodeimg: {
    width:ScreenUtil.autowidth(125),
    height: ScreenUtil.autowidth(125),
  },
  foottext: {
    color: '#808080',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(12),
    marginTop: ScreenUtil.autoheight(5),
    lineHeight: ScreenUtil.autoheight(17),
  },
});

export default Community;
