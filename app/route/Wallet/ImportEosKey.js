import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, TextInput, TouchableHighlight, TouchableOpacity, Modal,Platform,KeyboardAvoidingView,ScrollView  } from 'react-native';
import UImage from '../../utils/Img';
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class ImportEosKey extends BaseComponent {

  static navigationOptions = {
    title: '导入EOS私钥',
    header:null,
  }

  constructor(props) {
    super(props);
    this.state = {
      reWalletpwd: '',
      walletpwd: '',
      activePk: '',
      ownerPk: '',
      isChecked: this.props.isChecked || true,
      weak: UColor.arrow,
      medium: UColor.arrow,
      strong: UColor.arrow,
      CreateButton:  UColor.mainColor,
      show: false,
      Invalid: false,
      publicKey: '',
      ReturnData: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectpromp: false,  //选择钱包
      walletList: [],  //获取到的账户
      keyObj:{},       //导入密钥对象
      isSenior:false,//是否是高级设置
    };
  }

  //组件加载完成
  componentDidMount() {
    const { dispatch } = this.props;
    var seniorFlag=false;
    if(this.props.navigation.state.params.isSenior==true){
      seniorFlag=true;
    }
    this.setState({
      isSenior: seniorFlag
    });
  }

  componentWillUnmount() {
     //结束页面前，资源释放操作
    super.componentWillUnmount();
    DeviceEventEmitter.removeListener('changeTab');
  }

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'clause') {
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'Memorizingwords') {
    navigate('Web', { title: "什么是助记词", url: "http://static.eostoken.im/html/MemorizingWords.html" });
    }else  if (key == 'privatekey') {
    navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/Keystore.html" });
    }else  if (key == 'howImportPrivatekey') {
    navigate('Web', { title: "如何导入私钥", url: "http://static.eostoken.im/html/importPrivatekey.html" });
    }
  }

  //高级导入
  seniorImport = () =>{  
    this.props.navigation.goBack();                                 
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey',{isSenior:true});
  }

  checkClick() {
    this.setState({
      show: false
    });
  }

 checkPk(privateKey){
    var p = new Promise(function(resolve, reject){
        Eos.checkPrivateKey(privateKey, (rdata) => {
          if (!rdata.isSuccess) {
            reject(rdata.isSuccess);
          }else{
            resolve(rdata.isSuccess);
          }

        });
    });
    return p;            
}



  importPriKey() {
    //只判断active有没有输入
    if (this.state.activePk == ''&& this.state.ownerPk == '') {
      EasyToast.show('请输入私钥');
      return;
    }
    if (this.state.walletpwd == '') {
      EasyToast.show('请输入密码');
      return;
    }
    if (this.state.reWalletpwd == '') {
      EasyToast.show('请输入确认密码');
      return;
    }
    if (this.state.walletpwd.length < 8 && this.state.reWalletpwd.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.walletpwd != this.state.reWalletpwd) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.isChecked == false) {
      EasyToast.show('请确认已阅读并同意条款');
      return;
    }

    //两次调用校验，用promise模式
    if(this.state.activePk==''){
      Eos.checkPrivateKey(this.state.ownerPk, (r) => {
        if (!r.isSuccess) {
          EasyToast.show('无效的Active私钥，请检查输入是否正确');
          return;
        }
        this.createWalletByPrivateKey(this.state.ownerPk, this.state.activePk);
      });
    }else{
      this.checkPk(this.state.activePk)
      .then((rdata)=>{
          if (!rdata) {
            EasyToast.show('无效的Active私钥，请检查输入是否正确');
          }else{
            if(this.state.ownerPk==""){
              this.createWalletByPrivateKey(this.state.ownerPk, this.state.activePk);
            }else{
              return this.checkPk(this.state.ownerPk);
            }
          }
        })
      .then((rdata)=>{
        if(rdata){
          this.createWalletByPrivateKey(this.state.ownerPk, this.state.activePk);
        }else{
          if(this.state.ownerPk!=""){
            EasyToast.show('无效的私钥，请检查输入是否正确');
          }
        }
      }).catch((error)=>{
          EasyToast.show('无效的私钥，请检查输入是否正确');
      });
    }
    
  }

  opendelay(owner_publicKey ,data) {
    var pthis = this;
    this.tm=setTimeout(function(){
      pthis.setState({
        show: true,
        Invalid: false,
        publicKey: '找不到:' + owner_publicKey,
        ReturnData: "对应的账户名" + " " + JSON.stringify(data),
      });
        clearTimeout(pthis.tm);
    },500);
  }

  
