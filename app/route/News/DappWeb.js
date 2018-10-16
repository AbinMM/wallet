import React, { Component } from 'react'
import {InteractionManager,Text,View,WebView,Animated,TextInput,Dimensions,StyleSheet,Modal,TouchableOpacity,Image} from 'react-native'
import UColor from '../../utils/Colors'

import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import UImage from '../../utils/Img'
import RenderScatter from './RenderScatter';
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { connect } from 'react-redux';
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import {formatEosQua} from '../../utils/FormatUtil';
// import { WalletList } from '../comps/WalletList';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet }) => ({ ...wallet }))
export default class DappWeb extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
      return {title:navigation.state.params.title,
        header:null,
    }
  }

  constructor(props) {
    super(props)
    this.props.dispatch({
        type: "wallet/getDefaultWallet",
        callback: data => {}
      });
      
    this.props.navigation.setParams({ onPress: this.share });
    this.state = {
      show: false,
      walletArr:null,
      fromAccount:'',
      toAccount:'',
      amount: '',
      memo: '',
      name: '',
      key: '', 
      password:'',
      progress: new Animated.Value(10),
      error: false,
      news: this.props.navigation.state.params.news,
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000)
    }
    let noop = () => { }
    this.__onLoad = this.props.onLoad || noop
    this.__onLoadStart = this.props.onLoadStart || noop
    this.__onError = this.props.onError || noop
  }

  _onLoad() {
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth,
      duration: 200
    }).start(() => {
      setTimeout(() => {
        this.state.progress.setValue(0);
      }, 300)
    })
    this.__onLoad()
  }
  _onLoadStart() {
    this.state.progress.setValue(0);
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth * .7,
      duration: 5000
    }).start()
    this.__onLoadStart()
  }
  _onError() {
    setTimeout(() => {
      this.state.progress.setValue(0);
    }, 300)
    this.setState({ error: true })
    this.__onError()
  }
    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
    inputPwd = () => {
        this._setModalVisible();
        const view =
            <View style={styles.passout}>
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

            try {

                var privateKey = this.state.walletArr.activePrivate;
                var permission = 'active';

                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.state.walletArr.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if(plaintext_privateKey == "eostoken"){ // active私钥为空时使用owner私钥
                    bytes_privateKey = CryptoJS.AES.decrypt(this.state.walletArr.ownerPrivate, this.state.password + this.state.walletArr.salt);
                    plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                    permission = "owner"; 
                }

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    EasyShowLD.loadingShow();
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transaction({
                        actions: [
                            {
                                account: "eosio.token",
                                name: "transfer", 
                                authorization: [{
                                actor: this.state.fromAccount,
                                permission: permission,
                                }], 
                                data: {
                                    from: this.state.fromAccount,
                                    to: this.state.toAccount,
                                    quantity: formatEosQua(this.state.amount + " EOS"),
                                    memo: this.state.memo,
                                }
                            },
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r && r.isSuccess){
                            this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.state.fromAccount, to: this.state.toAccount, amount: this.state.amount + " EOS", memo: this.state.memo, data: "push"}});
                            var obj_result = new Object();
                            obj_result.scatter = this.state.name;
                            obj_result.key = this.state.key;

                            var transaction_id = r.data.transaction_id ? r.data.transaction_id : "";
                            obj_result.data = {result:transaction_id};
                            this.refs.refWebview.postMessage(JSON.stringify(obj_result));
                        }else{
                            if(r && r.data){
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
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
            // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    }

  onMessage = (e) =>{
    let result = JSON.parse(e.nativeEvent.data);
    if(result.scatter==="getCurrencyBalance"){
      this.props.dispatch({type:'wallet/balanceScatter',payload:{...result.params},callback:(res)=>{
        this.refs.refWebview.postMessage(JSON.stringify({...result,data:res}));
      }});
    }else if(result.scatter==="getAccount"){
      this.props.dispatch({type:'wallet/getAccount',payload:{...result.params},callback:(res)=>{
        if(res.code==0){
          this.refs.refWebview.postMessage(JSON.stringify({...result,data:res.data}));
        }else{
        //   Toast.show(res.msg);
        }
      }});
    }else if(result.scatter==="transaction"){
    //   DappTx.show(result.params.actions,()=>{
    //     account = WalletUtils.selectAccount();
    //     Auth.show(account,(pk)=>{
    //       Loading.show("提交中...");
    //       Eos.transaction(pk,result.params.actions,(r)=>{
    //         Loading.dismis();
    //         if(r.isSuccess){
    //           this.refs.refWebview.postMessage(JSON.stringify({...result,data:r.data}));
    //         }else{
    //         //   Toast.show(r.msg);
    //         }
    //       })
    //     },()=>{
          
    //     });
    //   });
    }else if(result.scatter==="transfer"){
        this.dapp_transfer(result);
    }else if(result.scatter==="noaccount"){
    //   Toast.show("请导入账户");
      InteractionManager.runAfterInteractions(() => {
        // WalletList.show(Globle.wallet,false,(select)=>{
          
        // });
      });
    }
  }

  dapp_transfer(result) {
    this.setState({
        walletArr: null,
        fromAccount:'',
        toAccount:'',
        amount: '',
        memo: '',
        name: '',
        key: '',
    });
    this.props.dispatch({type:'wallet/walletList',callback:(walletArr)=>{ 
        if (walletArr == undefined || walletArr == null || walletArr.length < 1) {
          EasyToast.show("get walletList error");
        }else{
          for(var i = 0;i < walletArr.length;i++)
          {
            //激活的账户
            if((walletArr[i].isactived) && (walletArr[i].account == result.params.from))
            {
                break;
            }
          }

          if(i >= walletArr.length)
          {
            EasyToast.show("from account is not exist or not actived");
          }else{
            this._setModalVisible();
            var tmp_amount = result.params.amount.replace(" EOS","");
            tmp_amount = tmp_amount.replace("EOS","");
            tmp_amount = tmp_amount.replace(" eos","");
            tmp_amount = tmp_amount.replace("eos","");
            this.setState({
                walletArr: walletArr[i],
                fromAccount:result.params.from,
                toAccount:result.params.to,
                amount: tmp_amount,
                memo: result.params.memo,
                name: result.scatter,
                key: result.key,
            });
          }
        }
      }
    });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.btnColor }}>
        <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.title} avatar={this.state.news && UImage.share_i} onPressRight={this.state.news && this.share.bind()}/>
        <WebView
            ref="refWebview"
            source={{uri:this.props.navigation.state.params.url}}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            scalesPageToFit={false}
            injectedJavaScript = {RenderScatter(this.props)}
            style={[styles.webview_style,{backgroundColor: UColor.btnColor}]}
            onLoad={this._onLoad.bind(this)}
            onLoadStart={this._onLoadStart.bind(this)}
            onError={this._onError.bind(this)}
            onMessage={(e)=>{this.onMessage(e)}}
          >
        </WebView>
        <View style={[styles.infoPage,{backgroundColor: UColor.secdColor},this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <View style={{backgroundColor: UColor.riceWhite,}}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={[styles.modalStyle,{ backgroundColor: UColor.mask}]} activeOpacity={1.0}>  
                    <View style={{ width: ScreenWidth,backgroundColor: UColor.btnColor,}}>
                        <View style={styles.subView}>
                            <Text style={styles.buttontext}/>
                            <Text style={[styles.titleText,{color: UColor.blackColor}]}>订单详情</Text>
                            <Button  onPress={this._setModalVisible.bind(this)} style={styles.buttonView}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                            <Text style={[styles.amounttext,{color:UColor.blackColor}]}>{this.state.amount} </Text>
                            <Text style={[styles.unittext,{color:UColor.blackColor}]}> EOS</Text>
                        </View>
                        <View >
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>收款账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.toAccount}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]}>
                                <Text style={[styles.explainText,{color: UColor.startup}]}>转出账户：</Text>
                                <Text style={[styles.contentText,{color: UColor.startup}]}>{this.state.fromAccount}</Text>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.mainsecd}]} >
                                <Text style={[styles.explainText,{color: UColor.startup}]}>备注：</Text> 
                                <Text style={[styles.contentText,{color: UColor.startup}]} numberOfLines={1}>{this.state.memo}</Text> 
                            </View>
                            {this.state.memo== ""&&
                            <View style={[styles.warningoutShow,{borderColor: UColor.showy}]}>
                                <View style={{flexDirection: 'row',alignItems: 'center',}}>
                                    <Image source={UImage.warning_h} style={styles.imgBtn} />
                                    <Text style={[styles.headtext,{color: UColor.showy}]} >温馨提示</Text>
                                </View>
                                <Text style={[styles.headtitle,{color: UColor.showy}]}>如果您是向交易所转账，请务必填写相应的备注（MEMO）信息，否则可能无法到账。</Text>
                            </View>}
                            
                            <Button onPress={() => { this.inputPwd() }}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确认</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
        <Animated.View style={[styles.progress, {backgroundColor: UColor.fallColor, width: this.state.progress }]}></Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    passout: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        borderBottomWidth: 1,
        textAlign: "center",
        width: ScreenWidth-100,
        height:  ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom:  ScreenUtil.autoheight(5),
    },
    webview_style: {
      flex: 1,
    },
    progress: {
      position: "absolute",
      height: 5,
      left: 0,
      top: 64,
      overflow: "hidden",
    },
    infoPage: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      paddingTop: 50,
      alignItems: "center",
      transform: [
        { translateX: ScreenWidth }
      ],
    },
    showInfo: {
      transform: [
        { translateX: 0 }
      ]
    },
    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    subView: {
        flexDirection: "row", 
        alignItems: 'center',
        height:  ScreenUtil.autoheight(50), 
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center', 
    },
    buttontext: {
        textAlign: 'center',
        width:  ScreenUtil.autoheight(50),
        fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
        flex: 1,
        fontWeight: 'bold', 
        textAlign:'center',
        fontSize: ScreenUtil.setSpText(18),
    },
    explainText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(18),
    },
    contentText: {
        flex: 1,
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(18),
    },
    separationline: {
        alignItems: 'center',
        flexDirection: "row",
        borderBottomWidth: 0.5,
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(50),
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
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height:  ScreenUtil.autoheight(45),
        marginVertical: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autoheight(15),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
    btnnextstep: {
        height:  ScreenUtil.autoheight(85),
        marginTop:  ScreenUtil.autoheight(30),
    },
    nextstep: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(20),
        height:  ScreenUtil.autoheight(45),
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(15),
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
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: "column",
        marginTop: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(20),
        paddingVertical:  ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginRight: ScreenUtil.autowidth(10),
    },
    headtext: {
        fontWeight: "bold",
        fontSize: ScreenUtil.setSpText(14), 
    },
    headtitle: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight:  ScreenUtil.autoheight(20),
    },
  })