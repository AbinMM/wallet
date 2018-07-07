import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight,TouchableOpacity,KeyboardAvoidingView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class TurnOutAsset extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: '转出' + params.coins.asset.name,
            // headerTitle: '转出EOS',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
            },
        };
    };

    //组件加载完成
    componentDidMount() {
        const c = this.props.navigation;
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                if (data != null && data.defaultWallet.account != null) {
                    this.getBalance(data);
                } else {
                    EasyToast.show('获取账号信息失败');
                }
            }
        });
        var params = this.props.navigation.state.params.coins;
        this.setState({
            toAccount: params.toaccount,
            amount: params.amount == null ? '' : params.amount,
            name: params.name,
        })
        DeviceEventEmitter.addListener('scan_result', (data) => {
            this.setState({toAccount:data.toaccount})
          });
    }

    componentWillUnmount(){
        DeviceEventEmitter.removeListener('scan_result');
      }

    getBalance(data) {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: this.props.navigation.state.params.coins.asset.contractAccount, account: data.defaultWallet.account, symbol: this.props.navigation.state.params.coins.asset.name }, callback: (data) => {
                if (data.code == '0') {
                    if (data.data == "") {
                        this.setState({ balance: '0.0000' })
                    } else {
                        this.setState({ balance: data.data })
                    }
                } else {
                    // EasyToast.show('获取余额失败：' + data.msg);
                }
            }
        })
    }

    onPress(action) {
        EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }

    _rightButtonClick() {
        //   console.log('右侧按钮点击了');  
        this._setModalVisible();
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
            balance: 0,
            name: '',
        };
    }

    goPage(coinType) {
        const { navigate } = this.props.navigation;
        navigate('Thin', { coinType });
    }
    inputPwd = () => {

        if (this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;
        }
        if (this.state.toAccount.length > 12) {
            EasyToast.show('请输入正确的收款账号');
            return;
        }
        if (this.state.amount == "") {
            EasyToast.show('请输入转账数量');
            return;
        }

        // if (this.state.amount > this.state.balance) {
        //     EasyToast.show('转账金额超出账户余额');
        //     return;
        // }

        this._setModalVisible();

        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyDialog.show("密码", view, "确认", "取消", () => {

            if (this.state.password == "") {
                EasyToast.show('请输入密码');
                return;
            }
            EasyLoading.show();
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transfer(this.props.navigation.state.params.coins.asset.contractAccount, this.props.defaultWallet.account, this.state.toAccount, this.state.amount + " " + this.props.navigation.state.params.coins.asset.name, this.state.memo, plaintext_privateKey, false, (r) => {
                        this.props.dispatch({
                            // type: 'wallet/pushTransaction', payload: { to: this.state.toAccount, amount: this.state.amount, from: this.props.defaultWallet.account, data: r.data.transaction }, callback: (data) => {
                            type: 'wallet/pushTransaction', payload: { to: this.state.toAccount, amount: this.state.amount, from: this.props.defaultWallet.account, data: JSON.stringify(r.data.transaction) }, callback: (result) => {
                                EasyLoading.dismis();
                                if (result.code == '0') {
                                    AnalyticsUtil.onEvent('Turn_out');
                                    EasyToast.show('交易成功');
                                    DeviceEventEmitter.emit('transaction_success');
                                    this.props.navigation.goBack();
                                } else {
                                    EasyToast.show('交易失败');
                                }
                            }
                        });
                    });
                    //     }
                    // });
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    chkLast(obj) {
        if (obj.substr((obj.length - 1), 1) == '.') {
            obj = obj.substr(0, (obj.length - 1));
        }
    }

    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");
        obj = obj.replace(/^\./g, "");
        obj = obj.replace(/\.{2,}/g, ".");
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        return obj;
    }

    clearFoucs = () => {
        this._raccount.blur();
        this._lpass.blur();
    }
    scan() {
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true});
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        const c = this.props.navigation.state.params.coins;
        return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView  keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.header}>
                            <Text style={styles.headertext}>{this.state.balance}</Text>
                            {/* <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 5 }}>≈ {c.value} ￥</Text> */}
                        </View>

                        <View style={styles.taboutsource}>
                            <View style={styles.outsource}>
                                <View style={styles.inptoutsource}>
                                    <View style={styles.accountoue} >
                                        <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}      
                                            placeholder="收款人账号" underlineColorAndroid="transparent" keyboardType="default"  
                                            onChangeText={(toAccount) => this.setState({ toAccount })} 
                                        />
                                    <View style={styles.scanning}>
                                            <Button onPress={() => this.scan()}>                                  
                                                <Image source={UImage.scan} style={styles.scanningimg} />                                 
                                            </Button>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow} 
                                        placeholder="转账金额"  underlineColorAndroid="transparent"   keyboardType="numeric"
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow}
                                        placeholder="备注(MEMO)" underlineColorAndroid="transparent" keyboardType="default" maxLength={20} 
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                                    <View style={styles.nextstep}>
                                        <Text style={styles.nextsteptext}>下一步</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
                <View style={styles.pupuo}>
                    <Modal animationType='none' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                        <View style={styles.modalStyle}>
                            <View style={styles.subView} >
                                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                                    <Text style={styles.buttontext}>×</Text>
                                </Button>
                                {/* <Text style={styles.titleText}>转出 {c.name}</Text> */}
                                <Text style={styles.contentText}>MEMO信息：{this.state.memo}</Text>
                                <Text style={styles.contentText}>转出地址：{this.state.toAccount}</Text>
                                <Text style={styles.contentText}> 数量：{this.state.amount}</Text>
                                <Button onPress={() => { this.inputPwd() }}>
                                    <View style={styles.btnoutsource}>
                                        <Text style={styles.btntext}>确认转出</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </Modal>
                </View>
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
        color: UColor.tintColor,
        height: 45,
        width: maxWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    header: {
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        backgroundColor: UColor.mainColor,
    },
    headertext: {
        fontSize: 20,
        color: UColor.fontColor
    },
    row: {
        height: 90,
        backgroundColor: UColor.mainColor,
        flexDirection: "column",
        padding: 10,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    footer: {
        height: 50,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },



    pupuo: {
        backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        backgroundColor: UColor.mask,  
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    // modal上子View的样式  
    subView: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: UColor.fontColor,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: UColor.baseline,
    },
    buttonView: {
        alignItems: 'flex-end',
    },
    buttontext: {
        width: 30,
        height: 30,
        color: '#CBCBCB',
        marginBottom: 0,
        fontSize: 28,
    },
    // 标题  
    titleText: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        marginLeft: 15,
        marginRight: 15,
        lineHeight: 30,
        fontSize: 14,
        textAlign: 'left',

    },
    // 按钮  
    btnoutsource: {
        margin: 10,
        height: 40,
        borderRadius: 6,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btntext: {
        fontSize: 16,
        color: UColor.fontColor
    },

   
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        backgroundColor: UColor.secdColor,
        flexDirection: 'column',
        padding: 20,
        flex: 1,
    },
    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        marginBottom: 10,
        paddingLeft: 10,
    },
    accountoue: {
        height: 40,
        flex: 1,
        justifyContent: 'center',
        flexDirection: "row",
    },

    inpt: {
        flex: 1,
        color: UColor.arrow,
        fontSize: 15,
        height: 40,
        paddingLeft: 2
    },
    scanning: {
        width: 30,
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: "flex-end",
        marginRight: 10
    },
    scanningimg: {
        width:30,
        height:30,
        justifyContent: 'center', 
        alignItems: 'center'
    },
    textinptoue: {
        paddingLeft: 10,
        height: 40,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        justifyContent: 'center',
    },

    separate: {
        height: 0.5,
        backgroundColor: UColor.secdColor
    },

    textinpt: {
        color: UColor.arrow,
        fontSize: 15,
        height: 40,
        paddingLeft: 2
    },
    btnnextstep: {
        height: 85,
        marginTop: 60,
    },
    nextstep: {
        height: 45,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 5
    },
    nextsteptext: {
        fontSize: 15,
        color: UColor.fontColor
    }


})
export default TurnOutAsset;