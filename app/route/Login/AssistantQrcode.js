import React from 'react';
import {StyleSheet, View, Text, Image, Clipboard,} from 'react-native';
import UImage from '../../utils/Img';
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import QRCode from "react-native-qrcode-svg";
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import ScreenUtil from '../../utils/ScreenUtil'

class AssistantQrcode extends BaseComponent {
  static navigationOptions = {
    headerTitle: '小助手二维码',
    header:null, 
  };
 
  constructor(props) {
    super(props);
    this.state = {
      WeChat: 'EOS-TOKEN'
    }
  }

  componentDidMount() {
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  copy() {
    Clipboard.setString(this.state.WeChat);
    EasyToast.show("复制成功")
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
     <Header {...this.props} onPressLeft={true} title="小助手二维码" />
        <View style={[styles.outsource,{backgroundColor: UColor.mainColor}]}>
            <Text style={[styles.accountText,{color: UColor.arrow}]}>微信号：{this.state.WeChat}</Text>
        </View>
        <View style={styles.codeout}>
            <View style={[styles.qrcode,{backgroundColor: UColor.btnColor}]}>
                <QRCode size={170} value={"https://u.wechat.com/IFNmi5QiQirtoO-MrzB55EE"}/>
            </View>
        </View>
        <Text style={[styles.prompttext,{color: UColor.fontColor}]}>微信扫一扫，添加好友</Text>
        <Button onPress={() => this.copy()}>
          <View style={[styles.btnloginUser,{backgroundColor:  UColor.tintColor}]}>
              <Text style={[styles.btntext,{color: UColor.btnColor}]}>复制微信号</Text>
          </View>
        </Button>
        <View style={styles.logout}>
            <Image source={UImage.bottom_log} style={styles.logimg}/>
            <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
        </View>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },

  outsource: {
    height:  ScreenUtil.autoheight(50), 
    marginVertical:  ScreenUtil.autoheight(20), 
    paddingHorizontal: ScreenUtil.autowidth(25),
    justifyContent: "center",
    
  },  
  accountText: {
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
  },

  codeout: {
    marginTop: ScreenUtil.autoheight(25),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  qrcode: {
    padding: ScreenUtil.autowidth(5),
  },

  prompttext: {
    marginVertical: ScreenUtil.autoheight(15),
    fontSize: ScreenUtil.setSpText(15),
    textAlign: "center"
  },

  btnloginUser: {
    height: ScreenUtil.autoheight(45),
    justifyContent: 'center',
    alignItems: 'center',
    margin: ScreenUtil.autowidth(20),
    borderRadius: 5
  },
  btntext: {
    fontSize:ScreenUtil.setSpText(17),
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

export default AssistantQrcode;
