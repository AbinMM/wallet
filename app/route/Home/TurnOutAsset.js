import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, StyleSheet, Image, ScrollView, View, Text, TextInput, Platform, Dimensions, Modal,TouchableHighlight, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {formatEosQua} from '../../utils/FormatUtil';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'

import TextButton from '../../components/TextButton';

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet, assets,addressBook }) => ({ ...wallet, ...assets,...addressBook }))
class TurnOutAsset extends BaseComponent {
    static navigationOptions = {
        headerTitle: '转账' ,
        header:null,
    };

     // 构造函数
     constructor(props) {
        super(props);
        // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            // dataSource: ds.cloneWithRows([]),
            show: false,
            toAccount: '', // 账户名称
            amount: '', // 转账金额
            memo: '', // 备注
            balance: '0', // 代币余额
            name: '', // 代币名称
            tokenvalue: '', // 代币兑换比率
            tokenicon: "http://news.eostoken.im/images/20180319/1521432637907.png", // 代币图标
            contractAccount: "eosio.token", // 契约帐户
            precisionNumber: '0', // 代币经度
            Choicesymbol: this.props.navigation.state.params.Choicesymbol, // 是否具有选择代币功能
            getbalance: this.props.navigation.state.params.getbalance, // 扫码and页面进来
        };
    }

    //扫码
    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,});
    }

    //组件加载完成
    componentDidMount() {
        this.props.dispatch({ type: 'addressBook/addressInfo'});
        this.props.dispatch({ type: 'wallet/getDefaultWallet', callback: (data) => {}})
        var params = this.props.navigation.state.params.coins;
        if(this.state.getbalance){
            this.setState({
                name: params.asset.name,
                balance: params.balance.replace(params.asset.name, ""),
                tokenvalue: params.asset.value,
                tokenicon: params.asset.icon,
                contractAccount: params.asset.contractAccount,
                precisionNumber: params.asset.precisionNumber,
            })
        }else{
            this.getBalance(params);
            this.setState({
                toAccount: params.toaccount,
                amount: params.amount,
                name: params.symbol,
            })
        }

        //点击本页面的扫码返回的参数
        DeviceEventEmitter.addListener('scan_result', (data) => {
            this.getBalance(data);
            this.setState({
                toAccount: data.toaccount,
                amount: data.amount,
                name: data.symbol,
            })
        });

        //选择联系人返回的参数
        DeviceEventEmitter.addListener('transfer_scan_result', (data) => {
            this.setState({toAccount:data.toaccount});
        });

        //选择代币返回的参数
        DeviceEventEmitter.addListener('transfer_token_result', (data) => {
            this.setState({
                balance: data.balance.replace(data.asset.name, ""),
                name:data.asset.name,
                tokenvalue: data.asset.value,
                tokenicon:data.asset.icon,
                contractAccount: data.asset.contractAccount,
                precisionNumber: data.asset.precisionNumber,
            });
        });
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        DeviceEventEmitter.removeListener('scan_result');
    }

    //查询代币余额
    getBalance(data) {
        this.props.dispatch({
            type: 'assets/getmyAssetInfo', payload: { accountName: this.props.defaultWallet.account, symbol: data.symbol }, callback: (data) => {
                this.setState({
                    balance: data.balance.replace(data.asset.name, ""),
                    name: data.asset.name,
                    tokenvalue: data.asset.value,
                    tokenicon: data.asset.icon,
                    contractAccount: data.asset.contractAccount,
                    precisionNumber: data.asset.precisionNumber,
                });
            }
        })
    }


    //选择联系人
    openAddressBook() {
        const { navigate } = this.props.navigation;
        navigate('addressManage', {isTurnOut:true,coinType:this.state.name,callback:(resp)=>{
            if(resp && resp.length > 0){
                this.setState({ toAccount: resp[0].address});
            }
        }});
    }

    //选择代币
    openChoiceToken() {
        const { navigate } = this.props.navigation;
        navigate('ChoiceToken', {isTurnOut:true,coinType:this.state.name});
    }

    //下一步
    _rightButtonClick() {
        if (this.state.toAccount == null || this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;
        }
        if (this.state.amount == null || this.state.amount == "") {
            EasyToast.show('请输入转账数量');
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
            EasyToast.show('请输入转账数量');
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
    addToAddressManage()
    {
        var isAdd = true;
        if(this.props.addressBook && this.props.addressBook.length > 0)
        {
            for(var i = 0;i < this.props.addressBook.length;i++){
                if(this.props.addressBook[i].address == this.state.toAccount)
                {
                    isAdd = false;
                    break;
                }
            }
        }

        if(isAdd){
            this.props.dispatch({ type: 'addressBook/saveAddress', payload: { address: this.state.toAccount, labelName: this.state.toAccount } });
        }

    }

    inputPwd = () => {
        this._setModalVisible();
        AuthModal.show(this.props.defaultWallet.account, (resp) => {
            if(resp && resp.isOk)
            {
            try {
                EasyShowLD.loadingShow();
                Eos.transaction({
                    actions: [
                        {
                            account: this.state.contractAccount,
                            name: "transfer",
                            authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: resp.permission,
                            }],
                            data: {
                                from: this.props.defaultWallet.account,
                                to: this.state.toAccount,
                                quantity: formatEosQua(this.state.amount + " " + this.state.name, this.state.precisionNumber),
                                memo: this.state.memo,
                            }
                        },
                    ]
                }, resp.pk, (r) => {
                    EasyShowLD.loadingClose();
                    if(r && r.isSuccess){
                        this.addToAddressManage();
                        this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.props.defaultWallet.account, to: this.state.toAccount, amount: this.state.amount + " " + this.state.name, memo: this.state.memo, data: "push"}});
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
            } catch (error) {
                EasyToast.show('未知异常');
                EasyShowLD.loadingClose();
            }
            }

        });
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
        return (
        <View style={[styles.container,{backgroundColor:'#F9FAF9'}]}>
            <Header {...this.props} onPressLeft={true} title="转账" avatar={UImage.scan} onPressRight={this._rightTopClick.bind()} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/> 
            <ScrollView  keyboardShouldPersistTaps="always">
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.taboutsource}>
                            <View style={styles.accountoue} >
                                <Text style={[styles.inptitle,{flex: 1,}]}>收款账号</Text>
                                <TouchableOpacity onPress={() => this.openAddressBook()} style={styles.scanning}>
                                    <Image source={UImage.accountmange_01} style={styles.alningimg} />
                                </TouchableOpacity>
                            </View>
                            <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={[styles.textinpt]} placeholderTextColor={UColor.inputtip}
                                placeholder="请输入收款账号"   underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})}
                            />

                            <View style={styles.accountoue} >
                                <Text style={[styles.inptitle,{flex: 1,}]}>转账数量</Text>
                                <Text onPress={()=>{this.openChoiceToken()}}  style={[{fontSize: ScreenUtil.setSpText(12),},
                                    {lineHeight: ScreenUtil.autoheight(17),color: '#3B80F4',}]}>{this.state.name} ></Text>
                            </View>
                            <TextInput  ref={ (ref) => this._ramount = ref} value={this.state.amount} selectionColor={UColor.tintColor}
                                style={[styles.textinpt]} maxLength = {15}  placeholder="请输入转账数量" 
                                placeholderTextColor={UColor.inputtip}  underlineColorAndroid="transparent"   keyboardType="numeric"
                                onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })} returnKeyType="next"
                            />
                            <Text style={{textAlign: 'right', fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: '#808080',marginTop: 2}}>{this.state.balance==""? "余额：0.0000" : "余额：" + this.state.balance +" "+ this.state.name}</Text>
                          
                            <Text style={[styles.inptitle]}>备注(Memo)</Text>
                            <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next" maxLength = {40}
                                selectionColor={UColor.tintColor} style={[styles.textinpt]}  placeholderTextColor={UColor.inputtip}
                                underlineColorAndroid="transparent" keyboardType="default"  placeholder="备注(Memo)" 
                                onChangeText={(memo) => this.setState({ memo })}
                            />
                            <Text style={{fontSize: ScreenUtil.setSpText(10),lineHeight: ScreenUtil.autoheight(14),color: '#808080', textAlign: 'right',marginTop: 2}}>转入交易所时请务必填写正确的Memo</Text>

                            <View style={{justifyContent: 'center', alignItems:'center',   marginHorizontal: ScreenUtil.autowidth(15),marginTop:ScreenUtil.autoheight(36), marginBottom: ScreenUtil.autoheight(20),}}>
                                <TextButton text="确认转账" onPress={this._rightButtonClick.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
             
               
            </ScrollView>
            <View style={{backgroundColor: UColor.riceWhite,}}>
                <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <TouchableOpacity style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0} onPress={() => this._setModalVisible()}>
                        <View style={{ width: ScreenWidth, backgroundColor: UColor.btnColor,}}>
                            <View style={styles.subView}>
                                <TouchableOpacity style={styles.LeftBack} onPress={() => this._setModalVisible()}>
                                    <Ionicons style={{color:'#080808'}} name="ios-arrow-back" size={ScreenUtil.setSpText(25)}/>
                                </TouchableOpacity>
                                 <Text style={styles.modualTitle}>订单详情</Text>
                                 <View style={{width: ScreenUtil.autowidth(40),}}/>
                            </View>

                            <View>
                                <View style={[styles.separationline,]} >
                                    <Text style={[styles.explainText]}>收款账户：</Text>
                                    <Text style={[styles.contentText]}>{this.state.toAccount}</Text>
                                </View>
                                <View style={[styles.separationline,]} >
                                    <Text style={[styles.explainText]}>付款账户：</Text>
                                    <Text style={[styles.contentText]}>{this.props.defaultWallet.account}</Text>
                                </View>
                                <View style={[styles.separationline,]} >
                                    <Text style={[styles.explainText]}>数        量：</Text>
                                    <Text style={[styles.contentText]} numberOfLines={1}>{this.state.amount + " " + this.state.name}</Text>
                                </View>
                                <View style={[styles.separationline,]} >
                                    <Text style={[styles.explainText]}>备        注：</Text>
                                    <Text style={[styles.contentText]} numberOfLines={1}>{this.state.memo}</Text>
                                </View>
                                { this.state.memo == '' &&
                                    <View style={[styles.warningoutShow,{borderColor: UColor.showy}]}>
                                        <Text style={[styles.headtitle,{color: '#3B80F4'}]}>• </Text>
                                        <Text style={[styles.headtitle,{flex: 1, marginLeft: ScreenUtil.autowidth(5),color: '#3B80F4'}]}>如果您是向交易所转账，请务必填写相应的备注（MEMO）信息，否则可能无法到账。</Text>
                                    </View>
                                }
                                <View style={[styles.btnoutsource]}>  
                                    <TextButton text="确认支付" onPress={this.inputPwd.bind(this)} textColor={UColor.btnColor} fontSize={ScreenUtil.autowidth(14)}　shadow={true} borderRadius={25} style={{width:ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42)}}></TextButton>
                                </View>
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
        width: ScreenWidth,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(50),
        marginTop:ScreenUtil.autoheight(2),
    },
    LeftBack: {
        width: ScreenUtil.autowidth(40), 
        paddingLeft:ScreenUtil.autowidth(20), 
        alignItems:"flex-start",
    },

    modualTitle: {
        flex: 1,  
        textAlign: "center",
        fontWeight: '600',
        fontSize: ScreenUtil.setSpText(20),
        color: '#323232',
    },

    explainText: {
        flex: 1.5,
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(23),
        color: '#323232',
    },
    contentText: {
        flex: 3.5,
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(23),
        color: '#808080',
    },
    separationline: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        marginHorizontal: ScreenUtil.autowidth(20),
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
        alignItems: 'center',
        justifyContent: 'center',
        // marginVertical: ScreenUtil.autowidth(10),
        marginBottom:ScreenUtil.autoheight(10),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        marginTop: ScreenUtil.autoheight(20),
        marginHorizontal: ScreenUtil.autowidth(15),
        paddingHorizontal: ScreenUtil.autowidth(20),
        borderRadius: 5,
    },

    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingLeft: ScreenUtil.autowidth(5),
        marginBottom: ScreenUtil.autoheight(10),
    },
    accountoue: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inpt: {
        flex: 1,
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
    },
    scanning: {
        alignSelf: 'center',
        justifyContent: "center",
    },
    scanningimg: {
        width: ScreenUtil.autowidth(19),
        height: ScreenUtil.autowidth(19),
    },
    alningimg: {
        width: ScreenUtil.autowidth(17),
        height: ScreenUtil.autowidth(15),
    },
    tokenText: {
        fontSize: ScreenUtil.setSpText(15),
        marginRight: ScreenUtil.autowidth(5),
    },
    textinptoue: {
        justifyContent: 'center',
        marginBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    inptitle: {
        color: '#323232',
        fontWeight: '300',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(23),
        marginVertical: ScreenUtil.autoheight(18),
    },
    textinpt: {
        flex: 1,
        color: '#808080',
        paddingVertical: 0,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(20),
        borderBottomColor: '#D5D5D5',
        borderBottomWidth:ScreenUtil.autowidth(1)
    },
    btnnextstep: {
        marginTop: ScreenUtil.autoheight(44),
        marginBottom: ScreenUtil.autowidth(25),
        // marginHorizontal: ScreenUtil.autowidth(16),
        // width:ScreenUtil.screenWidth/2,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    nextstep: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(50),
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(18),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "column",
        marginVertical: ScreenUtil.autoheight(10),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
        marginHorizontal:  ScreenUtil.autoheight(20),
    },
    warningoutShow: {
        alignItems: 'flex-start',
        flexDirection: "row",
        justifyContent: 'flex-start',
        paddingVertical:  ScreenUtil.autoheight(15),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    headtext: {
        fontWeight: "300",
        fontSize: ScreenUtil.setSpText(10),
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(10),
        lineHeight: ScreenUtil.autoheight(14),
       
    },
  
  
})
export default TurnOutAsset;