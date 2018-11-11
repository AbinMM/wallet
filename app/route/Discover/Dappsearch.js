import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, StyleSheet, Image, View, Text, TextInput, ListView, TouchableOpacity, Platform, Linking,  } from 'react-native';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Constants from '../../utils/Constants';
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
import {AlertModal} from '../../components/modals/AlertModal'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
@connect(({ login, wallet, dapp }) => ({ ...login, ...wallet, ...dapp }))
class Dappsearch extends BaseComponent {

    static navigationOptions = {
        title: 'DAPP搜索',
        header:null,  
    };

    // 构造函数  
    constructor(props) { 
        super(props);
        this.state = {
            labelname: '',
            showgoDapp: false,
            historydappList: [], //历史搜索记录
            vagueDappList: [],//模糊查询结果 后台返回
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
        }
    }

    componentDidMount() {
        //获取搜索历史记录
        this.setDapplist();
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();

    }

    setDapplist() {
        this.props.dispatch({ type: 'dapp/historyDappInfo', payload: {}, 
            callback: (historyDappInfo) => {
                if(historyDappInfo){
                    this.setState({historydappList: historyDappInfo});
                }
            }  
        });
    }
    
    //查询
    _query =(labelname) => {
        this.dismissKeyboardClick();
        if (labelname == "") {
            EasyToast.show('请输入DAPP网址');
            return;
        }else{
            this.props.dispatch({ type: 'dapp/dappfindByName', payload: {variable: labelname},
                callback: (resp) => {
                if (resp && resp.code == '0') {
                    if(resp.data){
                        this.setState({
                            vagueDappList: resp.data,  //模糊查询的记录
                        });
                    }
                } 
                }
            });
        }
    }

    
    //前往
    _goDapps =(labelname) => {
        this.dismissKeyboardClick();
        if (labelname == "") {
            EasyToast.show('请输入DAPP网址');
            return;
        }else{
            var index = labelname.indexOf('http://');
            var indexHttps = labelname.indexOf('https://');

            var tmpUrl;
            if(index == 0 || indexHttps == 0){
                tmpUrl = labelname;
            }else{
                tmpUrl = 'http://' + labelname;
            }
            //前往要保存历史搜索记录
            var tmpdata = {name: labelname, url: tmpUrl,icon:"http://static.eostoken.im/images/20181025/1540434919469.png"};
            this.props.dispatch({ type: 'dapp/savehistoryDapp', payload: tmpdata });

            const { navigate } = this.props.navigation;
            navigate('DappWeb', { data: tmpdata});
        }
    }
 
    //清空历史记录
    _emptyHistory =() => {
        this.props.dispatch({ type: 'dapp/deletehistoryDapp',});
        this.setDapplist();
    }

