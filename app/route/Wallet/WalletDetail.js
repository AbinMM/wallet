import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, StyleSheet, View, Clipboard, Text, ScrollView, Image, Linking, TextInput, Modal } from 'react-native';
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

@connect(({ wallet, login }) => ({ ...wallet, ...login }))
class WalletDetail extends BaseComponent {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      // headerTitle: params.data.name,
      headerTitle: "账户管理",
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
    this.state = {
      password: '',
      show: false,
      txt_owner: '',
      txt_active: '',
      integral: 0,
      accumulative: 0,
    }
    DeviceEventEmitter.addListener('modify_password', () => {
      this.props.navigation.goBack();
    });
  }

  //组件加载完成
  componentDidMount() {
    this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
      this.setState({integral: data.data});
    } });
    alert(JSON.stringify(this.props.navigation.state.params.data));
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  // 显示/隐藏 modal  
  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  goPage(key, data) {
    const { navigate } = this.props.navigation;
    if (key == 'BackupsPkey' ) {
      AuthModal.show(this.props.navigation.state.params.data.account, (authInfo) => {
        try {
            if(authInfo.isOk){
              navigate('BackupsPkey', { wallet: this.props.navigation.state.params.data, password:authInfo.password, entry: "walletDetails"});
            }
            EasyShowLD.dialogClose();
        } catch (error) {
          EasyShowLD.dialogClose();
          EasyToast.show('未知异常');
        }
      });
    } else if(key == 'ExportPublicKey') {
      navigate('ExportPublicKey', { ownerPublicKey: this.props.navigation.state.params.data.ownerPublic, activePublicKey:this.props.navigation.state.params.data.activePublic});
    } else if (key == 'ModifyPassword') {
      navigate('ModifyPassword', this.props.navigation.state.params.data);
    } else if (key == 'Resources') {
      if(this.props.navigation.state.params.data.isactived){
        navigate('Resources', {account_name:this.props.navigation.state.params.data.name});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入资源管理")
      }
      
    } else if(key == 'SeeBlockBrowser'){
      if(this.props.navigation.state.params.data.isactived){
        this.setState({ show: true,})
      }else{
        EasyToast.show("该账号还没激活，激活之后才能查看详细信息")
      }
    }else if(key == 'AuthManage'){
      if(this.props.navigation.state.params.data.isactived){     
        navigate('AuthManage', {wallet: this.props.navigation.state.params.data});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入权限管理")
      }
    }else if(key=="AuthExchange"){
      if(this.props.navigation.state.params.data.isactived){     
        navigate('AuthExchange', {wallet: this.props.navigation.state.params.data});
      }else{
        EasyToast.show("该账号还没激活，激活之后才能进入交易授权")
      }
    }
    else{

    }
  }
 
  eospark() {
    this._setModalVisible();
    EasyShowLD.dialogClose()
    Linking.openURL("https://eosmonitor.io/account/" + this.props.navigation.state.params.data.name);
  }

  eoseco() {
    this._setModalVisible();
    EasyShowLD.dialogClose()
    Linking.openURL("https://eoseco.com/accounts/" + this.props.navigation.state.params.data.name);
  }

  importWallet() {
    const { navigate, goBack } = this.props.navigation;
    navigate('ImportKey', this.props.navigation.state.params.data);
  }

  copy() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
    Clipboard.setString('OwnerPrivateKey: ' + this.state.txt_owner + "\n" + 'ActivePrivateKey: ' + this.state.txt_active);
    EasyToast.show("复制成功")
  }

  deleteWarning(c,data){
    
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

  deleteAccount(c,data){
    if(!c.isactived || !c.hasOwnProperty('isactived'))
    {
      //未激活
      this.deleteWarning(c,data);
    }
    else{

     AlertModal.show("免责声明","系统检测到该账号已经激活!如果执意删除请先导出私钥并保存好，否则删除后无法找回。",'执意删除','返回钱包',(resp)=>{
      if(resp){
          this.deleteWallet();
        }
        // EasyShowLD.dialogClose();
      });
    }
  }

  //未激活账号直接删除
  deletionDirect() {
    EasyShowLD.dialogClose();
    var data = this.props.navigation.state.params.data;
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

  //已激活账号需要验证密码
  deleteWallet() {
    EasyShowLD.dialogClose();

    AuthModal.show(this.props.navigation.state.params.data.account, (authInfo) => {
      try {
          if(authInfo.isOk){
              var data = this.props.navigation.state.params.data;
              var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
              var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), authInfo.password + this.props.navigation.state.params.data.salt);
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

  activeWalletOnServer(){
    const { navigate } = this.props.navigation;
    let wallet = this.props.navigation.state.params.data
    let name = wallet.account;
    let owner = wallet.ownerPublic;
    let active = wallet.activePublic;
    try {
      EasyShowLD.loadingShow('正在请求');
      //检测账号是否已经激活
      this.props.dispatch({
        type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
          EasyShowLD.loadingClose();
            if(result.code == 0 && result.data == true){
                wallet.isactived = true
                this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                AlertModal.show("恭喜激活成功",""+name,'知道了',null,(resp)=>{
                  EasyShowLD.dialogClose();
                });
            }else if(result.code == 500){ // 网络异常
              EasyToast.show(result.msg);
            }else if(result.code == 515){
              EasyToast.show("账号已被别人占用，请换个账号吧！");
            }else{
              navigate('ActivationAt', {parameter:wallet, entry: "activeWallet"});
            }
        }
    });
    } catch (error) {
      EasyShowLD.loadingClose();
      navigate('ActivationAt', {parameter:wallet});
      return false;
    }
  
  }

  activeWallet(data) {
    const { navigate } = this.props.navigation;
    if(data.name.length != 12){
      EasyToast.show('该账号格式无效，无法进行激活！');
    }else{
      // 通过后台激活账号
      this.activeWalletOnServer();
    }
  }

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'Explain') {
      EasyShowLD.dialogClose()
    navigate('Web', { title: "积分说明", url: "http://news.eostoken.im/html/20180703/1530587725565.html" });
    }else  if (key == 'EOS-TOKEN') {
      EasyShowLD.dialogClose()
      navigate('AssistantQrcode', key);
    }
  }

  backupWords() {

    AuthModal.show(this.props.navigation.state.params.data.account, (authInfo) => {
      try {
          if(authInfo.isOk){
            var _words = this.props.navigation.state.params.data.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), authInfo.password + this.props.navigation.state.params.data.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
    
            var words_active = this.props.navigation.state.params.data.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), authInfo.password + this.props.navigation.state.params.data.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);
    
            if (plaintext_words.indexOf('eostoken') != -1) {
              plaintext_words = plaintext_words.substr(9, plaintext_words.length);
              var wordsArr = plaintext_words.split(',');
    
              plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
              var wordsArr_active = plaintext_words_active.split(',');
    
              this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            }else {
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

  toBackup = (words) => {
    this.props.navigation.goBack();
    const { navigate } = this.props.navigation;
    navigate('BackupWords', { words_owner: words.words_owner, words_active: words.words_active, wallet: this.props.navigation.state.params });
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }
  
  copyname(c) {
    Clipboard.setString(c.name);
    EasyToast.show('账号复制成功');
  }

  render() {
    const c = this.props.navigation.state.params.data
    const balance = this.props.navigation.state.params.balance ? this.props.navigation.state.params.balance : "0.0000";
    const isEye = this.props.navigation.state.params.isEye
    return <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>    
      <Header {...this.props} onPressLeft={true} title={"账户详情"} />
      <ScrollView>
        <View style={[styles.walletout,{backgroundColor: UColor.mainColor}]}>
          {/* <View style={styles.accountout} >
            <Text style={[styles.accounttext,{color: UColor.fontColor}]}>{isEye ? (c.isactived && c.balance != null && c.balance != ""? c.balance : balance) : "******"}</Text>
              <Text style={[styles.company,{color: UColor.fontColor}]}> EOS</Text>
          </View>
          <View style={styles.topout}>
            <Text style={[styles.category,{color:  UColor.fontColor}]}>账户名称：</Text>
              <Button onPress={this.copyname.bind(this,c)} underlayColor={UColor.mainColor}>
                <View style={{flexDirection: "row",}}>
                  <Text style={[styles.outname,{color: UColor.arrow}]}>{c.name}</Text>
                  <Image source={UImage.copy} style={styles.imgBtn} />
                </View>
              </Button>
            {(!c.isactived || !c.hasOwnProperty('isactived')) ? <View style={[styles.notactivedout,{borderColor: UColor.showy}]}>
            <Text style={[styles.notactived,{color: UColor.showy}]}>未激活</Text>
            </View>:(c.isBackups ? null : <View style={[styles.stopoutBackupsout,{borderColor: UColor.tintColor}]}>
            <Text style={[styles.stopoutBackups,{color: UColor.tintColor}]}>未备份</Text>
            </View>) }   
          </View> */}
           <View style={{borderRadius: 6,}}>
            <Item first={1} name="账户名" onPress={this.copyname.bind(this,c)} disable={true} subName={c.name}/>
            <Item first={1} name="余额" onPress={this.copyname.bind(this,c)} disable={true} subName={(isEye ? (c.isactived && c.balance != null && c.balance != ""? c.balance : balance) : "******") + ' EOS'}/>
            
            <Item first={1} name="导出公钥" onPress={this.goPage.bind(this, "ExportPublicKey")} />
            <Item first={1} name="资源管理" onPress={this.goPage.bind(this, "Resources")} />
            <Item first={1} name="账户详细信息" onPress={this.goPage.bind(this, "SeeBlockBrowser")} />
            <Item first={1} name="交易授权" onPress={this.goPage.bind(this, "AuthExchange")} />

            <Item first={1} name="已抵押资源" onPress={this.copyname.bind(this,c)} subName={c.name}/>
            <Item first={1} name="RAM" onPress={this.copyname.bind(this,c)} subName={c.name}/>

            <Item first={1} name="更改密码" onPress={this.goPage.bind(this, "ModifyPassword")}  />
            <Item first={1} name="导出私钥" onPress={this.goPage.bind(this, "BackupsPkey")}  />
            <Item first={1} name="权限管理" onPress={this.goPage.bind(this, "AuthManage")}  />
          </View>
        </View>
       
        {/* <View>{this._renderListItem()}</View> */}
      
      <View style={{flex: 1, alignItems: 'center',justifyContent: 'flex-end', paddingBottom: ScreenUtil.autoheight(20),}}>
        <TextButton onPress={this.deleteAccount.bind(this, c)} textColor="#fff" text="删除账户"  shadow={true} 
          style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
      </View>
      </ScrollView>
      {/* {(!c.isactived || !c.hasOwnProperty('isactived'))?
        <View style={[styles.footer,{backgroundColor:UColor.secdColor}]}>
          <Button onPress={this.activeWallet.bind(this, c)} style={{flex:1}}>
              <View style={[styles.footoutsource,{marginRight:0.5,backgroundColor:UColor.mainColor}]}>
                <Image source={UImage.activation_wallet} style={styles.activationimg}/>
                <Text style={[styles.delete,{color:UColor.showy}]}>激活账户</Text>
              </View>
          </Button>
          <Button  onPress={this.deleteAccount.bind(this, c)} style={{flex:1}}>
              <View style={[styles.footoutsource,{marginLeft: 0.5, backgroundColor:UColor.mainColor}]}>
                <Image source={UImage.delete_wallet} style={styles.deleteimg}/>
                <Text style={[styles.delete,{color:UColor.tintColor}]}>删除账户</Text>
              </View>
          </Button>
        </View> 
        :
        <Button onPress={this.deleteAccount.bind(this, c)} style={{flex: 1,}}>
          <View style={[styles.deleteout,{backgroundColor: UColor.mainColor}]}>
            <Text style={[styles.delete,{color: UColor.tintColor}]}>删除账户</Text>
          </View>
        </Button>
      } */}
      <View style={{backgroundColor: UColor.riceWhite}}>
        <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
          <View style={[styles.modalStyle,{backgroundColor: UColor.mask}]}>
            <View style={[styles.subView,{borderColor: UColor.baseline,backgroundColor: UColor.btnColor}]} >
              <Button style={{ alignItems: 'flex-end',}} onPress={this._setModalVisible.bind(this)}>
                <View style={styles.closeText}>
                    <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={28} />
                </View>
              </Button>
              <View style={[styles.eosparkout,{borderColor: UColor.tintColor}]}>
                <Text style={[styles.titletext,{color: UColor.arrow}]}>eosmonitor.io</Text>
                <Button onPress={() => { this.eospark() }}>
                  <View style={[styles.eosparktext,{backgroundColor: UColor.tintColor}]}>
                  <Text style={[styles.buttonText,{color: UColor.btnColor}]}>查看</Text>
                  </View> 
                </Button>
              </View>
              <View style={[styles.eosecoout,{borderColor: UColor.tintColor}]}>
                <Text style={[styles.titletext,{color: UColor.arrow}]}>eoseco.com</Text>
                <Button onPress={() => { this.eoseco() }}>
                  <View style={[styles.eosecotext,{backgroundColor: UColor.tintColor}]}>
                    <Text style={[styles.buttonText,{color: UColor.btnColor}]}>查看</Text>
                  </View>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
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
