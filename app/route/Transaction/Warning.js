import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight,TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

class Warning extends BaseComponent {

    static navigationOptions = {
        headerTitle: '价格预警',
        header:null,   
    };

    //组件加载完成
    componentDidMount() {
        // this.props.dispatch({
        //     type: 'wallet/getDefaultWallet', callback: (data) => {
        //         if (data != null && data.defaultWallet.account != null) {
        //             this.getBalance(data);
        //         } else {
        //             EasyToast.show('获取账号信息失败');
        //         }
        //     }
        // });
        // var params = this.props.navigation.state.params.coins;
        this.setState({
            toAccount: "eosbille1234",
            // amount: "1.0000",
            name: "EOS",
        })
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
      }

   
    onPress(action) {
        EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }

    _rightButtonClick() {
       
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            toAccount: '',
            amount: '',
            memo: '',
            defaultWallet: null,
            balance: '0',
            name: '',
        };
    }

    inputPwd = () => {

    }

    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
          .replace(".", "$#$")
          .replace(/\./g, "")
          .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        // var max = 9999999999.9999;  // 100亿 -1
        // var min = 0.0000;
        // var value = 0.0000;
        // var floatbalance;
        // try {
        //   value = parseFloat(obj);
        //   floatbalance = parseFloat(this.state.balance);
        // } catch (error) {
        //   value = 0.0000;
        //   floatbalance = 0.0000;
        // }
        // if(value < min|| value > max){
        //   EasyToast.show("输入错误");
        //   obj = "";
        // }
        // if (value > floatbalance) {
        //     EasyToast.show('账户余额不足,请重输');
        //     obj = "";
        // }

        return obj;
      }

    clearFoucs = () => {
        this._raccount.blur();
        this._lpass.blur();
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="价格预警" />   
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView  keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={[styles.basc,{backgroundColor: UColor.secdColor}]}>
                            <Text style={[styles.basctext,{color: UColor.arrow}]}>当前价格约 1EOS/120KB</Text>
                        </View>
                        <View style={styles.taboutsource}>
                            <View style={[styles.outsource,{backgroundColor: UColor.secdColor}]}>
                                <View style={[styles.textinptoue,{borderBottomColor: UColor.mainColor}]}  >
                                    <TextInput  ref={(ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip} 
                                        placeholder="上涨0.25%"  underlineColorAndroid="transparent"   keyboardType="numeric"   maxLength = {15}
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
                                <View style={[styles.textinptoue,{borderBottomColor: UColor.mainColor}]} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="下跌2%" underlineColorAndroid="transparent" keyboardType="default" maxLength={20} 
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                                <View style={[styles.separate,{backgroundColor: UColor.secdColor}]}></View>
                                <View style={[styles.basc,{backgroundColor: UColor.secdColor}]}>
                                    <Text style={[styles.basctext,{color: UColor.arrow}]}>注：由于不同的手机设置与地区网络环境的不同，本服务可能存在一定的偏差,不适用于实施挂单!交易建议实时操作为准。</Text>
                                </View>
                                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                                    <View style={[styles.nextstep,{backgroundColor: UColor.tintColor}]}>
                                        <Text style={[styles.nextsteptext,{color: UColor.btnColor}]}>确认</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
                
        </View>
        )
    }
}
const styles = StyleSheet.create({
    passoutsource: {
        alignItems: 'center',
        flexDirection: 'column', 
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        flex: 1,
        flexDirection: 'column',
        padding: ScreenUtil.autowidth(20),
       
    },
    textinptoue: {
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        paddingLeft: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autoheight(10),
    },
    separate: {
        height: 0.5,
    },
    textinpt: {
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(15),
        paddingLeft: ScreenUtil.autowidth(2),
    },
    btnnextstep: {
        height: ScreenUtil.autoheight(85),
        marginTop: ScreenUtil.autoheight(60),
    },
    nextstep: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(20),
        height: ScreenUtil.autoheight(45),
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    basc: {
        padding: ScreenUtil.autowidth(20),
    },
    basctext :{
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(25),
    },


})
export default Warning;