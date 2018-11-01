import React from 'react';
import { connect } from 'react-redux'
import {Modal,Dimensions,ImageBackground,DeviceEventEmitter,NativeModules,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,KeyboardAvoidingView,Linking,ActivityIndicator,} from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import Echarts from 'native-echarts'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Constants from '../../utils/Constants'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import {formatEosQua} from '../../utils/FormatUtil';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import BaseComponent from "../../components/BaseComponent";
import { SegmentedControls } from 'react-native-radio-buttons';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
const transactionOption = ['最新交易','我的交易','最近大单','交易大户'];
var DeviceInfo = require('react-native-device-info');

@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: 'ET交易所',
          tabBarLabel: '交易所',
          tabBarIcon: ({ focused}) => (
            <Image resizeMode='stretch' source={focused ? UImage.tab_5_h : UImage.tab_5} style={{width: ScreenUtil.autowidth(21), height: ScreenUtil.autowidth(21),}}/>
          ),
          header: null,
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedSegment:"5分",
            selectedTransactionRecord: transactionOption[0],
            isBuy: true,
            isSell: false,
            balance: '0.0000',      //EOS余额
            slideCompletionValue: 0,
            buyETAmount: "0",    //输入购买的额度
            eosToET: '0.0000',
            etToEos: '0.0000',
            sellET: "0",    //输入出售的ET
            myETAvailable: '0', // 我的可用 ET余额
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            logRefreshing: false,
            newetTradeLog: [],
            logId: "-1",
            password : "", //买卖交易时的密码
            modal: false,
            contractAccount:"octtothemoon", //ET合约账户名称
            tradename:"OCT",  //ET交易币种的名称
            selectcode:"OCT_EOS_octtothemoon",    //ET交易币种的唯一code
            precisionNumber: 4,
            showMore:false,  
            showMoreTitle:"更多",
            isKLine:true,  //是否K线
            dataKLine: {},
            business: false,
            error: false,
            errortext: '',
            scrollEnabled: true, 
            etOpenStatus: true, 
        };
    }

    componentWillMount() {
        super.componentWillMount();
        // this.props.dispatch({type: 'transaction/clearRamPriceLine',payload:{}});
    }

    componentDidMount(){
        try {
            this.setState({logRefreshing: true});

            this.props.dispatch({type:'transaction/getETServiceStatus',payload:{}, callback: (data) => {
                if(data && data.code == '0'){
                    this.setState({etOpenStatus: data.data.open});
                }
            }});  

            // 获取ETB行情相关信息
            this.props.dispatch({type:'transaction/getCurrentET',payload:{}, callback: (et) => {
                if(et!=undefined && et != null && et != ""){
                    this.setState({
                        modal: false,
                        contractAccount: et.base_contract ? et.base_contract : "octtothemoon",
                        tradename:et.base_balance_uom ? et.base_balance_uom : "OCT",
                        selectcode:et.code ?  et.code : "OCT_EOS_octtothemoon",
                        });
                }

                this.props.dispatch({type: 'transaction/getETInfo',payload: {code:this.state.selectcode}, callback: () => {
                    this.setState({logRefreshing: false});
                }});
                // 默认获取ETB的时分图
                // this.fetchETLine(24,'24小时');
                // 获取曲线
                this.onClickTimeType(this.state.selectedSegment);
                // 获取钱包信息和余额
                this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
                    this.getAccountInfo();
                }});
                this.getETTradeLog();
                DeviceEventEmitter.addListener('getRamInfoTimer', (data) => {
                    this.onRefreshing();
                });
            }});    

        } catch (error) {
            this.setState({logRefreshing: false});
        }

    }

    onRefreshing() {
        this.props.dispatch({type:'transaction/getETServiceStatus',payload:{}, callback: (data) => {
            if(data && data.code == '0'){
                this.setState({etOpenStatus: data.data.open});
            }
        }}); 
        this.getETInfo();
        this.getAccountInfo();
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord, true);
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    _leftTopClick = () => {
        this.setState({ modal: !this.state.modal });
        this.props.dispatch({type:'transaction/getETList',payload:{}});
        this.props.dispatch({type:'transaction/getRamInfo',payload: {}});
    }
 
    //选择ram 交易
    selectRamTx(){
        this.setState({modal: false});
        const { navigate } = this.props.navigation;
        navigate('Ram', {returnkey: true});
    }

    _rightTopClick = (tradename) =>{
        const { navigate } = this.props.navigation;
        navigate('Detailsofmoney', {tradename:tradename});
    }

    //选择ET交易
    selectETtx(rowData){
        this.setState({
            modal: false,
            contractAccount: rowData.base_contract,
            tradename:rowData.base_balance_uom,
            selectcode:rowData.code,
            precisionNumber: rowData.precision_number,
            });
        this.props.dispatch({type:'transaction/setCurrentET',payload:{et: rowData}});    
        InteractionManager.runAfterInteractions(() => {
            // this.getETInfo();
            this.onRefreshing();
        });
    }

    getETInfo(){
        //取头部开盘等信息
        this.props.dispatch({type:'transaction/getETInfo',payload:{code:this.state.selectcode}});
        // 获取曲线
        this.onClickTimeType(this.state.selectedSegment);
    }

    getETTradeLog(){
        this.props.dispatch({type: 'transaction/getETTradeLog',payload: {code:this.state.selectcode}, callback: (resp) => {
            try {
                if(this.props.etTradeLog && this.props.etTradeLog.length > 0){
                    this.setState({
                        newetTradeLog: this.props.etTradeLog,
                    });
                }else{
                    this.setState({
                        newetTradeLog: [],
                    });
                }
            } catch (error) {

            }
        }}); 
    }

    getAccountInfo(){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            return;
        }
        this.getBalance();  //取eos余额
        this.getETBalance(); //取ET余额
    } 

    //获取时分图
    fetchETLine(type,opt){
        this.setState({logRefreshing: true});
        InteractionManager.runAfterInteractions(() => {
            try {
                this.props.dispatch({type:'transaction/getETPriceLine',payload:{code:this.state.selectcode,type:type}, callback: (resp) => {
                    this.setState({logRefreshing: false});
                }});
            } catch (error) {
                this.setState({logRefreshing: false});
            }
        });
    }

    //获取K线
    fetchETKLine(dateType,opt){
        this.setState({logRefreshing: true});
        InteractionManager.runAfterInteractions(() => {
            this.props.dispatch({type: 'transaction/getETKLine',payload: {code:this.state.selectcode,pageSize: "180", dateType: dateType}, callback: (resp) => {
                try {
                    this.setState({logRefreshing: false});
                    if(this.props.etKLine && this.props.etKLine.length > 0){
                    // // 数据意义：日期(record_date),开盘(open)，收盘(close)，最低(min)，最高(max),交易量(volum)
                    // var data = splitData([
                    //     ['2013/1/24', 2320.26,2320.26,2287.3,2362.94,117990000],
                    var  arrayObj = new Array();
                    for(var i = 0;i < this.props.etKLine.length;i++){
                        var elementArray = new Array("",0,0,0,0,0);
                        var element = this.props.etKLine[i];
                        if(element.record_date){
                            var timezone;
                            try {
                                // timezone = moment(element.record_date).add(8,'hours').format('MM-DD HH:mm');
                                timezone = moment(element.record_date).format('MM-DD HH:mm');
                            } catch (error) {
                                timezone = "";
                            }
                            elementArray[0] = timezone;
                        }   
                        if(element.open) {
                            elementArray[1] = element.open;
                        }
                        if(element.close){
                            elementArray[2] = element.close;
                        }
                        if(element.min){
                            elementArray[3] = element.min;
                        }
                        if(element.max){
                            elementArray[4] = element.max;
                        }
                        if(element.volum){
                            elementArray[5] = element.volum;
                        }
                        arrayObj[i] = elementArray;
                    }
                    var constructdata = splitData(arrayObj);
                    var echartsoption = combineETKLine(constructdata);
                    this.setState({ dataKLine : echartsoption});
                    }else{
                    this.setState({ dataKLine : {}});
                    }
                } catch (error) {
                    this.setState({ dataKLine : {}});
                    this.setState({logRefreshing: false});
                }
            }});
        
        });
    }

    onClickTimeType(opt){
        if(opt == "时分"){
            this.setState({isKLine:false, showMore: false,selectedSegment:opt,showMoreTitle:opt});
            this.fetchETLine(24,'24小时');
            return ;
        }
        this.setState({isKLine:true, showMore: false,selectedSegment:opt});
        if(opt == "5分"){
            this.setState({showMoreTitle:'更多'});
            this.fetchETKLine("5m",opt);
        }else if(opt == "15分"){
            this.setState({showMoreTitle:'更多'});
            this.fetchETKLine("15m",opt);
        }else if(opt == "30分"){
            this.setState({showMoreTitle:'更多'});
            this.fetchETKLine("30m",opt);
        }else if(opt == "1小时"){
            this.setState({showMoreTitle:opt});
            this.fetchETKLine("1h",opt);
        }else if(opt == "1天"){
            this.setState({showMoreTitle:opt});
            this.fetchETKLine("1d",opt);
        }else if(opt == "1周"){
            this.setState({showMoreTitle:opt});
            this.fetchETKLine("1w",opt);
        }else if(opt == "1月"){
            this.setState({showMoreTitle:opt});
            this.fetchETKLine("1M",opt);
        }else if(opt == "更多"){
            this.onClickMore();
        }
    }

    tradingpoolClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('Tradingpool', {precisionNumber:this.state.precisionNumber, etinfo:this.props.etinfo, selectcode: this.state.selectcode, tradename:this.state.tradename, contract:this.state.contractAccount,});
    }
  
    getDataLine(){
            return this.props.etLineDatas ? this.props.etLineDatas : {};
    }

    getDataKLine(){
            return this.state.dataKLine ? this.state.dataKLine : {};
    }

    onClickMore(){
        this.setState({ showMore: !this.state.showMore });
    }
    
    selectedTransactionRecord(opt){
        this.setSelectedTransactionRecord(opt, false);
    }

    //我的交易，大盘交易
    setSelectedTransactionRecord(opt, onRefreshing = false){
        if(opt== transactionOption[0]){
        this.selectionTransaction(1,opt,onRefreshing);
        }else if(opt== transactionOption[1]){
        this.selectionTransaction(0,opt,onRefreshing);
        }else if(opt== transactionOption[2]){
        this.fetchETBigTradeLog(0,opt,onRefreshing);
        }else if(opt== transactionOption[3]){
        this.fetchETBigTradeLog(1,opt,onRefreshing);
        }else{

        }
    }

    fetchETBigTradeLog(type,opt, onRefreshing = false){
        this.setState({selectedTransactionRecord:opt});
        if(type == 0){
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'transaction/getETBigTradeLog',payload: {code:this.state.selectcode}, callback: () => {
                this.setState({logRefreshing: false});
            }});    
        }else{
            // EasyToast.show('暂未开放');   
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'transaction/getLargeRankByCode',payload: {code:this.state.selectcode}, callback: () => {
                this.setState({logRefreshing: false});
            }});
        }
    }

    selectionTransaction(type, opt, onRefreshing = false){
        this.setState({selectedTransactionRecord:opt});
        if(type == 0){
            if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
                if(!onRefreshing){
                    EasyToast.show('请导入您已激活的账号');
                }
            }else{
                if(!onRefreshing){
                    this.setState({logRefreshing: true});
                }
                this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: this.props.defaultWallet.account, last_id: this.state.logId}, callback: (resp) => {
                    try {
                        if(this.props.etTradeLog && this.props.etTradeLog.length > 0){
                            this.setState({
                                newetTradeLog: this.props.etTradeLog,
                                logRefreshing: false
                            });
                        }else{
                            this.setState({
                                newetTradeLog: [],
                                logRefreshing: false,
                            });
                        }
                    } catch (error) {
                        this.setState({
                            logRefreshing: false
                        });
                    }
                }});
            }
        }else{
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'transaction/getETTradeLog',payload: {code:this.state.selectcode}, callback: (resp) => {
                try {
                    if(this.props.etTradeLog && this.props.etTradeLog.length > 0){
                        this.setState({
                            newetTradeLog: this.props.etTradeLog,
                            logRefreshing: false
                        });
                    }else{
                        this.setState({
                            newetTradeLog: [],
                            logRefreshing: false,
                        });
                    }
                } catch (error) {
                    this.setState({
                        logRefreshing: false
                    });
                }
            }}); 
        }
    }

    setEosBalance(balance){
        if (balance == null || balance == "") {
            this.setState({balance: '0.0000'});
        } else {
            this.setState({ balance: balance.replace("EOS", "") });
        }
    }

    getBalance() {
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        return;
        }
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
            if (data.code == '0') {
                this.setEosBalance(data.data);
            }
            }
        })
    }

    setETBalance(balance){
        if (balance == null || balance == "") {
            this.setState({myETAvailable: '0.0000'});
        } else {
            this.setState({ myETAvailable: balance.replace(this.state.tradename, "") });
        }
    }
    
    getETBalance() {
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        return;
        }
        this.props.dispatch({
            type: 'transaction/getETBalance', payload: { contract: this.state.contractAccount, account: this.props.defaultWallet.account, symbol: this.state.tradename }, callback: (data) => {
            if (data && data.code == '0') {
                this.setETBalance(data.data);
            }
            }
        })
    }

    // 更新"买，卖，交易记录，大单追踪"按钮的状态  
    _updateBtnState(currentPressed, array) { 
        if (currentPressed === 'undefined' || currentPressed === null || array === 'undefined' || array === null ) {  
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
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord);
    }  

    businesButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.btnColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    } 

    transformColor(currentPressed) {
        if(currentPressed == 'isBuy'){
            return UColor.fallColor;
        }else if(currentPressed == 'isSell'){
            return UColor.showy;
        }else{
            return UColor.tintColor;
        }
    }


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
        return obj;
    }

    chkBuyEosQuantity(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = 9999999999.9999;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        var floatbalance;
        try {
            value = parseFloat(obj);
            floatbalance = parseFloat(this.state.balance);
        } catch (error) {
            value = 0.0000;
            floatbalance = 0.0000;
        }
        if(value < min|| value > max){
            EasyToast.show("输入错误");
            obj = "";
        }
        if (value > floatbalance) {
            EasyToast.show('账户余额不足,请重输');
            obj = "";
        }
        return obj;
    }

    chkInputSellET(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = 9999999999.9999;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        var tmp_et = 0;
        try {
        value = parseFloat(obj);
        tmp_et = parseFloat(this.state.myETAvailable);
        } catch (error) {
        value = 0.0000;
        tmp_et = 0.0000;
        }
        if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
        }
        if (value * 1 > tmp_et) {
        EasyToast.show('可卖数量不足,请重输');
        obj = "";
        }
        return obj;
    }

  
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

    // 购买
    buy = (rowData) => { 
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            //EasyToast.show('请先创建并激活钱包');
            this.setState({ error: true,errortext: '请先创建并激活钱包' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if(this.state.buyETAmount == ""||this.state.buyETAmount == '0'){
            //EasyToast.show('请输入购买金额');
            this.setState({ error: true,errortext: '请输入购买金额' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if(this.chkAmountIsZero(this.state.buyETAmount,'请输入购买金额')){
            this.setState({ buyETAmount: "" })
            return ;
        };

        // if(parseFloat(this.state.buyETAmount) > 1){
        //     this.setState({ error: true,errortext: '测试版本每次购买上限为１EOS.' });
        //     return;
        // }
        this.setState({ business: false});
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passout}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password : password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]} 
                    placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey;
                var plaintext_privateKey;
                try {
                    bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                    plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                } catch (error) {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                    return;
                }

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyShowLD.loadingShow();
                    Eos.transaction({
                        actions: [
                            // {
                            //     account: "eosio",
                            //     name: "updateauth", 
                            //     authorization: [{
                            //     actor: this.props.defaultWallet.account,
                            //     permission: 'active'
                            //     }], 
                            //     data: {
                            //         account: this.props.defaultWallet.account,
                            //         permission: 'active',
                            //         parent: "owner",
                            //         auth: {
                            //             threshold: 1,
                            //             keys: [
                            //                 {
                            //                     key: this.props.defaultWallet.activePublic,
                            //                     weight: 1,
                            //                 }
                            //             ],
                            //             accounts: [
                            //                 {
                            //                     permission: {
                            //                         actor: "etbexchanger",
                            //                         permission: "eosio.code",
                            //                     },
                            //                     weight: 1,
                            //                 }
                            //             ],
                            //         },
                            //     }
                            // },
                            {
                                account: "etbexchanger",
                                name: "buytoken", 
                                authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                                }], 
                                data: {
                                    payer: this.props.defaultWallet.account,
                                    eos_quant: formatEosQua(this.state.buyETAmount + " EOS"),
                                    token_contract: this.props.etinfo.base_contract,//"issuemytoken",
                                    token_symbol: this.state.precisionNumber + "," + this.props.etinfo.base_balance_uom, //"4,TEST",
                                    fee_account: this.props.defaultWallet.account,
                                    fee_rate: "1", 
                                }
                            },
                            // {
                            //     account: "eosio",
                            //     name: "updateauth", 
                            //     authorization: [{
                            //     actor: this.props.defaultWallet.account,
                            //     permission: 'active'
                            //     }], 
                            //     data: {
                            //         account: this.props.defaultWallet.account,
                            //         permission: 'active',
                            //         parent: "owner",
                            //         auth: {
                            //             threshold: 1,
                            //             keys: [
                            //                 {
                            //                     key: this.props.defaultWallet.activePublic,
                            //                     weight: 1,
                            //                 }
                            //             ],
                            //             accounts: [

                            //             ],
                            //         },
                            //     }
                            // },
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("购买成功");
                        }else{
                            if(r.data){
                                if(r.data.code){
                                    var errcode = r.data.code;
                                    if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                                        || errcode == 3081001)
                                    {
                                        this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                            if(resp.code == 608)
                                            { 
                                                //弹出提示框,可申请免费抵押功能
                                                const view =
                                                <View style={styles.Explainout}>
                                                    <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                    <Text style={[styles.Explaintext,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                                </View>
                                                EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                const { navigate } = this.props.navigation;
                                                navigate('FreeMortgage', {wallet: this.props.defaultWallet});
                                                // EasyShowLD.dialogClose();
                                                }, () => { EasyShowLD.dialogClose() });
                                            }
                                        }});
                                    }else if(errcode == 3090003){
                                        //弹出提示框
                                        const view =
                                        <View style={styles.Explainout}>
                                            <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号未进行交易授权！</Text>
                                            <Text style={[styles.Explaintext,{color: UColor.arrow}]}>进行交易前，需授权ET交易智能合约，否则无法进行交易!</Text>
                                        </View>
                                        EasyShowLD.dialogShow("提示", view, "去授权", "待会说", () => {
                                        const { navigate } = this.props.navigation;
                                        navigate('AuthExchange', {wallet: this.props.defaultWallet});
                                        // EasyShowLD.dialogClose();
                                        }, () => { EasyShowLD.dialogClose() });
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
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('未知异常');
            }
            // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    };

    // 出售
    sell = (rowData) => {
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        this.setState({ error: true,errortext: '请先创建并激活钱包' });
        setTimeout(() => {
            this.setState({ error: false,errortext: '' });
        }, 2000);
        return;
        }; 
        if(this.state.sellET == ""||this.state.sellET == '0'){
            this.setState({ error: true,errortext: '请输入出售数量' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if(this.chkAmountIsZero(this.state.sellET,'请输入出售数量')){
            this.setState({ sellET: "" })
            return ;
        };
        this.setState({ business: false});
        this. dismissKeyboardClick();
        const view =
        <View style={styles.passout}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}
                placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>
        EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey;
            var plaintext_privateKey;
            try {
                bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            } catch (error) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
                return;
            }
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyShowLD.loadingShow();

                Eos.transaction({
                    actions: [
                        // {
                        //     account: "eosio",
                        //     name: "updateauth", 
                        //     authorization: [{
                        //     actor: this.props.defaultWallet.account,
                        //     permission: 'active'
                        //     }], 
                        //     data: {
                        //         account: this.props.defaultWallet.account,
                        //         permission: 'active',
                        //         parent: "owner",
                        //         auth: {
                        //             threshold: 1,
                        //             keys: [
                        //                 {
                        //                     key: this.props.defaultWallet.activePublic,
                        //                     weight: 1,
                        //                 }
                        //             ],
                        //             accounts: [
                        //                 {
                        //                     permission: {
                        //                         actor: "etbexchanger",
                        //                         permission: "eosio.code",
                        //                     },
                        //                     weight: 1,
                        //                 }
                        //             ],
                        //         },
                        //     }
                        // },
                        {
                            account: "etbexchanger",
                            name: "selltoken", 
                            authorization: [{
                            actor: this.props.defaultWallet.account,
                            permission: 'active'
                            }], 
                            data: {
                                receiver: this.props.defaultWallet.account,
                                token_contract: this.props.etinfo.base_contract, //"issuemytoken",
                                quant: formatEosQua(this.state.sellET + " " + this.props.etinfo.base_balance_uom, this.state.precisionNumber),
                                fee_account: this.props.defaultWallet.account,
                                fee_rate: "1", 
                            }
                        },
                        // {
                        //     account: "eosio",
                        //     name: "updateauth", 
                        //     authorization: [{
                        //     actor: this.props.defaultWallet.account,
                        //     permission: 'active'
                        //     }], 
                        //     data: {
                        //         account: this.props.defaultWallet.account,
                        //         permission: 'active',
                        //         parent: "owner",
                        //         auth: {
                        //             threshold: 1,
                        //             keys: [
                        //                 {
                        //                     key: this.props.defaultWallet.activePublic,
                        //                     weight: 1,
                        //                 }
                        //             ],
                        //             accounts: [

                        //             ],
                        //         },
                        //     }
                        // },
                    ]
                }, plaintext_privateKey, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
                    }else{
                        if(r.data){
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                                    || errcode == 3081001)
                                {
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                        if(resp.code == 608)
                                        { 
                                            //弹出提示框,可申请免费抵押功能
                                            const view =
                                            <View style={styles.Explainout}>
                                                <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                <Text style={[styles.Explaintext,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                            </View>
                                            EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                            const { navigate } = this.props.navigation;
                                            navigate('FreeMortgage', {});
                                            // EasyShowLD.dialogClose();
                                            }, () => { EasyShowLD.dialogClose() });
                                        }
                                    }});
                                }else if(errcode == 3090003){
                                    //弹出交易授权提示框
                                    const view =
                                    <View style={styles.Explainout}>
                                        <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号未进行交易授权！</Text>
                                        <Text style={[styles.Explaintext,{color: UColor.arrow}]}>进行交易前，需授权ET交易智能合约，否则无法进行交易!</Text>
                                    </View>
                                    EasyShowLD.dialogShow("提示", view, "去授权", "呆会说", () => {
                                    const { navigate } = this.props.navigation;
                                    navigate('AuthExchange', {wallet: this.props.defaultWallet});
                                    // EasyShowLD.dialogClose();
                                    }, () => { EasyShowLD.dialogClose() });
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

            } else {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyShowLD.loadingClose();
            EasyToast.show('未知异常');
        }
        // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    };

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    eosToET(eos, currentPrice) {
        if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
            return '0';
        }
        var ret = (eos/currentPrice).toFixed(8); 
        if(ret == 'NaN')
        {
            ret = '0';
        }
        return ret; 
    }

    etToEos(et, currentPrice){
        if(et == null || et == '' || currentPrice == null || currentPrice == ''){
            return '0.0000';
        }
        var ret = (et * currentPrice).toFixed(4);
        if(ret == 'NaN')
        {
            ret = '0';
        }
        return ret
    }

    //小数点位数大于指定位数,强制显示指定位数,少于则按实际位数显示
    precisionTransfer(data,pos){
        if(data == null || data == undefined){
            return '0';
        }
        try {
            var point = data.lastIndexOf(".");
            if(point <= 0){
                return data; //无小数位
            }
            var pointnum = data.length - point - 1;
            var precisionData = data;
            if(pointnum > pos){
                precisionData = data.substring(0,point + 1 + pos);
            }
            return precisionData;
        } catch (error) {
            return data.toFixed(pos);
        }
    }

    openQuery =(payer) => {
        if(payer == 'busines'){
            if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
                this.setState({ error: true,errortext: '未检测到您的账号信息' });
                setTimeout(() => {
                    this.setState({ error: false,errortext: '' });
                }, 2000);
            }else{
                this.setState({ business: false});
                const { navigate } = this.props.navigation;
                navigate('RecordQueryET', {code:this.state.selectcode,tradename:this.state.tradename,record:this.props.defaultWallet.account});
            }
        }else{
            const { navigate } = this.props.navigation;
            navigate('RecordQueryET', {code:this.state.selectcode,tradename:this.state.tradename,record:payer});
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }
    
    transferTimeZone(time){
        var timezone;
        try {
            timezone = moment(time).add(8,'hours').format('YYYY-MM-DD HH:mm');
        } catch (error) {
            timezone = time;
        }
        return timezone;
    }

    openbusiness() {
        if(this.props.etinfo.base_balance_uom != "TEST" && this.props.etinfo.base_balance_uom != "ABC"){
            let business = this.state.business;  
            this.setState({  
                business:!business,
                buyETAmount: '0',
                sellET: '0',  
            });
            return;
        } 

        const view = 
        <View style={styles.passoutsource}>
        <Text　style={{height: 45,width: ScreenWidth-100,paddingBottom: 5,fontSize: 16,}}>TEST/EOS币仅用于测试,没有投资价值,请不要大量购买!</Text>  
        </View>
        EasyShowLD.dialogShow("警示", view, "确认", "取消", () => {
            EasyShowLD.dialogClose();
            let business = this.state.business;  
            this.setState({  
                business:!business,
                buyETAmount: '0',
                sellET: '0',  
            });
        }, () => { EasyShowLD.dialogClose() })
    
    }  

    onMoveLineView() {
        this.setState({scrollEnabled: false});
        return true;
    }

    onMoveLineViewEnd(){
        this.setState({scrollEnabled: true});
        return true;
    }

    isIos11(iphoneAdjustStyle){
        if(Platform.OS == 'ios'&& DeviceInfo.getSystemVersion()>"11.0"){
            return iphoneAdjustStyle;
        }else{
            return null;
        }
    }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
    <TouchableOpacity style={styles.transactiontou}  onPress={this.openbusiness.bind(this)} activeOpacity={0.9}>
        <View style={[styles.transactionout,{backgroundColor: UColor.tintColor}]}>
            <Text style={[styles.paneltext,{color: UColor.btnColor}]}>交易面板</Text>
        </View>
    </TouchableOpacity>
    <LinearGradient colors={UColor.Navigation} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width:ScreenWidth,height: ScreenUtil.autoheight(45) + Constants.FitPhone,zIndex: 999,}}>
        <View style={styles.headerTitle} paddingTop = {Constants.FitPhone} >  
            <Button onPress={this._leftTopClick.bind()}>
                <Image source={this.state.modal ? UImage.tx_slide0 : UImage.tx_slide1} style={styles.imgBtn} />
            </Button>
            <Text style={[styles.headerTitleText,{color: UColor.btnColor}]}>{this.state.tradename + "/EOS"}</Text>
            <Button onPress={this._rightTopClick.bind(this,this.state.tradename)}>
                <Image source={UImage.pool_explain} style={{margin: ScreenUtil.autowidth(5), width: ScreenUtil.autowidth(21), height: ScreenUtil.autowidth(21),}} />
            </Button>
        </View> 
    </LinearGradient>
    {Constants.isNetWorkOffline &&
    <Button onPress={() => {NativeUtil.openSystemSetting();}}>
        <View style={[styles.systemSettingTip,{backgroundColor: UColor.showy}]}>
            <Text style={[styles.systemSettingText,{color: UColor.btnColor}]}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
            <Ionicons style={{marginRight: ScreenUtil.autowidth(5),color: UColor.btnColor}} name="ios-arrow-forward-outline" size={20} />
        </View>
    </Button>}
    <LinearGradient colors={UColor.Navigation} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{width:ScreenWidth,height:ScreenWidth*0.1733}}>
        <View style={styles.header}>
            <View style={styles.leftout}>
                <View style={styles.nameout}>
                    <Text style={[styles.nametext,{color: UColor.btnColor}]}>CNY</Text>
                    <Text style={[styles.nametext,{color: UColor.btnColor}]}>开盘</Text>
                    <Text style={[styles.nametext,{color: UColor.btnColor}]}>交易量</Text>
                </View>
                <View style={styles.recordout}>
                    <Text style={[styles.recordtext,{color: '#C2E1FF'}]}>{this.props.etinfo ? this.precisionTransfer(this.props.etinfo.price_rmb,8) : '0'}</Text>
                    <Text style={[styles.recordtext,{color: '#C2E1FF'}]}>{this.props.etinfo ? this.precisionTransfer(this.props.etinfo.open,8) : '0'} EOS</Text>
                    <Text style={[styles.recordtext,{color: '#C2E1FF'}]}>{this.props.etinfo ? this.precisionTransfer(this.props.etinfo.today_volum,8) : '0'} {this.state.tradename}</Text>
                </View>
            </View>
            <View style={styles.rightout}>
                <View style={styles.presentprice}>
                    <Text style={[styles.present,{color: '#C2E1FF'}]}> {this.props.etinfo ? this.precisionTransfer(this.props.etinfo.price,8) : '0'}</Text>
                    <Text style={[styles.toptext,{color: UColor.btnColor}]}>价格</Text>
                </View>
                <View style={styles.titleout}>
                    {/* <Text style={[styles.cupcdo,{color: (this.props.etinfo && this.props.etinfo.increase>=0)?UColor.fallColor:UColor.showy}]}>  */}
                    <Text style={[styles.cupcdo,{color: '#C2E1FF'}]}>
                        {this.props.etinfo ? (this.props.etinfo.increase > 0 ? '+' + (this.props.etinfo.increase * 100).toFixed(2) : 
                        (this.props.etinfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                    <Text style={[styles.Increasetext,{color:UColor.btnColor}]}>涨幅</Text>
                </View>
            </View>
        </View>
    </LinearGradient>
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null} style={styles.tab}>
        <ScrollView {...this.isIos11({contentInsetAdjustmentBehavior:'automatic'})} 
            scrollEnabled={this.state.scrollEnabled} keyboardShouldPersistTaps="always"
            refreshControl={Platform.OS == 'ios' ? <RefreshControl refreshing={false} onRefresh={() => this.onRefreshing()} 
            tintColor={UColor.transport} colors={[UColor.tintColor]} progressBackgroundColor={UColor.transport}
            style={{backgroundColor: UColor.transport}}/>
            :
            <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()} 
            tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}
            style={{backgroundColor: UColor.transport}}/>
            }
        >
       {Platform.OS == 'ios' && <ActivityIndicator size="large" color={UColor.tintColor} animating={this.state.logRefreshing} 
        style={[styles.loganimat, {height:this.state.logRefreshing? ScreenUtil.autoheight(60):0}]}/>}
          <View style={[styles.timeout,{backgroundColor:UColor.secdColor}]}>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"5分")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.selectedSegment=="5分"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>5分</Text> 
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"15分")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.selectedSegment=="15分"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>15分</Text> 
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"30分")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.selectedSegment=="30分"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>30分</Text> 
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"更多")}>
                    <View style={[styles.timeview,{backgroundColor:(this.state.selectedSegment=="更多"||this.state.selectedSegment=="时分"||this.state.selectedSegment=="1小时"||
                        this.state.selectedSegment=="1天"||this.state.selectedSegment=="1周"||this.state.selectedSegment=="1月")?UColor.tintColor:UColor.invalidbtn}]}>
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>{this.state.showMoreTitle}</Text>
                        <Ionicons name={this.state.showMore ? "md-arrow-dropdown" : "md-arrow-dropright"} size={ScreenUtil.autowidth(20)} color={UColor.btnColor}/>
                    </View>
                </Button> 
            </View>
            {/* <View style={styles.timetabout}>
                <Button onPress={this.tradingpoolClick.bind(this)}>
                    <View style={[styles.tradingview,{backgroundColor:UColor.tintColor}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>坐庄</Text>
                    </View>
                </Button> 
            </View> */}
         </View> 
        {this.state.showMore &&       
        <View style={[styles.timeout,{backgroundColor:UColor.secdColor}]}>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"1小时")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.showMoreTitle == "1小时"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>1小时</Text>
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"1天")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.showMoreTitle == "1天"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>1天</Text>
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"1周")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.showMoreTitle == "1周"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>1周</Text>
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
               <Button onPress={this.onClickTimeType.bind(this,"1月")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.showMoreTitle == "1月"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color: UColor.btnColor}]}>1月</Text>
                    </View>
                </Button> 
            </View>
            <View style={styles.timetabout}>
                <Button onPress={this.onClickTimeType.bind(this,"时分")}>
                    <View style={[styles.timeview,{backgroundColor:this.state.showMoreTitle=="时分"?UColor.tintColor:UColor.invalidbtn}]} >
                        <Text style={[styles.timeinitial,{color:UColor.btnColor}]}>时分</Text>
                    </View>
                </Button>   
            </View>
         </View> 
        }  
        {
            this.state.etOpenStatus ? 
            (this.state.isKLine ? 
                <View style={{width: ScreenWidth, backgroundColor: UColor.bgEchar}} onStartShouldSetResponderCapture={this.onMoveLineView.bind(this)} onResponderRelease={this.onMoveLineViewEnd.bind(this)} onResponderEnd={this.onMoveLineViewEnd.bind(this)}>
                {
                    <Echarts option={this.getDataKLine()} width={ScreenWidth} height={ScreenUtil.autoheight(300)} />
                }
                </View>
                : 
                <View style={{width: ScreenWidth, backgroundColor: UColor.bgEchar}} onStartShouldSetResponderCapture={this.onMoveLineView.bind(this)} onResponderRelease={this.onMoveLineViewEnd.bind(this)} onResponderEnd={this.onMoveLineViewEnd.bind(this)}>
                {
                    <Echarts option={this.getDataLine()} width={ScreenWidth} height={ScreenUtil.autoheight(180)} />
                }
                </View>
            )
            :
            <View style={{width: ScreenWidth, height: ScreenUtil.autoheight(300), backgroundColor: UColor.bgEchar, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{flexDirection: 'row',alignItems: 'center',}}>
                    <Image source={UImage.warning} style={styles.statementimg} />
                    <Text style={[styles.statementtext,{color: UColor.riseColor}]} >警告</Text>
                </View>
                <Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.riseColor,lineHeight: ScreenUtil.autoheight(30)}}>交易系统正在升级维护中, 请勿进行交易!</Text>
            </View>
        }
        <View style={styles.toptabout}>
            <SegmentedControls tint= {UColor.tintColor} selectedTint= {UColor.btnColor} onSelection={this.selectedTransactionRecord.bind(this) }
                selectedOption={ this.state.selectedTransactionRecord } backTint= {UColor.secdColor} options={transactionOption} />
        </View>
        {this.state.selectedTransactionRecord == transactionOption[0] || this.state.selectedTransactionRecord == transactionOption[1] ? 
                    <View style={{flex: 1, marginBottom: 15}}>
                        {(this.props.etTradeLog  != null &&  this.props.etTradeLog .length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                        <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                                renderHeader = {()=>
                                <View style={styles.formout}>
                                    <Text style={[styles.formName,{flex: 3,color: UColor.lightgray}]}>账号</Text>
                                    <Text style={[styles.formName,{flex: 4,color: UColor.lightgray}]}>数量(EOS)</Text>
                                    <Text style={[styles.formName,{flex: 3.5,color: UColor.lightgray}]}>价格(EOS)</Text>
                                    <Text style={[styles.formName,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7,color: UColor.lightgray}]}>时间</Text>
                                </View>
                            }
                            dataSource={this.state.dataSource.cloneWithRows(this.state.newetTradeLog == null ? [] : this.state.newetTradeLog)} 
                            renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.account)}>
                                <View style={[styles.businessout,{backgroundColor: UColor.mainColor}]}>
                                    {rowData.action_name == 'selltoken' ? 
                                    <View style={styles.liststrip}>
                                        <Text style={[styles.payertext,{flex: 3,color: UColor.fontColor}]} numberOfLines={1}>{rowData.account}</Text>
                                        <Text style={[styles.selltext,{flex: 4,color: UColor.riseColor}]} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? this.precisionTransfer(rowData.token_qty,8) : rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={[styles.selltext,{flex: 3.5,color: UColor.riseColor}]} numberOfLines={1}>{rowData.price != 0? this.precisionTransfer(rowData.price,8):''}</Text>
                                        <Text style={[styles.payertext,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7, color: UColor.riseColor}]} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                        <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} />
                                    </View>
                                    :
                                    <View style={styles.liststrip}>
                                        <Text style={[styles.payertext,{flex: 3,color: UColor.fontColor}]} numberOfLines={1}>{rowData.account}</Text>
                                        <Text style={[styles.selltext,{flex: 4,color: UColor.fallColor}]} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={[styles.selltext,{flex: 3.5,color: UColor.fallColor}]} numberOfLines={1}>{rowData.price != 0? this.precisionTransfer(rowData.price,8):''}</Text>
                                        <Text style={[styles.payertext,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7, color: UColor.riseColor}]} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                        <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} />
                                    </View>
                                    }
                                </View>
                            </Button>         
                            )}                
                        /> 
                        }
                    </View>: 
            <View style={{flex: 1,}}>
                {this.state.selectedTransactionRecord == transactionOption[2] ? 
                  <View style={{flex: 1,}}>
                    {(this.props.etBigTradeLog != null &&  this.props.etBigTradeLog.length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    renderHeader = {()=>
                    <View style={styles.formout}>
                        <Text style={[styles.formName,{flex: 3,color: UColor.lightgray}]}>账号</Text>
                        <Text style={[styles.formName,{flex: 4,color: UColor.lightgray}]}>数量(EOS)</Text>
                        <Text style={[styles.formName,{flex: 3.5,color: UColor.lightgray}]}>价格(EOS)</Text>
                        <Text style={[styles.formName,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7,color: UColor.lightgray}]}>时间</Text>
                    </View>
                    }
                      dataSource={this.state.dataSource.cloneWithRows(this.props.etBigTradeLog == null ? [] : this.props.etBigTradeLog)} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                        <Button onPress={this.openQuery.bind(this,rowData.account)}>
                            <View style={[styles.businessout,{backgroundColor: UColor.mainColor}]}>
                                {rowData.action_name == 'selltoken' ? 
                                <View style={styles.liststrip}>
                                    <Text style={[styles.payertext,{flex: 3,color: UColor.fontColor}]} numberOfLines={1}>{rowData.account}</Text>
                                    <Text style={[styles.selltext,{flex: 4,color: UColor.riseColor}]} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? this.precisionTransfer(rowData.token_qty,8) : rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={[styles.selltext,{flex: 3.5,color: UColor.riseColor}]} numberOfLines={1}>{rowData.price != 0 ? this.precisionTransfer(rowData.price,8):''}</Text>
                                    <Text style={[styles.payertext,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7, color: UColor.riseColor}]} numberOfLines={1} >{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} />
                                </View>
                                :
                                <View style={styles.liststrip}>
                                    <Text style={[styles.payertext,{flex: 3,color: UColor.fontColor}]} numberOfLines={1}>{rowData.account}</Text>
                                    <Text style={[styles.selltext,{flex: 4,color: UColor.fallColor}]} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={[styles.selltext,{flex: 3.5,color: UColor.fallColor}]} numberOfLines={1}>{rowData.price != 0 ? this.precisionTransfer(rowData.price,8):''}</Text>
                                    <Text style={[styles.payertext,{paddingLeft: ScreenUtil.autowidth(10),flex: 2.7, color: UColor.riseColor}]} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} />
                                </View>
                                }
                            </View>
                        </Button>      
                      )}                
                    /> 
                    }
                  </View> :
                  <View style={{flex: 1,}}>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                      renderHeader = {()=>
                        <View style={styles.rankout}>
                            <Text style={[styles.pertext,{flex: 1,color: UColor.lightgray}]}>排名</Text>
                            <Text style={[styles.pertext,{flex: 5,color: UColor.lightgray}]}>账号</Text>
                            <Text style={[styles.pertext,{flex: 4,color: UColor.lightgray}]}>持有数量</Text>
                        </View>
                        }
                        dataSource={this.state.dataSource.cloneWithRows(this.props.largeRankByCode == null ? [] : this.props.largeRankByCode)} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.account)}>
                                <View style={[styles.businessRan,{backgroundColor: UColor.mainColor}]}>
                                    <View style={styles.liststrip}>
                                        <Text style={[styles.numtext,{flex: 1,color: UColor.arrow}]} numberOfLines={1}>{rowData.seq}</Text>
                                        <Text style={[styles.accounttext,{flex: 4,color: UColor.fontColor}]} numberOfLines={1}>{rowData.account}</Text>
                                        <Text style={[styles.quotatext,{flex: 3,color: UColor.riseColor}]} numberOfLines={1}>{rowData.qty}</Text>
                                        <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} />
                                    </View>
                                </View>
                            </Button>
                        )}                
                    /> 
                  </View>
                }
            </View>}
      </ScrollView>  
    </KeyboardAvoidingView> 

    <Modal style={styles.touchableouts} animationType={'none'} transparent={true} onRequestClose={() => {this.setState({modal: false}); }} visible={this.state.modal}>
          <TouchableOpacity onPress={() => this.setState({ modal: false })} style={[styles.touchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
            <TouchableOpacity style={[styles.touchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>

              <View style={[styles.touchableout,{backgroundColor:UColor.secdColor}]}>
               {/* <TouchableOpacity onPress={this._leftTopClick.bind()}> 
                <View style={{ paddingRight: 0,alignItems: 'flex-end', }} >
                    <Image source={UImage.tx_slide0} style={styles.HeadImg}/>
                </View>
                </TouchableOpacity> */}
                <View style={[styles.ebhbtnout,{backgroundColor:UColor.receivables}]}>
                    <View style={{width:'30%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:ScreenUtil.autowidth(10),fontSize:ScreenUtil.setSpText(15),color:UColor.btnColor}}>内存</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"center", }}>
                            <Text style={{fontSize:ScreenUtil.setSpText(15),marginLeft:0,color:UColor.btnColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'42%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:ScreenUtil.setSpText(15), color:UColor.btnColor,textAlign:'center', marginRight:ScreenUtil.autowidth(5)}}>单价(EOS)</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.ebhbtnout2,{backgroundColor:UColor.mainColor}]}>
                  <Button onPress={this.selectRamTx.bind(this)}>
                      <View style={styles.sliderow}>
                        <View style={{width:'30%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:ScreenUtil.autowidth(10),fontSize:ScreenUtil.setSpText(14),color:UColor.fontColor}}>RAM</Text>
                            </View>
                        </View>
                        <View style={{width:'28%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"center"}}>
                            <Text style={[styles.greenincup,{color:(this.props.ramInfo && this.props.ramInfo.increase>=0)? UColor.riseColor:UColor.fallColor}]}>
                             {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                            </View>
                        </View>
                        <View style={{width:'42%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:ScreenUtil.setSpText(14), color:UColor.fontColor, textAlign:'center', marginRight:ScreenUtil.autowidth(5)}}>{this.props.ramInfo ? (this.props.ramInfo.price * 1).toFixed(4) : '0.0000'}</Text>
                            </View>
                        </View>
                      </View>
                  </Button>
                </View>

                <View style={[styles.ebhbtnout,{backgroundColor:UColor.receivables}]}>
                    <View style={{width:'30%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:ScreenUtil.autowidth(10),fontSize:ScreenUtil.setSpText(15),color:UColor.btnColor}}>币种</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"center", }}>
                            <Text style={{fontSize:ScreenUtil.setSpText(15),color:UColor.btnColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'42%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:ScreenUtil.setSpText(15), color:UColor.btnColor,textAlign:'center', marginRight:ScreenUtil.autowidth(5)}}>单价(EOS)</Text>
                        </View>
                    </View>
                </View>

                <ListView initialListSize={5} 
                  renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor:UColor.secdColor}} />}
                  enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.etlist==null?[]:this.props.etlist)}
                  renderRow={(rowData) => (
                    <Button onPress={this.selectETtx.bind(this, rowData)}>
                      <View style={[styles.sliderow,{backgroundColor:UColor.mainColor}]}>
                        <View style={{width:'30%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:ScreenUtil.autowidth(10),fontSize:ScreenUtil.setSpText(14),color:UColor.fontColor}}>{rowData.base_balance_uom == null ? "" : rowData.base_balance_uom}</Text>
                            </View>
                        </View>
                        <View style={{width:'28%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"center"}}>
                                <Text style={[styles.greenincup,{color: rowData.increase>0? UColor.riseColor:UColor.fallColor}]}>
                                {rowData.increase>0?'+'+rowData.increase:rowData.increase}</Text>
                            </View>
                        </View>
                        <View style={{width:'42%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:ScreenUtil.setSpText(14), color:UColor.fontColor, 
                                    textAlign:'center', marginRight:ScreenUtil.autowidth(5)}}>{(rowData.price == null || rowData.price == "") ? "0" : this.precisionTransfer(rowData.price,8)}</Text>
                            </View>
                        </View>
                      </View>
                    </Button> 
                  )}
                />
           </View>
          </TouchableOpacity>
      </TouchableOpacity>
    </Modal>

    <Modal style={[styles.businesmodal,{backgroundColor: UColor.tintColor}]} animationType={'slide'} transparent={true} onRequestClose={() => {this.setState({business: false}) }} visible={this.state.business}>
    <TouchableOpacity onPress={() => this.setState({ business: false })} style={[styles.businestouchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}> 
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
        <TouchableOpacity style={styles.busines} activeOpacity={1.0} >
            <View style={[styles.businesout,{backgroundColor: UColor.secdColor}]}>
                <View style={styles.headbusines}>
                    <View style={[styles.businestab,{backgroundColor: UColor.secdColor}]}>  
                        {this.businesButton([styles.buytab,{borderColor: UColor.tintColor}], this.state.isBuy, 'isBuy', '买')}  
                        {this.businesButton([styles.selltab,{borderColor: UColor.tintColor}], this.state.isSell, 'isSell', '卖')}  
                    </View>
                    <View style={{flex: 1,flexDirection: 'row',}}> 
                        <TouchableOpacity onPress={this.openQuery.bind(this,'busines')} style={styles.busrecord} activeOpacity={0.8}>
                            <Image source={ UImage.record } style={styles.busrecordimg} resizeMode= 'contain'/>
                            <Text style={[styles.busrecordtext,{color: UColor.tintColor}]}> 我的记录</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.setState({ business: false })} activeOpacity={0.8}>
                            <Image source={ UImage.redclose } style={styles.redclose}  resizeMode='contain'/>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.isBuy?<View>
                    <View style={styles.greeninptout}>
                        <View style={{flex: 1, flexDirection: 'column',alignItems: 'flex-start',}}>
                            <Text style={[styles.greenText,{color: UColor.fallColor}]}>单价: {this.props.etinfo ? this.precisionTransfer(this.props.etinfo.price,8) : '0'} EOS</Text>
                            <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>余额: {this.state.balance==""? "0" : this.state.balance} EOS</Text>
                        </View>
                        {this.state.error&&<Text style={[styles.errortext,{color: UColor.showy}]}>{this.state.errortext}</Text>}
                    </View>
                    <View style={[styles.inputout,{backgroundColor: UColor.mainColor}]}>
                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyETAmount + ''} returnKeyType="go" 
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.fontColor}]}  placeholderTextColor={UColor.inputtip} 
                        placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                        onChangeText={(buyETAmount) => this.setState({ buyETAmount: this.chkBuyEosQuantity(buyETAmount), 
                            eosToET: this.eosToET(buyETAmount, this.props.etinfo?this.props.etinfo.price:''), error: false,errortext: '' })}
                        />
                        <Text style={[styles.unittext,{color: UColor.fontColor}]}>EOS</Text>
                    </View>
                    <View style={[styles.inputout,{backgroundColor: UColor.mainColor}]}>
                        <Text style={[styles.conversion,{color: UColor.arrow}]}>≈{this.precisionTransfer(this.state.eosToET,8)}</Text>
                        <Text style={[styles.unittext,{color: UColor.fontColor}]}>{this.state.tradename}</Text>
                    </View>
                    <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={styles.progressbar}>
                                <Slider maximumValue={this.state.balance*1} minimumValue={0} step={0.0001} value={this.state.buyETAmount*1}
                                onSlidingComplete={(value)=>this.setState({ buyETAmount: value.toFixed(4), eosToET: this.eosToET(value.toFixed(4), this.props.etinfo?this.props.etinfo.price:'')})}
                                maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                                />
                                <View style={styles.paragraph}>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>0</Text>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>1/3</Text>     
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>2/3</Text>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>ALL</Text>                                
                                </View>    
                            </View>
                            <Button onPress={this.buy.bind(this)}>
                                <View style={styles.botn} backgroundColor={UColor.fallColor}>
                                    <Text style={[styles.botText,{color: UColor.btnColor}]}>买入</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>
                </View>
                :
                <View>
                    <View style={styles.greeninptout}>
                        <View style={{flex: 1, flexDirection: 'column',alignItems: 'flex-start',}}>
                            <Text style={[styles.redText,{color: UColor.showy}]}>单价: {this.props.etinfo ? this.precisionTransfer(this.props.etinfo.price,8) : '0.0000'} EOS</Text>
                            <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>可卖: {(this.state.myETAvailable == null || this.state.myETAvailable == '') ? '0' : this.precisionTransfer(this.state.myETAvailable,8)} {this.state.tradename}</Text>
                        </View>
                        {this.state.error&&<Text style={[styles.errortext,{color: UColor.showy}]}>{this.state.errortext}</Text>}
                    </View>
                  <View style={[styles.inputout,{backgroundColor: UColor.mainColor}]}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellET + ''} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.fontColor}]} placeholderTextColor={UColor.inputtip} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellET) => this.setState({ sellET: this.chkInputSellET(sellET), etToEos: this.etToEos(sellET, this.props.etinfo?this.props.etinfo.price:'')})}
                      />
                      <Text style={[styles.unittext,{color: UColor.fontColor}]}>{this.state.tradename}</Text>
                  </View>
                  <View style={[styles.inputout,{backgroundColor: UColor.mainColor}]}>
                      <Text style={[styles.conversion,{color: UColor.arrow}]}>≈{(this.state.etToEos == null || this.state.etToEos == '') ? '0' : this.state.etToEos}</Text>
                      <Text style={[styles.unittext,{color: UColor.fontColor}]}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={styles.progressbar}>
                                <Slider maximumValue={this.state.myETAvailable*1} minimumValue={0} step={0.0001} value={this.state.sellET*1}
                                    onSlidingComplete={(value)=>this.setState({ sellET: (value/1).toFixed(4), etToEos: this.etToEos(value/1, this.props.etinfo?this.props.etinfo.price:'')})}
                                    maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                                    />
                                <View style={styles.paragraph}>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>0</Text>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>1/3</Text>     
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>2/3</Text>
                                    <Text style={[styles.subsection,{color: UColor.arrow}]}>ALL</Text>                                
                                </View> 
                            </View>
                            <Button onPress={this.sell.bind(this)}>
                                <View style={styles.botn} backgroundColor={UColor.showy}>
                                    <Text style={[styles.botText,{color: UColor.btnColor}]}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                  </View>
                </View>}
            </View>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  </View>
  }
}
const styles = StyleSheet.create({
    passout: {
        alignItems: 'center',
        flexDirection: 'column', 
    },
    inptpass: {
        textAlign: 'center',
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },

    headerTitle: {
        width: ScreenWidth,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: ScreenUtil.autowidth(10),
        
    },
    headerTitleText: {
        textAlign: "center",
        fontSize: ScreenUtil.setSpText(18),
    },
    leftoutTitle: {
        paddingLeft: ScreenUtil.autowidth(15),
    },
    HeadImg: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autoheight(15),
    },
    Rightout: {
        paddingRight: ScreenUtil.autowidth(15),
    },
    imgTeOy: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autowidth(15),
        marginHorizontal: ScreenUtil.autowidth(5),
    },
    HeadTitle: {
        flex: 1,
        justifyContent: 'center', 
        paddingLeft: ScreenUtil.autowidth(60),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    loganimat: {
        zIndex: 999, 
        position:'absolute', 
        left: 0,
        right: 0,
        top: ScreenUtil.autoheight(80), 
        alignItems: 'center',
        justifyContent: 'center',
        padding: ScreenUtil.autowidth(8),
    },
    container: {
        flex: 1,
        flexDirection:'column',
    },
    header: {
        width: ScreenWidth,
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenWidth*0.1733,
        paddingHorizontal: ScreenUtil.autowidth(6),
    },
    leftout: {
        flex: 7,
        flexDirection: "row",
    },
    nameout: {
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    nametext: {
        fontSize: ScreenUtil.setSpText(13),
    },
    recordout: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
        paddingLeft: ScreenUtil.autowidth(5),
    },
    recordtext: {
        fontSize: ScreenUtil.setSpText(13),
    },
    rightout: {
        flex:5,
        flexDirection:'column',
        alignItems:"flex-end",
        justifyContent: "space-between",
    },
    presentprice: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    present: {
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(20),
    },
    toptext: {
        textAlign: 'center', 
        fontSize: ScreenUtil.setSpText(13), 
        marginTop: ScreenUtil.autoheight(2), 
        marginLeft: ScreenUtil.autowidth(5), 
        marginRight: ScreenUtil.autowidth(2),
    },
    titleout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cupcdo:{
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(20),
    },
    Increasetext: {
        textAlign:'center', 
        fontSize: ScreenUtil.setSpText(13),
        marginTop: ScreenUtil.autoheight(2),
        marginLeft: ScreenUtil.autowidth(5),
    },
    timeout: {
        width:ScreenWidth,
        flexDirection:'row',
        alignItems:'center',
        justifyContent: 'center',
        height:ScreenUtil.autoheight(35),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    timetabout: {
        flex:1,
        flexDirection:"column",
    },
    timeview: { 
        borderRadius: 3, 
        flexDirection:'row',
        alignItems: 'center', 
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autoheight(25),
    },
    tradingview: {
        borderRadius: 3, 
        flexDirection:'row',
        alignItems: 'center', 
        justifyContent: 'center', 
        width: (ScreenWidth - ScreenUtil.autowidth(10))/5, 
        height: ScreenUtil.autoheight(25),
    },
    timeinitial: {
        fontSize: ScreenUtil.setSpText(14), 
    },
    statementimg: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autowidth(25),
        marginRight: ScreenUtil.autowidth(10),
    },
    statementtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(16), 
    },
    toptabout: {
        paddingTop: ScreenUtil.autoheight(10),
        paddingBottom: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },

    formout: { 
        flexDirection: "row", 
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    formName: { 
        textAlign: 'left',
        paddingLeft: ScreenUtil.autowidth(8), 
    },
    inptoutsource: {
        flexDirection: 'row',  
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: ScreenUtil.autoheight(10),
        paddingBottom: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    outsource: {
        flexDirection: 'row',  
        alignItems: 'center',
    },
    progressbar: {
        flex: 1,
        paddingRight: ScreenUtil.autowidth(20),
    },
    inpt: {
        flex: 1, 
        height: ScreenUtil.autoheight(45), 
        fontSize: ScreenUtil.setSpText(15),
        paddingLeft: ScreenUtil.autowidth(10), 
    },
    paragraph: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ScreenUtil.autoheight(30),
        paddingHorizontal: Platform.OS == 'ios' ? 0 : 15,
    },
    subsection: {
        fontSize: ScreenUtil.setSpText(12),
    },
    greeninptout: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.autoheight(50),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    greenText: {
        flex: 1,
        textAlign: "left",
        fontSize: ScreenUtil.setSpText(14), 
    },
    redText: {
        flex: 1,
        textAlign: "left",
        fontSize: ScreenUtil.setSpText(14), 
    },
    inptTitle: {
        flex: 1,
        textAlign: "right",
        fontSize: ScreenUtil.setSpText(14), 
    },
    errortext: {
        textAlign: 'left', 
        fontSize: ScreenUtil.setSpText(12), 
    },
    inputout: {
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(30),
        marginBottom: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(18),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    conversion: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(15),
        paddingLeft: ScreenUtil.autowidth(10),
    },
    unittext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    botn: {
        borderRadius: 3, 
        alignItems: 'center' ,
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(70), 
        height: ScreenUtil.autoheight(30), 
        marginLeft: ScreenUtil.autowidth(10), 
    },
    botText: {
        fontSize: ScreenUtil.setSpText(17), 
    },
    businessout: {
        borderRadius: 5,
        flexDirection: "row",
        height: ScreenUtil.autoheight(40),
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    liststrip: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    
    payertext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(14), 
    },
    selltext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(14),
        paddingLeft: ScreenUtil.autowidth(8),
    },


    businessRan: {
        borderRadius: 5,
        flexDirection: "row",
        height: ScreenUtil.autoheight(30),
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },

    numtext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
    },
    accounttext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
    },
    quotatext: {
        textAlign: 'right',
        marginRight: ScreenUtil.autowidth(20),
        fontSize: ScreenUtil.setSpText(14),
    },
    rankout: {
        flexDirection: "row", 
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    pertext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
    },
    sliderow:{
        flex:1,
        flexDirection:"row",
        height: ScreenUtil.autoheight(40), 
      },
    touchableouts: {
        flex: 1,
        flexDirection: "column",
      },
    touchable: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
    },
    touchableout: {
        height: ScreenHeight, 
        alignItems: 'center', 
        width: (ScreenWidth * 2)/ 3, 
        paddingTop: ScreenUtil.autoheight(40),
    },
    imgBtn: {
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
    },
    ebhbtnout: {
        width: '100%', 
        flexDirection: "row", 
        alignItems: 'flex-start', 
        height: ScreenUtil.autoheight(30), 
    },
    ebhbtnout2: {
        width: '100%', 
        flexDirection: "column", 
        alignItems: 'flex-start', 
        height: ScreenUtil.autoheight(40), 
    },
    establishout: {
        flex: 1, 
        flexDirection: "row",
        alignItems: 'center', 
        height: ScreenUtil.autoheight(30), 
    },
    establishimg:{
        width: ScreenUtil.autowidth(25), 
        height: ScreenUtil.autowidth(25), 
    },

    greenincup:{
        fontSize:ScreenUtil.setSpText(14),
    },
    businesmodal: {
        flex: 1,
        flexDirection:'column',
        justifyContent: 'flex-end',
    },
    businestouchable: {
        flex: 1, 
        justifyContent: 'flex-end', 
    },
    busines: {
        width: ScreenWidth , 
        height: ScreenUtil.autoheight(280),
    },
    businesout: {
        flex: 1,
        alignItems: 'center', 
    },
    businestab: {
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        paddingLeft: ScreenUtil.autowidth(20),
    },
    buytab: {
        flex: 1,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        height: ScreenUtil.autoheight(26),
    },
    selltab: {
        flex: 1,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        height: ScreenUtil.autoheight(26),
    },
    busrecord: {
        flex: 3,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
    busrecordimg: {
        width: ScreenUtil.autowidth(12),
        height: ScreenUtil.autowidth(16),
    },
    busrecordtext: {
        fontSize: ScreenUtil.setSpText(14),
    },
    redclose: {
        width: ScreenUtil.autowidth(40),
        height: ScreenUtil.autowidth(40),
    },
    headbusines: {
        width: ScreenWidth,
        flexDirection: 'row',
        justifyContent: "center",
        height: ScreenUtil.autoheight(40),
    },
    transactiontou: { 
        right: 0, 
        zIndex: 999, 
        position:'absolute', 
        bottom: ScreenUtil.autoheight(45), 
    },
    transactionout: {
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        width: ScreenUtil.autowidth(90),
        height: ScreenUtil.autoheight(35),
    },
    paneltext: {
        fontSize: ScreenUtil.setSpText(14), 
    },
    systemSettingTip: {
        width: ScreenWidth,
        flexDirection: "row",
        alignItems: 'center', 
        height: ScreenUtil.autoheight(40),
    },
    systemSettingText: {
        flex: 1,
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14)
    },
    systemSettingArrow: {
        color: UColor.fontColor,
        marginRight: ScreenUtil.autowidth(5)
    },
    Explainout: {
        flexDirection: 'column', 
        alignItems: 'flex-start'
    },
    Explaintext: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(25), 
    },
    tab: {
        flex: 1,
    }
});

