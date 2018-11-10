import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,StyleSheet,Image,ScrollView,View,Text, TextInput,Platform,Dimensions,ImageBackground,TouchableOpacity,KeyboardAvoidingView,BVLinearGradient} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Header from '../../components/Header'
import Button from  '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {formatEosQua} from '../../utils/FormatUtil';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient';
import BaseComponent from "../../components/BaseComponent";
import CountDownReact from '../../components/CountDownReact'
import TextButton from '../../components/TextButton';
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'
import {AlertModal, AlertModalView} from '../../components/modals/AlertModal'
import {NavigationActions} from 'react-navigation';
import Bar from '../../components/Bar'
import CheckMarkCircle from '../../components/CheckMarkCircle'
import CheckPointCircle from '../../components/CheckPointCircle'

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class CpuNet extends BaseComponent {

    static navigationOptions = {
        title: "CPU+NET",
        header:null,
    };

    //返回上一页面
    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    }

    gotoRam = () =>{
        const { navigate } = this.props.navigation;
        // navigate('DelegatebwRecord', {account_name: this.props.defaultWallet.account});
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
            EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
              this.createWallet();
              EasyShowLD.dialogClose()
            }, () => { EasyShowLD.dialogClose() });
            return;
          }

          this.pop(1, false);
          navigate('Ram', {});    
    }

    recordDelegatebw = () =>{
        const { navigate } = this.props.navigation;
        navigate('DelegatebwRecord', {account_name: this.props.defaultWallet.account});
    }

  // 构造函数
  constructor(props) {
    super(props);
    this.state = {
        index: 0,
        routes: [
            { key: '1', title: "CPU/NET" },
            { key: '2', title:  "内存" }
        ],

        cpuVal: "", //计算抵押赎回
        netVal: "", //网络抵押赎回
        isOwn: true, // 自己
        isOthers: false, //他人

        isMortgage: true, //抵押
        isRedeem: false, //赎回
        isCalculation: false, //计算
        isNetwork: false, //网络

        isLease: true, // 租赁
        isTransfer: false, // 过户
        LeaseTransfer: 0,

        cpu_available: '0.00', //计算可用
        cpu_AlreadyUsed: '0.00', //计算已用
        cpu_Percentage: '0%', //计算已用百分比
        cpu_max: '0.00', //总量

        net_available: '0.00', //网络可用
        net_AlreadyUsed: '0.00', //网络已用
        net_Percentage: '0%', //网络已用百分比
        net_max: '0.00', //总量

        cpu_redeem: '0', //计算可赎回EOS
        net_redeem: '0', //网络可赎回EOS
        and_redeem: '0', //计算+网络赎回中EOS

        cpu_weight: "0.0000", // cpu总共抵押的EOS
        net_weight: '0.0000',  // net总共抵押的EOS

        cpuPrice: '0.0000', // cpu单价
        netPrice: '0.0000', // net单价

        Currentprice: '0',
        receiver: "", //账户（默认自己）
        init: true,


        show: false, //弹框
        balance: '0', //EOS余额
        password: "", //密码
        errortext: "", //提示语
        //logRefreshing: false, //下拉刷新

        undelegateTimeCountDown: "00天00分00秒"
    };
  }

    componentDidMount() {
        try {

            //获取账户信息
            this.props.dispatch({ type: 'wallet/getDefaultWallet',
                callback: (data) => {
                    if(data != null || data != ''){

                        this.getAccountInfo();
                        this.setState({receiver:  this.props.defaultWallet.account});
                    }
                }
            });

            //选择联系人返回的参数
            DeviceEventEmitter.addListener('transfer_scan_result', (data) => {
                if(data.toaccount !=  this.props.defaultWallet.account){
                    this.setState({
                        receiver:data.toaccount,
                        isOthers: true,
                    });
                }else{
                    this.setState({
                        receiver:data.toaccount,
                        isOthers: false,
                    });
                }
            });

        } catch (error) {
            EasyShowLD.loadingClose();
        }
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    getAccountInfo(){
        try {
            EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page: 1, username: this.props.defaultWallet.account},
                callback: (data) => {
                    
                    if(data != null){
                        if(data.display_data){
                            this.setState({
                                cpu_available: data.display_data.cpu_limit_available,
                                cpu_AlreadyUsed: (Math.floor((data.display_data.cpu_limit_max - data.display_data.cpu_limit_available)*100)/100).toFixed(2),
                                // cpu_Percentage: (100-data.display_data.cpu_limit_available_percent.replace("%", "")) + '%',
                                cpu_Percentage: data.display_data.cpu_limit_available_percent.replace("%", ""),
                                cpu_max: data.display_data.cpu_limit_max,

                                net_available: data.display_data.net_limit_available,
                                net_AlreadyUsed:  (Math.floor((data.display_data.net_limit_max - data.display_data.net_limit_available)*100)/100).toFixed(2),
                                // net_Percentage: (100-data.display_data.net_limit_available_percent.replace("%", "")) + '%',
                                net_Percentage: data.display_data.net_limit_available_percent.replace("%", ""),
                                net_max: data.display_data.net_limit_max, //总量
                            });
                        }

                        if(data.self_delegated_bandwidth){
                            this.setState({
                                cpu_redeem: parseFloat(data.self_delegated_bandwidth.cpu_weight.replace("EOS", "")).toFixed(4),
                                net_redeem: parseFloat(data.self_delegated_bandwidth.net_weight.replace("EOS", "")).toFixed(4),
                            });
                        }

                        if(data.refund_request){
                            this.setState({
                                and_redeem: (parseFloat(this.props.Resources.refund_request.cpu_amount.replace(" EOS", "")) + parseFloat(this.props.Resources.refund_request.net_amount.replace(" EOS", ""))).toFixed(4),
                                undelegateTimeCountDown: this.transferTimeZone(data.refund_request.request_time.replace("T", " "))
                            });
                        }

                        if(data.total_resources){
                            this.setState({cpu_weight: data.total_resources.cpu_weight, net_weight: data.total_resources.net_weight});
                            this.setState({cpuPrice: (Math.floor((data.total_resources.cpu_weight.replace(" EOS", "") / data.display_data.cpu_limit_max) * 100) / 100).toPrecision(4)});
                            this.setState({netPrice: (Math.floor((data.total_resources.net_weight.replace(" EOS", "") / data.display_data.net_limit_max) * 100) / 100).toPrecision(4)});
                        }
                    }
                    EasyShowLD.loadingClose();
                }
            })

            //EOS余额
            this.props.dispatch({ type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account , symbol: 'EOS' },
                callback: (data) => {
                    this.setState({
                        balance: data && data.data?data.data.replace('EOS', "") :'0',
                    });
                }
            });
        } catch (error) {
            EasyShowLD.loadingClose();
        }

    }

    //初始化输入框
    init() {
        this.setState({
            buyRamAmount: "",
            sellRamBytes: "",
            receiver: "",
            cpuVal: "",
            netVal: "",
            LeaseTransfer: 0,
        })
    }

    //校验输入的账户
    chkAccount(obj) {
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }
            if(j >= charmap.length){
                //非法字符
                obj = obj.replace(tmp, "");
                EasyToast.show('请输入正确的账号');
            }
        }
        this.setState({ receiver:obj });
        if (this.state.index == 0 && obj == this.props.defaultWallet.account) {
            this.setState({ isOthers: false })
        }else{
            this.setState({ isOthers: true })
        }
        return obj;
    }

    //校验输入的EOS数量
    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = 9999999999.9999;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        try {
        value = parseFloat(obj);
        } catch (error) {
        value = 0.0000;
        }
        if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
        }
        return obj;
    }

    //转换时间
    transferTimeZone(date){
        // //转换时间
        let timezone = moment(date).add(72,'hours').format('YYYY-MM-DDTHH:mm:ss');
        return  timezone;
    }

    //时间百分比防出错
    falseAlarm(timePercentage){
        let Percentage = timePercentage.replace("%", "")
        let newtimePercentage;
        if(Percentage <= 0){
            newtimePercentage = '0%'
        }else if(Percentage >= 100){
            newtimePercentage = '100%'
        }else{
            newtimePercentage = timePercentage;
        }
        return newtimePercentage
    }

    //验证输入EOS数量
    chkAmount(amount,errInfo){
        var tmp;
        try {
             tmp = parseFloat(amount);
          } catch (error) {
              tmp = 0;
          }
        if(tmp < 0){
            EasyToast.show(errInfo);
            return true;
        }
        return false;
    }

    //计算 网络 抵押 赎回
    startTrans() {
        if(this.state.isMortgage) {
            this.delegateb();
        }else{
            this.undelegateb();
        }
    }

    // 免费抵押提示
    freeDelegatePrompt(){
        this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username: this.props.defaultWallet.account},callback:(resp)=>{
            if(resp.code == 608){
                var title = '资源受限';
                var content = '该账号资源(NET/CPU)不足！EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。';
                AlertModal.show(title, content, '申请免费抵押', '放弃', (isOk)=>{
                    if(isOk){
                        const { navigate } = this.props.navigation;
                        navigate('FreeMortgage', {});
                    }
                });
            }
        }});
    }

    // 计算网络抵押
    delegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.cpuVal == "" && this.state.netVal == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        if(this.chkAmount(this.state.cpuVal,'请输入抵押的EOS数量')){
            this.setState({ cpuVal: "" })
            return ;
        }
        if(this.chkAmount(this.state.netVal,'请输入抵押的EOS数量')){
            this.setState({ netVal: "" })
            return ;
        }

        if(this.state.isOthers && this.state.receiver == ""){
            EasyToast.show('请输入接收账户');
            return;
        }

        if(this.state.isOwn){
            this.state.receiver=this.props.defaultWallet.account;
        }

        this.dismissKeyboardClick();

        AuthModal.show(this.props.defaultWallet.account, (authInfo) => {
            try {
                if(!authInfo.isOk){ // 密码取消
                    return;
                }
                EasyShowLD.loadingShow();
                this.state.LeaseTransfer = 0;
                if(this.state.isOthers && this.state.isTransfer){
                    this.state.LeaseTransfer = 1;
                }
                Eos.transaction({
                    actions: [
                        {
                            account: "eosio",
                            name: "delegatebw",
                            authorization: [{
                            actor: this.props.defaultWallet.account,
                            permission: authInfo.permission,
                            }],
                            data: {
                                from: this.props.defaultWallet.account,
                                receiver: this.state.receiver,
                                stake_net_quantity: formatEosQua(this.state.netVal == "" ? "0 EOS" : this.state.netVal + " EOS"),
                                stake_cpu_quantity: formatEosQua(this.state.cpuVal == "" ? "0 EOS" : this.state.cpuVal + " EOS"),
                                transfer: this.state.LeaseTransfer,
                            }
                        },
                    ]
                }, authInfo.pk, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("抵押成功");
                    }else{
                        if(r.data){
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                    this.freeDelegatePrompt();
                                }
                            }

                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("抵押失败");
                            }

                        }else{
                            EasyToast.show("抵押失败");
                        }
                    }
                });
            } catch (error) {
                EasyToast.show('未知异常');
                EasyShowLD.loadingClose();
            }

        });
    };

    //计算网络赎回
    undelegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.cpuVal == "" && this.state.netVal == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }
        if(this.chkAmount(this.state.cpuVal,'请输入赎回的EOS数量')){
            this.setState({ cpuVal: "" })
            return ;
        }
        if(this.chkAmount(this.state.netVal,'请输入赎回的EOS数量')){
            this.setState({ netVal: "" })
            return ;
        }
        if(this.state.isOthers && this.state.receiver == ""){
            EasyToast.show('请输入赎回账户');
            return;
        }

        if(this.state.isOwn){
            this.state.receiver=this.props.defaultWallet.account;
        }

        this.dismissKeyboardClick();

        AuthModal.show(this.props.defaultWallet.account, (authInfo) => {
            try {
                if(!authInfo.isOk){ // 密码取消
                    return;
                }

                EasyShowLD.loadingShow();
                Eos.transaction({
                    actions: [
                        {
                            account: "eosio",
                            name: "undelegatebw",
                            authorization: [{
                            actor: this.props.defaultWallet.account,
                            permission: authInfo.permission,
                            }],
                            data: {
                                from: this.props.defaultWallet.account,
                                receiver: this.state.receiver,
                                unstake_net_quantity: formatEosQua(this.state.netVal == "" ? "0 EOS" : this.state.netVal + " EOS"),
                                unstake_cpu_quantity: formatEosQua(this.state.cpuVal == "" ? "0 EOS" : this.state.cpuVal + " EOS"),
                            }
                        },
                    ]
                }, authInfo.pk, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("赎回成功");
                    }else{
                        if(r.data){
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001) {
                                    this.freeDelegatePrompt();
                                }
                            }
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("赎回失败");
                            }
                        }else{
                            EasyToast.show("赎回失败");
                        }
                    }
                });
            } catch (error) {
                EasyToast.show('未知异常');
                EasyShowLD.loadingClose();
            }
        });
    };

    //赎回遇到问题
    undelegatedRefund = () => {
        const { navigate } = this.props.navigation;
        navigate('undelegatedRefund', {});
    }

    //收回键盘
    dismissKeyboardClick() {
        dismissKeyboard();
    }

    //扫二维码
    scan() {
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
    }

    //通讯录
    openAddressBook() {
        const { navigate } = this.props.navigation;
        navigate('addressManage', {isTurnOut: true, coinType: this.props.defaultWallet.account});
    }

    //渲染页面
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
                <Header {...this.props} onPressLeft={true} title="CPU+NET"  onPressRight={this.gotoRam.bind()}
                subName="内存"
                />

                <View style={[styles.inptoutsource,{flex: 1,}]}>
                    <ScrollView  keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                                <View style={styles.subViewStyle1}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,fontWeight:"bold"}}>CPU</Text>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>  抵押: {this.state.cpu_weight}</Text>
                                </View>

                                <View style={styles.barStyle}>
                                    <Bar width={ScreenUtil.autowidth(305)} height={ScreenUtil.autoheight(10)} current={this.state.cpu_Percentage} max={100} />
                                </View>

                                <View style={styles.subViewStyle2}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>  可用: {this.state.cpu_available} ms / 总量: {this.state.cpu_max} ms</Text>
                                </View>
        

                                <View style={styles.subViewStyle1}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,fontWeight:"bold"}}>NET</Text>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>  抵押: {this.state.net_weight}</Text>
                                </View>

                                <View style={styles.barStyle}>
                                    <Bar width={ScreenUtil.autowidth(305)} height={ScreenUtil.autoheight(10)} current={this.state.net_Percentage} max={100} />
                                </View>

                                <View style={styles.subViewStyle2}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>  可用: {this.state.net_available} KB / 总量: {this.state.net_max} KB</Text>
                                </View>

                                <View style={{paddingHorizontal: ScreenUtil.autowidth(20),paddingTop: ScreenUtil.autowidth(14),flexDirection:'row',}}>
                                    <Text style={{flex: 1, textAlign: 'left', fontSize: ScreenUtil.setSpText(16),fontWeight:"bold", color: UColor.fontColor,}}>赎回中</Text>
                               </View>
                               <View style={{paddingHorizontal: ScreenUtil.autowidth(20),paddingTop: ScreenUtil.autowidth(6),flexDirection:'row',}}>
                                    <Text style={{flex: 1, textAlign: 'left', fontSize: ScreenUtil.setSpText(10), color: UColor.tradedetail_prompt,}}>{this.state.and_redeem} EOS</Text>
                                    <CountDownReact
                                    date= {this.state.undelegateTimeCountDown}
                                    hours='小时'
                                    mins='分'
                                    segs='秒'
                                    hoursStyle={[styles.ratiotext,{color: UColor.arrow}]}
                                    minsStyle={[styles.ratiotext,{color: UColor.arrow}]}
                                    secsStyle={[styles.ratiotext,{color: UColor.arrow}]}
                                    firstColonStyle={[styles.ratiotext,{color: UColor.arrow}]}
                                    secondColonStyle={[styles.ratiotext,{color: UColor.arrow}]}
                                    />
                               </View>

                               <View style={[styles.tablayout,{backgroundColor: UColor.mainColor}]}>
                                    {/* {this.ownOthersButton([styles.memorytab,{borderColor: UColor.tintColor}], this.state.isBuy, 'isBuy', '购买')}
                                    {this.ownOthersButton([styles.networktab,{borderColor: UColor.tintColor}], this.state.isSell, 'isSell', '出售')} */}
                                    <View style={{width:ScreenUtil.autowidth(48),}}/>
                                    <View style={{flex:1,flexDirection:'row', alignItems: 'center',justifyContent: 'center',}}>
                                        <CheckMarkCircle selected={this.state.isMortgage} onPress={() => {this.setState({isMortgage: true, isRedeem:false}); this.init()}}/>
                                        <Text style={[styles.tabText, {color: UColor.fontColor, paddingLeft: ScreenUtil.autowidth(5), paddingRight: ScreenUtil.autowidth(24)}]}>抵押</Text>
                                        <CheckMarkCircle selected={this.state.isRedeem} onPress={() => {this.setState({isMortgage: false, isRedeem:true}); this.init()}}/>
                                        <Text style={[styles.tabText, {color: UColor.fontColor, paddingLeft: ScreenUtil.autowidth(5)}]}>赎回</Text>
                                    </View>            
                                    <TextButton onPress={this.recordDelegatebw.bind()} text='租借列表' textColor='#3B80F4' fontSize={ScreenUtil.setSpText(12)} style={{width:ScreenUtil.autowidth(48), height: ScreenUtil.autowidth(17)}}/>                             
                                </View>
                                
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65),flexDirection:'column',backgroundColor: UColor.mainColor,}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>CPU</Text>
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'left', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>价格: {this.state.cpuPrice} EOS/ms</Text>
                                    </View>
                                    <View style={[styles.inptout, {borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.cpuVal} returnKeyType="go"
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(cpuVal) => this.setState({ cpuVal: this.chkPrice(cpuVal)})}
                                        />
                                        {this.state.isRedeem ?
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可赎回：{this.state.cpu_redeem} EOS</Text>
                                            :
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.arrow, lineHeight: ScreenUtil.autowidth(30)}}>余额：{this.state.balance} EOS</Text>
                                         }
                                    </View>
                                </View>
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65),flexDirection:'column',backgroundColor: UColor.mainColor,}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>NET</Text>
                                        {/* {this.state.isRedeem ?
                                            <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'left', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可赎回：{this.state.net_redeem} EOS</Text>
                                            : */}
                                            <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'left', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>价格:{this.state.netPrice} EOS/kb</Text>
                                        {/* } */}
                                    </View>
                                    <View style={[styles.inptout, {borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.netVal} returnKeyType="go"
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(netVal) => this.setState({ netVal: this.chkPrice(netVal)})}
                                        />
                                        {this.state.isRedeem ?
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可赎回：{this.state.net_redeem} EOS</Text>
                                            :
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.arrow, lineHeight: ScreenUtil.autowidth(30)}}>余额：{this.state.balance} EOS</Text>
                                        }
                                    </View>
                                </View>
                                <View style={[styles.outsource,{height: this.state.isOwn?ScreenUtil.autowidth(30):ScreenUtil.autowidth(65), flexDirection:'column',backgroundColor: UColor.mainColor}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>{this.state.isMortgage ?　'接收账户' : '赎回账户'}</Text>
                                        <View style={[styles.businestab]}>
                                            <CheckPointCircle selected={this.state.isOwn} onPress={() => {this.setState({isOwn:true, isOthers:false}); this.init();}}/>
                                            <Text style={[{color: UColor.arrow, paddingHorizontal: ScreenUtil.autowidth(12)}]}>自己</Text>
                                            <CheckPointCircle selected={this.state.isOthers} onPress={() => {this.setState({isOwn:false, isOthers:true}); this.init();}}/>
                                            <Text style={[{color: UColor.arrow, paddingHorizontal: ScreenUtil.autowidth(12)}]}>他人</Text>
                                     </View>
                                    </View>
                                    {this.state.isOthers && <View style={[styles.inptout, {borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]}>
                                        <Button onPress={() => this.openAddressBook()}>
                                            <View style={styles.botnout}>
                                                <Image source={UImage.al} style={styles.botnimg} />
                                            </View>
                                        </Button>
                                        <TextInput ref={(ref) => this._account = ref} value={this.state.receiver} returnKeyType="go"  keyboardType="default"
                                            selectionColor={UColor.tintColor} style={[styles.inpt,{paddingHorizontal: ScreenUtil.autowidth(10), color: UColor.arrow}]} placeholderTextColor={UColor.inputtip}
                                            placeholder='' underlineColorAndroid="transparent" maxLength={12}
                                            onChangeText={(receiver) => this.chkAccount(receiver)}
                                        />
                                    </View>
                                    }

                                </View>

                                <View style={styles.basc}>
                                    {(this.state.isOthers &&  this.state.isMortgage) &&
                                    <View style={[styles.businestab,]}>
                                        <TouchableOpacity style={[styles.owntab, this.state.isLease ? {backgroundColor:'#6DA0F8'} : {backgroundColor: '#FFFFFF'}]}  onPress={ () => {this.setState({isLease: true, isTransfer: false});}}>
                                            <Text style={[{fontSize: ScreenUtil.setSpText(10) }, this.state.isLease ? {color: '#FFFFFF'} : {color: '#6DA0F8'}]}>租借</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.otherstab, this.state.isTransfer ? {backgroundColor:'#6DA0F8'} : {backgroundColor: '#FFFFFF'}]}  onPress={ () => {this.setState({isLease: false, isTransfer: true})}}>
                                            <Text style={[{fontSize: ScreenUtil.setSpText(10) }, this.state.isTransfer ? {color: '#FFFFFF'} : {color: '#6DA0F8'}]}>过户</Text>
                                        </TouchableOpacity>
                                   </View>}
                                </View>
                                
                                <View style={{alignItems: 'center',justifyContent: 'center', marginHorizontal:ScreenUtil.autowidth(15)}}>
                                    <Text style={{color: '#3B80F4',textAlign: 'right', fontSize: ScreenUtil.setSpText(), }} onPress={this.undelegatedRefund.bind()} >赎回遇到问题？</Text>
                               </View>
                                <View style={{flex: 1, justifyContent: 'center', alignItems:'center', marginHorizontal: ScreenUtil.autowidth(15), marginTop: ScreenUtil.autowidth(15),}}>
                                    <TextButton text="提交" onPress={this.startTrans.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <AlertModalView />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    inptpass: {
        textAlign: "center",
        borderBottomWidth: 1,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
        width: ScreenWidth-ScreenUtil.autowidth(100),
    },
    inptpasstext: {
        flex: 1,
        textAlign: "center",
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autoheight(5),
        lineHeight: ScreenUtil.autoheight(25),
    },

    tabbutton: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    tablayout: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(18),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    memorytab: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(22),
        paddingVertical: ScreenUtil.autoheight(5),
    },
    networktab: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(22),
        paddingVertical: ScreenUtil.autoheight(5),
    },
    tabText: {
        fontSize: ScreenUtil.setSpText(18),
    },

    container: {
        flex: 1,
        flexDirection:'column',
    },
    wterout: {
        flexDirection: 'row',
        paddingVertical: ScreenUtil.autoheight(10),
    },
    OwnOthers: {
        flexDirection: 'row',
        width: (ScreenWidth - 20) / 2,
        paddingHorizontal: ScreenUtil.autowidth(18),
    },
    LeaseTransfer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inptoutsource: {
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(15),
        marginTop: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autowidth(23),
        backgroundColor: UColor.mainColor,
    },

    subViewStyle1:{
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'flex-start', 
        paddingHorizontal: ScreenUtil.autowidth(20), 
        paddingTop: ScreenUtil.autowidth(12),
    },

    barStyle:{
        flex: 1,
        height: ScreenUtil.autowidth(10), 
        paddingHorizontal: ScreenUtil.autowidth(15), 
        paddingTop: ScreenUtil.autowidth(12),
        paddingBottom: ScreenUtil.autowidth(10),
        // backgroundColor: UColor.riceWhite,
    },

    subViewStyle2:{
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'flex-end', 
        paddingHorizontal: ScreenUtil.autowidth(20), 
        paddingTop: ScreenUtil.autowidth(4),
    },
    
    rectangleStyle: {
        // flex: 1,
        // flexDirection:'row',
        borderWidth: 1,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        // marginHorizontal: ScreenUtil.autowidth(2),
      },
      rectangleFontStyle: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(10),
        // paddingVertical: ScreenUtil.autoheight(1),
        // paddingHorizontal: ScreenUtil.autowidth(8),
      },


    outsource: {
        marginTop: 1,
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    inptout: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.autoheight(35),
    },
    inpt: {
        flex: 1,
        paddingVertical: 0,
        fontSize: ScreenUtil.setSpText(16),
    },
    inptTitleout: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.autoheight(30),
    },
    inptTitle: {     
        fontSize: ScreenUtil.setSpText(16),
    },
    businestab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    owntab: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        width: ScreenUtil.autowidth(35),
        height: ScreenUtil.autoheight(18),
    },
    otherstab: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        width: ScreenUtil.autowidth(35),
        height: ScreenUtil.autoheight(18),
    },

    inptTitlered: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(35),
    },
    botnout: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(38),
        // paddingHorizontal: ScreenUtil.autowidth(10),
    },
    botnimg:{
        width: ScreenUtil.autowidth(17),
        height: ScreenUtil.autowidth(17),
    },
    botn: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(50),
    },
    botText: {
        fontSize: ScreenUtil.setSpText(18),
    },

    basc: {
        flexDirection: 'row',
        paddingHorizontal: ScreenUtil.autowidth(18),
        paddingTop: ScreenUtil.autowidth(10),
        paddingBottom: ScreenUtil.autowidth(5),
    },
    // basctextright :{
    //     textAlign: 'right',
    //     borderBottomWidth: 1,
    //     flexDirection: 'row',
    //     fontSize: ScreenUtil.setSpText(14),
    //     lineHeight: ScreenUtil.autoheight(20),
    // },
    basctext :{
        flex: 1,
        textAlign: 'left',
        fontSize:ScreenUtil.setSpText(12),
    },

    tetleout: {
        paddingBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    tetletext: {
        fontSize: ScreenUtil.setSpText(15),
        paddingVertical: ScreenUtil.autoheight(5),
    },
    linebgout: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: ScreenWidth - 30,
        justifyContent: 'space-around',
        height: (ScreenWidth - 30) * 0.307,
    },
    stripbgout: {
        height: (ScreenWidth - 30) * 0.307 - 5,
        width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,
        marginBottom: Platform.OS == 'ios' ? 0.3 : 0.2,
    },
    ratiotext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(10),
    },
    recordtext: {
        fontSize: ScreenUtil.setSpText(12),
    },
    record: {
        flexDirection: 'row',
    },
    recordout: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: "center",
    },
    tab: {
        flex: 1,
    },
    passoutsource2: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    Explaintext2: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
    },
})
export default CpuNet;
