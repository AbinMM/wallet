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

class Detailsofmoney extends BaseComponent {

    static navigationOptions = {
        headerTitle: 'EOS(柚子)',
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

    

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="EOS(柚子)" />   
            <ScrollView>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.fontColor}]}>类型</Text>
                    <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(8),color:UColor.fontColor}]}>分布式底层平台</Text>
                    <View style={{flexDirection: 'row',alignItems: 'flex-start',justifyContent: 'center',}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>（推荐指数：</Text>
                        <Image source={UImage.fivestars} style={styles.starsimg} />
                        <Image source={UImage.fivestars} style={styles.starsimg} />
                        <Image source={UImage.fivestars} style={styles.starsimg} />
                        <Image source={UImage.fivestars} style={styles.starsimg} />
                        <Image source={UImage.fivestars_h} style={styles.starsimg} />
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>）</Text>
                    </View>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>同比该行业产品</Text>
                    <View style={{flex: 1, flexDirection: 'row',justifyContent: 'center',}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>项目创新</Text>
                        <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(5),color:UColor.tintColor}]}>99% 高</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row',justifyContent: 'center',}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>投资价值</Text>
                        <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(5),color:UColor.tintColor}]}>99% 高</Text>
                    </View>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>市值</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]}>￥36,168,734,186,74(361亿)</Text>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>总量</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]}>1,006,245,120(10亿)EOS</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>官方网站</Text>
                    <Text style={[styles.recordtext,{color:UColor.tintColor}]}>https://eos.io/</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>募资成本</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]}>1 ETH=306 EOS,约¥7.00</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>募资时间</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]}>2017.6.26-2018.6.2</Text>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>白皮书</Text>
                    <Text style={[styles.recordtext,{color:UColor.tintColor}]}>查看</Text>
                </View>
                <View style={[styles.synopsisout,{backgroundColor: UColor.mainColor}]}>
                    <Text style={[styles.synopsis,{color:UColor.fontColor}]}>简介</Text>
                    <Text style={[styles.synopsiscenter,{color:UColor.arrow}]}>EOS(Enterprise Operation System)是由 Block.one 公司主导开发的一种全新的基于区块链智能合约平台，
                    旨在为高性能分布式应用提供底层区块链平台服务。EOS 项目的目标是实现一个类似操作系统的支撑分布式应用程序的区块链架构。该架构可以提供账户，身份认证，数据库，
                    异步通信以及可在数以万计的 CPU/GPU 集群上进行程序调度和并行运算。EOS 最终可以支持每秒执行数百万个交易，同时普通用户执行智能合约无需支付使用费用。
                    EOS 代币目前是 EOS 区块链基础设施发布的基于以太坊的代币，主要有三大应用场景：带宽和日志存储（硬盘），计算和计算储备（CPU），状态存储（RAM）。
                    EOS主网上线后会将 ERC-20 代币 EOS 转换为其主链上的代币。</Text>
                </View>
            </ScrollView>
        </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource:{
        marginBottom: 1,
        flexDirection: 'row',
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    separateout: {
        flexDirection: 'row',
        marginBottom: ScreenUtil.autoheight(6),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    nametext: {
        textAlign: "left", 
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(32), 
    },
    recordtext: {
        flex: 1, 
        textAlign: "right", 
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(32),  
    },
    starsimg: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autowidth(2),
        marginVertical: ScreenUtil.autoheight(6),
    },
    synopsisout: {
        flex: 1, 
        flexDirection: 'column',
        marginBottom: ScreenUtil.autoheight(6),
        paddingVertical:ScreenUtil.autowidth(10), 
        paddingHorizontal:ScreenUtil.autowidth(15),
    },
    synopsis: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
    },
    synopsiscenter: {
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(20),
    },
})
export default Detailsofmoney;