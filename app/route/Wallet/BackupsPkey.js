import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants';
import ScreenUtil from '../../utils/ScreenUtil'
import {NavigationActions} from 'react-navigation';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class BackupsPkey extends BaseComponent {

    static navigationOptions =  {
        headerTitle: '备份私钥',
        header:null,
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            ownerPk: '',
            activePk: '',
            show: false,
        }
    }

     //组件加载完成
     componentDidMount() {
         var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
         var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
         var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
         var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
        if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            this.setState({
                ownerPk: plaintext_words_owner.substr(8, plaintext_words_owner.length),
                activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
            })
        }
    }

    componentWillUnmount(){
        var entry = this.props.navigation.state.params.entry;
        if(entry == "createWallet"){
            this.pop(1, true);
        }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    }

    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }

    decryptWords = () => {
        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}    
                    placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent"/>
            </View>
        EasyShowLD.dialogShow("密码", view, "备份", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            try{
            var _words = this.props.navigation.state.params.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
            var words_active = this.props.navigation.state.params.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);
            if (plaintext_words.indexOf('eostoken') != -1) {
                plaintext_words = plaintext_words.substr(9, plaintext_words.length);
                var wordsArr = plaintext_words.split(',');
                plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
                var wordsArr_active = plaintext_words_active.split(',');
                this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            } else {
                EasyToast.show('密码错误');
            }
        }catch(e){
            EasyToast.show('密码错误');
        }
            EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    }

    dismissKeyboardClick() {
      dismissKeyboard();
    }

    checkClick() {
    this.setState({
        show: false
    });
    }

    prot(key, data = {}) {
        const { navigate } = this.props.navigation; 
        if(key == 'activePk'){
            Clipboard.setString(this.state.activePk);
            EasyToast.show('Active私钥已复制成功');
        } else if(key == 'ownerPk'){
          Clipboard.setString(this.state.ownerPk);
          EasyToast.show('Owner私钥已复制成功');
        }else  if(key == 'problem') {
          navigate('Web', { title: "什么是私钥", url: "http://news.eostoken.im/html/Keystore.html" });   
        }
    }

    nextStep() {
        const { navigate } = this.props.navigation;
        var entry = this.props.navigation.state.params.entry;
        var wallet = this.props.navigation.state.params.wallet;
        var password = this.props.navigation.state.params.password;
        navigate('BackupsAOkey', {wallet:wallet, password:password, entry: entry});
    }

    render() {
        return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
         <Header {...this.props} onPressLeft={true} title="备份私钥" />
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.scrollView}>
            <View style={[styles.header,{backgroundColor: UColor.secdColor}]}>
                <View style={[styles.inptoutbg,{backgroundColor: UColor.mainColor}]}>
                    <View style={styles.headout}>
                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>请立即备份您的私钥</Text>
                        <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                            <View style={{flexDirection: 'row',alignItems: 'center',}}>
                                <Image source={UImage.warning} style={styles.imgBtn} />
                                <Text style={[styles.significanttextHead,{color: UColor.showy}]} >安全警告</Text>
                            </View>
                            <Text style={[styles.headtitle,{color: UColor.showy}]}>私钥相当于您的银行卡密码，请妥善保管！（切勿截图、存储到网络硬盘、微信等传输！）</Text>
                        </View>
                    </View> 
                    {this.state.activePk != ''&& 
                    <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>Active私钥</Text>
                        <TouchableHighlight style={[styles.inptgo,{backgroundColor: UColor.secdColor}]} underlayColor={UColor.secdColor} onPress={this.prot.bind(this, 'activePk')}>
                            <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.activePk}</Text>
                        </TouchableHighlight>
                    </View>}  
                    {this.state.ownerPk != ''&&
                    <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                        <Text style={[styles.inptitle,{color: UColor.fontColor}]}>Owner私钥</Text>
                        <TouchableHighlight style={[styles.inptgo,{backgroundColor: UColor.secdColor}]} underlayColor={UColor.secdColor} onPress={this.prot.bind(this, 'ownerPk')}>
                            <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.ownerPk}</Text>
                        </TouchableHighlight>
                    </View>}
                </View>
                <Button onPress={this.prot.bind(this, 'problem')}>
                    <Text style={[styles.readtext,{color: UColor.tintColor}]} >什么是私钥？</Text> 
                </Button> 
                <Button onPress={() => this.nextStep()}>
                    <View style={[styles.importPriout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.importPritext,{color: UColor.btnColor}]}>下一步(已经抄好)</Text>
                    </View>
                </Button>
                <View style={styles.logout}>
                    <Image source={UImage.bottom_log} style={styles.logimg}/>
                    <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
                </View>
            </View>
        </TouchableOpacity>
         
    </View>)
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
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flex: 1,
        marginTop: ScreenUtil.autoheight(10),
    },
    inptoutbg: {
        marginBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    inptitle: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        width: ScreenWidth-40,
        flexDirection: "column",
        alignItems: 'center', 
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    significanttextHead: {
        fontWeight:"bold",
        fontSize: ScreenUtil.setSpText(16), 
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    inptoutgo: {
        paddingBottom: ScreenUtil.autoheight(15),
    },
    inptgo: {
        height: ScreenUtil.autoheight(60),
        paddingHorizontal: ScreenUtil.autowidth(10),
        width: ScreenWidth - ScreenUtil.autowidth(40),
    },
    inptext: {
        flexWrap: 'wrap',
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    readtext: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(15),
    },
    importPriout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        marginTop: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    importPritext: {
        fontSize: ScreenUtil.setSpText(15),
    },
    logout:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: ScreenUtil.autoheight(20),
    },
    logimg: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50),
    },
    logtext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(30),
    },
});

export default BackupsPkey;
