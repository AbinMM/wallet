import React from 'react';
import { connect } from 'react-redux'
import {CameraRoll, Linking, Dimensions, StyleSheet, View, Text, Image, ImageBackground, ScrollView } from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { kapimg } from '../../utils/Api'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import LinearGradient from 'react-native-linear-gradient'
import BaseComponent from "../../components/BaseComponent";
import { redirect } from '../../utils/Api'
import ViewShot from "react-native-view-shot";
import QRCode from 'react-native-qrcode-svg';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var WeChat = require('react-native-wechat');

@connect(({ login }) => ({ ...login }))
class Shareing extends BaseComponent {

  static navigationOptions = {
    title: '分享资讯',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    WeChat.registerApp('wxc5eefa670a40cc46');
    this.state = {
      news: this.props.navigation.state.params.news,
    }
  }

  componentDidMount() {
  
   
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  shareAction = (e) => {
    var th = this;
    if (e == 1) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToSession({ type: 'imageFile', imageUrl: uri })
                .catch((error) => {
                  EasyToast.show(error.message);
                });
            } else {
              EasyToast.show('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    } else if (e == 2) {
      this.refs.viewShot.capture().then(uri => {
        CameraRoll.saveToCameraRoll(uri);
        EasyToast.show("图片已保存到您的相册,打开QQ并选择图片发送吧");
        setTimeout(() => {
          Linking.openURL('mqqwpa://');
          th.setState({ showShare: false });
        }, 2000);
      });
    } else if (e == 3) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToTimeline({ type: 'imageFile', imageUrl: uri }).then((resp) => {
                // EasyToast.show(JSON.stringify(resp));
                if(resp && resp.errCode == 0){ // 分享成功
                  th.shareSuccess();
                }
              }).catch((error) => {
                  EasyToast.show(error.message);
                });
            } else {
              EasyToast.show('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    } else if (e == 4) {
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  getTime(obj){
    var date;
    try {
      date = moment(obj).format('YYYY.MM.DD HH:mm:ss');
    } catch (error) {
      date = "";
    }
    return date;
  }

  shareClose() {
    this.props.navigation.goBack()
  }

  
  render() {
    return <View style={[styles.container,{backgroundColor: '#FFFFFF'}]}>
      <ScrollView style={{height: ScreenHeight-ScreenUtil.autowidth(200),}}>
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <ViewShot ref="viewShot" style={{}} options={{ format: "jpg", quality: 0.9 }}>
            <View style={{ backgroundColor: UColor.btnColor, flex: 1}}>
              <ImageBackground style={{width: ScreenWidth, height: ScreenWidth*0.7893, justifyContent: 'center', alignItems: 'center'}} source={UImage.home_bg}>
                <Image source={UImage.share_banner} resizeMode="stretch" style={{ width: ScreenWidth - ScreenUtil.autowidth(120), height: (ScreenWidth - ScreenUtil.autowidth(120))*0.5275}} />
              </ImageBackground>
              <View style={{minHeight: ScreenUtil.autoheight(400), marginHorizontal: ScreenUtil.autowidth(25), paddingVertical: ScreenUtil.autoheight(20), borderBottomWidth: 0.5, borderBottomColor: '#D9D9D9',}}>
                <View style={{flexDirection: 'column',}}>
                  <Text style={[styles.pastTime,{color: '#808080'}]}>{moment(this.state.news.createdate).format('YYYY.MM.DD HH:mm')}</Text>
                  <LinearGradient colors={['#69B6FF','#3A42F1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width: ScreenUtil.autowidth(20),height: 1}}/>
                </View>
                <Text style={{ color: '#323232', fontSize: ScreenUtil.setSpText(14),lineHeight: ScreenUtil.autoheight(20)}} >{this.state.news.title}</Text>
                <Text style={{ color: '#555555', fontSize: ScreenUtil.setSpText(12), marginTop: ScreenUtil.autoheight(10) ,lineHeight: ScreenUtil.autoheight(17)}} ellipsizeMode='tail'>{this.state.news.content}</Text>
              </View>
              <View style={{ backgroundColor: UColor.btnColor, width: '100%', paddingTop: ScreenUtil.autowidth(18), paddingHorizontal: ScreenUtil.autowidth(25), flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{justifyContent: 'center', alignSelf: 'center', paddingRight: ScreenUtil.setSpText(15), }}>
                  <QRCode size={ScreenUtil.setSpText(80)} logo={UImage.etlogo} logoSize={ScreenUtil.setSpText(20)} logoBorderRadius={5}
                  value={Constants.rootaddr+redirect + (Constants.loginUser ? Constants.loginUser.uid : "nuid") + "/" + (Constants.token ? Constants.token.substr(0, 4) : "ntk") + "/" + this.state.news.id} />
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignSelf: 'center' }}>
                  <Text style={{ color: UColor.tintColor, fontSize: ScreenUtil.setSpText(16), textAlign: 'center', width: '100%', marginTop: 5 }}>ET钱包</Text>
                  <Text style={{ color: UColor.tintColor, fontSize: ScreenUtil.setSpText(16), textAlign: 'center', width: '100%', marginTop: 3 }}>专注于柚子生态</Text>
                  <Text style={{ color: UColor.btnColor, fontSize: ScreenUtil.setSpText(13), textAlign: 'center', padding: 5, backgroundColor: UColor.blueDeep, margin: 15,}}>更多精彩 长按识别二维码</Text>
                </View>
              </View>
              <Image source={UImage.my_footbg} style={{width: ScreenWidth,height: ScreenWidth*0.2106}} />
            </View>
          </ViewShot>
        </View>
      </ScrollView>
      <View style={{ height: ScreenUtil.autowidth(200), backgroundColor: '#FFFFFF', borderTopLeftRadius: 5,borderTopRightRadius: 5, 
              shadowColor: '#4A90E2',shadowOffset:{height: 0,width: 0},shadowRadius: 5,shadowOpacity:1,elevation: 12,}}>
          <Text style={{fontSize: ScreenUtil.setSpText(16), color: '#333333', marginVertical: ScreenUtil.autowidth(7), width: "100%", textAlign: "center" }}>-分享到-</Text>
          <View style={{ flexDirection: "row",marginVertical: ScreenUtil.autowidth(14), }}>
            <Button onPress={() => { this.shareAction(1) }} >
              <View style={{justifyContent: 'center', alignSelf: 'center', width: ScreenWidth/4, }}>
                <Image source={UImage.share_wx} style={styles.sharewximg} />
                <Text style={[styles.sharetext,{color: '#323232'}]}>微信</Text>
              </View>
            </Button>
            <Button onPress={() => { this.shareAction(3) }} >
              <View style={{justifyContent: 'center', alignSelf: 'center', width: ScreenWidth/4, }}>
                <Image source={UImage.share_pyq} style={styles.sharepyqimg} />
                <Text style={[styles.sharetext,{color: '#323232'}]}>朋友圈</Text>
              </View>
            </Button>
            <Button onPress={() => { this.shareAction(2) }} >
              <View style={{justifyContent: 'center', alignSelf: 'center', width: ScreenWidth/4, }}>
                <Image source={UImage.share_qq} style={styles.shareqqimg} />
                <Text style={[styles.sharetext,{color: '#323232'}]}>QQ</Text>
              </View>
            </Button>
            <Button onPress={() => { this.shareAction(4) }} >
              <View style={{justifyContent: 'center', alignSelf: 'center', width: ScreenWidth/4, }}>
                <Image source={UImage.share_wb} style={styles.sharewbimg} />
                <Text style={[styles.sharetext,{color: '#323232'}]}>微博</Text>
              </View>
            </Button>
          </View>
          <View style={{flex: 1,alignItems: 'center',justifyContent: 'center'}}>
            <Button onPress={() => { this.shareClose() }} >
              <View style={[styles.cancelout,{backgroundColor: '#D9D9D9'}]}>
                <Text style={[styles.canceltext,{color: '#FFFFFF'}]}>取消</Text>
              </View>
            </Button>
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
  pastTime: {
    fontSize: ScreenUtil.setSpText(10), 
    lineHeight: ScreenUtil.autoheight(20), 
  },

  sharetitle: {
    width: ScreenWidth,
    textAlign: "center",
    marginTop: ScreenUtil.autowidth(10),
  },
  sharewximg: {
    alignSelf: 'center',
    width: ScreenUtil.autowidth(37),
    height: ScreenUtil.autowidth(30),
  },
  sharepyqimg: {
    alignSelf: 'center',
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
  },
  shareqqimg: {
    alignSelf: 'center',
    width: ScreenUtil.autowidth(26),
    height: ScreenUtil.autowidth(30),
  },
  sharewbimg: {
    alignSelf: 'center',
    width: ScreenUtil.autowidth(35),
    height: ScreenUtil.autowidth(30),
  },
  shareimg: {
    alignSelf: 'center',
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(50),
    marginTop: ScreenUtil.autowidth(10),
    marginBottom: ScreenUtil.autowidth(5),
  },
  sharetext: {
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autowidth(20),
  },

  
  cancelout: {
    borderRadius: 25,
    alignSelf: 'center' ,
    justifyContent: 'center',
    width: ScreenUtil.autowidth(175),
    height: ScreenUtil.autowidth(40),
  },
  canceltext: {
    textAlign: "center",
    fontSize: ScreenUtil.setSpText(14),
  },
  
});

export default Shareing;