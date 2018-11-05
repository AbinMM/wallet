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
        
        delegateb: "", //计算抵押赎回
        undelegateb: "", //网络抵押赎回
        isOwn: true, // 自己
        isOthers: false, //他人

        isMortgage: true, //抵押
        isRedeem: false, //赎回
        isCalculation: false, //计算
        isNetwork: false, //网络

        isLease: true, // 租赁
        isTransfer: false, // 过户
        LeaseTransfer: 0,
        
        cpu_delegateb: "", //抵押cpu
        net_delegateb: "", //抵押net

        cpu_available: '0.00', //计算可用
        cpu_AlreadyUsed: '0.00', //计算已用
        cpu_Percentage: '0%', //计算已用百分比

        net_available: '0.00', //网络可用
        net_AlreadyUsed: '0.00', //网络已用
        net_Percentage: '0%', //网络已用百分比

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
                                cpu_Percentage: (100-data.display_data.cpu_limit_available_percent.replace("%", "")) + '%',
                                
                                net_available: data.display_data.net_limit_available,
                                net_AlreadyUsed:  (Math.floor((data.display_data.net_limit_max - data.display_data.net_limit_available)*100)/100).toFixed(2),
                                net_Percentage: (100-data.display_data.net_limit_available_percent.replace("%", "")) + '%',
    
                            });
                        }

                        if(data.self_delegated_bandwidth){
                            this.setState({
                                cpu_redeem: Math.floor(data.self_delegated_bandwidth.cpu_weight.replace("EOS", "")*100)/100 ,
                                net_redeem: Math.floor(data.self_delegated_bandwidth.net_weight.replace("EOS", "")*100)/100 ,
                            });
                        }

                        if(data.refund_request){
                            this.setState({
                                and_redeem: Math.floor((parseFloat(this.props.Resources.refund_request.cpu_amount.replace(" EOS", "")) + parseFloat(this.props.Resources.refund_request.net_amount.replace(" EOS", "")))*100)/100
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


    // 返回 抵押 赎回
    resourceButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isMortgage', 'isRedeem', ];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor,}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.btnColor} : {color: UColor.arrow}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    }  

    // 更新"抵押,赎回"按钮的状态  
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

    // 返回自己,他人
    businesButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isOwn', 'isOthers'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor:'#6DA0F8'} : {backgroundColor: '#FFFFFF'}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[{fontSize: ScreenUtil.setSpText(8) }, selectedSate ? {color: '#FFFFFF'} : {color: '#6DA0F8'}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    } 

    // 返回租赁,过户
    leaseTransferButton(style, selectedSate, stateType, buttonTitle) {    
        let BTN_SELECTED_STATE_ARRAY = ['isLease','isTransfer'];  
        return(  
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-start',alignItems: 'center', flex: 1,}} onPress={ () => {this._updateSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
              <View style={{width: 10, height: 10, marginHorizontal: 8, borderRadius: 10, backgroundColor: UColor.mainColor, alignItems: 'center', justifyContent: 'center',borderColor: UColor.arrow,borderWidth: 1,}}>
                  {selectedSate ?<View style={{width: 10, height: 10, borderRadius: 10, backgroundColor: UColor.tintColor, borderColor: UColor.tintColor, borderWidth: 1, }}/>:null}
              </View>
              <Text style={{fontSize: 16,color: UColor.fontColor}}>{buttonTitle}</Text>  
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

    //计算 网络 抵押 赎回
    purchaseMortgage() {
        if(this.state.isMortgage) {
            this.delegateb();
        }else{
            this.undelegateb();
        }
    }

    // 计算网络抵押
    delegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.delegateb == "" && this.state.undelegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.delegateb,'请输入抵押的EOS数量')){
            this.setState({ delegateb: "" })
            return ;
        }
        if(this.chkAmountIsZero(this.state.undelegateb,'请输入抵押的EOS数量')){
            this.setState({ undelegateb: "" })
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
                                stake_net_quantity: formatEosQua(this.state.undelegateb == "" ? "0 EOS" : this.state.undelegateb + " EOS"),
                                stake_cpu_quantity: formatEosQua(this.state.delegateb == "" ? "0 EOS" : this.state.delegateb + " EOS"),
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
        if ((this.state.delegateb == "" && this.state.undelegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.delegateb,'请输入抵押的EOS数量')){
            this.setState({ delegateb: "" })
            return ;
        }
        if(this.chkAmountIsZero(this.state.undelegateb,'请输入赎回的EOS数量')){
            this.setState({ undelegateb: "" })
            return ;
        }
        if(this.state.receiver == ""){
            EasyToast.show('请输入接收账户');
            return;
        }
        this. dismissKeyboardClick();

        AuthModal.show((authInfo) => {
            try {
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
                                unstake_net_quantity: formatEosQua(this.state.undelegateb == "" ? "0 EOS" : this.state.undelegateb + " EOS"),
                                unstake_cpu_quantity: formatEosQua(this.state.delegateb == "" ? "0 EOS" : this.state.delegateb + " EOS"),
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
    redemption = () => { 
        const { navigate } = this.props.navigation;
        navigate('undelegated', {});
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
                <Header {...this.props} onPressLeft={true} title="CPU+NET"  onPressRight={this.recordDelegatebw.bind()}  
                avatar={UImage.delegatebw_record} imgWidth={ScreenUtil.autowidth(20)} imgHeight={ScreenUtil.autowidth(20)} /> 

                <View style={[styles.inptoutsource,{flex: 1,}]}>
                    <ScrollView  keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                                <View style={{height: ScreenUtil.autowidth(70), flexDirection:'row', backgroundColor: UColor.mainColor, marginBottom: ScreenUtil.autowidth(1), }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: ScreenUtil.autowidth(15), }}>
                                        <Text style={{fontSize: ScreenUtil.setSpText(18), color: UColor.fontColor,}}>CPU</Text>
                                    </View>
                                    <View style={{flex: 1,padding: ScreenUtil.autowidth(15), justifyContent: 'space-around',}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.fontColor}}>已用{this.state.cpu_AlreadyUsed}ms</Text>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.arrow}}>可用{this.state.cpu_available}ms</Text>
                                            </View>
                                        </View>
                                        <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10,}}>
                                            <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.cpu_Percentage}/>
                                        </View>
                                    </View>
                                </View>
                                <View style={{height: ScreenUtil.autowidth(70), flexDirection:'row', backgroundColor: UColor.mainColor, marginBottom: ScreenUtil.autowidth(1), }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: ScreenUtil.autowidth(15), }}>
                                        <Text style={{fontSize: ScreenUtil.setSpText(18), color: UColor.fontColor,}}>NET</Text>
                                    </View>
                                    <View style={{flex: 1,padding: ScreenUtil.autowidth(15), justifyContent: 'space-around',}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.fontColor}}>已用{this.state.net_AlreadyUsed}kb</Text>
                                            </View>
                                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                                <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.arrow}}>可用{this.state.net_available}kb</Text>
                                            </View>
                                        </View>
                                        <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10,}}>
                                            <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.net_Percentage}/>
                                        </View>
                                    </View>
                                </View>
                                <View style={{height: ScreenUtil.autowidth(44), paddingHorizontal: ScreenUtil.autowidth(15), flexDirection:'row', alignItems: 'center', backgroundColor: UColor.mainColor, marginBottom: ScreenUtil.autowidth(10), }}>
                                    <Text style={{flex: 1, textAlign: 'left', fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor,}}>赎回中</Text>
                                    <Text style={{flex: 1, textAlign: 'right', fontSize: ScreenUtil.setSpText(16), color: UColor.arrow,}}>{this.state.and_redeem} EOS</Text>
                                </View>
                                <View style={[styles.tablayout,{backgroundColor: UColor.mainColor}]}>  
                                    {this.resourceButton([styles.memorytab,{borderColor: UColor.tintColor}], this.state.isMortgage, 'isMortgage', '抵押')}  
                                    {this.resourceButton([styles.networktab,{borderColor: UColor.tintColor}], this.state.isRedeem, 'isRedeem', '赎回')}  
                                    {/* <TextButton style={[styles.memorytab,{borderColor: UColor.tintColor}]} text="抵押" onPress={() => {this.setState({isMortgage: true, isRedeem: false})}}></TextButton>
                                    <TextButton style={[styles.networktab,{borderColor: UColor.tintColor}]} text="赎回" onPress={() => {this.setState({isMortgage: false, isRedeem: true})}}></TextButton> */}

                                </View> 
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65),flexDirection:'column',backgroundColor: UColor.mainColor,}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>CPU</Text>
                                        {this.state.isRedeem ?
                                            <Text style={{fontSize:ScreenUtil.setSpText(12), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可赎回：{this.state.cpu_redeem} EOS</Text>
                                            :
                                            <Text style={{fontSize:ScreenUtil.setSpText(12), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>当前价格:{this.state.cpuPrice} EOS/ms</Text>
                                        }
                                    </View>
                                    <View style={styles.inptout}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegateb} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip} 
                                        placeholder="请输入EOS数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(delegateb) => this.setState({ delegateb: this.chkPrice(delegateb)})} 
                                        />
                                    </View>
                                </View>
                                <View style={[styles.outsource,{height: ScreenUtil.autowidth(65),flexDirection:'column',backgroundColor: UColor.mainColor,}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>NET</Text>
                                        {this.state.isRedeem ?
                                            <Text style={{fontSize:ScreenUtil.setSpText(12), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>可赎回：{this.state.net_redeem} EOS</Text>
                                            :
                                            <Text style={{fontSize:ScreenUtil.setSpText(12), color: UColor.fontColor, lineHeight: ScreenUtil.autowidth(30)}}>当前价格:{this.state.netPrice} EOS/kb</Text>
                                        }
                                    </View>
                                    <View style={styles.inptout}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.undelegateb} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip} 
                                        placeholder="请输入EOS数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(undelegateb) => this.setState({ undelegateb: this.chkPrice(undelegateb)})} 
                                        />
                                    </View>
                                </View>
                                <View style={[styles.outsource,{height: this.state.isOwn?ScreenUtil.autowidth(30):ScreenUtil.autowidth(65), flexDirection:'column',backgroundColor: UColor.mainColor}]}>
                                    <View style={styles.inptTitleout}>
                                        <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>{this.state.isMortgage ?　'接收账户' : '赎回账户'}</Text>
                                        <View style={[styles.businestab]}>  
                                            {this.businesButton([styles.owntab,{borderColor: '#6DA0F8'}], this.state.isOwn, 'isOwn', '自己')}  
                                            {this.businesButton([styles.otherstab,{borderColor: '#6DA0F8'}], this.state.isOthers, 'isOthers', '他人')}  
                                        </View>
                                    </View>
                                    {this.state.isOthers && <View style={styles.inptout}>
                                        <TextInput ref={(ref) => this._account = ref} value={this.state.receiver} returnKeyType="go"  keyboardType="default"  
                                            selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip} 
                                            placeholder={this.state.receiver} underlineColorAndroid="transparent" maxLength={12} 
                                            onChangeText={(receiver) => this.chkAccount(receiver)}  
                                        />
                                        <Button onPress={() => this.openAddressBook()}>
                                            <View style={styles.botnout}>
                                                <Image source={UImage.al} style={styles.botnimg} />
                                            </View>
                                        </Button> 
                                    </View>
                                    }
                                   
                                </View>
                        
                                <View style={styles.basc}>
                                    {(this.state.isOthers &&  this.state.isMortgage) &&
                                    <View style={[styles.LeaseTransfer,]}>  
                                        {this.leaseTransferButton(styles.tabbutton, this.state.isLease, 'isLease', '租赁')}  
                                        {this.leaseTransferButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', '过户')}  
                                    </View>}
                                    <Text style={[styles.basctext,{color: UColor.fontColor}]}>余额：{this.state.balance}EOS</Text>
                                </View>
                    
                                <View style={{flex: 1, justifyContent: 'flex-end', marginHorizontal: ScreenUtil.autowidth(15), marginBottom: ScreenUtil.autowidth(15),}}>
                                    <Button onPress={this.purchaseMortgage.bind(this)} >
                                        <View style={[styles.botn,{backgroundColor: UColor.tintColor}]}>
                                            <Text style={[styles.botText,{color: UColor.btnColor}]}>{this.state.isMortgage ? "抵押" : "赎回"}</Text>
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
export default CpuNet;