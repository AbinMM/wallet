import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight,FlatList} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Header from '../../components/Header'
import Button from  '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthChange extends BaseComponent {

    static navigationOptions = {
        headerTitle: "Active权限管理",
        header:null, 
    }

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            activePk:'',
            threshold:'1',//权阀值
            authKeys:[],//授权的公钥组
            isAuth:false,//当前的公钥是否在授权公钥的范围内
            inputCount:0,
            inputText:'',
            activeAuth:'',//更改的数据组
            isRefreshing: false,
            password: '',
        }
    }

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.name});
    }

    //组件加载完成
    componentDidMount() {
        this.setState({
            activePk:this.props.navigation.state.params.wallet.activePublic,
        });
        this.getAuthInfo();
        DeviceEventEmitter.addListener('scan_result', (data) => {
            this.setState({inputText:data.toaccount})
        });
    }

    verifyAccount(obj){
        var ret = true;
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        if(obj == "" || obj.length > 12){
            return false;
        }
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }
            if(j >= charmap.length){
                //非法字符
                // obj = obj.replace(tmp, ""); 
                ret = false;
                break;
            }
        }
        return ret;
    }

    //提交
    submission = () =>{  
        if(this.state.isAuth==false){
            EasyToast.show("找不到对应的公钥或账号");
            return
        }
        if(this.state.inputText==''){
            EasyToast.show("输入不能为空");
            return//暂不支持账号先
        }
        for (var j = 0; j < this.state.authKeys.length; j++) {
            if (this.state.authKeys[j].key ==this.state.inputText) {
                EasyToast.show('添加授权公钥或账户已存在');
                return;
            }
        }
        var authTempActive=this.state.activeAuth;
        if (this.state.inputText.length > 12) {
            Eos.checkPublicKey(this.state.inputText, (r) => {
                if (!r.isSuccess) {
                    EasyToast.show('您输入的公钥有误，请核对后再试！');
                    return;
                }else{
                    authTempActive.data.auth.keys.push({weight:1,key:this.state.inputText})
                    this.changeAuth(authTempActive);
                }
            });
        }else if(this.state.inputText.length >= 1){
            if(this.verifyAccount(this.state.inputText)==false){
                EasyToast.show('请输入正确的账号');
                return 
            }
            authTempActive.data.auth.accounts.push({"weight":1,"permission":{"actor":this.state.inputText,"permission":"active"}});
            this.changeAuth(authTempActive);
        }else{
            EasyToast.show('输入数据长度不正确');
        }
    }  
  
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
 
    //获取账户信息
    getAuthInfo(){
        this.setState({isRefreshing: true})//开始刷新
        this.props.dispatch({ type: 'vote/getAuthInfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (resp) => {
            // EasyShowLD.loadingClose();
            console.log("resp.data.permissions[0].required_auth.keys=%s",JSON.stringify(resp.data.permissions[0].required_auth.keys))
            if(resp && resp.code == '0'){
                var temp=[];
                var authFlag=false;
                var authTempActive={
                    account: "eosio",
                    name: "updateauth", 
                    authorization: [{
                    actor: '',//操作者 account
                    permission: 'active'// active
                    }], 
                    data: {
                        account: '',//操作者 account
                        permission: 'active',// active
                        parent: "owner",// owner
                        auth: {
                            threshold: '',//总阀值 1
                            keys: [],//公钥组 Keys
                            accounts: [],//帐户组 Accounts
                        }
                    }
                };
                //active 
                authTempActive.authorization[0].actor=this.props.navigation.state.params.wallet.name;
                authTempActive.data.account=this.props.navigation.state.params.wallet.name;
                authTempActive.data.parent=resp.data.permissions[0].parent;
                authTempActive.data.auth.threshold=resp.data.permissions[0].required_auth.threshold;
                authTempActive.data.auth.keys=resp.data.permissions[0].required_auth.keys;
                authTempActive.data.auth.accounts=resp.data.permissions[0].required_auth.accounts;
                //账户
                for(var i=0;i<authTempActive.data.auth.accounts.length;i++){
                    // if(authTempActive.data.auth.accounts[i].permission.actor != this.props.navigation.state.params.wallet.name){
                        temp.push({weight:authTempActive.data.auth.accounts[i].weight,key:authTempActive.data.auth.accounts[i].permission.actor+"@"+authTempActive.data.auth.accounts[i].permission.permission});
                    // }
                }
                //公钥
                for(var i=0;i<authTempActive.data.auth.keys.length;i++){
                    // if(authTempActive.data.auth.keys[i].key != this.props.navigation.state.params.wallet.activePublic){
                        temp.push({weight:authTempActive.data.auth.keys[i].weight,key:authTempActive.data.auth.keys[i].key});
                    // }else{
                        
                    // }
                }
                authFlag=true;//获取账户成功后可以
                this.setState({
                    threshold:resp.data.permissions[0].required_auth.threshold,
                    isAuth:authFlag,
                    authKeys:temp,//授权的公钥组
                    activeAuth:authTempActive,
                    inputCount:0,
                    inputText:'',
                    isRefreshing: false
                });
            }else{
                this.setState({isAuth: false});
            }
        } });
    } 

    EosUpdateAuth = (account, pvk,authActiveArr, callback) => { 
        if (account == null) {
            if(callback) callback("无效账号");
            return;
        };
        // console.log("authActiveArr=%s",JSON.stringify(authActiveArr))
        Eos.transaction({
            actions: [
                authActiveArr,
            ]
        }, pvk, (r) => {
           if(callback) callback(r);
        });
    };

    changeAuth(authTempActive){
        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH} 
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}   
                    placeholderTextColor={UColor.inputtip} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            EasyShowLD.dialogClose();
            var privateKey = this.props.navigation.state.params.wallet.activePrivate;
            try {
                this.setState({isRefreshing: true})//开始刷新
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.navigation.state.params.wallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    this.EosUpdateAuth(this.props.navigation.state.params.wallet.name, plaintext_privateKey,authTempActive,(r) => {
                        console.log("r=%s",JSON.stringify(r))
                        if(r.isSuccess==true){
                            EasyToast.show('授权变更成功！');
                        }else{
                            EasyToast.show('授权变更失败！');
                        }
                        this.getAuthInfo();//刷新一下
                    });
                } else {
                    this.setState({isRefreshing: false})//停止刷新
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                this.setState({isRefreshing: false})//停止刷新
                EasyToast.show('密码错误');
            }
        }, () => { EasyShowLD.dialogClose() });
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    //这个是用来删除当前行的
    deleteUser = (delKey) =>{  
        if(delKey.indexOf("@")!=-1){
            delKey = delKey.replace( /([^@]+)$/, "");  //删除@后面的字符
            delKey = delKey.replace( "@", "");  //删除@后面的字符
        }
        if(this.state.isAuth==false){
            EasyToast.show("找不到对应的公钥或账号");
            return
        }
        var authTempActive=this.state.activeAuth;
        if(delKey.length>12){
            for (var i = 0; i < authTempActive.data.auth.keys.length; i++) {
                if (authTempActive.data.auth.keys[i].key ==delKey) {
                    authTempActive.data.auth.keys.splice(i, 1);
                }
            }
        }else{
            for (var i = 0; i < authTempActive.data.auth.accounts.length; i++) {
                if (authTempActive.data.auth.accounts[i].permission.actor ==delKey) {
                    authTempActive.data.auth.accounts.splice(i, 1);
                }
            }
        }
        // arrAccounts.push({"weight":1,"permission":{"actor":this.state.inputContent}});
        this.changeAuth(authTempActive);
    }  

    _onRefresh(){
        this.getAuthInfo();//刷新一下
    }
    
    _renderRow(rowData){ // cell样式
        return (
            <View style={[styles.addUserTitle,{ backgroundColor: UColor.mainColor}]}>
                <View style={styles.titleStyle}>
                    <View style={styles.userAddView}>
                        {(this.state.authKeys[0].key == rowData.item.key) &&
                            <Text style={[styles.authText,{color: UColor.fontColor}]}>授权的Active用户</Text>
                        }
                    </View>
                    <View style={styles.buttonView}>
                        <Text style={[styles.weightText,{color: UColor.arrow}]}>权重  </Text>
                        <Text style={[styles.buttonText,{color:  UColor.fontColor}]}>{rowData.item.weight}</Text>
                    </View>
                </View>
                <View style={{flex:1,flexDirection: "row",}}>
                    <View style={[styles.showPkStyle,{borderColor: UColor.arrow,}]}>
                        <Text style={[styles.pktext,{color: UColor.arrow}]}>{rowData.item.key}</Text>
                    </View>
                    {/* {(this.state.activeAuth.data.auth.keys.length>1 || rowData.item.key.length<50) && */}
                    <TouchableHighlight onPress={() => { this.deleteUser(rowData.item.key) }}  >
                        <View style={styles.delButton}>
                            <Image source={UImage.delicon} style={styles.imgBtn} />
                        </View>
                    </TouchableHighlight>
                    {/* } */}
                </View>
            </View>
        )
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="Active权限管理" onPressRight={this._rightTopClick.bind()} avatar={UImage.scangray} imgWidth={ScreenUtil.autowidth(20)} imgHeight={ScreenUtil.autowidth(20)}/>
            <View style={[styles.significantout,{backgroundColor: UColor.secdColor,borderColor: UColor.riseColor}]}>
                <View style={{flexDirection: 'row',alignItems: 'center',}}>
                    <Image source={UImage.warning} style={styles.imgBtnWarning} />
                    <Text style={[styles.significanttextHead,{color: UColor.riseColor}]} >温馨提示</Text>
                </View>
                <Text style={[styles.significanttext,{color: UColor.riseColor}]} >请确保您清楚了解Active授权，并确保添加的授权用户是您信任的用户，添加的授权用户将可获得变更权限、转账和投票等操作的权限。</Text>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : null} style={styles.tab}>
                <ScrollView keyboardShouldPersistTaps="handled" 
                    refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this._onRefresh()}
                        tintColor={UColor.fontColor}
                        colors={[UColor.tintColor]}
                        progressBackgroundColor={UColor.btnColor}
                    />
                    }
                    scrollEventThrottle={50}
                    >
                    <FlatList
                        data={this.state.authKeys.length==null ?[]: this.state.authKeys} 
                        extraData={this.state}
                        renderItem={this._renderRow.bind(this)} >
                    </FlatList>
                    <View style={[styles.addUserTitle,{ backgroundColor: UColor.mainColor}]}>
                        <View style={styles.titleStyle}>
                            <View style={styles.buttonView}>
                                <Text style={[styles.weightText,{color: UColor.arrow}]}>权重  </Text>
                                <Text style={[styles.buttonText,{color:  UColor.fontColor}]}>1</Text>
                            </View>
                        </View>
                        <View style={{flex:1,flexDirection: "row",}}>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.inputText} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} placeholderTextColor={UColor.inputtip} autoFocus={false}
                                style={[styles.inptgo,{color: UColor.arrow,backgroundColor: UColor.secdColor, borderColor: UColor.arrow,}]} 
                                onChangeText={(inputText) => this.setState({ inputText: inputText})}   keyboardType="default" 
                                placeholder="请您输入Active公钥 " underlineColorAndroid="transparent"  multiline={true}  />
                        
                            <View style={styles.addButton}>
                                <Image source={UImage.adminAddA} style={styles.imgBtn} />
                            </View>
                        </View>
                    </View>
                    <Button onPress={ this.submission.bind(this) }>
                        <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                            <Text style={[styles.btntext,{color: UColor.btnColor}]}>授权</Text>
                        </View>
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
    },
    addUserTitle: {
        flex: 1,
        marginTop: 1,
        paddingBottom: ScreenUtil.autoheight(10),
    },
    titleStyle:{
        flex:1,
        flexDirection:'row',
        marginTop: ScreenUtil.autoheight(5),
        marginLeft: ScreenUtil.autowidth(11),
        marginRight: ScreenUtil.autowidth(42),
    },
    showPkStyle: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        marginLeft: ScreenUtil.autowidth(15),
        marginRight: ScreenUtil.autowidth(5),
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
     //用户添加样式  
    userAddView: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
     // 按钮  
    buttonView: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    buttonText: {
        fontSize: ScreenUtil.setSpText(12),
    },
    authText: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(30),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(23),
        height: ScreenUtil.autowidth(24),
    },
    pktext: {
        fontSize: ScreenUtil.setSpText(14),
    },
    weightText: {
        fontSize: ScreenUtil.setSpText(12),
    },
    //删除按键样式
    delButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    //删除按键样式
    addButton: {
        // flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
    //警告样式
    significantout: {
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "column",
        alignItems: 'center', 
        paddingVertical: ScreenUtil.autoheight(5),
        marginVertical: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(15),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    imgBtnWarning: {
        width: ScreenUtil.autowidth(23),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    significanttextHead: {
        fontWeight:"bold",
        fontSize: ScreenUtil.setSpText(16), 
    },
    significanttext: {
        fontSize: ScreenUtil.setSpText(13), 
        lineHeight: ScreenUtil.autoheight(20),
    },
    inptgo: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        textAlignVertical: 'top',
        height: ScreenUtil.autoheight(57),
        fontSize: ScreenUtil.setSpText(15),
        marginLeft: ScreenUtil.autowidth(15),
        marginRight: ScreenUtil.autowidth(5),
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    passoutsource: {
        alignItems: 'center',
        flexDirection: 'column', 
    },
    inptpass: {
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        fontSize: ScreenUtil.setSpText(16),
        height: ScreenUtil.autoheight(45),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    // 按钮  
    btnoutsource: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.autowidth(101),
        height: ScreenUtil.autoheight(41),
        marginTop: ScreenUtil.autoheight(15),
        marginHorizontal: ScreenUtil.autowidth(137),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(17),
    },
    tab: {
        flex: 1,
    }
   
});

export default AuthChange;
