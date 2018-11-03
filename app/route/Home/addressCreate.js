/**
 * Created by zhuang.haipeng on 2017/9/12.
 */
import React from 'react';
import { connect } from 'react-redux'
import {Platform,DeviceEventEmitter,StyleSheet,Image,View,Text, TextInput,Dimensions,Modal,TouchableOpacity,KeyboardAvoidingView,ScrollView} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({addressBook}) => ({...addressBook}))
class addressCreate extends BaseComponent {

    static navigationOptions = {
        title: '联系人',  
        header:null, 
    };

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            labelName:'',    //标签名称
            address:'',      //账户
        };
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

    componentDidMount() {
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});

        DeviceEventEmitter.addListener('scan_result', (data) => {
            if(data && data.toaccount){
                if(this.verifyAccount(data.toaccount)){
                    this.setState({address:data.toaccount,show:true});
                }else{
                    EasyToast.show('请输入正确的账号');
                }
            }
        });

    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        DeviceEventEmitter.removeListener('scan_result');
    }

      //扫码
     _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,});
    }


    saveAddress = () => { 

        //确认选择
    };


    btnRightSelect() { 
        //取消
        this.props.navigation.goBack();  //正常返回上一个页面
    }
    dismissKeyboardClick() {
        dismissKeyboard();
    }
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="新建联系人" subName={"取消"} onPressRight={this.btnRightSelect.bind(this)} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
            <ScrollView  keyboardShouldPersistTaps="always">
             
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        
                        <View style={styles.taboutsource}>
                            <View style={[styles.outsource,{}]}>
                                <View style={styles.accountoue} >
                                    <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autowidth(64),color: UColor.fontColor}]}>名字</Text>
                                </View>
                                <View style={[styles.accountoue,{backgroundColor:UColor.mainColor}]} >
                                    <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{flex: 1, color: UColor.arrow}]} placeholderTextColor={UColor.inputtip}      
                                        placeholder="请输入联系人名字" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                        onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                                    />
                                   <View style={styles.scanning}>
                                        <Button onPress={() => this._rightTopClick()}>                                  
                                            <Image source={UImage.scanning} style={styles.scanningimg} />                                 
                                        </Button>
                                    </View>
                                </View>
                          
                           
                                <View style={styles.accountoue} >
                                    <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autoheight(56),color: UColor.fontColor}]}>账户名称</Text>
                                </View>
                                <View style={[styles.accountoue,{backgroundColor:UColor.mainColor}]} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="输入a-z小写字符和1-5数字组合字符" underlineColorAndroid="transparent" keyboardType="default"  maxLength={12}
                                        onChangeText={(memo) => this.setState({ memo })}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

                <View style={[styles.replace,{backgroundColor: UColor.secdColor}]}>
                    <TouchableOpacity onPress={() => this.saveAddress(this)} style={[styles.editClickout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>保存</Text>
                    </TouchableOpacity>                 
                </View>
            </ScrollView>
            </View>
        );
    }
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        flex: 1,
        flexDirection: 'column',
        
    },
    accountoue: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: ScreenUtil.autowidth(20),
    },

    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(16),
    },
    textinpt: {
        flex: 1,
        height: ScreenUtil.autoheight(60),
        fontSize: ScreenUtil.setSpText(16),
    },
    scanning: {
        alignSelf: 'center',
        flexDirection: "row",
        justifyContent: "center",
        width: ScreenUtil.autowidth(50),
    },
    scanningimg: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autowidth(25),
    },
    replace: {
        width: ScreenWidth,
        alignItems: "center",
        flexDirection: 'column',
        justifyContent: "space-between",
    },
    editClickout: {
        borderRadius: 5,
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(45),
    },
    address: {
        fontSize: ScreenUtil.setSpText(17),
    },
})

export default addressCreate;