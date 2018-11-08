import React from 'react';
import { connect } from 'react-redux'
import {Platform,DeviceEventEmitter,StyleSheet,Image,View,Text, TextInput,Dimensions,TouchableOpacity,KeyboardAvoidingView,ScrollView} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import TextButton from '../../components/TextButton';
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
            toAccount:'',      //账户
            memo:'', //分组用的备注
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
        DeviceEventEmitter.addListener('scan_result', (data) => {
            if(data && data.toaccount){
                if(this.verifyAccount(data.toaccount)){
                    this.setState({toAccount:data.toaccount});
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
     scan = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,});
    }


    saveAddress = () => { 
        this.props.dispatch({ type: 'addressBook/saveAddress', payload: { address: this.state.toAccount, labelName: this.state.labelName,memo: this.state.memo } });
        this.props.navigation.goBack();  //正常返回上一个页面
        if(this.props.navigation.state.params.callback){
            this.props.navigation.state.params.callback();
        }
    };

    dismissKeyboardClick() {
        dismissKeyboard();
    }
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="新建联系人" imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
            <ScrollView  keyboardShouldPersistTaps="always">
             
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        
                        <View style={styles.taboutsource}>
                                <View style={styles.accountoue} >
                                    <Text style={[styles.inptitle]}>名字</Text>
                                </View>
                                <View style={[styles.accountoue,{borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.labelName} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="请输入联系人名字" underlineColorAndroid="transparent" keyboardType="default"  maxLength={12}
                                        onChangeText={(labelName) => this.setState({ labelName })}
                                    />
                                </View>
                          
                                <View style={styles.accountoue} >
                                    <Text style={[styles.inptitle]}>账户名称</Text>
                                </View>

                                <View style={[styles.accountoue,{borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]} >
                                    <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{flex: 1}]} placeholderTextColor={UColor.inputtip}      
                                        placeholder="输入a-z小写字符和1-5数字组合字符" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                        onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                                    />
                                   <View style={styles.scanning}>
                                        <Button onPress={() => this.scan()}>                                  
                                            <Image source={UImage.scanning} style={styles.scanningimg} />                                 
                                        </Button>
                                    </View>
                                </View>
                                

                                <View style={styles.accountoue} >
                                    <Text style={[styles.inptitle]}>备注(可不填)</Text>
                                </View>
                                <View style={[styles.accountoue,{marginBottom:ScreenUtil.autoheight(5),borderBottomColor: UColor.secdColor,borderBottomWidth:ScreenUtil.autowidth(2)}]} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={[styles.textinpt,{color: UColor.arrow}]}  placeholderTextColor={UColor.inputtip}
                                        placeholder="备注(Memo)" underlineColorAndroid="transparent" keyboardType="default"  maxLength={20}
                                        onChangeText={(memo) => this.setState({ memo })}
                                    />
                                </View>

                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

                <View style={[styles.replace,{backgroundColor: UColor.secdColor}]}>
                    <TouchableOpacity onPress={() => this.saveAddress(this)} style={[styles.editClickout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>保存</Text>
                    </TouchableOpacity>     
                {/* <TextButton style={[styles.networktab,{borderColor: UColor.tintColor}]} text="保存" onPress={() => {this.saveAddress()}}></TextButton>  */}
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
        top:ScreenUtil.autoheight(12),
        marginLeft:ScreenUtil.autowidth(10),
        marginRight:ScreenUtil.autowidth(10),
        backgroundColor:UColor.mainColor,
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
        lineHeight: ScreenUtil.autowidth(40),
        color: UColor.fontColor,
    },
    textinpt: {
        flex: 1,
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
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
        marginTop:ScreenUtil.autowidth(25),
    },
    editClickout: {
        borderRadius: 5,
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(45),
    },

    networktab: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(22),
        paddingVertical: ScreenUtil.autoheight(5),
    },
    address: {
        fontSize: ScreenUtil.setSpText(17),
    },
})

export default addressCreate;