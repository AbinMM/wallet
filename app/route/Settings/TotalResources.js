import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,StyleSheet,Image,ScrollView,View,Text, TextInput,Platform,Dimensions,ImageBackground,TouchableOpacity,KeyboardAvoidingView,BVLinearGradient,Modal,RefreshControl} from 'react-native';

import moment from 'moment';
import Echarts from 'native-echarts'
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
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Resources extends BaseComponent {

    static navigationOptions = { 
        title: "资源管理",
        header:null, 
    };
     
    recordMortgage = () =>{  
        const { navigate } = this.props.navigation;
        navigate('MortgageRecord', {account_name: this.props.navigation.state.params.account_name});
    }  

    // 构造函数  
    constructor(props) { 
        super(props);
        this.state = {
            show: false, //弹框
            balance: '0', //EOS余额
            password: "", //密码
            errortext: "", //提示语
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
            logRefreshing: false,
        };
    }

    componentDidMount() {
       this.onRefresh();
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    onRefresh() {
        this.setState({logRefreshing: true});
        try {
            this.props.dispatch({ type: 'wallet/getDefaultWallet',
                callback: () => {
                    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.navigation.state.params.account_name}, 
                        callback: (data) => {
                            EasyShowLD.loadingClose();
                            try {
                                if(data != null){
                                    this.setState({ 
                                        logRefreshing: false,

                                        ram_available: Math.floor(data.ram_usage/1024*100)/100,
                                        ram_AlreadyUsed: Math.floor((data.total_resources.ram_bytes-data.ram_usage)/1024*100)/100,
                                        ram_Percentage: ((data.total_resources.ram_bytes-data.ram_usage)/data.total_resources.ram_bytes)*10000/100 + '%',

                                        cpu_available: Math.floor(data.cpu_limit.available/1024*100)/100,
                                        cpu_AlreadyUsed: Math.floor(data.cpu_limit.used/1024*100)/100,
                                        cpu_Percentage: (data.cpu_limit.used/data.cpu_limit.max)*10000/100 + '%',
                                        
                                        net_available: Math.floor(data.net_limit.available/1024*100)/100,
                                        net_AlreadyUsed: Math.floor(data.net_limit.used/1024*100)/100,
                                        net_Percentage: (data.net_limit.used/data.net_limit.max)*10000/100 + '%',
                                    })
                                }
                            } catch (e) {
                            
                            }
                        }
                    });
                    this.props.dispatch({ type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.navigation.state.params.account_name, symbol: 'EOS' }, 
                        callback: (data) => {
                            //alert(JSON.stringify(data));
                            if (data && data.code == '0') {
                                if (data.data == "") {
                                    this.setState({
                                        balance: '0',
                                    })
                                } else {
                                    this.setState({ 
                                      balance: data.data.replace("EOS", ""), 
                                    })
                                }
                            } else {
                                EasyToast.show('获取余额失败：' + data.msg);
                            }
                        }
                    })
                }
            });
        } catch (error) {
            this.setState({ logRefreshing: false })
        }
    }

    cpu_chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = this.state.balance;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        try {
        value = parseFloat(obj);
        } catch (error) {
        value = 0.0000;
        }
        if(value < min){
            this.setState({ errortext: '输入错误' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            obj = "";
        }else if(value > max){
            this.setState({ errortext: 'EOS余额不足' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            obj = "";
        }
        return obj;
    }

    net_chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = this.state.balance - this.state.cpu_delegateb;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        try {
            value = parseFloat(obj);
        } catch (error) {
            value = 0.0000;
        }
        if(value < min){
            this.setState({ errortext: '输入错误' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            obj = "";
            return obj;
        }else if(value > max){
            this.setState({ errortext: 'EOS余额不足' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            obj = "";
            return obj;
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

    // 抵押
    delegateb = () => {
        if(!this.props.defaultWallet){
            this.setState({ errortext: '请先创建钱包' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            return;
        }
        if (this.state.cpu_delegateb == "" && this.state.net_delegateb == "") {
            this.setState({ errortext: '请输入抵押的EOS数量' });
            setTimeout(() => {
                this.setState({ errortext: '' });
            }, 2000);
            return;
        }
        if(this.chkAmountIsZero(this.state.cpu_delegateb,'请输入抵押的EOS数量')){
            this.setState({ cpu_delegateb: "" })
            return ;
        }
        if(this.chkAmountIsZero(this.state.net_delegateb,'请输入抵押的EOS数量')){
            this.setState({ net_delegateb: "" })
            return ;
        }
        this. dismissKeyboardClick();
        this._setModalVisible();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}  
                placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <View style={{flexDirection: 'row',}}>
                  <Text style={[styles.inptpasstext,{color: UColor.lightgray}]}>CPU抵押 {this.state.cpu_delegateb} EOS</Text>
                  <Text style={[styles.inptpasstext,{color: UColor.lightgray}]}>NET抵押 {this.state.net_delegateb} EOS</Text>
                </View>
        </View>
        EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            EasyShowLD.loadingShow();
            try {
                var bytes_privateKey;
                var plaintext_privateKey;
                var permission = 'active';

                try {
                    var privateKey = this.props.defaultWallet.activePrivate;
                    bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                    plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                    if(plaintext_privateKey == "eostoken"){ // active私钥为空时使用owner私钥
                        bytes_privateKey = CryptoJS.AES.decrypt(this.props.defaultWallet.ownerPrivate, this.state.password + this.props.defaultWallet.salt);
                        plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                        permission = "owner"; 
                    }
                } catch (error) {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                    return;
                }
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // 计算 网络
                    Eos.transaction({
                        actions: [
                            {
                                account: "eosio",
                                name: "delegatebw", 
                                authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: permission,
                                }], 
                                data: {
                                    from: this.props.defaultWallet.account,
                                    receiver: this.props.defaultWallet.account,
                                    stake_cpu_quantity: formatEosQua(this.state.cpu_delegateb + " EOS"),
                                    stake_net_quantity: formatEosQua(this.state.net_delegateb + " EOS"),
                                    transfer: 0,
                                }
                            },
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.isSuccess){
                            EasyToast.show("抵押成功");
                            this.onRefresh();
                        }else{
                            if(r.data){
                                if(r.data.code){
                                    var errcode = r.data.code;
                                    if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                        this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
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
                                    EasyToast.show("1" + r.data.msg);
                                }else{
                                    EasyToast.show("抵押失败");
                                }
                            }else{
                                EasyToast.show("抵押失败");
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
  
    //跳转内存计算网络
    onPress(key, data = {}) {
        const { navigate } = this.props.navigation;
        if (key == 'Memory') {
            navigate('Resources', {account_name: this.props.navigation.state.params.account_name, Memory: true, Calculation: false, Network: false });
        }else if (key == 'Calculation') {
            navigate('Resources', {account_name: this.props.navigation.state.params.account_name, Memory: false, Calculation: true, Network: false });
        }else if (key == 'Network') {
            navigate('Resources', {account_name: this.props.navigation.state.params.account_name, Memory: false, Calculation: false, Network: true });
        }
    }

     // 显示/隐藏 modal  
     _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
 
    //键盘收回
    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (<View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
                <Header {...this.props} onPressLeft={true} title="资源管理" onPressRight={this.recordMortgage.bind()} avatar={UImage.Mortgage_record} imgWidth={ScreenUtil.autowidth(20)} imgHeight={ScreenUtil.autowidth(20)}/> 
                <ScrollView  refreshControl={ <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefresh()} 
                    tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/> }>
                    <View style={{paddingTop: ScreenUtil.autowidth(10),}}>
                        <View style={{marginHorizontal: ScreenUtil.autowidth(15), marginVertical: ScreenUtil.autowidth(10), backgroundColor: UColor.baseline, borderRadius: 5,}}>
                            <TouchableOpacity onPress={this.onPress.bind(this, 'Memory')} style={{backgroundColor: UColor.mainColor, paddingHorizontal: ScreenUtil.autowidth(20), paddingVertical: ScreenUtil.autowidth(30), marginBottom: ScreenUtil.autowidth(5), borderRadius: 5, }}>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(16),}}>内存资源(RAM)</Text>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={18} />
                                </View>
                                <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10, marginVertical: ScreenUtil.autowidth(25),}}>
                                    <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.ram_Percentage}/>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fontColor}}>已用{this.state.ram_AlreadyUsed}</Text>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.arrow}}>可用{this.state.ram_available}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginHorizontal: ScreenUtil.autowidth(15), marginVertical: ScreenUtil.autowidth(10), backgroundColor: UColor.baseline, borderRadius: 5,}}>
                            <TouchableOpacity onPress={this.onPress.bind(this, 'Calculation')} style={{backgroundColor: UColor.mainColor, paddingHorizontal: ScreenUtil.autowidth(20), paddingVertical: ScreenUtil.autowidth(30), marginBottom: ScreenUtil.autowidth(5), borderRadius: 5, }}>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(16),}}>计算资源(CPU)</Text>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={18} />
                                </View>
                                <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10, marginVertical: ScreenUtil.autowidth(25),}}>
                                    <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.cpu_Percentage}/>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fontColor}}>已用{this.state.cpu_AlreadyUsed}</Text>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.arrow}}>可用{this.state.cpu_available}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginHorizontal: ScreenUtil.autowidth(15), marginVertical: ScreenUtil.autowidth(10), backgroundColor: UColor.baseline, borderRadius: 5,}}>
                            <TouchableOpacity onPress={this.onPress.bind(this, 'Network')} style={{backgroundColor: UColor.mainColor, paddingHorizontal: ScreenUtil.autowidth(20), paddingVertical: ScreenUtil.autowidth(30), marginBottom: ScreenUtil.autowidth(5), borderRadius: 5, }}>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(16),}}>网络资源(NET)</Text>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={18} />
                                </View>
                                <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.riceWhite, borderRadius: 10, marginVertical: ScreenUtil.autowidth(25),}}>
                                    <View style={{height: ScreenUtil.autowidth(10), backgroundColor: UColor.tintColor, borderRadius: 10,}} width={this.state.net_Percentage}/>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.tintColor,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fontColor}}>已用{this.state.net_AlreadyUsed}</Text>
                                    <View style={{width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6), marginHorizontal: ScreenUtil.autowidth(5), borderRadius: 25, backgroundColor: UColor.arrow,}}/>
                                    <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.arrow}}>可用{this.state.net_available}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Button style={{alignItems: 'center', }}>
                            <View style={{borderBottomColor: UColor.tintColor, borderBottomWidth: 1,}}>
                                <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.tintColor,borderBottomColor: UColor.tintColor, borderBottomWidth: 1,}}>什么是一键抵押？</Text>
                            </View>
                        </Button>
                        <Button onPress={() => this._setModalVisible()} style={{marginHorizontal: ScreenUtil.autowidth(15), marginVertical: ScreenUtil.autoheight(22),}}>
                            <View style={[styles.createWalletout,{backgroundColor: UColor.tintColor,}]} >
                                <Text style={[styles.createWallet,{color: UColor.btnColor}]}>一键抵押</Text>
                            </View>
                        </Button>
                    </View>
                </ScrollView>
               
                <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <TouchableOpacity style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={{ width: ScreenWidth-ScreenUtil.autowidth(96), backgroundColor: UColor.btnColor, }}>
                            <View style={styles.outsource}>
                                <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>抵押账户：</Text>
                                <Text style={[styles.inptTitle,{color: UColor.arrow}]}>{this.props.navigation.state.params.account_name}</Text>
                            </View>
                            <View style={styles.outsource}>
                                <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>计算资源：</Text>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.cpu_delegateb} returnKeyType="go" 
                                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow,borderBottomColor: UColor.arrow,}]}  
                                underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15} placeholderTextColor={UColor.inputtip}
                                onChangeText={(cpu_delegateb) => this.setState({ cpu_delegateb: this.cpu_chkPrice(cpu_delegateb)})}
                                />
                            </View>
                            <View style={styles.outsource}>
                                <Text style={[styles.inptTitle,{color: UColor.fontColor}]}>网络资源：</Text>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.net_delegateb} returnKeyType="go" 
                                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow,borderBottomColor: UColor.arrow,}]}  
                                underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15} placeholderTextColor={UColor.inputtip}
                                onChangeText={(net_delegateb) => this.setState({ net_delegateb: this.net_chkPrice(net_delegateb)})}
                                />
                            </View>
                            <View style={{height: ScreenUtil.autowidth(20),  alignItems: 'center', justifyContent: 'center', paddingHorizontal: ScreenUtil.autowidth(25)}}>
                                <Text style={{fontSize: ScreenUtil.setSpText(12),color: UColor.showy}}>{this.state.errortext}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end',}}>
                                <Button onPress={() => { this._setModalVisible() }}>
                                    <Text style={[styles.btntext,{color: UColor.tintColor}]}>取消</Text>
                                </Button>
                                <Button onPress={() => { this.delegateb() }}>
                                    <Text style={[styles.btntext,{color: UColor.tintColor}]}>确认</Text>
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

    createWalletout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(50),
    },
    createWallet: {
        fontSize: ScreenUtil.setSpText(18),
    },




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
        alignItems: 'center',   
        justifyContent: 'center', 
    },  
    tablayout: {   
        alignItems: 'center',
        flexDirection: 'row',  
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },  
    memorytab: {
        flex: 1,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        height: ScreenUtil.autoheight(33),
    },
    calculationtab: {
        flex: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
        height: ScreenUtil.autoheight(33),
    },
    networktab: {
        flex: 1,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        height: ScreenUtil.autoheight(33),
    },
    tabText: {  
        fontSize: ScreenUtil.setSpText(14),
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
        flexDirection: 'row',
        width: (ScreenWidth - 20) / 2,
        paddingHorizontal: ScreenUtil.autowidth(18),
    },
    inptoutsource: {
        justifyContent: 'center',
        paddingBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    outsource: {
        flexDirection: 'row',  
        alignItems: 'center',
        paddingTop: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autowidth(25)
    },
    inpt: {
        flex: 1, 
        borderBottomWidth: 0.5,
        fontSize: ScreenUtil.setSpText(16), 
    },
    inptTitle: {
        fontSize: ScreenUtil.setSpText(16),  
        //lineHeight: ScreenUtil.autoheight(25),
    },
    inptTitlered: {
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(35),
    },
    botnimg: {
        alignItems: 'flex-end',
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(86), 
        height: ScreenUtil.autoheight(38), 
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    botn: {
        borderRadius: 3, 
        alignItems: 'center',
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(70), 
        height: ScreenUtil.autoheight(32),  
        marginLeft: ScreenUtil.autowidth(10), 
    },
    botText: {
        fontSize: ScreenUtil.setSpText(17), 
    },
    basc: {
        flex: 1,
        padding: ScreenUtil.autoheight(10),
    },
    basctextright :{
        textAlign: 'right',
        borderBottomWidth: 1,
        flexDirection: 'row',  
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(20),
    },
    basctext :{
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(25),
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



    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center', 
    },
    subView: {
        flexDirection: "row", 
        alignItems: 'center',
        height: ScreenUtil.autoheight(50), 
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center', 
    },
    buttontext: {
        textAlign: 'center',
        width: ScreenUtil.autowidth(50),
        fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
        flex: 1,
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
    },
    btnoutsource: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(45),
        marginVertical: ScreenUtil.autowidth(10),
        marginHorizontal: ScreenUtil.autoheight(15),
    },
    btntext: {
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingTop: ScreenUtil.autowidth(10),
        paddingBottom: ScreenUtil.autowidth(20),
        fontSize: ScreenUtil.setSpText(18),
    },
})
export default Resources;