var upColor = '#f44961';
var downColor = '#3fcfb4';

function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumes = [];
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }

    return {
        categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}

function calculateMA(data, dayCount) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}


function combineETKLine(data) {
    return {
        //backgroundColor: "#2f3b50",
        animation: false,
        // legend: {
        //     bottom: 10,
        //     left: 'center',
        //     data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
        // },
        tooltip: {
            trigger: 'none',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: UColor.fontColor,
                    width: 0.5,
                },
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000',
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},
            label: {
                backgroundColor: '#777'
            }
        },
        // toolbox: {
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: false
        //         },
        //         brush: {
        //             type: ['lineX', 'clear']
        //         }
        //     }
        // },
        // brush: {
        //     xAxisIndex: 'all',
        //     brushLink: 'all',
        //     outOfBrush: {
        //         colorAlpha: 0.1
        //     }
        // },
        visualMap: {
            show: false,
            seriesIndex: 1,
            dimension: 2,
            pieces: [{
                value: 1,
                color: downColor
            }, {
                value: -1,
                color: upColor
            }]
        },
        color:['#ec0000','#6e6e46','#835098','#4b9373','#4b7793'],
        legend: {
            data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
            // left: '20%',
            textStyle:{
                color: "#7382a1",
                fontSize: 10,
            },
            // inactiveColor:upColor,
            itemHeight: 12,
        },
        grid: [
            {
                top: ScreenUtil.autoheight(30),
                left: ScreenUtil.autowidth(0),
                right: ScreenUtil.autowidth(0),
                height: ScreenUtil.autoheight(160),
            },
            {
                left: ScreenUtil.autowidth(0),
                right: ScreenUtil.autowidth(0),
                top: ScreenUtil.autoheight(210),
                height: ScreenUtil.autoheight(85),
                bottom: ScreenUtil.autoheight(5),
            }
        ],
        xAxis: [
            {
                type: 'category',
                data:  data.categoryData,
                scale: true,
                boundaryGap : true,
                axisLabel: {
                    show: true,
                    color: "#7382a1",
                    fontSize: 8,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    },
                    onZero: false,
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: "#7382a1",
                    }
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data:  data.categoryData,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
                // axisPointer: {
                //     label: {
                //         formatter: function (params) {
                //             var seriesValue = (params.seriesData[0] || {}).value;
                //             return params.value
                //             + (seriesValue != null
                //                 ? '\n' + echarts.format.addCommas(seriesValue)
                //                 : ''
                //             );
                //         }
                //     }
                // }
            }
        ],
        yAxis: [
            {
                show: false,
                scale: true,
                min: 'dataMin',
                max: 'dataMax',
                splitArea: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    showMaxLabel: true,
                    color: "#7382a1",
                    fontSize: 2,
                    formatter: function(value, index) {
                        if(value == null || value == ''){
                            return parseFloat('0').toExponential(2);
                        }
                        return parseFloat(value).toExponential(2);
                    },
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: "#7382a1",
                    }
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 50,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'inside',
                top: '85%',
                start: 50,
                end: 100
            }
        ],
        series: [
            {
                name: '日K',
                type: 'candlestick',
                data: data.values ,
                itemStyle: {
                    normal: {
                        color: upColor,
                        color0: downColor,
                        borderColor: null,
                        borderColor0: null
                    }
                },
                tooltip: {
                    formatter: function (param) {
                        return [
                            // '日期:' + param.name + '<hr size=1 style="margin: 3px 0">',
                            // '开盘:' + param.data[0] + '<br/>',
                            // '收盘:' + param.data[1] + '<br/>',
                            // '最低:' + param.data[2] + '<br/>',
                            // '最高:' + param.data[3] + '<br/>'
                        ].join('');
    
                    }
                },
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data.volumes,
            },
            {
                name: 'MA5',
                type: 'line',
                data: calculateMA(data, 5),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#6e6e46",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA10',
                type: 'line',
                data: calculateMA(data, 10),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#835098",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA20',
                type: 'line',
                data: calculateMA(data, 20),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#4b9373",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA30',
                type: 'line',
                data: calculateMA(data, 30),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#4b7793",
                        width: 1,
                    }                
                }
            },
        ]
        
    };
}

export default Transaction;
