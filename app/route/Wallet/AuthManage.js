import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthManage extends BaseComponent {

    static navigationOptions = {
        headerTitle: '权限管理',
        header:null, 
    };
    
    constructor(props) {
        super(props);
        this.state = {
            ownerPk: '',
            activePk: '',
            ownerThreshold:'1',//owner权阀值
            activeThreshold:'1',//active权阀值
        }
    }
    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk: this.props.navigation.state.params.wallet.ownerPublic,//ownerPublic
            activePk: this.props.navigation.state.params.wallet.activePublic,
        })
        this.getAuthInfo();
    }
  
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
 
    //获取账户信息
    getAuthInfo(){
        EasyShowLD.loadingShow();
        this.props.dispatch({ type: 'vote/getAuthInfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (resp) => {
            EasyShowLD.loadingClose();
            if(resp && resp.code == '0'){
                var temActiveKey='';
                var temOwnerKey='';
                var authTempOwner=resp.data.permissions[1].required_auth.keys
                var authTempActive=resp.data.permissions[0].required_auth.keys
                //公钥
                for(var i=0;i<authTempOwner.length;i++){
                    if((authTempOwner[i].key == this.props.navigation.state.params.wallet.activePublic)||(authTempOwner[i].key == this.props.navigation.state.params.wallet.ownerPublic)){
                        temOwnerKey=authTempOwner[i].key;
                    }
                }
                for(var i=0;i<authTempActive.length;i++){
                    if((authTempActive[i].key == this.props.navigation.state.params.wallet.activePublic)||(authTempActive[i].key == this.props.navigation.state.params.wallet.ownerPublic)){
                        temActiveKey=authTempActive[i].key;
                    }
                }
                this.setState({
                    activeThreshold:resp.data.permissions[0].required_auth.threshold,
                    ownerThreshold:resp.data.permissions[1].required_auth.threshold,//owner权阀值
    
                    ownerPk: temOwnerKey,
                    activePk: temActiveKey,
                });
            }
        } });
    }

    transferByOwner() {
        const { navigate } = this.props.navigation;
        navigate('AuthTransfer', { wallet:this.props.navigation.state.params.wallet});
    }

    manageByActive() {
        const { navigate } = this.props.navigation;
        navigate('AuthChange', { wallet:this.props.navigation.state.params.wallet});
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
        <Header {...this.props} onPressLeft={true} title="权限管理" />
        <View style={[styles.inptoutbg,]}>
            {this.state.ownerPk != '' && <TouchableHighlight onPress={() => { this.transferByOwner() }} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                <View style={[styles.addUserTitle,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flex:1,flexDirection: "column",}}>
                        <View style={styles.titleStyle}>
                            <Text style={[styles.inptitle]}> Owner关联公钥（拥有者）</Text>
                            <Text style={[styles.weightText]}>权重阀值  </Text>
                            <Text style={[styles.weightText]}>{this.state.activeThreshold}</Text>
                        </View>
                        <Text style={[styles.inptext]}>{this.state.ownerPk}</Text>
                    </View>
                    <View style={styles.enterButton}> 
                        <Ionicons color={UColor.fontColor} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(21)} color={UColor.arrow} />     
                    </View>
                </View>
            </TouchableHighlight>}
            {this.state.activePk != '' && <TouchableHighlight onPress={() => { this.manageByActive() }} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                <View style={[styles.addUserTitle,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flex:1,flexDirection: "column",}}>
                        <View style={styles.titleStyle}>
                            <Text style={[styles.inptitle,{}]}> Active关联公钥（管理者）</Text>
                            <Text style={[styles.weightText]}>权重阀值 </Text>
                            <Text style={[styles.weightText]}>{this.state.activeThreshold}</Text>
                        </View>
                        <Text style={[styles.inptext]}>{this.state.activePk}</Text>
                    </View>
                    <View style={styles.enterButton}> 
                        <Ionicons color={UColor.fontColor} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(21)} color={UColor.arrow} />     
                    </View>
                </View>
            </TouchableHighlight>}
        </View>
        <View style={styles.textout}>
            <Text style={[styles.titletext,{color: UColor.turnout_eos}]}>• 什么是拥有者权限（Owner）？</Text>
            <Text style={[styles.explaintext,{color: UColor.turnout_eos}]}> Owner 代表了对账户的所有权，可以对权限进行设置，管理Active和其他角色。</Text>
            <Text style={[styles.titletext,{color: UColor.turnout_eos}]}>• 什么是管理者权限（Active）？</Text>
            <Text style={[styles.explaintext,{color: UColor.turnout_eos}]}> Active 用于日常使用，比如转账，投票等。</Text>
            <Text style={[styles.titletext,{color: UColor.turnout_eos}]}>• 什么是权重阈值？</Text>
            <Text style={[styles.explaintext,{color: UColor.turnout_eos}]}> 权重阈值是使用该权限的最低权重要求。</Text>
        </View>
    </View>
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
    },
    inptoutbg: {
        flexDirection:'column',
    },
    addUserTitle: {
        borderRadius: 5,
        flexDirection: "row",
        marginTop: ScreenUtil.autoheight(15),
        marginHorizontal: ScreenUtil.autowidth(10),
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    titleStyle:{
        flexDirection:'row',
    },
    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(30),
        color: '#262626',
    },
    weightText: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(30),
        color: UColor.arrow,
    },
    buttonText: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(30),
    },
    inptext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(25),
        color: UColor.arrow,
    },
    enterButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: ScreenUtil.autowidth(15),
    },
    textout: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    titletext: {
        fontSize: ScreenUtil.setSpText(10),
        // lineHeight: ScreenUtil.autoheight(35),
    },
    explaintext: {
        fontSize: ScreenUtil.setSpText(10),
        // lineHeight: ScreenUtil.autoheight(20),
    },
});

export default AuthManage;
