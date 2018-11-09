import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Platform, DeviceEventEmitter, StyleSheet, View, Clipboard, Text, ScrollView, Image, Linking, TextInput, Modal, TouchableWithoutFeedback, Animated, TouchableOpacity } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Item from '../../components/Item'
import Button from '../../components/Button'
import Header from '../../components/Header'
import JPushModule from 'jpush-react-native';
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import TextButton from '../../components/TextButton'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'
import {AlertModal,AlertModalView} from '../../components/modals/AlertModal'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet, login, vote }) => ({ ...wallet, ...login, ...vote }))
class WalletDetail extends BaseComponent {

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "账户详情",
      header:null,  
    };
  };

  constructor(props) {
    super(props);
    this.config = [
      {  name: "资源管理", onPress: this.goPage.bind(this, "Resources") },
      {  name: "账户详细信息", onPress: this.goPage.bind(this, "SeeBlockBrowser") },
      {  name: "交易授权", onPress: this.goPage.bind(this, "AuthExchange") },
      {name: "导出公钥", onPress: this.goPage.bind(this, "ExportPublicKey") },
      {name: "更改密码",  onPress: this.goPage.bind(this, "ModifyPassword") },
      {name: "备份私钥", onPress: this.goPage.bind(this, "BackupsPkey") },
      {name: "权限管理", onPress: this.goPage.bind(this, "AuthManage") },
    ];
    paramsdata = this.props.navigation.state.params.data,
    this.state = {
      mortgage: '0.00EOS',
      ram_available: '0.00kb',
      password: '',
      txt_owner: '',
      txt_active: '',
      accumulative: 0,
      modalwl: false,
      keytitle: '',
      PublicPrivate: false,
      ownerPk: '',
      activePk: '',
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
    }
    DeviceEventEmitter.addListener('modify_password', () => {
      this.props.navigation.goBack();
    });
  }

  //组件加载完成
  componentDidMount() {
    //获取已抵押资源和RAM
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: paramsdata.name},callback: (resources) => {
      if(resources != null){
        this.setState({
          assetRefreshing: false,
          mortgage: resources.self_delegated_bandwidth ? Math.floor(resources.self_delegated_bandwidth.cpu_weight.replace("EOS", "")*100 + resources.self_delegated_bandwidth.net_weight.replace("EOS", "")*100)/100 + 'EOS' : '0.00EOS',
          allowance: resources.display_data ? resources.display_data.ram_left.replace("kb", "") : '0',
          ram_available: resources.display_data ? resources.display_data.ram_left : 'O.00kb' ,
        })
      }
    }});
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  goPage(key, data) {
    const { navigate } = this.props.navigation;
    if(key=="CpuNet"){
      navigate('CpuNet', {});
    }else if(key=="Ram"){
      navigate('Ram', {});
    }else if (key == 'ModifyPassword') {
      navigate('ModifyPassword', paramsdata);
    }else if(key == 'PublicKey') {
      if(paramsdata != null && paramsdata != ''){
        this.setState({
          PublicPrivate: false,
          ownerPk: paramsdata.ownerPublic,
          activePk: paramsdata.activePublic,
        });
        this._wlshow ();
      }
    }else if (key == 'PrivateKey' ) {
      AuthModal.show(paramsdata.account, (authInfo) => {
        try {
            if(authInfo.isOk){
              var ownerPrivateKey = paramsdata.ownerPrivate;
              var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), authInfo.password + paramsdata.salt);
              var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
              var activePrivateKey = paramsdata.activePrivate;
              var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), authInfo.password + paramsdata.salt);
              var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
              if (plaintext_words_owner.indexOf('eostoken') != - 1) {
                  if(plaintext_words_owner==plaintext_words_active){
                      this.setState({
                          activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
                          PublicPrivate: true,
                          samePk:true,
                      });
                      this._wlshow ();
                  }else{
                      this.setState({
                          ownerPk: plaintext_words_owner.substr(8, plaintext_words_owner.length),
                          activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
                          PublicPrivate: true,
                          samePk:false,
                      });
                      this._wlshow ();
                  }
              }
            }
            EasyShowLD.dialogClose();
        } catch (error) {
          EasyShowLD.dialogClose();
          EasyToast.show('未知异常');
        }
      });
    }else if(key == 'AuthManage'){
      if(paramsdata.isactived){     
        navigate('AuthManage', {wallet: paramsdata});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入权限管理")
      }
    }else if(key == 'Resources') {
      if(paramsdata.isactived){
        navigate('Resources', {account_name:paramsdata.name});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入资源管理")
      }
    }else if(key=="AuthExchange"){
      if(paramsdata.isactived){     
        navigate('AuthExchange', {wallet: paramsdata});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入交易授权")
      }
    }
  }
  
  //删除账户
  deleteAccount = (c,data) => {
    if(!c.isactived || !c.hasOwnProperty('isactived')){
      //未激活
      this.deleteWarning(c,data);
    }else{
      AlertModal.show("免责声明","系统检测到该账号已经激活!如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','返回钱包',(resp)=>{
        if(resp){
            this.deleteWallet();
        }
      });
    }
  }

  deleteWarning = (c,data) => {
    AlertModal.show("免责声明","删除过程中会检测您的账号是否已激活，如果您没有备份私钥，删除后将无法找回！请确保该账号不再使用后再删除！",'下一步','返回钱包',(resp)=>{
      if(resp){
        EasyShowLD.loadingShow();
        //检测账号是否已经激活
        this.props.dispatch({
            type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: c.name, owner: c.ownerPublic, active: c.activePublic}, callback:(result) =>{
              EasyShowLD.dialogClose();
              if(result.code == 0 && result.data == true){
                AlertModal.show("免责声明","系统检测到该账号已经激活!如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','返回钱包',(resp)=>{
                  if(resp){
                      this.deleteWallet();
                    }
                    EasyShowLD.dialogClose();
                  });
              }else if(result.code == 521){
                AlertModal.show("免责声明","系统检测到该账号还没激活，如果您不打算激活此账号，建议删除。",'删除','取消',(resp)=>{
                  if(resp){
                    this.deletionDirect();
                    }
                    EasyShowLD.dialogClose();
                  });
              }else if(result.code == 515){
                AlertModal.show("免责声明","系统检测到该账号已经被别人抢注，强烈建议删除。",'删除','取消',(resp)=>{
                  if(resp){
                    this.deletionDirect();
                    }
                    EasyShowLD.dialogClose();
                  });
              }else {
                AlertModal.show("免责声明","网络异常, 暂不能检测到账号是否已经激活, 建议暂不删除此账号, 如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','取消',(resp)=>{
                  if(resp){
                    this.deletionDirect();
                    }
                    EasyShowLD.dialogClose();
                  });
              }
            }
        })
      }
    });
  }

  //已激活账号需要验证密码
  deleteWallet () {
    EasyShowLD.dialogClose();
    AuthModal.show(paramsdata.account, (authInfo) => {
      try {
          if(authInfo.isOk){
              var data = paramsdata;
              var ownerPrivateKey = paramsdata.ownerPrivate;
              var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), authInfo.password + paramsdata.salt);
              var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
              if (plaintext_words.indexOf('eostoken') != - 1) {
                plaintext_words = plaintext_words.substr(8, plaintext_words.length);
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
                //删除tags
                JPushModule.deleteTags([data.name],map => {
                  if (map.errorCode === 0) {
                    console.log('Delete tags succeed, tags: ' + map.tags)
                  } else {
                    console.log(map)
                    console.log('Delete tags failed, error code: ' + map.errorCode)
                  }
                });
                DeviceEventEmitter.addListener('delete_wallet', (tab) => {
                  this.props.navigation.goBack();
                });
              } else {
                EasyToast.show('您输入的密码不正确');
              }
          }
          EasyShowLD.dialogClose();
      } catch (error) {
        EasyShowLD.dialogClose();
        EasyToast.show('未知异常');
      }
    });
  }

  //未激活账号直接删除
  deletionDirect () {
    EasyShowLD.dialogClose();
    var data = paramsdata;
    this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
    //删除tags
    JPushModule.deleteTags([data.name],map => {
      if (map.errorCode === 0) {
        console.log('Delete tags succeed, tags: ' + map.tags)
      } else {
        console.log(map)
        console.log('Delete tags failed, error code: ' + map.errorCode)
      }
    });
    DeviceEventEmitter.addListener('delete_wallet', (tab) => {
      this.props.navigation.goBack();
    });
  }

  _wlshow () {
    if(this.isShow)return;
    this.isShow = true;
    window.currentDialog = this;
    this.setState({modalwl:true,});
    Animated.parallel([
      Animated.timing(this.state.mask,{toValue:0.6,duration:400}),
      Animated.timing(this.state.alert,{toValue:1,duration:300})
    ]).start(() => {});
  }

  _wldimss () {
    if(!this.isShow)return;
    window.currentDialog = null;
    Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0,duration:400}),
        Animated.timing(this.state.alert,{toValue:0,duration:300})
    ]).start(() => {
        this.setState({modalwl:false});
        this.isShow = false;
    });
  }

  prot (key) {
    const { navigate } = this.props.navigation; 
    if(key == 'activePk'){
        Clipboard.setString(this.state.activePk);
        if(this.state.PublicPrivate){
          if(this.state.samePk){
              EasyToast.show('钱包私钥已复制成功');
          }else{
              EasyToast.show('Active私钥已复制成功');
          }
        }else{
          EasyToast.show('Active公钥已复制成功');
        }
    } else if(key == 'ownerPk'){
      Clipboard.setString(this.state.ownerPk);
      if(this.state.PublicPrivate){
        EasyToast.show('Owner私钥已复制成功');
      }else{
        EasyToast.show('Owner公钥已复制成功');
      }
    }else  if(key == 'problem') {
      navigate('Web', { title: "什么是私钥", url: "http://news.eostoken.im/html/Keystore.html" });   
    }
  }

  render() {
    const balance = this.props.navigation.state.params.balance ? this.props.navigation.state.params.balance : "0.0000";
    const isEye = this.props.navigation.state.params.isEye
    return (<View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>    
      <Header {...this.props} onPressLeft={true} title={"账户详情"} />
      <View style={[styles.walletout,{backgroundColor: UColor.mainColor}]}>
          <View style={{borderRadius: 6,}}>
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} topfirst={ScreenUtil.autowidth(7)} name="账户名" disable={true} subName={paramsdata.name}/>
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} name="余额" disable={true} subName={(isEye ? (paramsdata.isactived && paramsdata.balance != null && paramsdata.balance != ""? paramsdata.balance : balance) : "******") + 'EOS'}/>
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} topfirst={ScreenUtil.autowidth(17)} name="已抵押资源" subName={this.state.mortgage + ''} onPress={this.goPage.bind(this, "CpuNet")}/>
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} name="RAM" subName={this.state.ram_available} onPress={this.goPage.bind(this, "Ram")}/>
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} topfirst={ScreenUtil.autowidth(17)} name="更改密码" onPress={this.goPage.bind(this, "ModifyPassword")} />
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} name="查看公钥" onPress={this.goPage.bind(this, "PublicKey")} />
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} name="导出私钥" onPress={this.goPage.bind(this, "PrivateKey")}   />
          <Item first={1} itemHeight={ScreenUtil.autoheight(40)} name="权限管理" onPress={this.goPage.bind(this, "AuthManage")}  />
        </View>
      </View>
      
      <View style={{flex: 1, alignItems: 'center',justifyContent: 'flex-end', paddingBottom: ScreenUtil.autoheight(20),}}>
        <TextButton onPress={this.deleteAccount.bind(this, paramsdata)} textColor="#fff" text="删除账户"  shadow={true} 
          style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
      </View>

      {this.state.modalwl && <View style={styles.continer}>
        <TouchableWithoutFeedback onPress={()=>{this._wldimss()}}>
          <View style={[styles.content,]}>
            <Animated.View style={[styles.mask,{opacity:this.state.mask,}]} />
            <View style={styles.alertContent}>
              <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                <View style={[styles.touchableout,{backgroundColor:'#FFFFFF'}]}>
                  <View style={{paddingHorizontal: ScreenUtil.autowidth(22),paddingBottom:ScreenUtil.autowidth(18), alignItems: 'center',}}>
                    <Text style={{fontSize: ScreenUtil.setSpText(16), color: '#3B80F4', fontWeight: 'bold',marginBottom: ScreenUtil.autowidth(6),}}>{this.state.PublicPrivate ? '导出私钥' : '查看公钥'}</Text>
                    {this.state.PublicPrivate && <Text style={{fontSize: ScreenUtil.setSpText(12), color: '#3B80F4'}}>• 安全警告：私钥未经加密，请妥善保管！</Text>}
                  </View>
                  {this.state.activePk != "" && <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                      <Text style={[styles.inptitle,{color: '#555555'}]}>{this.state.PublicPrivate ? 'Active私钥' : 'Active公钥'}</Text>
                      <TouchableOpacity  onPress={this.prot.bind(this, 'activePk')}>
                        <Text style={{fontSize: ScreenUtil.setSpText(12), color: '#3B80F4', paddingHorizontal: ScreenUtil.autowidth(33), }}>复制</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.inptgo,{borderColor: '#D9D9D9'}]}> 
                      <Text style={[styles.inptext,{color: '#808080',borderColor: '#D9D9D9'}]}>{this.state.activePk}</Text>
                    </View>
                  </View>}
                  {this.state.ownerPk != "" && <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                    <View style={{flexDirection: 'row',alignItems: 'center',}}>
                      <Text style={[styles.inptitle,{color: '#555555',}]}>{this.state.PublicPrivate ? 'Owner私钥' : 'Owner公钥'}</Text>
                      <TouchableOpacity   onPress={this.prot.bind(this, 'ownerPk')}>
                        <Text style={{fontSize: ScreenUtil.setSpText(12), color: '#3B80F4', paddingHorizontal: ScreenUtil.autowidth(33), }}>复制</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.inptgo,{borderColor: '#D9D9D9'}]}>
                      <Text style={[styles.inptext,{color: '#808080',borderColor: '#D9D9D9'}]}>{this.state.ownerPk}</Text>
                    </View>
                  </View> }
                  <View style={{position: 'absolute', bottom: -ScreenUtil.autowidth(21), alignItems: 'center',justifyContent: 'center',}}>
                    <TextButton onPress={() => this._wldimss()} textColor="#FFFFFF" text="完成"  bgColor={'#3B80F4'} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>}
    </View>)
  }
}


