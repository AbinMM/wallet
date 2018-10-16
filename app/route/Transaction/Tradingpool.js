import React from 'react';
import { connect } from 'react-redux'
import { Linking, StyleSheet, Image, ScrollView, View, Text, Dimensions, RefreshControl, ListView, Modal, TouchableOpacity, Slider, Platform, TextInput} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import Button from '../../components/Button'
import { Eos } from "react-native-eosjs";
import Constants from '../../utils/Constants'
import {formatEosQua} from '../../utils/FormatUtil';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({transaction, wallet}) => ({...transaction, ...wallet}))
class Tradingpool extends BaseComponent {

    static navigationOptions = {
        headerTitle: '资金池',
        header:null,   
    };

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            params: this.props.navigation.state.params,
            Banker: false,
            Withdraw: false,
            RankingList: false,
            coinInfodata: {},
            balance: '0.0000',
            buyETAmount: "0",
            sellET: "0",    //输入出售的ET
            isChecked: this.props.isChecked || true,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            largeRankByCode: [],
            EosTotalfee: '0.00', //Eos总收益
            TokenTotalfee: '0.00', //Token总收益
            EosYesterdayfee: '0.00', //Eos昨日收益
            TokenYesterdayfee: '0.00', //Token昨日收益
            EosBalancepool: '0', //Eos资金池
            TokenBalancepool: '0', //Token资金池
            BuyRate: '0', //买费率
            SellRate: '0', //卖费率
            ExistingTrading: '0', //现有坐庄人数
            MaxTrading: '0', //最多坐庄人数
            ConvertBalance: '0.1', //bancor转换算法
            EosTotalinput: '0.00', //本人Eos总投入
            TokenTotalinput: '0.00', //本人Token总投入
            EosBalance: '0', //eos当前余额
            TokenBalance: '0', //token当前余额
            EosProportion: '0', //eos占比
            TokenProportion: '0', //token占比
            ListEosTotalinput: '0', //排行榜详情Eos总投入
            ListTokenTotalinput: '0', //排行榜详情Token总投入
            ListEosBalance: '0',//排行榜详情Token当前余额
            ListTokenBalance: '0', //排行榜详情Token当前余额
            ListEosProportion: '0', //排行榜详情eos占比
            ListTokenProportion: '0', //排行榜详情token占比
            myEosAvailable: '0.00', //我的Eos余额
            myTokenAvailable: '0.00', //我的Token余额
            buyEosAmount: '0', //我的坐庄Eos数量
            eosToToken: '0', //我的坐庄Token数量
            error: false, //提示语显示隐藏
            errortext: '', //提示内容
            password : '', //买卖交易时的密码
            logRefreshing: false, //下拉刷新
            TotalQuant: '', //总资金量
        };
    }

    //组件加载完成
    componentDidMount() {
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
            // 获取钱包信息和余额
            this.getAccountInfo();
            // 获取钱包坐庄信息
            this.getAccountTrading();
        } });
    }

    getAccountTrading() {
        // this.state.params.selectcode = 'ETB_EOS_octtothemoon',
        // this.state.params.contract = 'etbexchange1',
        // this.state.params.tradename = 'ETB',
        // this.state.params.precisionNumber = '4',
        // if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        //     return;
        // }
        this.setState({logRefreshing: true});
        try {
            this.props.dispatch({ 
                type: 'transaction/getEosMarkets', 
                payload:{code: this.state.params.selectcode, base_contract: this.state.params.contract, tradename: this.state.params.tradename},
                callback: (data) => {
                if(data && data.code=='0'){
                    this.setState({
                        EosTotalfee: Math.floor(data.data.rows[0].total_fee.eos_fee.replace("EOS", "")*100)/100 , //Eos总收益
                        TokenTotalfee: Math.floor(data.data.rows[0].total_fee.token_fee.replace(this.state.params.tradename, "")*100)/100 , //Token总收益
                        EosYesterdayfee: Math.floor(data.data.rows[0].yesterday_fee.eos_fee.replace("EOS", "")*100)/100 , //Eos昨日收益
                        TokenYesterdayfee: Math.floor(data.data.rows[0].yesterday_fee.token_fee.replace(this.state.params.tradename, " ")*100)/100 , //Token昨日收益
                        EosBalancepool:  Math.floor(data.data.rows[0].quote.balance.replace("EOS", "")*100)/100, //Eos资金池
                        TokenBalancepool: Math.floor(data.data.rows[0].base.balance.replace(this.state.params.tradename, "")*100)/100 , //Token资金池
                        BuyRate: data.data.rows[0].buy_fee_rate/10000, //买费率
                        SellRate: data.data.rows[0].sell_fee_rate/10000, //卖费率
                        MaxTrading: data.data.rows[0].banker_max_number, //最多坐庄人数
                        ConvertBalance: data.data.rows[0].base.balance.replace(this.state.params.tradename, "")/data.data.rows[0].quote.balance.replace("EOS", ""), //Eos转换Token算法
                    })
                }else{
                    this.setState({logRefreshing: false,})
                }
                this.props.dispatch({ type: 'transaction/getEosShareholdersInfo', 
                    payload:{code: this.state.params.selectcode, base_contract: this.state.params.contract,tradename: this.state.params.tradename},
                    callback: (data) => {
                        if(data && data.code=='0'){
                            let arr = data.data.rows[0].map_acc_info;
                            let EosInput = '0.00';
                            let TokenInput = '0.00';
                            let EosBalance = '0.00';
                            let TokenBalance = '0.00';
                            let EosProportion = '0';
                            let TokenProportion = '0';
                            for(var i = 0; i < arr.length; i++){
                                if(arr[i].account == this.props.defaultWallet.account){
                                    EosInput = arr[i].info.eos_in;
                                    TokenInput = arr[i].info.token_in;
                                    EosBalance = this.state.EosBalancepool*arr[i].info.eos_holding.replace("EOS", "")/data.data.rows[0].total_quant.replace("EOS", "");
                                    TokenBalance = this.state.TokenBalancepool*arr[i].info.token_holding.replace(this.state.params.tradename, "")/data.data.rows[0].total_quant.replace("EOS", "");
                                    EosProportion= arr[i].info.eos_holding.replace("EOS", "")/data.data.rows[0].total_quant.replace("EOS", "");
                                    TokenProportion= arr[i].info.token_holding.replace(this.state.params.tradename, "")/data.data.rows[0].total_quant.replace("EOS", "");
                                }
                            }
                            this.setState({
                                TotalQuant: data.data.rows[0].total_quant.replace("EOS", ""),
                                EosBalance: Math.floor(EosBalance*100)/100,
                                TokenBalance: Math.floor(TokenBalance*100)/100,
                                EosProportion: Math.floor(EosProportion*10000)/100,
                                TokenProportion: Math.floor(TokenProportion*10000)/100,
                                ExistingTrading: data.data.rows[0].map_acc_info.length, //现有坐庄人数
                                largeRankByCode: data.data.rows[0].map_acc_info,
                                EosTotalinput: Math.floor(EosInput.replace("EOS", "")*100)/100,
                                TokenTotalinput: Math.floor(TokenInput.replace(this.state.params.tradename, "")*100)/100,
                                logRefreshing: false,
                            })

                        }else{
                            this.setState({logRefreshing: false,})
                        }
                    }
                })
            }});
        } catch (error) {
            console.log(error.message);
            this.setState({logRefreshing: false,})
        }
    }


    getAccountInfo(){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            return;
        }
        this.getBalance();  //取eos余额
        this.getETBalance(); //取Token余额
    } 

    getBalance() {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, 
            callback: (data) => {
                if (data.code == '0') {
                    if (data.data == null || data.data == "") {
                        this.setState({myEosAvailable: '0.0000'});
                    } else {
                        this.setState({myEosAvailable: data.data.replace("EOS", "") });
                    }
                }
            }
        })
    }

    getETBalance() {
        this.props.dispatch({
            type: 'transaction/getETBalance', payload: { contract: this.state.params.contract, account: this.props.defaultWallet.account, symbol: this.state.params.tradename }, 
            callback: (data) => {
                if (data && data.code == '0') {
                    if (data.data == null || data.data == "") {
                        this.setState({myTokenAvailable: '0.00'});
                    } else {
                        this.setState({myTokenAvailable: data.data.replace(this.state.params.tradename, "") });
                    }
                }
            }
        })
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Bancorpool.html" });
    }

    goPage(key, data = {}) {
        const { navigate } = this.props.navigation;
        if (key == 'dm') {
            navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Disclaimer.html" });
        }else if (key == 'zz') {
            navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/TheVillage.html" });
        }else if (key == 'tczz') {
            this.turnInAsset();
            navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/TheVillage.html" });
        }else if (key == 'tccz') {
            this.turnOutAsset();
            navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/WithdrawingTheVillage.html" });
        }

    }

    prot(key, data = {}) {
        if (key == 'site') {
            Linking.openURL(this.state.coinInfodata.site);
        }else if (key == 'whitePaper') {
            Linking.openURL(this.state.coinInfodata.whitePaperUrl);
        }else if (key == 'blockQuery') {
            Linking.openURL(this.state.coinInfodata.blockQueryUrl);
        }
    }

    turnInAsset() {
        this.setState({
            buyEosAmount: '0',
            eosToToken: '0',
        });
        this._setModalBanker();
    }

    turnOutAsset() {
        if(this.state.TokenTotalinput == ""||this.state.TokenTotalinput == '0'){
            EasyToast.show('您还没有坐庄');
            return;
        };
        this._setModalVisible();
    }

     // 显示/隐藏 modal  
    _setModalVisible() {
        let isWithdraw = this.state.Withdraw;
        this.setState({
            Withdraw: !isWithdraw,
        });
    }

    _setModalBanker() {
        let isBanker = this.state.Banker;
        this.setState({
            Banker: !isBanker,
        });
    }

    _setModalRankingList(listdata) {
        let isRankingList = this.state.RankingList;
        this.setState({ 
            RankingList: !isRankingList,
            ListEosTotalinput: Math.floor(listdata.info.eos_in.replace("EOS", "")*100)/100, //排行榜详情Eos总投入
            ListTokenTotalinput: Math.floor(listdata.info.token_in.replace(this.state.params.tradename, "")*100)/100, //排行榜详情Token总投入
            ListEosBalance: this.state.EosBalancepool*listdata.info.eos_holding.replace("EOS", "")/this.state.TotalQuant,//排行榜详情Token当前余额
            ListTokenBalance: this.state.TokenBalancepool*listdata.info.token_holding.replace(this.state.params.tradename, "")/this.state.TotalQuant,//排行榜详情Token当前余额
            ListEosProportion: Math.floor(listdata.info.eos_holding.replace("EOS", "")/this.state.EosBalancepool*10000)/100, //排行榜详情eos占比
            ListTokenProportion: Math.floor(listdata.info.token_holding.replace(this.state.params.tradename, "")/this.state.TokenBalancepool*10000)/100, //排行榜详情token占比
        });
    }

    _closeModalRankingList() {
        let isRankingList = this.state.RankingList;
        this.setState({ RankingList: !isRankingList,});
    }

    //坐庄
    inputDoPwd() {
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            this.setState({ error: true,errortext: '请先创建并激活钱包' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if(this.state.buyEosAmount == ""||this.state.buyEosAmount == '0'){
            this.setState({ error: true,errortext: '请输入购买金额' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if(this.state.eosToToken > this.state.myTokenAvailable){
            this.setState({ error: true,errortext: this.state.params.tradename + '余额不足' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        };
        if (this.state.isChecked == false) {
            this.setState({ error: true,errortext: '请确认已勾选协议' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        }
        this._setModalBanker();
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
                    EasyToast.show(error);
                    return;
                }

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyShowLD.loadingShow();
                    Eos.transaction({
                        actions: [
                            {
                                account: "etbexchanger",
                                name: "addtoken", 
                                authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                                }], 
                                data: {
                                    account: this.props.defaultWallet.account,
                                    quant: formatEosQua(this.state.buyEosAmount + " EOS"),
                                    token_contract: this.state.params.contract, //"issuemytoken",
                                    token_symbol: this.state.params.precisionNumber + "," + this.state.params.tradename, //"4,TEST",
                                }
                            },
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.isSuccess){
                            this.getAccountTrading();
                            this.getAccountInfo();
                            EasyToast.show("坐庄成功");
                        }else{
                            if(r.data){
                                if(r.data.code){
                                    var errcode = r.data.code;
                                    if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                        this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                            if(resp.code == 608){ 
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
                                    EasyToast.show("坐庄失败");
                                }
                            }else{
                                EasyToast.show("坐庄失败");
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
    }

    //撤庄
    inputWithdrawPwd() {
        if (this.state.isChecked == false) {
            this.setState({ error: true,errortext: '请确认已勾选协议' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            return;
        }
        this._setModalVisible();
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
                    EasyToast.show(error);
                    return;
                }

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyShowLD.loadingShow();
                    Eos.transaction({
                        actions: [
                            {
                                account: "etbexchanger",
                                name: "subtoken", 
                                authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                                }], 
                                data: {
                                    receiver: this.props.defaultWallet.account,
                                    quant: formatEosQua(this.state.EosTotalinput + " EOS"),
                                    token_contract: this.state.params.contract,//"issuemytoken",
                                    token_symbol: this.state.params.precisionNumber + "," + this.state.params.tradename, //"4,TEST",
                                }
                            },
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.isSuccess){
                            this.getAccountTrading();
                            this.getAccountInfo();
                            EasyToast.show("撤庄成功");
                        }else{
                            if(r.data){
                                if(r.data.code){
                                    var errcode = r.data.code;
                                    if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                        this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                            if(resp.code == 608){ 
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
                                    EasyToast.show("撤庄失败");
                                }
                            }else{
                                EasyToast.show("撤庄失败");
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
    }

    checkClick() {
        this.setState({
          isChecked: !this.state.isChecked
        });
    }

    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
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
        tmp_et = parseFloat(this.state.myEosAvailable);
        } catch (error) {
        value = 0.0000;
        tmp_et = 0.0000;
        }
        if(value < min|| value > max){
            this.setState({ error: true,errortext: '输入错误' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            obj = "";
        }
        if (value * 1 > tmp_et) {
            this.setState({ error: true,errortext: '您的EOS余额不足' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
            obj = "";
        }
        return obj;
    }

    eosToToken(eos, currentPrice) {
        if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
            return '0';
        }
        var ret =  Math.floor((eos*currentPrice)*100)/100; 
        if(ret == 'NaN'){
            ret = '0';
        }
        return ret; 
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title={'Bancor池'+this.props.navigation.state.params.tradename} avatar={UImage.pool_explain} onPressRight={this._rightTopClick.bind(this,this.props.navigation.state.params.tradename)}/>  
            <ScrollView style={styles.row}
                refreshControl={
                    <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.getAccountTrading()}  colors={[UColor.tintColor]}
                    tintColor={UColor.fontColor} progressBackgroundColor={UColor.btnColor} style={{backgroundColor: UColor.transport}}/>
                }>
                <View style={[styles.gridoutsource,{backgroundColor: UColor.mainColor}]}>
                    <View style={[styles.titleout,{borderBottomColor: UColor.secdColor}]}>
                        <Text style={[{flex: 1}]}></Text>
                        <Text style={[styles.titleText,{color: UColor.fontColor}]} >概况</Text>
                        <Text style={[{flex: 1}]}></Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>历史总收益</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosTotalfee} EOS</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenTotalfee + ' ' + this.state.params.tradename}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>昨日收益</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosYesterdayfee} EOS</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenYesterdayfee + ' ' + this.state.params.tradename}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>资金池</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosBalancepool}</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenBalancepool}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>费率</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>买：{this.state.BuyRate + '%'}</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>卖：{this.state.SellRate + '%'}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>坐庄概况</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ExistingTrading}人坐庄</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>最多{this.state.MaxTrading}人坐庄</Text>
                    </View>
                </View>
                <View style={[styles.gridoutsource,{backgroundColor: UColor.mainColor}]}>
                    <View style={[styles.titleout,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={styles.buttontext}></Text>
                        <Text style={[styles.titleText,{color: UColor.fontColor}]} >您的坐庄信息</Text>
                        <Text style={[styles.buttontext,{color:UColor.tintColor}]} onPress={this.goPage.bind(this, 'zz')}>什么是坐庄？</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>总投入</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosTotalinput} EOS</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenTotalinput + ' ' + this.state.params.tradename}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>当前余额</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosBalance} EOS</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenBalance + ' ' + this.state.params.tradename}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>占比</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosProportion} %</Text>
                        <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenProportion} %</Text>
                    </View>
                </View>
                <ListView style={[styles.listViewout,{backgroundColor: UColor.mainColor}]} renderRow={this.renderRow} enableEmptySections={true} 
                    renderHeader = {()=>
                    <View >
                        <View style={[styles.titleout,{borderBottomColor: UColor.secdColor,}]}>
                            <Text style={[{flex: 1}]} />
                            <Text style={[styles.titleText,{color: UColor.fontColor}]} >庄家排行榜</Text>
                            <Text style={[{flex: 1}]} />
                        </View>
                        <View style={[styles.rankout,]}>
                            <Text style={[styles.pertext,{flex: 1,color: UColor.fontColor}]}>排名</Text>
                            <Text style={[styles.pertext,{flex: 3,color: UColor.fontColor}]}>账号</Text>
                            <Text style={[styles.pertext,{flex: 4,color: UColor.fontColor}]}>EOS数量</Text>
                            <Text style={[styles.pertext,{flex: 2,color: UColor.fontColor}]}>资金占比</Text>
                        </View>
                    </View>
                    }
                    dataSource={this.state.dataSource.cloneWithRows(this.state.largeRankByCode == null ? [] : this.state.largeRankByCode)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                        <Button onPress={this._setModalRankingList.bind(this,rowData)}>
                            <View style={[styles.businessRan,{borderTopColor: UColor.secdColor}]}>
                                <View style={styles.liststrip}>
                                    <Text style={[styles.numtext,{flex: 1,color: UColor.lightgray}]} numberOfLines={1}>{Number(rowID)+1}</Text>
                                    <Text style={[styles.numtext,{flex: 3,color: UColor.lightgray}]} numberOfLines={1}>{rowData.account}</Text>
                                    <Text style={[styles.numtext,{flex: 4,color: UColor.lightgray}]} numberOfLines={1}>{rowData.info.eos_in.replace("EOS", "")}</Text>
                                    <Text style={[styles.numtext,{flex: 2,color: UColor.lightgray}]} numberOfLines={1}>{Math.floor(rowData.info.eos_in.replace("EOS", "")/this.state.EosBalancepool*10000)/100 + '%'}</Text>
                                </View>
                            </View>
                        </Button>
                    )}                
                /> 
            </ScrollView>
            <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                <Button onPress={this.turnInAsset.bind(this)} style={{ flex: 1 }}>
                    <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]}>
                        <Text style={[styles.shifttoturnout,{color: UColor.fallColor}]}>坐庄</Text>
                    </View>
                </Button>
                <Button onPress={this.turnOutAsset.bind(this)} style={{ flex: 1 }}>
                    <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginLeft: 0.5}]}>
                        <Text style={[styles.shifttoturnout,{color: UColor.warningRed}]}>撤庄</Text>
                    </View>
                </Button>
            </View>
            
            <Modal animationType={'slide'} transparent={true} visible={this.state.Banker} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={[styles.modalview,{backgroundColor: UColor.btnColor,}]}>
                        <View style={[styles.subView,{borderBottomColor: UColor.riceWhite}]}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>请输入坐庄信息</Text>
                            <Text style={[styles.buttontext,{color: UColor.tintColor}]}onPress={this.goPage.bind(this, 'tczz')}>帮助？</Text>
                        </View>
                        <View style={styles.progressbar}>
                            <View style={styles.paragraph}>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>0%</Text>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>100%</Text>     
                            </View>
                            <Slider maximumValue={this.state.myEosAvailable*1} minimumValue={0} step={0.0001} value={this.state.buyEosAmount*1}
                            onSlidingComplete={(value)=>this.setState({ buyEosAmount: value.toFixed(2), eosToToken: this.eosToToken(value/1, this.state.ConvertBalance)})}
                            maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                            />
                            <View style={styles.paragraph}>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>0</Text>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>1/4</Text>     
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>1/2</Text>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>3/4</Text>
                                <Text style={[styles.subsection,{color: UColor.blackColor}]}>ALL</Text>                                
                            </View>    
                            <View style={[styles.inputout]}>
                                <Text style={[styles.unittext,{color: UColor.blackColor}]}>EOS数量:</Text>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyEosAmount + ''} returnKeyType="go" keyboardType="phone-pad"  
                                    selectionColor={UColor.tintColor} style={[styles.inpt,{borderBottomColor: UColor.blackColor,color: UColor.blackColor,}]} 
                                    placeholder="输入EOS数量" underlineColorAndroid="transparent" maxLength = {15} placeholderTextColor={UColor.inputtip} 
                                    onChangeText={(buyEosAmount) => this.setState({ buyEosAmount: this.chkInputSellET(buyEosAmount), eosToToken: this.eosToToken(buyEosAmount, this.state.ConvertBalance)})}
                                />
                            </View>
                            <View style={[styles.inputout]}>
                                <Text style={[styles.unittext,{color: UColor.blackColor}]}>{this.state.params.tradename}数量:</Text>
                                <View style={[styles.inpout,{borderBottomColor: UColor.blackColor,}]}>
                                    <Text style={[styles.unittext,{color: UColor.arrow,}]}>{(this.state.eosToToken == null || this.state.eosToToken == '') ? '0' : this.state.eosToToken}</Text>
                                </View>
                            </View>
                            <View style={styles.agreementout}>
                                <View style={styles.clauseout}>
                                    <TouchableOpacity  onPress={() => this.checkClick()} activeOpacity={0.5} underlayColor={UColor.secdColor}>
                                        <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={styles.clauseimg} />
                                    </TouchableOpacity>
                                    <Text style={[styles.welcome,{color: UColor.blackColor}]} >我接受协议<Text onPress={() => this.prot()} style={[styles.clausetext,{color: UColor.tintColor}]}></Text></Text>
                                </View>
                                {this.state.error&&
                                    <View style={styles.hintout}>
                                        <Text style={[styles.tipstext,{color: UColor.blackColor}]}>提示：</Text>
                                        <Text style={[styles.tipstext,{color: UColor.showy}]}>{this.state.errortext}</Text>
                                    </View>
                                }
                            </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Button  onPress={this._setModalBanker.bind(this)} style={{flex:1}}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.showy}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>取消</Text>
                                </View>
                            </Button>
                            <Button onPress={() => { this.inputDoPwd() }} style={{flex:1}}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>提交</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

             <Modal animationType={'slide'} transparent={true} visible={this.state.Withdraw} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={[styles.modalview,{backgroundColor: UColor.btnColor,}]}>
                        <View style={[styles.subView,{borderBottomColor: UColor.riceWhite,}]}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>撤庄</Text>
                            <Text style={[styles.buttontext,{color: UColor.tintColor}]} onPress={this.goPage.bind(this, 'tccz')}>帮助？</Text>
                        </View>
                        <View style={styles.progressbar}>
                            <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                                <Text style={[styles.nametext,{color:UColor.blackColor}]}>您的投入</Text>
                                <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosTotalinput} EOS</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenTotalinput + ' ' + this.state.params.tradename}</Text>
                            </View>
                            <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                                <Text style={[styles.nametext,{color:UColor.blackColor}]}>当前余额</Text>
                                <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosBalance} EOS</Text>
                                <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenBalance + ' ' + this.state.params.tradename}</Text>
                            </View>
                            <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                                <Text style={[styles.nametext,{color:UColor.blackColor}]}>占比</Text>
                                <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.EosProportion} %</Text>
                                <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.TokenProportion} %</Text>
                            </View>
                            <View style={styles.agreementout}>
                                <View style={styles.clauseout}>
                                    <TouchableOpacity  onPress={() => this.checkClick()} activeOpacity={0.5} underlayColor={UColor.secdColor}>
                                        <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={styles.clauseimg} />
                                    </TouchableOpacity>
                                    <Text style={[styles.welcome,{color: UColor.blackColor}]} >我接受协议<Text onPress={() => this.prot()} style={[styles.clausetext,{color: UColor.tintColor}]}></Text></Text>
                                </View>
                                {this.state.error&&
                                    <View style={styles.hintout}>
                                        <Text style={[styles.tipstext,{color: UColor.blackColor}]}>提示：</Text>
                                        <Text style={[styles.tipstext,{color: UColor.showy}]}>{this.state.errortext}</Text>
                                    </View>
                                }
                            </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Button  onPress={this._setModalVisible.bind(this)} style={{flex:1}}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.showy}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>取消</Text>
                                </View>
                            </Button>
                            <Button onPress={() => { this.inputWithdrawPwd() }} style={{flex:1}}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>提交</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

             <Modal animationType={'slide'} transparent={true} visible={this.state.RankingList} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={[styles.modalview,{backgroundColor: UColor.btnColor,}]}>
                        <View style={[styles.subView,{borderBottomColor: UColor.riceWhite,}]}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>坐庄信息</Text>
                            <Text style={styles.buttontext}/>
                        </View>
                        <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                            <Text style={[styles.nametext,{color:UColor.blackColor}]}>总投入</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListEosTotalinput} EOS</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListTokenTotalinput + ' ' + this.state.params.tradename}</Text>
                        </View>
                        <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                            <Text style={[styles.nametext,{color:UColor.blackColor}]}>当前余额</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListEosBalance} EOS</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListTokenBalance + ' ' + this.state.params.tradename}</Text>
                        </View>
                        <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                            <Text style={[styles.nametext,{color:UColor.blackColor}]}>占比</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListEosProportion} %</Text>
                            <Text style={[styles.recordtext,{color:UColor.lightgray}]} numberOfLines={1}>{this.state.ListTokenProportion} %</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Button  onPress={this._closeModalRankingList.bind(this)} style={{flex:1}}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确定</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
        )
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

    container: {
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        paddingTop: ScreenUtil.autowidth(20),
        marginBottom: ScreenUtil.autowidth(46),
    },
    gridoutsource: {
        marginBottom: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    outsource:{
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.autoheight(40), 
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    nametext: {
        flex: 1,
        textAlign: "left", 
        fontSize: ScreenUtil.setSpText(16), 
    },
    recordtext: {
        flex: 1,
        textAlign: "left", 
        fontSize: ScreenUtil.setSpText(14), 
    },
    listViewout: {
        marginBottom: ScreenUtil.autowidth(40),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    titleout: {
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1.5,
        height: ScreenUtil.autowidth(35),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    rankout: {
        flexDirection: "row", 
        alignItems: 'center',
        height: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    pertext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
    },
    businessRan: {
        flexDirection: "row",
        borderTopWidth: 1,
        height: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    liststrip: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    numtext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(12),
    },
   
    footer: {
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        flexDirection: 'row',
        height: ScreenUtil.autoheight(45),
        paddingTop: ScreenUtil.autoheight(1),
    },
    shiftshiftturnout: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    shifttoturnout: {
        fontSize: ScreenUtil.setSpText(15),
        marginLeft: ScreenUtil.autowidth(20),
    },


    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center', 
    },
    modalview: {
        borderRadius: 5,
        width: ScreenWidth - ScreenUtil.autowidth(30),
    },
    subView: {
        borderBottomWidth: 1.5,
        flexDirection: "row", 
        alignItems: 'center',
        height:  ScreenUtil.autoheight(50), 
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    buttontext: {
        flex: 1,
        textAlign:'right',
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autowidth(35),
    },
    titleText: {
        flex: 2,
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
        lineHeight: ScreenUtil.autowidth(35),
    },

    agreementout: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ScreenUtil.autoheight(20),
    },
    clauseout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    clauseimg: { 
        width: ScreenUtil.autowidth(15), 
        height: ScreenUtil.autowidth(15),
        marginRight: ScreenUtil.autowidth(10), 
    },
    welcome: {
        fontSize: ScreenUtil.setSpText(12),
    },
    clausetext: {
        fontSize: ScreenUtil.setSpText(12),
    },
    btnoutsource: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height:  ScreenUtil.autowidth(40),
        margin: ScreenUtil.autowidth(15),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    progressbar: {
       paddingHorizontal: ScreenUtil.autowidth(20),
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

    inputout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: ScreenUtil.autoheight(15),
    },
    unittext: {
        fontSize: ScreenUtil.setSpText(14),
    },
    inpt: {
        flex: 1, 
        borderBottomWidth: 0.5,
        fontSize: ScreenUtil.setSpText(14),
        marginLeft: ScreenUtil.autowidth(10), 
    },
    inpout: {
        flex: 1, 
        borderBottomWidth: 0.5,
        marginLeft: ScreenUtil.autowidth(10), 
    },

    hintout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    tipstext: {
        fontSize: ScreenUtil.setSpText(12),
    },
    
})
export default Tradingpool;