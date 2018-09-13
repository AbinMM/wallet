import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, StyleSheet, Image, View, Text, Linking, Modal, TouchableOpacity,ListView,TextInput,Platform,DeviceEventEmitter,NativeModules} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import {formatEosQua} from '../../utils/FormatUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { EasyToast } from '../../components/Toast';
import Constants from '../../utils/Constants'
import { Eos } from "react-native-eosjs";
import moment from 'moment';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

var DeviceInfo = require('react-native-device-info');
let g_props;
let g_CallToRN = {methodName:"",callback:""}; //记录上次监听到的SDK方法和回调函数名

@connect(({ news ,wallet,vote}) => ({ ...news, ...wallet, ...vote}))
class FunctionsMore extends React.Component {

  static navigationOptions = {
    title: '全部',  
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
        Tokenissue: false,
        dappPromp: false,
        // dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
        selecttitle:"",
        selecturl:"",
    }
    g_props = props;    
  }

  //加载地址数据
  componentDidMount() {
  
    //监听原生页面的消息
    if(Platform.OS === 'ios')
    {
    //   NativeModules.SDKModule.presentViewControllerFromReactNative('DappActivity',this.props.navigation.state.params.url);
    }else(Platform.OS === 'android')
    {
      DeviceEventEmitter.addListener('CallToRN', (data) => {
        if(data){
          //  alert(data);
           try {
            var obj = JSON.parse(data);
            if(g_CallToRN.methodName == obj.methodName)
            {
                if(obj.callback && (g_CallToRN.callback == obj.callback))
                {
                  //同一个方法，同一个回调函数，重复消息拒绝掉
                  return;
                }
            }
            g_CallToRN.methodName = obj.methodName;
            g_CallToRN.callback = obj.callback;
            callMessage(obj.methodName,obj.params,obj.password,obj.device_id,obj.callback);
           } catch (error) {
            console.log("event CallToRN error: %s",error.message);
           }
        }
      });
      
    }
  }

  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Receivables') {
        AnalyticsUtil.onEvent('Receipt_code');
        navigate('TurnIn', {});
    }else if (key == 'transfer') {
      navigate('TurnOut', { coins:'EOS', balance: this.props.navigation.state.params.balance });
    }else if (key == 'Resources') {
      navigate('Resources', {account_name:this.props.navigation.state.params.account_name});
    }else if(key == 'candy'){
      Linking.openURL("https://eosdrops.io/");
    }else if(key == 'Bvote'){
      navigate('Bvote', {});
    }else if(key == 'Tokenissue'){
      this. _setModalVisible();
    }else if(key == 'FreeMortgage'){
        navigate('FreeMortgage');
    }else if(key == 'navigation'){
        Linking.openURL("https://eostoken.github.io/EOS-Navigator/");
    }else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  onPressDapp(key, data = {}) {
    if(key == 'DAPP1'){
        this.setState({dappPromp: true,
            selecttitle:"简影游戏",selecturl: "http://eosbao.io/pocket?tokenpocket=true&referrer=hezdanbtgega"});
    }else if(key == 'DAPP2'){
        this.setState({dappPromp: true,
            selecttitle:"星域之门",selecturl: "https://m.ite.zone/#/ite4"});    
    }else if(key == 'DAPP3'){
        this.setState({dappPromp: true,
            selecttitle:"EOSBET",selecturl: "https://dice.eosbet.io/token-pocket.html?ref=ecosystemlab"});     
    }else if(key == 'DAPP4'){
      this.setState({dappPromp: true,
          selecttitle:"猜猜猜",selecturl: "http://luckyeos.cn/"});
    }else if(key == 'DAPP5'){
      this.setState({dappPromp: true,
          selecttitle:"隐秘世界OL",selecturl: "http://www.h5indiegame.com/run.php?id=38"});   
    }else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

    // 显示/隐藏 modal  
    _setModalVisible() {  
        let isTokenissue = this.state.Tokenissue;  
        this.setState({  
            Tokenissue:!isTokenissue,  
        });  
    } 

    openTokenissue() {
        this. _setModalVisible();
        Linking.openURL("https://coincreate.github.io/EOS_coincreate/coincreate.html");
    }

    _setModalVisible_DAPP() {  
        let dappPromp = this.state.dappPromp;  
        this.setState({  
            dappPromp:!dappPromp,  
        });  
    } 
    openTokenissue_DAPP() {
        this. _setModalVisible_DAPP();
        if(Platform.OS === 'ios')
        {
          NativeModules.SDKModule.presentViewControllerFromReactNative('DappActivity',this.state.selecturl);
        }else(Platform.OS === 'android')
        {
          NativeModules.SDKModule.startActivityFromReactNative(this.state.selecturl,this.state.selecttitle);
        }
    }

  renderRow = (rowData, sectionID, rowID) => { // cell样式
    return( 
        <TouchableOpacity activeOpacity={0.8} onPress={()=>{EasyToast.show("点击了")}} > 
          <View style={styles.innerViewStyle}> 
            <Image source={{uri:rowData.icon}} style={styles.iconStyle} /> 
            <Text>{rowData.title}</Text> 
          </View> 
        </TouchableOpacity> 
      ); 
  }
  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="全部" />
        <View style={[styles.head,{backgroundColor: UColor.mainColor,marginTop:ScreenUtil.autoheight(10)}]}>
            <Button onPress={this.onPress.bind(this, 'Receivables')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.qr} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>收币</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'transfer')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.transfer} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>转账</Text>
                </View>
            </Button>
            <Button  onPress={this.onPress.bind(this, 'Resources')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.resources} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>资源管理</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'Tokenissue')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.tokenissue} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>发行代币</Text>
                </View>                      
            </Button>
        </View>
        <View style={[styles.head,{backgroundColor: UColor.mainColor}]}>
            <Button onPress={this.onPress.bind(this, 'Bvote')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.vote_node} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>节点投票</Text>
                </View>                      
            </Button>
            <Button onPress={this.onPress.bind(this, 'candy')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.candy} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>糖果信息</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'FreeMortgage')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.free_mortgage} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>免费抵押</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'navigation')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.navigation} style={styles.imgBtn} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>EOS导航</Text>
                </View>
            </Button>
        </View>
         <View style={{marginLeft:ScreenUtil.autowidth(10),marginTop:ScreenUtil.autoheight(10)}}>  
             <Text style={{fontSize: ScreenUtil.setSpText(14),}}>DAPP Store</Text>
         </View>
        {/* <ListView  enableEmptySections={true} 
          dataSource={this.state.dataSource.cloneWithRows((this.props.Book == null ? [] : this.props.Book))}
          renderRow={this.renderRow}  
          contentContainerStyle={styles.listViewStyle}
         />     */}

         <View style={[{backgroundColor: UColor.mainColor,marginTop:ScreenUtil.autoheight(10)}]}>
           <View style={[styles.headDAPP]}>
            <Button  onPress={this.onPressDapp.bind(this, 'DAPP1')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.dapp_jianyin} style={styles.imgBtnDAPP} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>简影游戏</Text>
                </View>
            </Button>
            <Button onPress={this.onPressDapp.bind(this, 'DAPP2')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.dapp_ite} style={styles.imgBtnDAPP} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>星域之门</Text>
                </View>                      
            </Button>
            <Button onPress={this.onPressDapp.bind(this, 'DAPP3')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.dapp_EOSBET} style={styles.imgBtnDAPP} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>EOSBET</Text>
                </View>
            </Button>
            <Button  onPress={this.onPressDapp.bind(this, 'DAPP4')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.dapp_caicaicai} style={styles.imgBtnDAPP} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>猜猜猜</Text>
                </View>
            </Button>
          </View>
          {/* <View style={[styles.head]}>
            <Button onPress={this.onPressDapp.bind(this, 'DAPP5')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.dapp_03} style={styles.imgBtnDAPP} />
                    <Text style={[styles.headbtntext,{color: UColor.arrow}]}>隐秘世界OL</Text>
                </View>                      
            </Button>
          </View> */}
        </View>
        <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.Tokenissue} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-30, backgroundColor: UColor.btnColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <Text style={styles.contentText}>使用说明</Text>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                        <Image source={UImage.warning} style={styles.imgBtnBackup} />
                        <Text style={[styles.headtext,{color: UColor.riseColor}]} >免责声明</Text>
                    </View>
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>本功能由第三方平台提供，不属于EosToken官方出品，《用户协议》和《应用风险》由该平台单独向您承担责任！</Text>
                </View>
                <View style={{ width: ScreenWidth-70,marginHorizontal: ScreenUtil.autowidth(20), marginVertical: ScreenUtil.autoheight(10),}}>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>3分钟，3EOS！最方便，最便宜的EOS自助发币DAPP。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>开发：清华大学计算机专业博士生莫与独立编写。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>功能：帮助大家自助地发行基于EOS代币。价格比大家自己发币便宜了13倍！</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>流程：</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>1.根据指导生成自己代币的MEMO。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>2.给指定合约账号转账3EOS，并备注之前生成的MEMO。</Text>
                    <Text style={[styles.centertext,{color: UColor.arrow}]}>3.在eostoken钱包中添加代币（添加公众号“深入浅出EOS”回复“eostoken”获取教程）</Text>
                </View>
                <Button onPress={this.openTokenissue.bind(this)} style={{}}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.btnColor}]}>知道了</Text>
                    </View>
                </Button>  
                </View> 
            </TouchableOpacity>
        </Modal>
        <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.dappPromp} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuoBackup,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-30, backgroundColor: UColor.btnColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible_DAPP.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <Text style={styles.contentText}>使用说明</Text>
                <View style={[styles.warningout,{borderColor: UColor.showy}]}>
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                        <Image source={UImage.warning} style={styles.imgBtnBackup} />
                        <Text style={[styles.headtext,{color: UColor.riseColor}]} >免责声明</Text>
                    </View>
                    <Text style={[styles.headtitle,{color: UColor.showy}]}>本功能由第三方平台提供，不属于EosToken官方出品，《用户协议》和《应用风险》由该平台单独向您承担责任！</Text>
                </View>
                <Button onPress={this.openTokenissue_DAPP.bind(this)} style={{}}>
                    <View style={[styles.deleteout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.deletetext,{color: UColor.btnColor}]}>知道了</Text>
                    </View>
                </Button>  
                </View> 
            </TouchableOpacity>
        </Modal>
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    head: {
        flexDirection: "row",
        height: ScreenUtil.autoheight(70), 
        paddingBottom: ScreenUtil.autoheight(10),
    },
    headbtn: {
        width: ScreenWidth/4,
        alignItems: 'center',
        justifyContent: "center", 
    },
    headbtnout: {
        flex:1, 
        alignItems: 'center', 
        justifyContent: "center",
    },
    imgBtn: {
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autoheight(30),
    },
    headbtntext: {
        fontSize: ScreenUtil.setSpText(14),
    },
    touchableouts: {
        flex: 1,
        flexDirection: "column",
    },
    pupuoBackup: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    subViewBackup: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(30),
        width: ScreenWidth - ScreenUtil.autowidth(30),
    },
    buttonView2: {
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.autowidth(30),
    },
    contentText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(18),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    imgBtnBackup: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autoheight(25),
        marginRight: ScreenUtil.autowidth(10),
    },
    headtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(16), 
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(20),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    warningout: {
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "column",
        alignItems: 'center',
        padding: ScreenUtil.autowidth(5),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    centertext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(20),
    },
    deleteout: {
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        marginHorizontal: ScreenUtil.autowidth(100),
        marginVertical: ScreenUtil.autoheight(15),
    },
    deletetext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    listViewStyle:{ 
        // 主轴方向 
        flexDirection:'row', 
        // 一行显示不下,换一行 
        flexWrap:'wrap', 
        // 侧轴方向 
        alignItems:'center', // 必须设置,否则换行不起作用 
      }, 
    innerViewStyle:{ 
        width:ScreenUtil.autowidth(100), 
        height:ScreenUtil.autoheight(100), 
        marginLeft:(ScreenUtil.screenWidth -ScreenUtil.autowidth(100) * 3) / (3 + 1), 
        marginTop:ScreenUtil.autoheight(25), 
        // 文字内容居中对齐 
        alignItems:'center'
    }, 
    
    iconStyle:{ 
        width:ScreenUtil.autowidth(80), 
        height:ScreenUtil.autoheight(80), 
    }, 

    touchablelist: {
        width: '100%', 
        borderBottomWidth: 1, 
      },

    headDAPP: {
        flexDirection: "row",
        height: ScreenUtil.autoheight(80), 
        paddingBottom: ScreenUtil.autoheight(10),
    },
    imgBtnDAPP: {
        marginTop : ScreenUtil.autoheight(10), 
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(40),
        height: ScreenUtil.autoheight(40),
    },

});
export default FunctionsMore;


