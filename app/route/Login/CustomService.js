import React, { Component } from 'react'
import {Platform,BackHandler,DeviceEventEmitter,Clipboard,InteractionManager,Text,View,WebView,Animated,TextInput,Dimensions,StyleSheet,Modal,TouchableOpacity,Image} from 'react-native'
import UColor from '../../utils/Colors'
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { connect } from 'react-redux';
import Button from '../../components/Button'
import Header from '../../components/Header'

@connect(({ wallet }) => ({ ...wallet }))
export default class CustomService extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
      return {title:navigation.state.params.title,
        header:null,
    }
  }

  constructor(props) {
    super(props)

  }

  componentWillUnmount(){

  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.btnColor }}>
        
        <WebView
            ref="refWebview"
            // ref={(ref) => this._refWebview = ref}
            source={require('./custom_service.html')}
          >
        </WebView>
     
      </View>
    )
  }
}

const styles = StyleSheet.create({
    passout: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        borderBottomWidth: 1,
        textAlign: "center",
        width: ScreenWidth-100,
        height:  ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom:  ScreenUtil.autoheight(5),
    },
    webview_style: {
      flex: 1,
    },
    progress: {
      position: "absolute",
      height: 5,
      left: 0,
      top: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(87):ScreenUtil.autoheight(63),
      overflow: "hidden",
    },
    infoPage: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      paddingTop: 50,
      alignItems: "center",
      transform: [
        { translateX: ScreenWidth }
      ],
    },
    showInfo: {
      transform: [
        { translateX: 0 }
      ]
    },
    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    subView: {
        flexDirection: "row", 
        alignItems: 'center',
        height:  ScreenUtil.autoheight(50), 
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center', 
    },
    buttontext: {
        textAlign: 'center',
        width:  ScreenUtil.autoheight(50),
        fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
        flex: 1,
        fontWeight: 'bold', 
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
    },
    explainText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(18),
    },
    contentText: {
        flex: 1,
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(18),
    },
    separationline: {
        alignItems: 'center',
        flexDirection: "row",
        borderBottomWidth: 0.5,
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(50),
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    amounttext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(25),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(15), 
    },
    unittext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(13),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(10), 
    },
    btnoutsource: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(45),
        marginVertical: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autoheight(15),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    
    actionsdetail: {
        fontSize: ScreenUtil.setSpText(10),
    },

    btnnextstep: {
        height:  ScreenUtil.autoheight(85),
        marginTop:  ScreenUtil.autoheight(30),
    },
    nextstep: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(20),
        height:  ScreenUtil.autoheight(45),
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center', 
        flexDirection: "column",
        marginVertical: ScreenUtil.autoheight(10),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
        marginHorizontal:  ScreenUtil.autoheight(20),
    },
    warningoutShow: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "column",
        marginTop: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(20),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    imgBtnBig: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
        margin: ScreenUtil.autowidth(5),
    },
    headtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(14), 
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight:  ScreenUtil.autoheight(20),
    },
    head: {
        flexDirection: "row",
        borderBottomWidth: 2,
        height: ScreenUtil.autoheight(70), 
      },
    headbtn: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: "center", 
        padding: ScreenUtil.autowidth(5),
      },

    headbtnout: {
        flex:1, 
        alignItems: 'center', 
        justifyContent: "center",
    },
    headbtntext: {
        fontSize: ScreenUtil.setSpText(12),
    },
  })