//获取公钥
  getPublicKey(privateKey){
    var p = new Promise((resolve, reject)=>{
        Eos.privateToPublic(privateKey, (rdata)=> {
          if (!rdata.isSuccess) {
            reject(rdata);
          }else{
            resolve(rdata);
          }
        });
    });
    return p;            
  }

  //获取账户
  getAccountsByPublickey(publicKey){
    var p = new Promise((resolve, reject)=>{
      this.props.dispatch({
        type: 'wallet/getAccountsByPuk',
        payload: {
          public_key: publicKey
        },
        callback: (rdata) => {

          if(rdata && rdata.code == 500 && rdata.msg){
            EasyToast.show(rdata.msg);
            reject(rdata);
          }
          if (rdata == undefined || rdata.code != '0') {
            this.opendelay(publicKey, rdata);
            reject(rdata);
          }else{
            resolve(rdata);
          }
        }
      });
    });
    return p;            
  }

  //选择账户
  selectAccount(AccArray,nkey){
    if(AccArray==""){
      return ;
    }
    var retName=[];
    var callCount=0;

    for(var ii=0;ii<AccArray.length;ii++){
      // console.log("AccArray[%d].name=%s",ii,AccArray[ii].name);

      this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: AccArray[ii].name},callback: (rdata) => {
        if (rdata!=null) {

          // console.log("checkKeyInAccount-->i=%s",ii);
          var pFlag=false;
          if(nkey.active_publicKey!=""){
            var authTemp=rdata.permissions[0].required_auth.keys
            for(var j=0;j<authTemp.length;j++){
                if(authTemp[j].key == nkey.active_publicKey){
                  pFlag=true;
                  // retName.push(AccArray[ii]);
                  retName.push({name:rdata.account_name,isChecked:false})
                }
            }
          }

          if(nkey.owner_publicKey!=""){
            var authTemp=rdata.permissions[1].required_auth.keys
            for(var j=0;j<authTemp.length;j++){
                if(authTemp[j].key == nkey.owner_publicKey && pFlag==false){
                  // retName.push(AccArray[ii]);
                  retName.push({name:rdata.account_name,isChecked:false})
                }
            }
          }
          if(++callCount>=AccArray.length){
            // return retName;
            if(retName==null||retName.length==0){
              EasyToast.show('请检查导入私钥对应的类型是否正确');
              return ;
            }
            if(retName && retName.length == 1){ // 只有一个账号时直接导入，不弹选择框
              this.state.walletList.push({name: retName[0].name, isChecked: true});
              this.setState({keyObj:nkey});
              this.specifiedAccountToWallet(this.state.walletList);   
            }else if (Platform.OS == 'ios') {
              this.setState({walletList : retName,keyObj:nkey});  
              var th = this;
                this.handle = setTimeout(() => {
                  th.setState({selectpromp: true}); 
                }, 100);
            }else{
              this.setState({selectpromp: true,walletList : retName,keyObj:nkey});  
            }
          }
        }
      }});
    }
    

    // if(AccArray && AccArray.length == 1){ // 只有一个账号时直接导入，不弹选择框
    //   this.state.walletList.push({name: AccArray[0].name, isChecked: true});
    //   this.setState({keyObj:nkey});
    //   this.specifiedAccountToWallet(this.state.walletList);   
    // }else if (Platform.OS == 'ios') {
    //   this.setState({walletList : AccArray,keyObj:nkey});  
    //   var th = this;
    //     this.handle = setTimeout(() => {
    //       th.setState({selectpromp: true}); 
    //     }, 100);
    // }else{
    //   this.setState({selectpromp: true,walletList : AccArray,keyObj:nkey});  
    // }

  }
  

  createWalletByPrivateKey(owner_privateKey, active_privatekey){    
    var array = [];
    var keyObj = new Object();
    keyObj.owner_privateKey = owner_privateKey;
    keyObj.owner_publicKey = "";
    keyObj.active_privatekey = active_privatekey;
    keyObj.active_publicKey = "";

    EasyShowLD.loadingShow('正在请求');

//用promise模式
    if(active_privatekey==""){

      this.getPublicKey(owner_privateKey)
      .then((rdata)=>{
          keyObj.owner_publicKey = rdata.data.publicKey;
          return this.getAccountsByPublickey(rdata.data.publicKey);
        })
      .then((rdata)=>{
          for(var i = 0;i < rdata.data.account_names.length;i++){
            array.push({name:rdata.data.account_names[i],isChecked:false})
          }
          EasyShowLD.loadingClose();
          this.selectAccount(array,keyObj);
        })
        .catch((error)=>{
          EasyShowLD.loadingClose();
          EasyToast.show('err: ' + JSON.stringify(error));
      });

    }else{
      this.getPublicKey(active_privatekey)
      .then((rdata)=>{
          keyObj.active_publicKey = rdata.data.publicKey;
          return this.getAccountsByPublickey(rdata.data.publicKey);
        })
      .then((rdata)=>{
          for(var i = 0;i < rdata.data.account_names.length;i++){
            array.push({name:rdata.data.account_names[i],isChecked:false})
          }
          if(owner_privateKey!=""){
            return this.getPublicKey(owner_privateKey);
          }else{
            EasyShowLD.loadingClose();
            this.selectAccount(array,keyObj);
          }
        })
      .then((rdata)=>{
        if(owner_privateKey!=""){
          keyObj.owner_publicKey = rdata.data.publicKey;
          return this.getAccountsByPublickey(rdata.data.publicKey);
        }
      })
      .then((rdata)=>{
        EasyShowLD.loadingClose();
        if(owner_privateKey!=""){
          var arrayAll = [];
          for(var i = 0;i < rdata.data.account_names.length;i++){
            for(var j=0;j<array.length;j++){
              if(rdata.data.account_names[i]==array[j].name){
                arrayAll.push({name:rdata.data.account_names[i],isChecked:false})
              }
            }
          }
          this.selectAccount(arrayAll,keyObj);
        }
      })
      .catch((error)=>{
          EasyShowLD.loadingClose();
          EasyToast.show('err: ' + JSON.stringify(error));
      });

    }
 
  }


  specifiedAccountToWallet(account_names){
    var walletList = [];
    var index = 0;
    var salt;
    Eos.randomPrivateKey((r) => {
      salt = r.data.ownerPrivate.substr(0, 18);
      for (var i = 0; i < account_names.length; i++) {
        if(account_names[i].isChecked == false){
          continue;// 未选中的跳过
        }
        var result = {
          data: {
            ownerPublic: '',
            activePublic: '',
            ownerPrivate: '',
            activePrivate: '',
            words_active: '',
            words: '',
          }
        };
        result.data.ownerPublic = this.state.keyObj.owner_publicKey;
        result.data.activePublic = this.state.keyObj.active_publicKey;
        result.data.words = '';
        result.data.words_active = '';
        result.data.ownerPrivate = this.state.keyObj.owner_privateKey;
        result.data.activePrivate = this.state.keyObj.active_privatekey;
        result.password = this.state.walletpwd;
        result.name = account_names[i].name;
        result.account = account_names[i].name;
        result.isactived = true;
        result.isBackups = true; // 导入私钥的情况不需要再提示未备份
        result.salt = salt;
        walletList[index] = result;
        index += 1;
      }
      if(walletList.length < 1)
      {
        //未选择，直接退出
        return ;
      }

      // EasyShowLD.loadingShow('正在请求');
      // 保存钱包信息
      this.props.dispatch({
        type: 'wallet/saveWalletList',
        walletList: walletList,
        callback: (data) => {
          EasyShowLD.loadingClose();
          if (data.error != null) {
            EasyToast.show('导入私钥失败：' + data.error);
          } else {
            EasyToast.show('导入私钥成功！');
            this.props.dispatch({
              type: 'wallet/updateGuideState',
              payload: {
                guide: false
              }
            });
            DeviceEventEmitter.emit('updateDefaultWallet');
            DeviceEventEmitter.emit('modify_password');
            this.props.navigation.goBack();

          }
        }
      });
    });

  }
  _onRequestClose() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  _onPressListItem() {
    this.setState((previousState) => {
        return ({
          Invalid: !previousState.Invalid,
        })
    });
  }
  
  intensity() {
    let string = this.state.walletpwd;
    if(string.length >=8) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.strong = UColor.tintColor;
        this.state.medium = UColor.arrow;
        this.state.weak = UColor.arrow;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else{
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.arrow;
          this.state.weak = UColor.tintColor;
        }
      }
    }else{
      this.state.strong = UColor.arrow;
      this.state.medium = UColor.arrow;
      this.state.weak = UColor.arrow;
    }
    if((this.state.activePk != ""||this.state.ownerPk != "" )&& this.state.walletpwd != "" && this.state.reWalletpwd != ""){
      this.state.CreateButton = UColor.tintColor;
    }else{
      this.state.CreateButton = UColor.invalidbtn;
    } 
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  _onRequestAccountClose() {
    this.setState({selectpromp: false,});
  }
  _onPressEnter() {
     this._onRequestAccountClose();
     var selected = false; 
     for (var i = 0; i < this.state.walletList.length; i++) 
     {
      if(this.state.walletList[i].isChecked){
        selected = true;
        break;
      }
    }
    if(selected)
    {
      this.specifiedAccountToWallet(this.state.walletList);
    }else{
      EasyToast.show("您未选择需要导入的钱包");
    }
  }

  selectItem(rowData){
    var array = this.state.walletList;
    for(var i = 0;i < array.length;i++){
      if(rowData.name == array[i].name){
        //已选中的，又撤销
        array[i].isChecked = !(rowData.isChecked);  
        break;
      }
    }
    this.setState({walletList : array });
  }

  render() {
    let {feedBackText, selection} = this.state;
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
      <Header {...this.props} onPressLeft={true} title="导入EOS私钥" onPressRight={this.seniorImport.bind()} subName={this.props.navigation.state.params.isSenior?"":"高级导入"}/>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : null} style={styles.tab}>
      <ScrollView keyboardShouldPersistTaps="always" >
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
            <View style={[styles.header,{backgroundColor: UColor.secdColor}]}>
              {/* <View style={[styles.headout,{backgroundColor: UColor.arrow}]}>
                  <Text style={[styles.headtitle,{color: UColor.arrow}]}>直接复制粘贴钱包私钥文件内容至输入框。或者直接输入私钥</Text>
              </View>      */}
              <View style={{paddingTop: ScreenUtil.autoheight(10),backgroundColor: UColor.mainColor}}>
                {this.state.isSenior==true &&
                <View style={[styles.biginptout,{backgroundColor: UColor.mainColor}]} >
                  {/* <Text style={[styles.inptitle,{color: UColor.fontColor}]}>私钥</Text> */}
                  <TextInput ref={(ref) => this._lphone = ref} value={this.state.ownerPk} returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} placeholderTextColor={UColor.arrow} autoFocus={false} maxLength={51}
                    style={[styles.inptgo,{color: UColor.arrow,borderColor: UColor.arrow,backgroundColor: UColor.secdColor,}]} 
                    onChangeText={(ownerPk) => this.setState({ ownerPk })}  onChange={this.intensity()} keyboardType="default"
                    placeholder="粘贴或输入owner私钥" underlineColorAndroid="transparent"  multiline={true}  />
                </View>}

                <View style={[styles.biginptout,{backgroundColor: UColor.mainColor}]} >
                  {/* <Text style={[styles.inptitle,{color: UColor.fontColor}]}>私钥</Text> */}
                  <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} placeholderTextColor={UColor.arrow} autoFocus={false} maxLength={51}
                    style={[styles.inptgo,{color: UColor.arrow,borderColor: UColor.arrow,backgroundColor: UColor.secdColor,}]} 
                    onChangeText={(activePk) => this.setState({ activePk })}  onChange={this.intensity()} keyboardType="default"
                    placeholder="粘贴或输入active私钥" underlineColorAndroid="transparent"  multiline={true}  />
                </View>

              </View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderTopColor: UColor.secdColor}]}>
                  <View style={{flexDirection: 'row',}}>
                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>设置密码</Text>
                    <View style={{flexDirection: 'row',}}>
                        <Text style={{color:this.state.weak, fontSize: 15, padding: 5,}}>弱</Text>
                        <Text style={{color:this.state.medium, fontSize: 15, padding: 5,}}>中</Text>
                        <Text style={{color:this.state.strong, fontSize: 15, padding: 5,}}>强</Text>
                    </View>
                  </View>
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletpwd}  returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} autoFocus={false} maxLength={Constants.PWD_MAX_LENGTH}
                    onChangeText={(password) => this.setState({walletpwd: password })} underlineColorAndroid="transparent"
                    placeholder="输入密码至少8位,建议大小写字母与数字混合" secureTextEntry={true} onChange={this.intensity()} />
              </View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor,borderTopColor: UColor.secdColor}]} >
                  <View style={{flexDirection: 'row',}}>
                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>确认密码</Text>
                  </View>
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.reWalletpwd} returnKeyType="next" editable={true} 
                      selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                      placeholder="重复密码" underlineColorAndroid="transparent"  autoFocus={false} onChange={this.intensity()}
                      onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })} />  
                </View>
              
              <View style={styles.readout}>
                  <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                      <Image source={this.state.isChecked?UImage.aab1:UImage.aab2} style={styles.readoutimg}/>
                  </TouchableHighlight>
                <Text style={[styles.readtext,{color: UColor.arrow}]} >我已经仔细阅读并同意 <Text onPress={() => this.prot(this,'clause')} style={[styles.servicetext,{color: UColor.tintColor}]}>服务及隐私条款</Text></Text> 
              </View> 
              <Button onPress={() => this.importPriKey()}>
                <View style={styles.importPriout} backgroundColor={this.state.CreateButton}>
                  <Text style={[styles.importPritext,{color: UColor.btnColor}]}>开始导入</Text>
                </View>
              </Button>
              {/* <Button onPress={() => this.prot(this,'privatekey')}>
                <View style={styles.importPriout}>
                  <Text style={[styles.privatekeytext,{color: UColor.tintColor}]}>什么是私钥 ？</Text>
                </View>
              </Button> */}

              <Button onPress={() => this.prot(this,'howImportPrivatekey')}>
                <View style={styles.importPriout}>
                  <Text style={[styles.privatekeytext,{color: UColor.tintColor}]}>如何导入私钥？</Text>
                </View>
              </Button>
              {this.state.isSenior!=true &&
              <View style={styles.logout}>
                  <Image source={UImage.bottom_log} style={styles.logimg}/>
                  <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
              </View>}
            </View>
        </TouchableOpacity>
        <Modal style={styles.touchableout} animationType={'slide'} transparent={true}  visible={this.state.show} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.pupuo,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={[styles.modalStyle,{backgroundColor: UColor.btnColor}]}>
                <View style={styles.subView}> 
                  <Text style={styles.titleout}/>
                  <Text style={styles.titleText}>导入失败</Text>
                  <Button style={{}} onPress={this._onRequestClose.bind(this)}>
                    <Text style={[styles.titleout,{color: UColor.baseline}]}>×</Text>
                  </Button>
                </View>
                <Text style={[styles.contentText,{color: UColor.showy}]}>该私钥信息导入失败，请仔细核对私钥是否正确</Text>
                <View>
                    <TouchableOpacity onPress={() => this._onPressListItem()}>
                        <View style={styles.codeout}>
                            <Text style={[styles.prompttext,{color: UColor.tintColor}]}>查看原因</Text>
                            <Ionicons name={this.state.Invalid ? "ios-arrow-down-outline" : "ios-arrow-forward-outline"} size={14} color={UColor.tintColor}/>
                        </View>
                    </TouchableOpacity>
                    {this.state.Invalid ? <Text style={[styles.copytext,{color: UColor.lightgray}]}>{this.state.publicKey}{this.state.ReturnData}</Text> : null}
                </View>
                  <Button onPress={this._onRequestClose.bind(this)}>
                      <View style={[styles.buttonView,{backgroundColor: UColor.showy}]}>
                          <Text style={[styles.buttoncols,{color: UColor.btnColor}]}>知道了</Text>
                      </View>
                  </Button>  
              </View>
            </TouchableOpacity>
        </Modal>  
        <Modal style={[styles.businesmodal,{backgroundColor: UColor.tintColor}]} animationType={'slide'} transparent={true}  visible={this.state.selectpromp} onRequestClose={()=>{}}>
            <TouchableOpacity style={[styles.businestouchable,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
              <View style={[styles.modalStyle1,{backgroundColor: UColor.btnColor,}]}>
                <View style={styles.subView}> 
                  <Text style={styles.titleout}/>
                  <Text style={styles.titleText}>请选择导入钱包</Text>
                  <Button style={{}} onPress={this._onRequestAccountClose.bind(this)}>
                    <Text style={[styles.titleout,{color: UColor.baseline}]}>×</Text>
                  </Button>
                </View>
                <ListView style={{}} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.state.walletList == null ? [] : this.state.walletList)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                        <View style={[styles.businessout,{borderBottomColor: UColor.riceWhite}]}>
                            <View style={styles.liststrip}>
                                <Text style={styles.payertext} numberOfLines={1}>{rowData.name}</Text>

                                <TouchableOpacity style={styles.taboue} onPress={ () => this.selectItem(rowData)}>
                                  <View style={[styles.tabview,{borderColor: UColor.lightgray}]} >
                                      <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                  </View>  
                                </TouchableOpacity>  
                            </View>
                        </View>
                    )}                
                /> 
                <Button onPress={this._onPressEnter.bind(this)}>
                    <View style={[styles.buttonViewEnter,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.buttonEnter,{color: UColor.btnColor}]}>确认导入</Text>
                    </View>
                </Button>  
              </View>
            </TouchableOpacity>
        </Modal>  
      </ScrollView>
      </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: { 
    flex: 1,
  },
  headout: {
    paddingTop: ScreenUtil.autoheight(10),
    marginBottom: ScreenUtil.autoheight(5),
    paddingBottom: ScreenUtil.autoheight(15),
    paddingHorizontal: ScreenUtil.autowidth(25),
  },
  headtitle: {
    fontSize: ScreenUtil.setSpText(15),
    lineHeight: ScreenUtil.autoheight(25),
  },
  biginptout: {
    paddingBottom: ScreenUtil.autoheight(10), 
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  inptout: {
    borderTopWidth: 1,
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  inptitle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(15),
    paddingLeft: ScreenUtil.autowidth(5),
    lineHeight: ScreenUtil.autoheight(30),
  },
  inpt: {
    height: ScreenUtil.autoheight(50),
    fontSize: ScreenUtil.setSpText(16),
  },
  inptgo: {
    borderWidth: 1,
    borderRadius: 5,
    textAlignVertical: 'top', 
    height: ScreenUtil.autoheight(90), 
    fontSize: ScreenUtil.setSpText(16),
    lineHeight: ScreenUtil.autoheight(25),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ScreenUtil.autoheight(20),
  },
  readoutimg: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(10),
  },
  readtext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  importPriout: { 
    borderRadius: 5, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: ScreenUtil.autoheight(45), 
    marginTop: ScreenUtil.autoheight(20), 
    marginHorizontal: ScreenUtil.autowidth(20),
  },
  importPritext: {
    fontSize: ScreenUtil.setSpText(15),
  },

  privatekeytext: { 
    fontSize: ScreenUtil.setSpText(15), 
  },
  pupuo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStyle: {
    borderRadius: 5,
    width: ScreenWidth - 20,
    paddingHorizontal: ScreenUtil.autowidth(25),
  },
  modalStyle1: {
    borderRadius: 5,
    width: ScreenWidth,
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  subView: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(30),
    marginVertical: ScreenUtil.autoheight(15),
  },
  buttonView: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(50),
    marginVertical: ScreenUtil.autoheight(10),
  },
  buttoncols: {
    fontSize: ScreenUtil.setSpText(16),
  },
  titleText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(18),
  },
  titleout: {
    textAlign: 'center',
    width: ScreenUtil.autowidth(40),
    fontSize: ScreenUtil.setSpText(28),
  },
  contentText: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
    marginVertical: ScreenUtil.autoheight(20),
  },
  prompttext: {
    fontSize: ScreenUtil.setSpText(14),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  codeout: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  copytext: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
  },
  logout:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(20),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(30),
  },
  businesmodal: {
    flex: 1,
    flexDirection:'column',
    justifyContent: 'flex-end',
  },
  businestouchable: {
    flex: 1, 
    justifyContent: 'flex-end', 
  },
  businessout: {
    borderRadius: 5,
    flexDirection: "row",
    alignItems: 'center',
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    height: ScreenUtil.autoheight(40),
    marginVertical: ScreenUtil.autoheight(2),
    marginHorizontal: ScreenUtil.autowidth(5),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  liststrip: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  payertext: {
    flex: 3,
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(18),
  },
  buttonViewEnter: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(50),
    marginVertical: ScreenUtil.autoheight(10),
  },
  buttonEnter: {
    fontSize: ScreenUtil.setSpText(16),
  },
  taboue: {
    alignItems: 'center',
    justifyContent: 'center', 
  },
  tabview: {
    borderWidth: 1,
    margin: ScreenUtil.autowidth(5),
    width: ScreenUtil.autowidth(27),
    height: ScreenUtil.autowidth(27),
  },
  tabimg: {
    width: ScreenUtil.autowidth(25), 
    height: ScreenUtil.autowidth(25),
  },
  tab: {
    flex: 1,
  }
});

export default ImportEosKey;