    //点DAPP跳转
    onPressDapp(data) {
        this.dismissKeyboardClick();
        const { navigate } = this.props.navigation;
        var title = '您所访问的页面将跳至第三方DApp' + data.name;
        var content = '提示：您所访问的页面将跳转至第三方DApp'+ data.name +'。您在第三方DApp上的使用行为将适用该第三方DApp的用户协议和隐私政策，由其直接并单独向您承担责任。';
        AlertModal.show(title,content,'确认','取消',(resp)=>{
        if(resp){
            this.props.dispatch({ type: 'dapp/savehistoryDapp', payload: data });
            navigate('DappWeb', { data: data});
            }
        });
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    getListValue()
    {
        if(this.state.labelname.length <= 0){
            //显示历史记录
            return  this.state.historydappList == null ? [] : this.state.historydappList;
        }else{
            //模糊查询记录
            return  this.state.vagueDappList == null ? [] : this.state.vagueDappList;
        }
       
    }

    render() {
        return (<View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
            <View style={[styles.header,{backgroundColor: '#FFFFFF',paddingTop: Constants.FitPhone,}]}>  
                <TouchableOpacity style={{paddingHorizontal:ScreenUtil.autowidth(15), alignItems:"flex-start",}} onPress={() => {this.props.navigation.goBack()}}>
                    <Ionicons style={{color:'#080808'}} name="ios-arrow-back" size={ScreenUtil.setSpText(25)}/>
                </TouchableOpacity>
                <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:'#FFFFFF'}]} >
                    <TouchableOpacity onPress={() => {this._query(this.state.labelname)}}>
                        <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
                    </TouchableOpacity>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} keyboardType="default"
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: '#808080'}]} autoCorrect={true}
                        underlineColorAndroid="transparent" onChangeText={(labelname) => this.setState({ labelname: labelname })}
                        placeholderTextColor={'#D9D9D9'}  placeholder="HASH FUN"  returnKeyType="go" />
                </View>    
            </View> 
            <View style={{flex: 1,}}>
                <View style={{backgroundColor: '#FFFFFF' }}>
                    {this.state.labelname.length<= 0 && this.state.historydappList  && this.state.historydappList.length > 0 && 
                     <View style={{height: ScreenUtil.autoheight(30),flexDirection: 'row', justifyContent: 'center'}}>
                        <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(12),color: '#D9D9D9',lineHeight: ScreenUtil.autoheight(17),paddingLeft:  ScreenUtil.autowidth(15)}}>历史记录</Text>
                        <TouchableOpacity onPress={() => {this._emptyHistory()}}>
                            <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#3B80F4',lineHeight: ScreenUtil.autoheight(17),paddingHorizontal: ScreenUtil.autowidth(15)}}>清空历史记录</Text>
                        </TouchableOpacity>
                    </View>
                    }
                   
                    {this.state.labelname.length > 0 &&
                    <TouchableOpacity onPress={() => {this._goDapps(this.state.labelname)}} style={{height: ScreenUtil.autoheight(44),flexDirection: 'row', alignItems: 'center',}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#323232',lineHeight: ScreenUtil.autoheight(17),paddingLeft:  ScreenUtil.autowidth(15)}}>前往DApp:</Text>
                        <Text style={{flex: 1, fontSize: ScreenUtil.setSpText(12),color: '#3B80F4',lineHeight: ScreenUtil.autoheight(17),}}  numberOfLines={1}>{this.state.labelname}</Text>
                        <Ionicons name="ios-arrow-forward-outline" size={ScreenUtil.autowidth(20)} color='#B5B5B5' style={{paddingHorizontal: ScreenUtil.autowidth(13),}} />
                    </TouchableOpacity>
                    }
                    
                    {this.state.labelname.length > 0 && this.state.vagueDappList && this.state.vagueDappList.length > 0 && 
                    <View style={{height: ScreenUtil.autoheight(30),paddingHorizontal:ScreenUtil.autowidth(15), justifyContent: 'center'}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#808080',lineHeight: ScreenUtil.autoheight(17),}}>DApps</Text>
                    </View>
                    }
                </View>
                <ListView  enableEmptySections={true}  contentContainerStyle={[styles.listViewStyle,{backgroundColor:'#FFFFFF'}]}
                    dataSource={this.state.dataSource.cloneWithRows(this.getListValue())} 
                    renderRow={(rowData) => (  
                    <TouchableOpacity  onPress={this.onPressDapp.bind(this, rowData)}  style={styles.headDAPP}>
                        <View style={styles.headbtnout}>
                            <Image source={{uri: rowData.icon}} style={styles.imgBtnDAPP} resizeMode='stretch'/>
                            <View style={{flex: 1}}>
                                <Text style={[styles.headbtntext,{color: '#323232'}]}>{rowData.name}</Text>
                                <Text style={[styles.descriptiontext,{color: '#808080'}]} numberOfLines={1}>{rowData.description}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    )}                
                /> 
            </View>
            </TouchableOpacity>
                
        </View>)
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: ScreenUtil.autoheight(7),
      paddingRight: ScreenUtil.autowidth(15),
    },
    headleftimg: {
      width: ScreenUtil.autowidth(16),
      height: ScreenUtil.autowidth(16),
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    inptout: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'center',
      height: ScreenUtil.autoheight(30),
      paddingHorizontal: ScreenUtil.autowidth(10),
    },
    inpt: {
      flex: 1,
      paddingVertical: 0,
      height: ScreenUtil.autoheight(30),
      fontSize: ScreenUtil.setSpText(12),
    },
    listViewStyle:{ 
        flexDirection:'column', 
        width: ScreenWidth, 
    }, 
    headDAPP: {
        paddingVertical: ScreenUtil.autoheight(8),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    headbtnout: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: "center",
    },
    imgBtnDAPP: { 
        width: ScreenUtil.autowidth(45),
        height: ScreenUtil.autowidth(45),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    headbtntext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(23), 
    },
    descriptiontext: {
        fontSize: ScreenUtil.setSpText(10),
        lineHeight: ScreenUtil.autoheight(14), 
    },





    cancelimg: {
      width: ScreenUtil.autowidth(23),
      height: ScreenUtil.autowidth(23),
      marginLeft: ScreenUtil.autowidth(15),
    },
    prompttext: {
      fontSize: ScreenUtil.setSpText(12),
      lineHeight: ScreenUtil.autoheight(20),
    },
    btnout: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    manualout: {
      paddingTop: ScreenUtil.autowidth(40),
      paddingHorizontal: ScreenUtil.autowidth(35),
    },
    
})
export default Dappsearch;