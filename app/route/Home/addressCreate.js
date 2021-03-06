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
        title: '新建联系人',  
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
            var resp = { address: this.state.toAccount, labelName: this.state.labelName,memo: this.state.memo };
            this.props.navigation.state.params.callback(resp);
        }
    };

    dismissKeyboardClick() {
        dismissKeyboard();
    }
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="新建联系人" imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
                <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex:1}}>
                    <View style={styles.taboutsource}>
                        <Text style={[styles.inptitle]}>名字</Text>
                        <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.labelName} returnKeyType="next"
                            selectionColor={UColor.tintColor} style={[styles.textinpt]}  placeholderTextColor={'#D9D9D9'} 
                            placeholder="请输入联系人名字" underlineColorAndroid="transparent" keyboardType="default"  maxLength={12}
                            onChangeText={(labelName) => this.setState({ labelName })}
                        />
                        
                        <Text style={[styles.inptitle]}>账户名称</Text>
                        <View style={[styles.accountoue,{borderBottomColor: '#D5D5D5',borderBottomWidth:ScreenUtil.autowidth(1)}]} >
                            <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                selectionColor={UColor.tintColor} style={[styles.inpt]} placeholderTextColor={'#D9D9D9'}      
                                placeholder="输入a-z小写字符和1-5数字组合字符" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                            />
                            <TouchableOpacity onPress={() => this.scan()}>                                  
                                <Image source={UImage.scanning} style={styles.scanningimg} />                                 
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.inptitle]}>备注(可不填)</Text>
                        <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                            selectionColor={UColor.tintColor} style={[styles.textinpt,]}  placeholderTextColor={'#D9D9D9'} 
                            placeholder="备注(Memo)" underlineColorAndroid="transparent" keyboardType="default"  maxLength={20}
                            onChangeText={(memo) => this.setState({ memo })}
                        />
                    </View>
                    <View style={[styles.footer]}>
                        <TextButton onPress={this.saveAddress.bind(this)} textColor="#FFFFFF" text="保存"  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },
    taboutsource: {
        borderRadius: 6,
        flexDirection: 'column',
        marginTop: ScreenUtil.autoheight(15),
        marginHorizontal: ScreenUtil.autowidth(15),
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingBottom: ScreenUtil.autowidth(15),
        backgroundColor:UColor.secdfont,
    },

    accountoue: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    inptitle: {
        fontWeight: '600',
        color: '#323232',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autowidth(23),
        marginTop:  ScreenUtil.autowidth(20),
        marginBottom: ScreenUtil.autowidth(17),
        
    },
    inpt:{
        flex: 1,
        color: '#808080',
        paddingVertical: 0,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(20),
    },
    textinpt: {
        color: '#808080',
        paddingVertical: 0,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(20),
        borderBottomColor: '#D5D5D5',
        borderBottomWidth:ScreenUtil.autowidth(1),
    },
    scanning: {
        alignSelf: 'center',
        justifyContent: "center",
        width: ScreenUtil.autowidth(50),
    },
    scanningimg: {
        width: ScreenUtil.autowidth(15),
        height: ScreenUtil.autowidth(15),
        marginHorizontal: ScreenUtil.autowidth(5),
    },
    replace: {
        width: ScreenWidth,
        alignItems: "center",
        flexDirection: 'column',
        justifyContent: "space-between",
        marginTop:ScreenUtil.screenHeith/3,
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

    footer:{
        flex: 1,
        alignItems: 'center', 
        justifyContent: 'flex-end',
        paddingBottom: ScreenUtil.autowidth(20),
      },
})

export default addressCreate;