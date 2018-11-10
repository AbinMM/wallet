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
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'
import {AlertModal, AlertModalView} from '../../components/modals/AlertModal'
import {NavigationActions} from 'react-navigation';
import Bar from '../../components/Bar'
import CheckMarkCircle from '../../components/CheckMarkCircle'
import CheckPointCircle from '../../components/CheckPointCircle'
import TextButton from '../../components/TextButton';

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Ram extends BaseComponent {

    static navigationOptions = {
        title: "资源管理",
        header:null,
    };

  // 构造函数
  constructor(props) {
    super(props);
    this.state = {
        index: 0,
        routes: [
            { key: '1', title: "CPU/NET" },
            { key: '2', title:  "内存" }
        ],
        isOwn: true, // 自己
        isOthers: false, //他人
        delegateb: "", //计算抵押赎回
        undelegateb: "", //网络抵押赎回

        isMortgage: true, //抵押
        isRedeem: false, //赎回
        isMemory: true, //内存
        isCalculation: false, //计算
        isNetwork: false, //网络
        isBuy: true, // 购买
        isSell: false, // 出售


        Currentprice: '0',

        buyRamAmount: "", //购买数量，抵押数量
        sellRamBytes: "", //出售数量，赎回数量
        receiver: "", //账户（默认自己）
        init: true,


        show: false, //弹框
        balance: '0', //EOS余额
        password: "", //密码
        errortext: "", //提示语
        //logRefreshing: false, //下拉刷新
        cpu_delegateb: "", //抵押cpu
        net_delegateb: "", //抵押net

        ram_available: '0.00', //内存可用
        ram_bytes: '0.00', //总内存
        ram_Percentage: '0%', //内存已用百分比

        cpu_available: '0.00', //计算可用
        cpu_AlreadyUsed: '0.00', //计算已用
        cpu_Percentage: '0%', //计算已用百分比

        net_available: '0.00', //网络可用
        net_AlreadyUsed: '0.00', //网络已用
        net_Percentage: '0%', //网络已用百分比

        total_ram_used: '0 GB', //全网已用
        total_ram_reserved: '0 GB', //全网可用
        total_ram_used_Percentage: '0%', //全网已用百分比
        total_ram: '0 GB', // 全网内存

        cpu_redeem: '0', //计算可赎回EOS
        net_redeem: '0', //网络可赎回EOS
        and_redeem: '0', //计算+网络赎回中EOS
    };
  }

    componentDidMount() {
        try {
            //取全网的内存数据
            this.props.dispatch({ type: 'vote/getGlobalInfo', payload: {},
                callback: (updateGlibal) => {
                    if(updateGlibal != null || updateGlibal != ''){
                        this.setState({
                            total_ram: updateGlibal.total + 'GB',
                            total_ram_used: updateGlibal.used + 'GB', //使用的总内存字节数
                            total_ram_reserved: updateGlibal.reserved + 'GB', //保留的总内存字节数
                            total_ram_used_Percentage: updateGlibal.used_Percentage, //使用百分比
                        })
                    }
                }
            });

            //取内存价格EOS/kb
            this.props.dispatch({ type: 'vote/getqueryRamPrice',  payload: {},
                callback: (data) => {
                    if(data != null || data != ''){
                        this.setState({Currentprice: data});
                    }
                }
            });

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
                    if(data != null && data.display_data != null){
                        this.setState({
                            ram_available: data.display_data.ram_left ,
                            ram_bytes: data.display_data.ram_bytes,
                            ram_Percentage:  data.display_data.ram_left_percent.replace("%", "")

                        });
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
            delegateb: "",
            undelegateb: "",
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
    chkAmountIsZero(amount,errInfo){
        var tmp;
        try {
             tmp = parseFloat(amount);
          } catch (error) {
              tmp = 0;
          }
        if(tmp <= 0){
            EasyToast.show(errInfo);
            return true;
        }
        return false;
    }

    //内存 购买 出售
    startTrans() {
        if(this.state.isBuy) {
            this.buyram();
        }else{
            this.sellram();
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

    // 购买内存
    buyram = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.buyRamAmount == ""){
            EasyToast.show('请输入购买金额');
            return;
        }
        if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
            this.setState({ buyRamAmount: "" })
            return ;
        }
        if(this.state.isOthers && this.state.receiver == ""){
            EasyToast.show('请输入接收账户');
            return;
        }
        if(this.state.isOwn){
            this.state.receiver = this.props.defaultWallet.account;
        }

        this.dismissKeyboardClick();

        AuthModal.show(this.props.defaultWallet.account, (authInfo) => {
            try {
                if(!authInfo.isOk){ // 密码取消
                    return;
                }
                EasyShowLD.loadingShow();
                if(this.state.isOwn){
                    this.state.receiver = this.props.defaultWallet.account;
                }
                Eos.transaction({
                    actions: [
                        {
                            account: "eosio",
                            name: "buyram",
                            authorization: [{
                            actor: this.props.defaultWallet.account,
                            permission: authInfo.permission,
                            }],
                            data: {
                                payer: this.props.defaultWallet.account,
                                receiver: this.state.receiver,
                                quant: formatEosQua(this.state.buyRamAmount + " EOS"),
                            }
                        },
                    ]
                }, authInfo.pk, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
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
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
                        }
                    }
                });
            } catch (error) {
                EasyToast.show('未知异常');
                EasyShowLD.loadingClose();
            }
        });
    };

    // 出售内存
    sellram = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.buyRamAmount == ""){
            EasyToast.show('请输入出售内存kb数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入出售内存kb数量')){
            this.setState({ buyRamAmount: "" })
            return ;
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
                            name: "sellram",
                            authorization: [{
                            actor: this.props.defaultWallet.account,
                            permission: authInfo.permission,
                            }],
                            data: {
                                account: this.props.defaultWallet.account,
                                bytes: (this.state.buyRamAmount * 1024).toFixed(0),
                            }
                        },
                    ]
                }, authInfo.pk, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
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
                                EasyToast.show("出售失败");
                            }

                        }else{
                            EasyToast.show("出售失败");
                        }
                    }
                });
            } catch (error) {
                EasyToast.show('未知异常');
                EasyShowLD.loadingClose();
            }
        });
    };

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

    //返回上一页面
    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    }

    goToCpuNet = () => {
        const { navigate } = this.props.navigation;

        this.pop(1, false);
        navigate('CpuNet', {});
    }

    //渲染页面
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
                <Header {...this.props} onPressLeft={true} title="内存"  onPressRight={this.goToCpuNet.bind()}
                subName="CPU/NET"
                />

                <View style={[styles.inptoutsource,{flex: 1,}]}>
                    <ScrollView  keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                                <View style={styles.subViewStyle1}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,fontWeight:"bold"}}>可用内存</Text>
                                </View>

                                <View style={styles.barStyle}>
                                    <Bar width={ScreenUtil.autowidth(305)} height={ScreenUtil.autoheight(10)} current={this.state.ram_Percentage} max={100} />
                                </View>

                                <View style={styles.subViewStyle2}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>  {this.state.ram_available} KB / {this.state.ram_bytes} KB</Text>
                                </View>
        

                                <View style={styles.subViewStyle1}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,fontWeight:"bold"}}>全网内存</Text>
                                </View>

                                <View style={styles.barStyle}>
                                    <Bar width={ScreenUtil.autowidth(305)} height={ScreenUtil.autoheight(10)} current={this.state.total_ram_used_Percentage} max={100} />
                                </View>

                                <View style={styles.subViewStyle2}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10), color: UColor.fontColor,}}>   {this.state.total_ram_used} / {this.state.total_ram}</Text>
                                </View>

                               <View style={[styles.tablayout,{backgroundColor: UColor.mainColor}]}>
                                    <TouchableOpacity style={{flexDirection:'row', alignItems: 'center',justifyContent: 'center',}} onPress={() => {this.setState({isBuy: true, isSell:false}); this.init()}}>
                                        <CheckMarkCircle selected={this.state.isBuy} />
                                        <Text style={[styles.tabText, {color: UColor.fontColor, paddingLeft: ScreenUtil.autowidth(5), paddingRight: ScreenUtil.autowidth(24)}]}>购买</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{flexDirection:'row', alignItems: 'center',justifyContent: 'center',}} onPress={() => {this.setState({isBuy: false, isSell:true}); this.init()}}>
                                        <CheckMarkCircle selected={this.state.isSell} />
                                        <Text style={[styles.tabText, {color: UColor.fontColor, paddingLeft: ScreenUtil.autowidth(5)}]}>出售</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65),flexDirection:'column',backgroundColor: UColor.mainColor,}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>{this.state.isBuy ? '购买内存' : '出售内存'}</Text>
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'left', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>价格: {this.state.Currentprice} EOS/KB</Text>
                                    </View>
                                    <View style={[styles.inptout, {borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(1)}]}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go"
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                                        />
                                        {this.state.isSell ?
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可出售：{this.state.ram_available} KB</Text>
                                            :
                                        <Text style={{marginLeft:ScreenUtil.setSpText(5), flex:1, textAlign: 'right', fontSize:ScreenUtil.setSpText(10), color: UColor.arrow, lineHeight: ScreenUtil.autowidth(30)}}>余额：{this.state.balance} EOS</Text>
                                         }
                                    </View>
                                </View>

                                {this.state.isBuy &&
                                <View style={[styles.outsource,{height: this.state.isOwn?ScreenUtil.autowidth(30):ScreenUtil.autowidth(65), flexDirection:'column',backgroundColor: UColor.mainColor}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>接收账户</Text>
                                        <View style={[styles.businestab]}>
                                            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center',marginRight: ScreenUtil.autowidth(6)}}  onPress={() => {this.setState({isOwn:true, isOthers:false}); this.init();}}>
                                                <CheckPointCircle selected={this.state.isOwn} />
                                                <Text style={[{color: UColor.arrow, paddingLeft: ScreenUtil.autowidth(5)}]}>自己</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center',marginLeft: ScreenUtil.autowidth(6)}}  onPress={() => {this.setState({isOwn:false, isOthers:true}); this.init();}}>
                                                <CheckPointCircle selected={this.state.isOthers} />
                                                <Text style={[{color: UColor.arrow, paddingLeft: ScreenUtil.autowidth(5)}]}>他人</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {this.state.isOthers && <View style={[styles.inptout, {borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(1)}]}>
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
                                }
                                
                                {this.state.isSell &&
                                    <View style={{alignItems: 'center',justifyContent: 'center', marginTop: ScreenUtil.autowidth(91), marginHorizontal:ScreenUtil.autowidth(15)}}>
                                        <Text style={{color: UColor.arrow,textAlign: 'right', fontSize: ScreenUtil.setSpText(12), }}>余额：{this.state.balance} EOS</Text>
                                        <View style={{marginTop: ScreenUtil.autowidth(35),justifyContent: 'center', alignItems:'center'}}>
                                            <TextButton text='出售' onPress={this.startTrans.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
                                        </View>
                                    </View>
                                }
   
                                {this.state.isBuy &&
                                <View style={{marginTop: ScreenUtil.autowidth(96),justifyContent: 'center', alignItems:'center'}}>
                                    <TextButton text='购买' onPress={this.startTrans.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
                                </View>
                                }
  
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
        paddingVertical: ScreenUtil.autoheight(9),
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
        marginBottom: ScreenUtil.autowidth(20),
        backgroundColor: UColor.mainColor,
        borderRadius: 6,
    },
    outsource: {
        marginTop: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.autowidth(65),
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
        paddingHorizontal: ScreenUtil.autowidth(10),
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
        paddingVertical: ScreenUtil.autowidth(10),
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
        fontSize: ScreenUtil.setSpText(12),
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
    subViewStyle1:{
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'flex-start', 
        paddingHorizontal: ScreenUtil.autowidth(20), 
        paddingTop: ScreenUtil.autowidth(12),
    },
    subViewStyle2:{
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'flex-end', 
        paddingHorizontal: ScreenUtil.autowidth(20), 
        paddingTop: ScreenUtil.autowidth(4),
    },
    barStyle:{
        flex: 1,
        height: ScreenUtil.autowidth(10), 
        paddingHorizontal: ScreenUtil.autowidth(15), 
        paddingTop: ScreenUtil.autowidth(12),
        paddingBottom: ScreenUtil.autowidth(10),
        // backgroundColor: UColor.riceWhite,
    },
})
export default Ram;