/**
 * 实现et.js/tp.js库对应的SDK 接口方法
 */

function callbackToSDK(methodName,callback, resp){
  if(Platform.OS === 'ios')
  {
    // NativeModules.SDKModule.presentViewControllerFromReactNative('DappActivity',this.state.selecturl);
  }else(Platform.OS === 'android')
  {
    NativeModules.SDKModule.callbackFromReactNative(methodName,callback, resp);
  }
}

// //输入密码,取私钥
function inputPwd(privateKey,salt,password,callback)
{
    // 解析密钥
    var plaintext_privateKey = "";
    try {
        var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, password + salt);
         plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
        if (plaintext_privateKey.indexOf('eostoken') != -1) {
            plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
        } else {
            plaintext_privateKey = "";
        }
    } catch (error) {
        plaintext_privateKey = "";
    }

    if (callback)  callback(plaintext_privateKey);
}

function eosTokenTransfer(methodName,params,password, callback)
{
    var str_res = '{"result":false,"data":{}}';
    var obj_param;
    try {
      obj_param = JSON.parse(params);
      if (!obj_param || !obj_param.from || !obj_param.to || !obj_param.amount || !obj_param.tokenName 
             || !obj_param.contract || !obj_param.precision || !password) {
        console.log('eosTokenTransfer:missing params; "from", "to", "amount", "tokenName","contract", "precision" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
      }
      var type_amount = typeof(obj_param.amount);
      if(type_amount == "number")
      {
        obj_param.amount = obj_param.amount.toString();
      }else if(type_amount == "string")
      {
          // 需要的是 string
      }else
      {
        console.log("eosTokenTransfer error: amount is not number or string");
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return ;
      }
      var type_precision = typeof(obj_param.precision);
      if(type_precision == "number")
      {
          // 需要的是 number
      }else if(type_precision == "string")
      {
        obj_param.precision = parseInt(obj_param.precision);
      }else
      {
        console.log("eosTokenTransfer error: precision is not number or string");
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return ;
      }
      if (password == "" || password.length < Constants.PWD_MIN_LENGTH) {
        console.log("eosTokenTransfer error: 密码长度错");
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return ;
      }
    } catch (error) {
      console.log("eosTokenTransfer error: %s",error.message);
      if (callback)  callbackToSDK(methodName,callback,str_res);
      return ;
    }
    //可选项
    obj_param.memo = obj_param.memo ? obj_param.memo : "";
    obj_param.address = obj_param.address ? obj_param.address : "";

    var res = new Object();
    res.result = false;
    res.data = {};

    var is_activePrivate = true; //是否使用active私钥

    new Promise(function(resolve, reject){
      g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
          if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
            reject({message:"get walletList error"});
          }else{
            for(var i = 0;i < walletArr.length;i++)
            {
              //激活的账户
              if((walletArr[i].isactived) && (walletArr[i].account == obj_param.from))
              {
                 if(obj_param.address)
                 {  //传公钥，则校验
                    if(walletArr[i].ownerPublic == obj_param.address)
                    {
                      is_activePrivate = false; //用owner私钥
                      break;
                    }else if((walletArr[i].activePublic == obj_param.address)){
                      is_activePrivate = true; //用active私钥
                      break;
                    }else{
                      //输入公钥 不匹配
                    }
                 }else{
                    break; 
                 }
              }
            }

            if(i >= walletArr.length)
            {
              reject({message:"from account is not exist or not actived"});
            }else{
              resolve(walletArr[i]);
            }
          }
        }
      });
    })
    .then((rdata)=>{
        var privateKey = (is_activePrivate == true) ? rdata.activePrivate : rdata.ownerPrivate;
        return  new Promise(function(resolve, reject){
          inputPwd(privateKey,rdata.salt,password,(data) => {
            if(data){
              //密码正确 ,返回私钥
              resolve(data);
            }else{
              //密码错误或取消
              reject({message:"inputPwd error"});
            }
          });
        });
    })
    .then((rdata)=>{
        var plaintext_privateKey = rdata; 
        Eos.transfer(obj_param.contract, obj_param.from, obj_param.to, formatEosQua(obj_param.amount + " " + obj_param.tokenName,obj_param.precision), obj_param.memo, plaintext_privateKey, true, (r) => {
            try {
              if(r && r.isSuccess)
              {
                g_props.dispatch({type: 'wallet/pushTransaction', payload: { from: obj_param.from, to: obj_param.to, amount: formatEosQua(obj_param.amount + " " + obj_param.tokenName,obj_param.precision), memo: obj_param.memo, data: "push"}});
                res.result = true;
                res.data.transactionId = r.data.transaction_id ? r.data.transaction_id : "";
                console.log("transfer ok");
              }else{
                var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
                console.log("transfer %s",errmsg);
                res.result = false;
                res.msg = errmsg;
              }
              str_res = JSON.stringify(res);
              if (callback)  callbackToSDK(methodName,callback,str_res);
            } catch (error) {
              console.log("eosTokenTransfer error: %s",error.message);
              if (callback)  callbackToSDK(methodName,callback,str_res);
            }
        });
    })
    .catch((error)=>{
        console.log("eosTokenTransfer error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
    });

}