const styles = StyleSheet.create({
  continer:{
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 99999,
    flex: 1,
    width:"100%",
    height:"100%"
  },
  content:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    flex:1,
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 0,
    width:"100%",
    height:"100%",
  },
  alertContent:{
    width:"100%",
    height:"100%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"rgba(0, 0, 0, 0.54)",
  },
  alert:{
    flex:1,
    width:"100%",
    borderRadius:4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title:{
    color:"#1A1A1A",
    fontWeight:"bold",
    textAlign:"center",
    lineHeight:ScreenUtil.setSpText(26),
    fontSize:ScreenUtil.setSpText(16),
    marginTop:ScreenUtil.setSpText(18),
    margin:ScreenUtil.setSpText(10)
  },
  touchableout: {
    borderRadius: 5,
    alignItems: 'center',
    width: ScreenWidth - ScreenUtil.autowidth(92),
    paddingVertical: ScreenUtil.autowidth(22),
  },


  inptoutgo: {
    alignItems: 'center',
    width: ScreenWidth - ScreenUtil.autowidth(92),
    paddingBottom: ScreenUtil.autoheight(15),
  },
  inptitle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(23),
    paddingHorizontal: ScreenUtil.autowidth(33), 
  },
  inptgo: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: ScreenUtil.autowidth(10),
    paddingVertical: ScreenUtil.autowidth(8),
    width: ScreenWidth - ScreenUtil.autowidth(144),
  },
  inptext: {
    flexWrap: 'wrap',
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(23),
  },


  inptpasstext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autoheight(20),
    marginBottom: ScreenUtil.autoheight(15),
  },
  passoutsource: {
    alignItems: 'center',
    flexDirection: 'column', 
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
  walletout: { 
    borderRadius: 6, 
    margin: ScreenUtil.autowidth(15), 
    paddingHorizontal: ScreenUtil.autowidth(10), 
    paddingTop: ScreenUtil.autowidth(7), 
    paddingBottom: ScreenUtil.autowidth(15), 
  },
  accountout: { 
    flexDirection: "row",
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  accounttext: { 
    fontSize: ScreenUtil.setSpText(24), 
    marginBottom: ScreenUtil.autoheight(10), 
  },
  company: {
    fontSize: ScreenUtil.setSpText(15),
    marginBottom: ScreenUtil.autoheight(5),
  },
  topout: {
    flexDirection: "row",
    alignItems: 'center',
  },
  category: {
    fontSize: ScreenUtil.setSpText(16),
  },
  outname: {
    fontSize: ScreenUtil.setSpText(14),
  },
  imgBtn: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  stopoutBackupsout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  stopoutBackups: {
    paddingVertical: 1,
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(10),
    paddingHorizontal: ScreenUtil.autowidth(8),
  },
  notactivedout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notactived: {
    paddingVertical: 1,
    textAlign: 'center', 
    fontSize: ScreenUtil.setSpText(10),
    paddingHorizontal: ScreenUtil.autowidth(8),
  },
  deleteout: {
    alignItems: 'center',
    justifyContent: 'center', 
    height: ScreenUtil.autoheight(50), 
  },
  delete: { 
    fontSize: ScreenUtil.setSpText(18), 
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subView: {
    borderRadius: 10,
    borderWidth: 0.5,
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  closeText: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(50),
    height: ScreenUtil.autowidth(50),
  },
  buttonText: {
    fontSize: ScreenUtil.setSpText(16),
  },
  eosparkout: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "row", 
    marginBottom: ScreenUtil.autoheight(18), 
    marginHorizontal: ScreenUtil.autowidth(20), 
    paddingVertical: ScreenUtil.autoheight(15),  
    paddingHorizontal: ScreenUtil.autowidth(11), 
  },
  eosecoout: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "row",
    marginBottom: ScreenUtil.autoheight(34), 
    marginHorizontal: ScreenUtil.autowidth(20), 
    paddingVertical: ScreenUtil.autoheight(15), 
    paddingHorizontal: ScreenUtil.autowidth(11), 
  },
  titletext: {
    flex: 1, 
    fontSize: ScreenUtil.setSpText(20), 
  },
  eosparktext: { 
    borderRadius: 5, 
    alignItems: 'center',
    justifyContent: 'center', 
    width: ScreenUtil.autowidth(64), 
    height: ScreenUtil.autoheight(30), 
  },
  eosecotext: { 
    borderRadius: 5, 
    alignItems: 'center',
    justifyContent: 'center', 
    width: ScreenUtil.autowidth(64), 
    height: ScreenUtil.autoheight(30), 
  },

  footer:{
    borderRadius: 5,
    left: 0,
    right: 0,
    bottom: 0,
    position:'absolute',
    flexDirection:'row',  
    height: ScreenUtil.autoheight(50),   
    paddingTop: ScreenUtil.autoheight(1),
  },
  footoutsource:{
    flex:1, 
    flexDirection:'row',
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  activationimg: {
    width: ScreenUtil.autowidth(18),
    height: ScreenUtil.autowidth(18)*1.1428,
    marginRight: ScreenUtil.autowidth(5),
  },
  deleteimg: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginRight: ScreenUtil.autowidth(5),
  },

 
});

export default WalletDetail;
