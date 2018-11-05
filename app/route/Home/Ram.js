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
        ram_AlreadyUsed: '0.00', //内存已用
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
                            total_ram_used: updateGlibal.used + 'GB', //使用的总内存字节数 
                            total_ram_reserved: updateGlibal.reserved + 'GB', //保留的总内存字节数
                            total_ram_used_Percentage: updateGlibal.used_Percentage + '%', //使用百分比
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
                            ram_AlreadyUsed: data.display_data.ram_usage,
                            ram_Percentage:  data.display_data.ram_usage_percent, //ram_left_percent

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

    // 返回购买,出售
    ownOthersButton(style, selectedSate, stateType, buttonTitle) {    
        let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor,}]}  onPress={ () => {this._updateSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.btnColor} : {color: UColor.arrow}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    }  

    // 更新"购买,出售,租赁,过户"按钮的状态  
    _updateSelectedState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
        let newState = {...this.state};  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        }  
        this.Initialization();
    }  

    // 返回自己,他人
    businesButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isOwn', 'isOthers'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor:'#6DA0F8'} : {backgroundColor: '#FFFFFF'}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[{fontSize: ScreenUtil.setSpText(8) }, selectedSate ? {color: '#FFFFFF'} : {color: '#6DA0F8'}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    } 

    // 更新"自己,他人"按钮的状态  
    _updateBtnState(currentPressed, array) { 
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
        let newState = {...this.state};  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        } 
        this.Initialization();
    }  
    
    //初始化输入框
    Initialization() {
        this.setState({
            buyRamAmount: "",
            sellRamBytes: "",
            receiver: this.props.defaultWallet.account,
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
    sellRedeem() {
        if(this.state.isBuy) {
            this.buyram();
        }else{
            this.sellram();
        }
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
        if(this.state.receiver == ""){
            EasyToast.show('请输入接收账户');
            return;
        }
        this. dismissKeyboardClick();

        AuthModal.show(this.props.defaultWallet.account, (authInfo) => {
            try {
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
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username: this.props.defaultWallet.account},callback:(resp)=>{ 
                                    if(resp.code == 608){ 
                                        //弹出提示框,可申请免费抵押功能
                                        const view =
                                        <View style={styles.passoutsource2}>
                                            <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                            <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                        </View>
                                        EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                            const { navigate } = this.props.navigation;
                                            navigate('FreeMortgage', {});
                                        }, () => { EasyShowLD.dialogClose() });
                                    }
                                }});
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
        this. dismissKeyboardClick();

        AuthModal.show(this.props.defaultWallet.account, (authInfo) => {
            try {
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
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username: this.props.defaultWallet.account},
                                        callback:(resp)=>{ 
                                            if(resp.code == 608){ 
                                                //弹出提示框,可申请免费抵押功能
                                                const view =
                                                <View style={styles.passoutsource2}>
                                                    <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                    <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                                </View>
                                                EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                    const { navigate } = this.props.navigation;
                                                    navigate('FreeMortgage', {});
                                                }, () => { EasyShowLD.dialogClose() });
                                            }
                                        }
                                    });
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

    //渲染页面
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
                <Header {...this.props} onPressLeft={true} title="内存" 
                avatar={UImage.delegatebw_record} imgWidth={ScreenUtil.autowidth(20)} imgHeight={ScreenUtil.autowidth(20)} /> 

                <View style={[styles.inptoutsource,{flex: 1,}]}>
                    <ScrollView  keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                                <View style={{height: ScreenUtil.autowidth(70), flexDirection:'row', backgroundColor: UColor.mainColor, marginBottom: ScreenUtil.autowidth(1), }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: ScreenUtil.autowidth(15), }}>
                                        <Text style={{fontSize: ScreenUtil.setSpText(18), color: UColor.fontColor,}}>内存资源</Text>
                                    </View>
                                    <View style={{flex: 1,padding: ScreenUtil.autowidth(15), justifyContent: 'space-around',}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.fontColor}}>已用{this.state.ram_AlreadyUsed}</Text>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.arrow}}>可用{this.state.ram_available}</Text>
                                            </View>
                                        </View>
                                        <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10,}}>
                                            <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.ram_Percentage}/>
                                        </View>
                                    </View>
                                </View>
                                <View style={{height: ScreenUtil.autowidth(70), flexDirection:'row', backgroundColor: UColor.mainColor, marginBottom: ScreenUtil.autowidth(10), }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: ScreenUtil.autowidth(15), }}>
                                        <Text style={{fontSize: ScreenUtil.setSpText(18), color: UColor.fontColor,}}>全网内存</Text>
                                    </View>
                                    <View style={{flex: 1,padding: ScreenUtil.autowidth(15), justifyContent: 'space-around',}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.fontColor}}>已用{this.state.total_ram_used}</Text>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.arrow}}>可用{this.state.total_ram_reserved}</Text>
                                            </View>
                                        </View>
                                        <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10,}}>
                                            <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.total_ram_used_Percentage}/>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.tablayout,{backgroundColor: UColor.mainColor}]}>  
                                    {this.ownOthersButton([styles.memorytab,{borderColor: UColor.tintColor}], this.state.isBuy, 'isBuy', '购买')}  
                                    {this.ownOthersButton([styles.networktab,{borderColor: UColor.tintColor}], this.state.isSell, 'isSell', '出售')}  
                                </View> 
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65), flexDirection:'column',backgroundColor: UColor.mainColor, }]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>{this.state.isBuy ? "购买" : "出售" }内存</Text>
                                        <Text style={{fontSize:ScreenUtil.setSpText(12), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>当前价格：{this.state.Currentprice} EOS/kb</Text>
                                    </View>
                                    <View style={styles.inptout}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip} 
                                        placeholder={this.state.isBuy ? "请输入EOS数量" : "请输入内存额度kb"} underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})} 
                                        />
                                    </View>
                                </View>
                                {this.state.isBuy&&
                                <View style={[styles.outsource,{height: this.state.isOwn?ScreenUtil.autowidth(30):ScreenUtil.autowidth(65), flexDirection:'column',backgroundColor: UColor.mainColor}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>接收账户</Text>
                                        <View style={[styles.businestab]}>  
                                            {this.businesButton([styles.owntab,{borderColor: '#6DA0F8'}], this.state.isOwn, 'isOwn', '自己')}  
                                            {this.businesButton([styles.otherstab,{borderColor: '#6DA0F8'}], this.state.isOthers, 'isOthers', '他人')}  
                                        </View>
                                    </View>
                                    {this.state.isOthers && <View style={styles.inptout}>
                                        <TextInput ref={(ref) => this._account = ref} value={this.state.receiver} returnKeyType="go" 
                                            selectionColor={UColor.tintColor}  placeholderTextColor={UColor.inputtip} maxLength={12}
                                            placeholder={this.state.receiver} underlineColorAndroid="transparent" keyboardType="default" 
                                            onChangeText={(receiver) => this.chkAccount(receiver)} style={[styles.inpt,{color: UColor.arrow}]}
                                        />
                                        <Button onPress={() => this.openAddressBook()}>
                                            <View style={styles.botnout}>
                                                <Image source={UImage.al} style={styles.botnimg} />
                                            </View>
                                        </Button> 
                                    </View>}
                                </View>}
                                <View style={styles.basc}>
                                    <Text style={[styles.basctext,{color: UColor.fontColor}]}>余额：{this.state.balance}EOS</Text>
                                </View>
                
                                <View style={{flex: 1, justifyContent: 'flex-end', marginHorizontal: ScreenUtil.autowidth(15), marginBottom: ScreenUtil.autowidth(15),}}>
                                    <Button onPress={this.sellRedeem.bind(this)} >
                                        <View style={[styles.botn,{backgroundColor: UColor.tintColor}]}>
                                            <Text style={[styles.botText,{color: UColor.btnColor}]}>{this.state.isSell ? "出售" : "购买"}</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <AuthModalView {...this.props} />
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
        flex: 1,
        fontSize: ScreenUtil.setSpText(16),  
    },
    businestab: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
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
})
export default Ram;