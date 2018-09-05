import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, StyleSheet, Image, ScrollView, View, Text, TextInput, Platform, Dimensions, Modal, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants';
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {formatEosQua} from '../../utils/FormatUtil';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class TurnOutAsset extends BaseComponent {
    static navigationOptions = {
        headerTitle: '转出' ,
        header:null, 
    };

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

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.name});
    }

    //组件加载完成
    componentDidMount() {
        var params = this.props.navigation.state.params.coins;
        var tmpbalance = this.props.navigation.state.params.balance;
        this.setState({
            toAccount: params.toaccount == null ? '' : params.toaccount,
            amount: params.amount == null ? '' : params.amount,
            name: params.asset.name,
            balance: tmpbalance == null ? '0.0000' : tmpbalance,
            password:''
        })
        DeviceEventEmitter.addListener('scan_result', (data) => {
            try {
                //TODO: 开启扫码已做检测判断资产类型是否匹配，在此不必判断,this.state.name取值不准。
                // if(data.symbol){
                //     var tmpname = this.state.name;
                //     if(data.symbol != tmpname){
                //         EasyToast.show('扫码转账资产不匹配，请确认再转');
                //         return ;
                //     }
                // }
                if(data.toaccount){
                    this.setState({toAccount:data.toaccount});
                }
                if(data.amount){
                    this.setState({amount:data.amount})
                }
            } catch (error) {
            }
        });        

        DeviceEventEmitter.addListener('transfer_scan_result', (data) => {
            this.setState({toAccount:data.toaccount});
        });
    }

    openAddressBook() {
        const { navigate } = this.props.navigation;
        navigate('addressManage', {isTurnOut:true,coinType:this.state.name});
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        DeviceEventEmitter.removeListener('scan_result');
    }

    onPress(action) {
        EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }

    _rightButtonClick() {
        //   console.log('右侧按钮点击了');  
        if (this.state.toAccount == null || this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;  
        }
        if (this.state.amount == null || this.state.amount == "") {
            EasyToast.show('请输入转账金额');
            return;
        }
        var value;
        var floatbalance;
        try {
            value = parseFloat(this.state.amount);
            floatbalance = parseFloat(this.state.balance);
          } catch (error) {
            value = 0;
          }
        if(value <= 0){
            this.setState({ amount: "" })
            EasyToast.show('请输入转账金额');
            return ;
        }
        if(value > floatbalance){
            this.setState({ amount: "" })
            EasyToast.show('账户余额不足,请重输');
            return ;
        }
        this._setModalVisible();
        this.clearFoucs();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    goPage(coinType) {
        const { navigate } = this.props.navigation;
        navigate('addressManage', { coinType });
    }

    inputPwd = () => {
        this._setModalVisible();
        const view =
            <View style={styles.passout}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}  
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
            if (!this.state.password || this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    EasyShowLD.loadingShow();
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transfer(this.props.navigation.state.params.coins.asset.contractAccount, this.props.defaultWallet.account, this.state.toAccount, formatEosQua(this.state.amount + " " + this.props.navigation.state.params.coins.asset.name, this.props.navigation.state.params.coins.asset.precisionNumber), this.state.memo, plaintext_privateKey, true, (r) => {
                        EasyShowLD.loadingClose();
                        if(r && r.isSuccess){
                            this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.props.defaultWallet.account, to: this.state.toAccount, amount: this.state.amount + " " + this.props.navigation.state.params.coins.asset.name, memo: this.state.memo, data: "push"}});
                            AnalyticsUtil.onEvent('Turn_out');
                            EasyToast.show('交易成功');
                            DeviceEventEmitter.emit('transaction_success');
                            this.props.navigation.goBack();
                        }else{
                            if(r && r.data){
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
                                                <Text style={[styles.Explain,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                <Text style={[styles.Explain,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                            </View>
                                            EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                
                                            const { navigate } = this.props.navigation;
                                            navigate('FreeMortgage', {});
                                            // EasyShowLD.dialogClose();
                                            }, () => { EasyShowLD.dialogClose() });
                                        }
                                    }});
                                    }
                                }
                                if(r.data.msg){
                                    EasyToast.show(r.data.msg);
                                }else{
                                    EasyToast.show("交易失败");
                                }
                            }else{
                                EasyToast.show("交易失败");
                            }
                        }
                    });
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
            // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    }

    chkLast(obj) {
        if (obj.substr((obj.length - 1), 1) == '.') {
            obj = obj.substr(0, (obj.length - 1));
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
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('收款账户和转出账户不能相同，请重输');
            obj = "";
        }
        return obj;
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

    clearFoucs = () => {
        this._raccount.blur();
        // this._lpass.blur();
        this._ramount.blur();
        this._rnote.blur();
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        const c = this.props.navigation.state.params.coins;
        return (
        <View style={[styles.container,{backgroundColor:UColor.secdfont}]}>
            <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.coins.asset.name} avatar={UImage.scan} onPressRight={this._rightTopClick.bind()}/>
            <ScrollView  keyboardShouldPersistTaps="always">
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>
                            <Text style={[styles.headertext,{color: UColor.fontColor}]}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} {c.asset.name}</Text>
                            {/* <Text style={styles.rowtext}>≈ {c.value} ￥</Text> */}
                        </View>
                        <View style={styles.taboutsource}>
                            <View style={[styles.outsource,{backgroundColor:UColor.secdfont}]}>
                                <View style={[styles.inptoutsource,{borderBottomColor:UColor.mainsecd}]}>
                                    <View style={styles.accountoue} >
                                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>账户名称</Text>
                                        <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                            selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow}      
                                            placeholder="收款人账号" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                            onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                                        />
                                    </View>
                                    <View style={styles.scanning}>
                                        <Button onPress={() => this.openAddressBook()}>                                  
                                            <Image source={UImage.al} style={styles.scanningimg} />                                 
                                        </Button>
                                    </View>
                                </View>
                                <View style={[styles.textinptoue,{borderBottomColor:UColor.mainsecd}]} >
                                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>转账数量</Text>
                                    <TextInput  ref={(ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                                        placeholder="转账数量"  underlineColorAndroid="transparent"   keyboardType="numeric"   maxLength = {15}
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={[styles.textinptoue,{borderBottomColor:UColor.mainsecd}]} >
                                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>备注</Text>
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.arrow}
                                        placeholder="Memo" underlineColorAndroid="transparent" keyboardType="default"  
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <Image source={UImage.warning} style={styles.imgBtn} />
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>温馨提示：如果您是向交易所转账，请务必填写相应的备注（MEMO）信息，否则可能无法到账。</Text>
                </View>
                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                    <View style={[styles.nextstep,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.nextsteptext,{color: UColor.btnColor}]}>下一步</Text>
                    </View>
                </Button>
            </ScrollView>
            <View style={{backgroundColor: UColor.riceWhite,}}>
                <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <TouchableOpacity style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
                        <View style={{ width: ScreenWidth, height: ScreenHeight*4/6, backgroundColor: UColor.btnColor,}}>
                                <View style={styles.subView}>
                                    <Text style={styles.buttontext}/>
                                    <Text style={[styles.titleText,{color: UColor.blackColor}]}>订单详情</Text>
                                    <Button  onPress={this._setModalVisible.bind(this)} style={styles.buttonView}>
                                        <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                                    </Button>
                                </View>
                                <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                    <Text style={[styles.amounttext,{color:UColor.blackColor}]}>{this.state.amount} </Text>
                                    <Text style={[styles.unittext,{color:UColor.blackColor}]}> {c.asset.name}</Text>
                                </View>
                                <View style={{flex: 1,}}>
                                    <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                        <Text style={[styles.explainText,{color: UColor.startup}]}>收款账户：</Text>
                                        <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.toAccount}</Text>
                                    </View>
                                    <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                        <Text style={[styles.explainText,{color: UColor.startup}]}>转出账户：</Text>
                                        <Text style={[styles.contentText,{color: UColor.startup}]}>{this.props.defaultWallet.account}</Text>
                                    </View>
                                    <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                        <Text style={[styles.explainText,{color: UColor.startup}]}>备注：</Text> 
                                        <Text style={[styles.contentText,{color: UColor.startup}]} numberOfLines={1}>{this.state.memo}</Text> 
                                    </View>

                                    {this.state.memo== ""&&
                                    <View style={styles.warningoutShow}>
                                        <Image source={UImage.warning} style={styles.imgBtn} />
                                        <Text style={styles.headtitle}>温馨提示：如果您是向交易所转账，请务必填写相应的备注（MEMO）信息，否则可能无法到账。</Text>
                                    </View>}
                                    
                                    <Button onPress={() => { this.inputPwd() }}>
                                        <View style={styles.btnoutsource}>
                                            <Text style={styles.btntext}>确认</Text>
                                        </View>
                                    </Button>
                                </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
        )
    }
}
const styles = StyleSheet.create({
    passout: {
        flexDirection: 'column', 
        alignItems: 'center',
    },
    inptpass: {
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    Explainout: {
        flexDirection: 'column', 
        alignItems: 'flex-start'
    },
    Explain: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30), 
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    header: {
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        margin: ScreenUtil.autowidth(5),
        height: ScreenUtil.autoheight(110),
    },
    headertext: {
        fontSize: ScreenUtil.setSpText(20),
    },
    rowtext: {
        fontSize: ScreenUtil.setSpText(14), 
        marginTop: ScreenUtil.autoheight(5),
    },
    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-end', 
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
        fontWeight: 'bold',
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
    },
    explainText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(18),
    },
    contentText: {
        flex: 1,
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(18),
    },
    separationline: {
        alignItems: 'center',
        flexDirection: "row",
        borderBottomWidth: 0.5,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    amounttext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(25),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(15), 
    },
    unittext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(13),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(10), 
    },
    btnoutsource: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        marginTop: ScreenUtil.autoheight(20),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
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
    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingLeft: ScreenUtil.autowidth(5),
        marginBottom: ScreenUtil.autoheight(10),
    },
    accountoue: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: "column",
    },
    inpt: {
        flex: 1,
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
    },
    scanning: {
        alignSelf: 'center',
        justifyContent: "center",
        width: ScreenUtil.autowidth(40),
    },
    scanningimg: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
    },
    textinptoue: {
        borderBottomWidth: 1,
        justifyContent: 'center',
        marginBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
    },
    textinpt: {
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
    },
    btnnextstep: {
        height: ScreenUtil.autoheight(85),
        marginTop: ScreenUtil.autoheight(30),
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
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center', 
        flexDirection: "row",
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(5),
        marginVertical: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(20),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    warningoutShow: {
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "row",
        alignItems: 'center',
        width: ScreenWidth-40,
        marginTop: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(20),
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
    },
    headtitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(12),
        paddingLeft: ScreenUtil.autowidth(10),
        lineHeight:  ScreenUtil.autoheight(20),
    },
})
export default TurnOutAsset;