import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, Image, Dimensions, Clipboard, TouchableHighlight} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');

@connect(({login}) => ({...login}))
class ExportPublicKey extends BaseComponent {

  static navigationOptions = {
    headerTitle: '导出公钥',
    header:null,  
  };
 
  constructor(props) {
    super(props);
    this.state = {
        ownerPk: '',
        activePk: '',
      }
  }

    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk: this.props.navigation.state.params.ownerPublicKey,
            activePk: this.props.navigation.state.params.activePublicKey,
        })
    }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
 
  copyOwnerPK() {
    Clipboard.setString(this.state.ownerPk);
    EasyToast.show("Owner公钥复制成功")
  }

  copyActivePK() {
    Clipboard.setString(this.state.activePk);
    EasyToast.show("Active公钥复制成功")
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="导出公钥" />
        <View style={[styles.header,{backgroundColor: UColor.secdColor}]}>
            <View style={[styles.inptoutbg,{backgroundColor: UColor.mainColor}]}>
                {this.state.ownerPk != '' && <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flexDirection:'row',}}>
                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>Owner公钥（拥有者）</Text>
                        <TouchableHighlight onPress={() => { this.copyOwnerPK() }} activeOpacity={1} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Text style={[styles.buttonText,{color:  UColor.tintColor}]}>复制</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={[styles.inptgo,{backgroundColor: UColor.secdColor}]}>
                        <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.ownerPk.substr(0, 26)}</Text>
                        <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.ownerPk.substr(26, 27)}</Text>
                    </View>
                </View>
                }
                {this.state.activePk != '' && <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flexDirection:'row',}}>
                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>Active公钥（管理者）</Text>
                        <TouchableHighlight onPress={() => { this.copyActivePK() }} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Text style={[styles.buttonText,{color:  UColor.tintColor}]}>复制</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={[styles.inptgo,{backgroundColor: UColor.secdColor}]}>
                        <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.activePk.substr(0, 26)}</Text>
                        <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.activePk.substr(26, 27)}</Text>
                    </View>
                </View>
                }
            </View>
            {/* <View style={styles.textout}>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是拥有者权限？</Text>
                <Text style={[styles.explaintext,{color: UColor.fontColor}]}>Owner 代表了对账户的所有权，可对权限进行设置，管理Active和其他角色</Text>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是管理者权限？</Text>
                <Text style={[styles.explaintext,{color: UColor.fontColor}]}>Active 用于日常使用，比如转账，投票等。</Text>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是权重阈值？</Text>
                <Text style={[styles.explaintext,{color: UColor.fontColor}]}>权重阈值是使用该权限的最低权重要求。</Text>
            </View> */}
            <View style={styles.textout}>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是拥有者权限（Owner）？</Text>
                <Text style={[styles.explaintext,{color: UColor.arrow}]}>Owner 代表了对账户的所有权，可以对权限进行设置，管理Active和其他角色。</Text>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是管理者权限（Active）？</Text>
                <Text style={[styles.explaintext,{color: UColor.arrow}]}>Active 用于日常使用，比如转账，投票等。</Text>
                <Text style={[styles.titletext,{color: UColor.fontColor}]}>什么是权重阈值？</Text>
                <Text style={[styles.explaintext,{color: UColor.arrow}]}>权重阈值是使用该权限的最低权重要求。</Text>
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
    header: {
        flex: 1,
        marginTop: ScreenUtil.autoheight(10),
    },
    inptoutbg: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    inptoutgo: {
        paddingBottom: ScreenUtil.autoheight(20),
    },
    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(35),
    },
    buttonView: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    buttonText: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(35),
    },
    inptgo: {
        height: ScreenUtil.autoheight(60),
        paddingHorizontal: ScreenUtil.autowidth(10),
        width: ScreenWidth - ScreenUtil.autowidth(40),
    },
    inptext: {
        flexWrap: 'wrap',
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },

    textout: {
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(16),
    },
    titletext: {
        fontSize: ScreenUtil.setSpText(15),
        paddingTop: ScreenUtil.autoheight(8),
    },
    explaintext: {
        fontSize: ScreenUtil.setSpText(13),
        lineHeight: ScreenUtil.autoheight(25),
        paddingLeft: ScreenUtil.autowidth(20),
        paddingVertical: ScreenUtil.autoheight(5),
    },
    // textout: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     paddingHorizontal: ScreenUtil.autowidth(20),
    // },
    // titletext: {
    //     fontSize: ScreenUtil.setSpText(15),
    //     lineHeight: ScreenUtil.autoheight(35),
    // },
    // explaintext: {
    //     fontSize: ScreenUtil.setSpText(13),
    //     lineHeight: ScreenUtil.autoheight(20),
    // },






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
    },
});

export default ExportPublicKey;