function pushEosAction(methodName,params,password, callback)
{
    var str_res = '{"result":false,"data":{}}';
    var obj_param;
    try{
      obj_param = JSON.parse(params);
      if (!obj_param || !obj_param.actions || !obj_param.account || !obj_param.address || !password) {
          console.log('pushEosAction:missing params; "actions", "account", "address" is required ');
          if (callback)  callbackToSDK(methodName,callback,str_res);
          return;
      }
      if (password == "" || password.length < Constants.PWD_MIN_LENGTH) {
        console.log("pushEosAction error: 密码长度错");
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return ;
      }
    }catch(error){
      console.log("pushEosAction error: %s",error.message);
      if (callback)  callbackToSDK(methodName,callback,str_res);
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};

    var is_activePrivate = true; //是否使用active私钥
    
    new Promise(function(resolve, reject){
      g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
          if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
            reject({message:"get walletList error"});
          }else{
            for(var i = 0;i < walletArr.length;i++)
            {
              //激活的账户
              if((walletArr[i].isactived) && (walletArr[i].account == obj_param.account))
              {
                if(walletArr[i].ownerPublic == obj_param.address)
                {
                  is_activePrivate = false; //用owner私钥
                  break;
                }else if((walletArr[i].activePublic == obj_param.address)){
                  is_activePrivate = true; //用active私钥
                  break;
                }else{
                  //输入公钥 不匹配
                }
              }
            }

            if(i >= walletArr.length)
            {
              reject({message:"account is not exist or not actived"});
            }else{
              resolve(walletArr[i]); 
            }
          }
        }
      });
    })
    .then((rdata)=>{
        var privateKey = (is_activePrivate == true) ? rdata.activePrivate : rdata.ownerPrivate;
        return  new Promise(function(resolve, reject){
          inputPwd(privateKey,rdata.salt,password,(data) => {
            if(data){
              //密码正确 ,返回私钥
              resolve(data);
            }else{
              //密码错误或取消
              reject({message:"inputPwd error"});
            }
          });
        });
    })
    .then((rdata)=>{
        var plaintext_privateKey = rdata;
        Eos.transaction({actions: obj_param.actions}, plaintext_privateKey, (r) => {
          try {
            if(r && r.isSuccess)
            {
              res.result = true;
              res.data.transactionId = r.data.transaction_id ? r.data.transaction_id : "";
              console.log("pushEosAction ok");
            }else{
              var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
              console.log("pushEosAction %s",errmsg);
              res.result = false;
              res.msg = errmsg;
            }
            str_res = JSON.stringify(res);
            if (callback)  callbackToSDK(methodName,callback,str_res);
          } catch (error) {
            console.log("pushEosAction error: %s",error.message);
            if (callback)  callbackToSDK(methodName,callback,str_res);
          }
        
      });
    })
    .catch((error)=>{
        console.log("pushEosAction error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
    });

}
function getEosBalance(methodName,params, callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account || !obj_param.contract || !obj_param.symbol) {
        console.log('getEosBalance:missing params; "account", "contract", "symbol" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};
    res.msg = "";
    g_props.dispatch({
      type: 'wallet/getBalance', payload: { contract: obj_param.contract, account: obj_param.account, symbol: obj_param.symbol }, callback: (resp) => {
        try {
          if (resp && resp.code == '0') {
            if (resp.data == "") {
              res.data.balance = '0.0000';
            } else {
              res.data.balance = resp.data;
            }
            res.result = true;
            res.data.symbol = obj_param.symbol;
            res.data.contract = obj_param.contract;
            res.data.account = obj_param.account;
            res.msg = "success";
          } else {
              var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "");
              console.log("getEosBalance %s",errmsg);
              res.result = false;
              res.msg = errmsg;
          }
          str_res = JSON.stringify(res);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        } catch (error) {
          console.log("getEosBalance error: %s",error.message);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        }
      }
    })

  }catch(error){
    console.log("getEosBalance error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}

function getEosTableRows(methodName,params, callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.json || !obj_param.code || !obj_param.scope || !obj_param.table) {
        console.log('getEosTableRows:missing params; "json", "code", "scope", "table" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }

  var res = new Object();
  res.result = false;
  res.data = {};
  res.msg = "";

  var objpayload = new Object();
  objpayload.json = obj_param.json;
  objpayload.code = obj_param.code;
  objpayload.scope = obj_param.scope;
  objpayload.table = obj_param.table;
  if(obj_param.table_key)  
  {
    objpayload.table_key = obj_param.table_key;
  }
  if(obj_param.lower_bound)
  {
    objpayload.lower_bound = obj_param.lower_bound;
  }
  else if(obj_param.upper_bound)
  {
    objpayload.upper_bound = obj_param.upper_bound;
  }
  objpayload.limit = obj_param.limit ? obj_param.limit : 10;
  g_props.dispatch({
    type: 'wallet/getEosTableRows', payload: objpayload, callback: (resp) => {
      try {
        if (resp && resp.code == '0') {
          res.result = true;
          var obj = JSON.parse(resp.data);
          res.data.rows = obj.rows;
          res.msg = "success";
        } else {
            var errmsg = ((resp.data && resp.data.msg) ? resp.data.msg : "error");
            console.log("getEosTableRows %s",errmsg);
            res.result = false;
            res.msg = errmsg;
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      } catch (error) {
        console.log("getEosTableRows error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getEosTableRows error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}

function getEosAccountInfo(methodName,params, callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account) {
        console.log('getEosAccountInfo:missing params; "account" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
    
    var res = new Object();
    res.result = false;
    res.data = {};
    res.msg = "";
    g_props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: obj_param.account},callback: (resp) => {
      try {
        if(resp){
          res.result = true;
          res.data = resp;
          res.msg = "success";
        }else{
          res.result = false;
          res.msg = "fail";
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      } catch (error) {
        console.log("getEosAccountInfo error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      }
    } });

  }catch(error){
    console.log("getEosAccountInfo error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }
}
function getEosTransactionRecord(methodName,params, callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.account) {
        console.log('getEosTransactionRecord:missing params; "account" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
   
    obj_param.start = obj_param.start ? obj_param.start : 0;
    obj_param.count = obj_param.count ? obj_param.count : 10;
    if(obj_param.start < 0 || obj_param.count < 1){
      console.log('getEosTransactionRecord:params; "count","start" is error ');
      if (callback)  callbackToSDK(methodName,callback,str_res);
      return;
    }
    if(obj_param.sort){
        if(!(obj_param.sort == 'desc' || obj_param.sort == 'asc'))
        {
            throw new Error('sort should be desc or asc');
            console.log('getEosTransactionRecord:sort should be desc or asc ');
            if (callback)  callbackToSDK(methodName,callback,str_res);
            return;
        }
    }else{
      obj_param.sort = 'desc';
    }
    obj_param.token = obj_param.token ? obj_param.token : "";
    obj_param.contract = obj_param.contract ? obj_param.contract : "";

  var res = new Object();
  res.result = false;
  res.data = {};
  res.msg = "";

  var objpayload = new Object();
  objpayload.account = obj_param.account;
  objpayload.start = obj_param.start;
  objpayload.count = obj_param.count;
  objpayload.sort = obj_param.sort;
  if(obj_param.token)
  {
    objpayload.token = obj_param.token;
  }
  if(obj_param.contract)
  {
    objpayload.contract = obj_param.contract;
  }

  g_props.dispatch({
    type: 'wallet/getEosTransactionRecord', payload: objpayload, callback: (resp) => {
      try {
        if (resp && resp.code == '0') {
          res.result = true;
          res.data = resp.data;
          res.msg = "success";
        } else {
            var errmsg = ( resp.msg ? resp.msg : "");
            console.log("getEosTransactionRecord %s",errmsg);
            res.result = false;
            res.msg = errmsg;
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      } catch (error) {
        console.log("getEosTransactionRecord error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getEosTransactionRecord error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}

function eosAuthSign(methodName,params,password,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  var obj_param;
  try{
     obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.from || !obj_param.publicKey || !obj_param.signdata || !password) {
        console.log('eosAuthSign:missing params; "from","publicKey","signdata","password" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
    if (password == "" || password.length < Constants.PWD_MIN_LENGTH) {
      console.log("eosAuthSign error: 密码长度错");
      if (callback)  callbackToSDK(methodName,callback,str_res);
      return ;
    }
  }catch(error){
    console.log("eosAuthSign error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

  var res = new Object();
  res.result = false;
  res.data = {};
  res.msg = "";

  var is_activePrivate = true; //是否使用active私钥

  new Promise(function(resolve, reject){
    g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          reject({message:"get walletList error"});
        }else{
          for(var i = 0;i < walletArr.length;i++)
          {
            //激活的账户,账户,公钥匹配
            if((walletArr[i].isactived) && (walletArr[i].account == obj_param.from))
            {
              if(walletArr[i].ownerPublic == obj_param.publicKey)
              {
                is_activePrivate = false; //用owner私钥
                break;
              }else if((walletArr[i].activePublic == obj_param.publicKey)){
                is_activePrivate = true; //用active私钥
                break;
              }else{
                //输入公钥 不匹配
              }
            }
          }

          if(i >= walletArr.length)
          {
            reject({message:"account is not exist or not actived"});
          }else{
            resolve(walletArr[i]); 
          }
        }
      }
    });
  })
  .then((rdata)=>{
      var privateKey = (is_activePrivate == true) ? rdata.activePrivate : rdata.ownerPrivate;
      return  new Promise(function(resolve, reject){
        inputPwd(privateKey,rdata.salt,password,(data) => {
          if(data){
            //密码正确 ,返回私钥
            resolve(data);
          }else{
            //密码错误或取消
            reject({message:"inputPwd error"});
          }
        });
      });
  })
  .then((rdata)=>{
    var plaintext_privateKey = rdata;
    Eos.sign(obj_param.signdata, plaintext_privateKey, (r) => {
        try {
          if(r && r.isSuccess)
          {
            res.result = true;
            res.data.signature = r.data;
            res.data.ref = 'EosToken';
            res.data.signdata = obj_param.signdata;

            let  now = moment();
            res.data.timestamp = now.valueOf();
            res.data.wallet = obj_param.from;  

            res.msg = "success";
            console.log("eosAuthSign ok");
          }else{
            var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
            console.log("eosAuthSign %s",errmsg);
            res.result = false;
            res.msg = errmsg;
          }
          str_res = JSON.stringify(res);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        } catch (error) {
          console.log("eosAuthSign error: %s",error.message);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        }
    });
  })
  .catch((error)=>{
      console.log("eosAuthSign error: %s",error.message);
      if (callback)  callbackToSDK(methodName,callback,str_res);
  });

}

function getAppInfo(methodName,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var res = new Object();
    res.result = true;
    res.data = {name:"EosToken",system:"",version:"",sys_version:"26"};
    if(Platform.OS === 'ios')
    {
      res.data.system = "ios";
      res.data.sys_version =  "26";  //TODO
    }else{
      res.data.system = "android";
      res.data.sys_version =  "26";
    }
    res.data.version =  DeviceInfo.getVersion();
    res.msg = "success";
    str_res = JSON.stringify(res);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }catch(error){
    console.log("getAppInfo error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}

function getWalletList(methodName,params, callback)
{
  var str_res = '{wallets:{eos:[]}}';
  try{
    var obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.type) {
        console.log('getWalletList:missing params; "type" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
    var res = new Object();
    res.wallets = {eos:[]};
    g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
      try {
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          //返回错误
        }else{
          var objarray = new Array();
          for(var i = 0;i < walletArr.length;i++)
          {
             //激活账户才返回
            if(walletArr[i].isactived)
            {
              var tmpobj = new Object();
              tmpobj.name = walletArr[i].name;
              tmpobj.address = walletArr[i].activePublic;
              var floatbalance = 0;
              try {
                  floatbalance = parseFloat(walletArr[i].balance);
              } catch (error) {
                floatbalance = 0;
              }
              tmpobj.tokens = {eos:floatbalance}; 

              objarray[i] = tmpobj;
            }
          }
          res.wallets.eos = objarray;
          str_res = JSON.stringify(res);
        }
        if (callback)  callbackToSDK(methodName,callback,str_res);
      } catch (error) {
        console.log("walletList error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
      }
    }
  });

  }catch(error){
    console.log("getWalletList error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }
 
}
// function getDeviceId(methodName,callback)
// {
//   var str_res = '{"device_id":""}';
//   try{
//     var res = new Object();
//     // res.result = true;
//     // res.data = {device_id:"dexa23333"};
//     res.device_id = 'dexa23333';
//     str_res = JSON.stringify(res);
//   }catch(error){
//     console.log("getDeviceId error: %s",error.message);
//   }

//   if (callback)  callbackToSDK('getDeviceId',callback,str_res);
// }

// function shareNewsToSNS(methodName,params)
// {
//   try{
//     var obj_param = JSON.parse(params);
//     if (!obj_param || !obj_param.title || !obj_param.desc || !obj_param.url || !obj_param.previewImage) {
//         console.log('shareNewsToSNS:missing params; "title","desc","url","previewImage" is required ');
//         return;
//     }
//     //待分享 ,暂不实现

//   }catch(error){
//     console.log("shareNewsToSNS error: %s",error.message);
//   }
// }
// function invokeQRScanner(methodName,callback){
//   // var str_res = '{"result":false,"data":{}}';
//   var str_res = '';
//   try{
//     // var res = new Object();
//     // res.result = false;
//     // res.data = {qrResult:""};
//     var res = '';

//     const { navigate } = g_props.navigation;
//     navigate('BarCode', {isTurnOut:true,coinType:"EOS"});

//     DeviceEventEmitter.addListener('scan_result', (data) => {
//       if(data && data.toaccount){
//         // res.result = true;
//         // res.data = {qrResult:data.toaccount};
//         res = data.toaccount;
//       }else{
//         // res.result = false;
//       }

//       str_res = res;
//       // str_res = JSON.stringify(res);
//       if (callback)  callbackToSDK('invokeQRScanner',callback,str_res);
//     }); 

//   }catch(error){
//     console.log("invokeQRScanner error: %s",error.message);
//     if (callback)  callbackToSDK('invokeQRScanner',callback,str_res);
//   }

// }

function getCurrentWallet(methodName,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var res = new Object();
    res.result = false;
    res.data = {name:"",address:"",blockchain_id:4};
    res.msg = "";
    g_props.dispatch({
      type: 'wallet/getDefaultWallet', callback: (data) => {
          try {
            if (data != null && data.defaultWallet.account != null) {
              res.result = true;
              res.data.name = data.defaultWallet.name;
              res.data.address = data.defaultWallet.activePublic;
              res.msg = "success";
            } else {
                res.result = false;
                res.msg = "fail";
            }
            str_res = JSON.stringify(res);
            if (callback)  callbackToSDK(methodName,callback,str_res);
          } catch (error) {
            console.log("getDefaultWallet error: %s",error.message);
            if (callback)  callbackToSDK(methodName,callback,str_res);
          }
      }
    });

  }catch(error){
    console.log("getCurrentWallet error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}
function getWallets(methodName,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  try{
    var res = new Object();
    res.result = true;
    res.data = [];

    g_props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
       try {
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          res.result = false;
          res.msg = "fail";
        }else{
          res.result = true;
          var objarray = new Array();
          for(var i = 0;i < walletArr.length;i++)
          {
            //激活账户才返回
            if(walletArr[i].isactived)
            {
              var tmpobj = new Object();
              tmpobj.name = walletArr[i].name;
              tmpobj.address = walletArr[i].activePublic;
              tmpobj.blockchain_id = 4;  //4 for EOS

              objarray[i] = tmpobj;
            }
          }
          res.data = objarray;
          res.msg = "success";
        }
        str_res = JSON.stringify(res);
        if (callback)  callbackToSDK(methodName,callback,str_res);
       } catch (error) {
        console.log("getWallets error: %s",error.message);
        if (callback)  callbackToSDK(methodName,callback,str_res);
       }
    }

  });
    
  }catch(error){
    console.log("getWallets error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

}

function sign(methodName,params,password,device_id,callback)
{
  var str_res = '{"result":false,"data":{},"msg":""}';
  var obj_param;
  try{
     obj_param = JSON.parse(params);
    if (!obj_param || !obj_param.appid || !password) {
        console.log('sign:missing params; "appid" is required ');
        if (callback)  callbackToSDK(methodName,callback,str_res);
        return;
    }
    if (password == "" || password.length < Constants.PWD_MIN_LENGTH) {
      console.log("sign error: 密码长度错");
      if (callback)  callbackToSDK(methodName,callback,str_res);
      return ;
    }
  }catch(error){
    console.log("sign error: %s",error.message);
    if (callback)  callbackToSDK(methodName,callback,str_res);
  }

  var res = new Object();
  res.result = false;
  res.data = {};
  res.msg = "";

  new Promise(function(resolve, reject){
    g_props.dispatch({type:'wallet/getDefaultWallet',callback:(data)=>{ 
        if (data != null && data.defaultWallet.account != null)
        {
          resolve(data.defaultWallet);
        }
        else{
          reject({message:"getDefaultWallet error"});
        }
      }
    });
  })
  .then((rdata)=>{
      return  new Promise(function(resolve, reject){
        inputPwd(rdata.activePrivate,rdata.salt,password,(data) => {
          if(data){
            //密码正确 ,返回私钥
            resolve(data);
          }else{
            //密码错误或取消
            reject({message:"inputPwd error"});
          }
        });
      });
  })
  .then((rdata)=>{
    var plaintext_privateKey = rdata;
    Eos.sign(obj_param.appid, plaintext_privateKey, (r) => {
        try {
          if(r && r.isSuccess)
          {
            res.result = true;
            res.data.deviceId = device_id;  
            res.data.appid = obj_param.appid;

            let  now = moment();
            res.data.timestamp = now.valueOf();
            res.data.sign = r.data;
            res.msg = "success";
            console.log("sign ok");
          }else{
            var errmsg = ((r.data && r.data.msg) ? r.data.msg : "");
            console.log("sign %s",errmsg);
            res.result = false;
            res.msg = errmsg;
          }
          str_res = JSON.stringify(res);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        } catch (error) {
          console.log("sign error: %s",error.message);
          if (callback)  callbackToSDK(methodName,callback,str_res);
        }
    });
  })
  .catch((error)=>{
      console.log("sign error: %s",error.message);
      if (callback)  callbackToSDK(methodName,callback,str_res);
  });

}

function callMessage(methodName, params,password,device_id, callback)
{
  var str_res = '{"result":false,"data":{}}';

   if(!methodName)
   {
       console.log("methodName is required");
       if (callback)  callbackToSDK('callMessage',callback,str_res);
       return;
   }

   console.log("callMessage %s",methodName);
   switch(methodName){
       case 'eosTokenTransfer':
           eosTokenTransfer(methodName,params,password, callback);
           break;

       case 'pushEosAction':
           pushEosAction(methodName,params,password, callback);
           break;

       case 'getEosBalance':
           getEosBalance(methodName,params, callback);
           break;

       case 'getTableRows':
       case 'getEosTableRows':
           getEosTableRows(methodName,params, callback);
           break;

       case 'getEosAccountInfo':
           getEosAccountInfo(methodName,params, callback);
           break;

       case 'getEosTransactionRecord':
           getEosTransactionRecord(methodName,params, callback);
           break;

       case 'eosAuthSign':
           eosAuthSign(methodName,params,password, callback);
           break;

       //common
       case 'getAppInfo':
           getAppInfo(methodName,callback);
           break;    

       case 'getWalletList':
           getWalletList(methodName,params, callback);
           break;
       
      //  case 'getDeviceId':
      //      getDeviceId(methodName,callback);
      //      break;

      //  case 'shareNewsToSNS':
      //      shareNewsToSNS(methodName,params);
      //      break;

      //  case 'invokeQRScanner':
      //      invokeQRScanner(methodName,callback);
      //      break;

       case 'getCurrentWallet':
           getCurrentWallet(methodName,callback);
           break;

       case 'getWallets':
           getWallets(methodName,callback);
           break;     

       case 'sign':
           sign(methodName,params,password,device_id,callback);
           break;  
           
       default :
           console.log("methodName error");
          if (callback)  callbackToSDK('callMessage',callback,str_res);
           break;
   }
}
