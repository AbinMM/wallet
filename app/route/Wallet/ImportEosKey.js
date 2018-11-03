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
      passwordNote: "",
      isChecked: this.props.isChecked || false,
      weak: false,
      medium: false,
      strong: false,
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
    navigate('Web', { title: "服务及隐私条款", url: "http://news.eostoken.im/html/reg.html" });
    }else  if (key == 'Memorizingwords') {
    navigate('Web', { title: "什么是助记词", url: "http://news.eostoken.im/html/MemorizingWords.html" });
    }else  if (key == 'privatekey') {
    navigate('Web', { title: "什么是私钥", url: "http://news.eostoken.im/html/Keystore.html" });
    }else  if (key == 'howImportPrivatekey') {
    navigate('Web', { title: "如何导入私钥", url: "http://news.eostoken.im/html/20181017/1539763702729.html" });
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
      isChecked: !this.state.isChecked
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
    var activePkTemp= this.state.activePk.replace(/\s+/g, "");
    activePkTemp = activePkTemp.replace(/<\/?.+?>/g,""); 
    activePkTemp = activePkTemp.replace(/[\r\n]/g, ""); 
    var ownerPkTemp= this.state.ownerPk.replace(/\s+/g, "");
    ownerPkTemp = ownerPkTemp.replace(/<\/?.+?>/g,""); 
    ownerPkTemp = ownerPkTemp.replace(/[\r\n]/g, ""); 

  // console.log("activePkTemp=%@",activePkTemp);
  // console.log("ownerPkTemp=%@",ownerPkTemp);

    if(activePkTemp.length>51){
      EasyToast.show('active私钥有效长度不对!');
      return;
    }

    if(ownerPkTemp.length>51){
      EasyToast.show('owner私钥有效长度不对!');
      return;
    }

    //只判断active有没有输入
    if (activePkTemp == ''&& ownerPkTemp == '') {
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
    if (this.state.walletpwd.length < 8 || this.state.reWalletpwd.length < 8) {
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
    if(activePkTemp==''){
      Eos.checkPrivateKey(ownerPkTemp, (r) => {
        if (!r.isSuccess) {
          EasyToast.show('无效的Active私钥，请检查输入是否正确');
          return;
        }
        this.createWalletByPrivateKey(ownerPkTemp, activePkTemp);
      });
    }else{
      this.checkPk(activePkTemp)
      .then((rdata)=>{
          if (!rdata) {
            EasyToast.show('无效的Active私钥，请检查输入是否正确');
          }else{
            if(ownerPkTemp==""){
              this.createWalletByPrivateKey(ownerPkTemp, activePkTemp);
            }else{
              return this.checkPk(ownerPkTemp);
            }
          }
        })
      .then((rdata)=>{
        if(rdata){
          this.createWalletByPrivateKey(ownerPkTemp, activePkTemp);
        }else{
          if(ownerPkTemp!=""){
            EasyToast.show('无效的私钥，请检查输入是否正确');
          }
        }
      }).catch((error)=>{
          EasyToast.show('无效的私钥，请检查输入是否正确');
      });
    }
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {});
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
                  if(nkey.owner_publicKey==""){
                    retName.push({name:rdata.account_name,isChecked:false})
                  }
                }
            }
          }

          if(nkey.owner_publicKey!=""){
            var authTemp=rdata.permissions[1].required_auth.keys
            for(var j=0;j<authTemp.length;j++){
                if(authTemp[j].key == nkey.owner_publicKey){
                  if((nkey.active_publicKey!="" && pFlag==true)||(nkey.active_publicKey=="" && pFlag==false)){
                    retName.push({name:rdata.account_name,isChecked:false})
                  }
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
        result.passwordNote = this.state.passwordNote;
        result.isactived = true;
        result.isBackups = true; // 导入私钥的情况不需要再提示未备份
        result.salt = salt;
        walletList[index] = result;
        index += 1;
      }
      if(walletList.length < 1){
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
        this.state.strong = true;
        this.state.medium = false;
        this.state.weak = false;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = false;
        }else{
          this.state.strong = false;
          this.state.medium = false;
          this.state.weak = true;
        }
      }
    }else{
      this.state.strong = false;
      this.state.medium = false;
      this.state.weak = false;
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
      <View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
      <Header {...this.props} onPressLeft={true} title="导入EOS钱包" onPressRight={this.seniorImport.bind()} subName={this.props.navigation.state.params.isSenior?"":"高级导入"}/>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : null} style={styles.tab}>
      <ScrollView keyboardShouldPersistTaps="always" >
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
            <View style={[styles.header,{backgroundColor: UColor.secdfont}]}>
              {/* <View style={[styles.headout,{backgroundColor: UColor.arrow}]}>
                  <Text style={[styles.headtitle,{color: UColor.arrow}]}>直接复制粘贴钱包私钥文件内容至输入框。或者直接输入私钥</Text>
              </View>      */}
              
                {this.state.isSenior==true &&<View >
                  <View style={[styles.inptout,]}>
                    <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autowidth(56),color: UColor.fontColor}]}>owner私钥</Text>
                  </View>
                  <View style={[styles.biginptout,{backgroundColor: UColor.mainColor}]} >
                    <TextInput ref={(ref) => this._lphone = ref} value={this.state.ownerPk} returnKeyType="next" editable={true}
                      selectionColor={UColor.tintColor} placeholderTextColor={UColor.inputtip} autoFocus={false} maxLength={64}
                      style={[styles.inptgo,{color: UColor.arrow}]} 
                      onChangeText={(ownerPk) => this.setState({ ownerPk })}  onChange={this.intensity()} keyboardType="default"
                      placeholder="请输入或复制您的owner私钥" underlineColorAndroid="transparent"  multiline={true}  />
                  </View>
                </View>}
                <View style={[styles.inptout,]}>
                  <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autowidth(56),color: UColor.fontColor}]}>active私钥</Text>
                </View>
                <View style={[styles.biginptout,{backgroundColor: UColor.mainColor}]} >
                  <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} placeholderTextColor={UColor.inputtip} autoFocus={false} maxLength={64}
                    style={[styles.inptgo,{color: UColor.arrow}]} 
                    onChangeText={(activePk) => this.setState({ activePk })}  onChange={this.intensity()} keyboardType="default"
                    placeholder="请输入或复制您的active私钥" underlineColorAndroid="transparent"  multiline={true}  />
                </View>

              
              <View style={[styles.inptout,{flexDirection: 'row',}]}>
                <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autowidth(56),color: UColor.fontColor}]}>设置密码</Text>
                <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                  <View style={[styles.Strengthout,this.state.weak&&{backgroundColor: UColor.baseline}]}>
                    <Text style={[styles.Strengthtext,{color:this.state.weak?UColor.btnColor:UColor.arrow}]}>低</Text>
                  </View>
                  <View style={[styles.Strengthout,this.state.medium&&{backgroundColor: UColor.baseline}]}>
                    <Text style={[styles.Strengthtext,{color:this.state.medium?UColor.btnColor:UColor.arrow}]}>中</Text>
                  </View>
                  <View style={[styles.Strengthout,this.state.strong&&{backgroundColor: UColor.baseline}]}>
                    <Text style={[styles.Strengthtext,{color:this.state.strong?UColor.btnColor:UColor.arrow}]}>高</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor, marginBottom: 1,}]}>
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletpwd}  returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip} autoFocus={false} maxLength={Constants.PWD_MAX_LENGTH}
                    onChangeText={(password) => this.setState({walletpwd: password })} underlineColorAndroid="transparent"
                    placeholder="输入密码至少8位,建议大小写字母与数字混合" secureTextEntry={true} onChange={this.intensity()} />
              </View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor,}]} >
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.reWalletpwd} returnKeyType="next" editable={true} 
                      selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip} secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                      placeholder="重复密码" underlineColorAndroid="transparent"  autoFocus={false} onChange={this.intensity()}
                      onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })} />  
              </View>
              <View style={[styles.inptout,]} >
                  <Text style={[styles.inptitle,{lineHeight: ScreenUtil.autowidth(56),color: UColor.fontColor}]}>设置密码提示</Text>
              </View>
              <View style={[styles.inptout,{backgroundColor: UColor.mainColor}]} >
                  <TextInput ref={(ref) => this._lnote = ref} value={this.state.passwordNote} selectionColor={UColor.tintColor} maxLength={40}
                    returnKeyType="go" placeholderTextColor={UColor.inputtip} placeholder="密码提示信息(可不填)"  style={[styles.inpt,{color: UColor.arrow}]} 
                    underlineColorAndroid="transparent" onChangeText={(passwordNote) => this.setState({ passwordNote })}  />
              </View>
              
              <View style={{flexDirection: 'row'}}>
                <View style={styles.readout}>
                  <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                    <View style={[{width: ScreenUtil.autowidth(12), height: ScreenUtil.autowidth(12),marginLeft: ScreenUtil.autowidth(18), marginTop: ScreenUtil.autowidth(13), borderColor: this.state.isChecked?UColor.tintColor:UColor.arrow,borderRadius: 25,borderWidth: 0.5,backgroundColor:this.state.isChecked?UColor.tintColor:UColor.mainColor}]}/>
                  </TouchableHighlight>
                  <Text style={[styles.readtext,{color: UColor.arrow}]} > 我已经阅读并同意 <Text onPress={() => this.prot(this,'clause')} style={[styles.servicetext,{color: UColor.arrow}]}>【服务及隐私条款】</Text></Text> 
                </View> 
                {!this.state.isSenior && <Text style={[styles.privatekeytext,{color: UColor.tintColor}]}  onPress={() => this.prot(this,'howImportPrivatekey')}>如何导入私钥？</Text>}
              </View>
              
              <Button onPress={() => this.importPriKey()} style={this.state.isSenior==true?styles.buttonImportStyleSenior:styles.buttonImportStyle}>
                <View style={styles.importPriout} backgroundColor={this.state.CreateButton}>
                  <Text style={[styles.importPritext,{color: UColor.btnColor}]}>导入钱包</Text>
                </View>
              </Button>
              {!this.state.isSenior &&
              <Button onPress={() => this.createWallet()} style={{marginHorizontal: ScreenUtil.autowidth(20),}}>
                <View style={styles.importPriout}>
                  <Text style={[styles.importPritext,{color: UColor.tintColor}]}>创建钱包</Text>
                </View>
              </Button>}
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
    paddingTop: ScreenUtil.autowidth(10),
    marginBottom: ScreenUtil.autowidth(5),
    paddingBottom: ScreenUtil.autowidth(15),
    paddingHorizontal: ScreenUtil.autowidth(25),
  },
  headtitle: {
    fontSize: ScreenUtil.setSpText(15),
    lineHeight: ScreenUtil.autowidth(25),
  },
  biginptout: {
    paddingVertical: ScreenUtil.autowidth(10), 
    paddingHorizontal: ScreenUtil.autowidth(18),
  },
  inptout: {
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  inptitle: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(16),
    
  },
  inpt: {
    height: ScreenUtil.autowidth(55),
    fontSize: ScreenUtil.setSpText(16),
  },
  inptgo: {
    textAlignVertical: 'top', 
    height: ScreenUtil.isIphoneX() ? ScreenUtil.autoheight(85):ScreenUtil.autoheight(65), 
    fontSize: ScreenUtil.setSpText(15),
    lineHeight: ScreenUtil.autowidth(25),
  },
  Strengthout: {
    borderRadius: 4,
    paddingHorizontal: ScreenUtil.autowidth(8),
    paddingVertical: ScreenUtil.autowidth(6),
  },
  Strengthtext: {
    fontSize: ScreenUtil.setSpText(12), 
  },
  readout: {
    flex: 1,
    flexDirection: 'row',
  },
  readoutimg: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginRight: ScreenUtil.autowidth(10),
  },
  readtext: {
    fontSize: ScreenUtil.setSpText(12),
    lineHeight: ScreenUtil.autowidth(40),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(12),
  },
  importPriout: { 
    borderRadius: 5, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: ScreenUtil.autowidth(50), 
    
  },
  importPritext: {
    fontSize: ScreenUtil.setSpText(16),
  },

  privatekeytext: { 
    textAlign: 'center',
    paddingRight: ScreenUtil.autowidth(10),
    fontSize: ScreenUtil.setSpText(12), 
    lineHeight: ScreenUtil.autowidth(40),
    textDecorationLine:'underline',
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
    height: ScreenUtil.autowidth(30),
    marginVertical: ScreenUtil.autowidth(15),
  },
  buttonView: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autowidth(50),
    marginVertical: ScreenUtil.autowidth(10),
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
    marginVertical: ScreenUtil.autowidth(20),
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
    paddingBottom: ScreenUtil.autowidth(20),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autowidth(30),
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
    height: ScreenUtil.autowidth(40),
    marginVertical: ScreenUtil.autowidth(2),
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
    height: ScreenUtil.autowidth(50),
    marginVertical: ScreenUtil.autowidth(10),
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
  },
  buttonImportStyle: {
    marginTop: ScreenUtil.autowidth(43), 
    marginHorizontal: ScreenUtil.autowidth(16),
  },
  buttonImportStyleSenior: {
    marginTop: ScreenUtil.autowidth(26), 
    marginHorizontal: ScreenUtil.autowidth(16),
  },
});

export default ImportEosKey;
