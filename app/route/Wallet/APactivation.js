import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, StyleSheet, View,  Text, ScrollView, Platform, TextInput, TouchableOpacity, KeyboardAvoidingView, Modal } from 'react-native';
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import {formatEosQua} from '../../utils/FormatUtil';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet }) => ({ ...wallet }))
class APactivation extends BaseComponent {

  static navigationOptions = {
    title: '账号支付激活',
    header:null, 
  };
 
  constructor(props) {
    super(props);
    this.state = {
      accountName: "",
      ownerPuk: "",
      activePuk: "",
      cpu:"0.1",
      net:"0.1",
      ram:"1",
      isComplete: false,
      hasErrorInput: false,
      show: false,
    }
  }

  componentDidMount() {
    var accountInfo = this.props.navigation.state.params.accountInfo;
    this.setState({
      cpu: accountInfo.cpu ? accountInfo.cpu : "0.1",
      net: accountInfo.net ? accountInfo.net : "0.1",
      ram: accountInfo.ram ? accountInfo.ram : "1",
      accountName: accountInfo.account ? accountInfo.account : "" ,
      ownerPuk: accountInfo.owner ? accountInfo.owner : "",
      activePuk: accountInfo.active ? accountInfo.active : "",
    });
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount() 
  }

  confirm(){
    // this.setState({isComplete: true});
    this._setModalVisible();
  }

  onShareFriend() {
    DeviceEventEmitter.emit('ReturnActivation','{"account_name":"' + this.state.accountName + '","owner":"' + this.state.ownerPuk + '","active":"' + this.state.ownerPuk + '","cpu":"' + this.state.cpu + '","net":"' + this.state.net + '","ram":"'+ this.state.ram +'"}');
  }

  createAccount() {
    this._setModalVisible();
    const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
                style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>
        EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
        if (!this.state.password || this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                // EasyShowLD.dialogClose();
                EasyShowLD.loadingShow();
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                Eos.createAndDelegateAccount(this.props.defaultWallet.account, plaintext_privateKey, this.state.accountName, this.state.ownerPuk, this.state.activePuk,
                    formatEosQua(this.state.cpu + " EOS"), formatEosQua(this.state.net + " EOS"), formatEosQua(this.state.ram + " EOS"), 1, (r)=>{
                  EasyShowLD.loadingClose();
                  if(r.isSuccess){
                    //   EasyToast.show("创建账号成功");
                    EasyShowLD.dialogShow("支付成功", (<View>
                        <Text style={[styles.Becarefultext,{color: UColor.showy}]}>{this.state.accountName}</Text>
                        <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>该账号完成支付，请告知账号主人点击激活即可正常使用。</Text>
                        <View style={styles.linkout}>
                            <Text style={[styles.linktext,{color: UColor.tintColor}]} onPress={() => this.onShareFriend()}>分享给您的朋友</Text>
                        </View>
                    </View>), "知道了", null,  () => { EasyShowLD.dialogClose();this.props.navigation.goBack(); });
                  }else{
                      if(r.data){
                          if(r.data.msg){
                              EasyToast.show(r.data.msg);
                          }else{
                              EasyToast.show("创建账号失败");
                          }
                      }else{
                          EasyToast.show("创建账号失败");
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

   // 显示/隐藏 modal  
   _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
        show: !isShow,
    });
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.mainColor}]}>
    <Header {...this.props} onPressLeft={true} title="账号支付激活" />
    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
          <View style={[styles.significantout,{backgroundColor: UColor.mainColor, borderTopColor: UColor.secdColor}]}>
            <Text style={[styles.significanttext,{color: UColor.fontColor}]} >{this.state.accountName}</Text>
            <Text style={[styles.nametext,{color: UColor.arrow}]} >EOS 账号</Text>
          </View>
          {!this.state.show?<View style={{backgroundColor: UColor.secdColor}}>
            <Text style={[styles.acctitleText,{color: UColor.arrow,}]}>账号资源配置</Text>
            <View style={[styles.inptout,{borderBottomColor: UColor.mainColor}]} >
                <View style={styles.rankout}>
                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>CPU抵押(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={[styles.falsehints,{color: UColor.showy}]}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.cpu} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.1" underlineColorAndroid="transparent"
                        keyboardType="default" maxLength={12} onChangeText={(cpu) => this.setState({ cpu })} 
                    />
                    <Text style={[styles.company,{color: UColor.arrow}]}>EOS</Text>
                </View>    
            </View>
            <View style={[styles.inptout,{borderBottomColor: UColor.mainColor}]} >
                <View style={styles.rankout}>
                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>网络抵押(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={[styles.falsehints,{color: UColor.showy}]}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.net} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.1" underlineColorAndroid="transparent"
                        keyboardType="default" maxLength={12} onChangeText={(net) => this.setState({ net })} 
                    />
                    <Text style={[styles.company,{color: UColor.arrow}]}>EOS</Text>
                </View>    
            </View>
            <View style={[styles.inptout,{borderBottomColor: UColor.mainColor}]} >
                <View style={styles.rankout}>
                    <Text style={[styles.inptitle,{color: UColor.fontColor}]}>分配内存(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={[styles.falsehints,{color: UColor.showy}]}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.ram} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.397" underlineColorAndroid="transparent"
                        keyboardType="default" maxLength={12} onChangeText={(ram) => this.setState({ ram })} 
                    />
                    <Text style={[styles.company,{color: UColor.arrow}]}>EOS</Text>
                </View>    
            </View>
          </View>
          :
          <View style={{backgroundColor: UColor.secdColor}}>
                <View style={{flexDirection:'row',alignItems:'center',marginVertical:ScreenUtil.autoheight(5),}}>
                    <View style={{flex:1,height:ScreenUtil.autoheight(2),backgroundColor:UColor.mainColor,}}/>
                    <Text style={{color:UColor.arrow,fontSize:ScreenUtil.setSpText(16),}} > (账号资源概况) </Text>
                    <View style={{flex:1,height:ScreenUtil.autoheight(2),backgroundColor:UColor.mainColor,}}/>
                </View>
                <View style={{flexDirection:'row'}}>
                    <View  style={{flex:1,alignItems:'center',}}>
                        <Text style={[styles.ramnetcputext,{color:UColor.tintColor}]}>{this.state.ram}</Text>
                        <Text style={[styles.companytext,{color:UColor.fontColor}]}>分配内存( EOS )</Text>
                        <Text style={[styles.ramnetcputext,{color: UColor.tintColor}]}>{this.state.net}</Text>
                        <Text style={[styles.companytext,{color:UColor.fontColor}]}>网络抵押( EOS )</Text>
                    </View>
                    <View style={{flex:1,alignItems:'center',}}>
                        <Text style={[styles.ramnetcputext,{color:UColor.tintColor}]}>{this.state.cpu}</Text>
                        <Text style={[styles.companytext,{color:UColor.fontColor}]}>CPU抵押( EOS )</Text>
                    </View>
                </View>
          </View>}
          <View style={{backgroundColor: UColor.mainColor,}}>
            <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                <Text style={[styles.inptitle,{color: UColor.fontColor}]}>owner公钥</Text>
                <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.ownerPuk}</Text>
            </View>
            <View style={{height: 1, backgroundColor: UColor.secdColor,}}/>
            <View style={[styles.inptoutgo,{backgroundColor: UColor.mainColor}]} >
                <Text style={[styles.inptitle,{color: UColor.fontColor}]}>active公钥</Text>
                <Text style={[styles.inptext,{color: UColor.arrow}]}>{this.state.activePuk}</Text>
            </View>
            {!this.state.show?<Text style={[styles.readtext,{color: UColor.tintColor}]} >说明：账号资源可输入设置</Text> : <Text style={[styles.readtext,{color: UColor.tintColor}]}></Text>}
            <Button onPress={() => this.confirm()}>
                <View style={[styles.createWalletout,{backgroundColor: UColor.tintColor}]}>
                    <Text style={[styles.createWallet,{color: UColor.btnColor}]}>确认支付</Text>
                </View>
            </Button>
          </View>
          <View style={{backgroundColor: UColor.riceWhite}}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={[styles.modalStyle,{backgroundColor: UColor.mask}]} activeOpacity={1.0}>
                    <View style={[styles.subView,{backgroundColor: UColor.btnColor}]}>
                        <View style={styles.buttonView}>
                            <Text style={[styles.titleText,{color: UColor.mainColor}]}>订单详情</Text>
                            <Button  onPress={this._setModalVisible.bind(this)}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                            <View style={styles.buttonView}>
                                <Text style={[styles.cpuramnet,{color: UColor.blackColor}]}>{parseFloat(this.state.cpu)+parseFloat(this.state.ram)+parseFloat(this.state.net)} </Text>
                                <Text style={[styles.modalcompany,{color: UColor.blackColor}]}> EOS</Text>
                            </View>
                        </View>
                        <View style={styles.accountout}>
                            <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                <View style={styles.rowInfo}>
                                    <Text style={[styles.contentText,{color: UColor.mainColor}]}>购买账号：</Text>
                                    <Text style={[styles.contentText,{color: UColor.mainColor}]}>{this.state.accountName}</Text>
                                </View>
                            </View>
                            <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                                <View style={styles.rowInfo}>
                                    <Text style={[styles.contentText,{color: UColor.mainColor}]}>支付账号：</Text>
                                    <Text style={[styles.contentText,{color: UColor.mainColor}]}>{this.props.defaultWallet.account}</Text>
                                </View>
                            </View>
                          
                            <Button onPress={() => { this.createAccount() }}>
                                <View style={[styles.btnoutsource,{backgroundColor: UColor.tintColor}]}>
                                    <Text style={[styles.btntext,{color: UColor.btnColor}]}>确认</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        textAlign: "center",
        borderBottomWidth: 1,
        width: ScreenWidth-100,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    inptpasstext: {
        fontSize: ScreenUtil.setSpText(12),
        marginBottom: ScreenUtil.autoheight(15),
        lineHeight: ScreenUtil.autoheight(20),
    },
    Becarefultext: {
        fontSize: ScreenUtil.setSpText(12),
    },
    linkout: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: ScreenUtil.autoheight(20),
    },
    linktext: {
        fontSize: ScreenUtil.setSpText(14),
        paddingLeft: ScreenUtil.autowidth(15),
    },
    inptoutgo: {
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(18),
    },
    inptgo: {
        flex: 1,
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    inptext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    readtext: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(13),
        marginHorizontal: ScreenUtil.autowidth(20),
        marginBottom: ScreenUtil.autoheight(10),
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    significantout: {
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingVertical: ScreenUtil.autoheight(10),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 10,
    },
    significanttext: {
        fontSize: ScreenUtil.setSpText(24),
    },
    nametext: {
        fontSize: ScreenUtil.setSpText(16),
    },

    acctitleText: {
        fontSize: ScreenUtil.setSpText(14),  
        textAlign: 'right', 
        marginHorizontal: ScreenUtil.autowidth(20), 
        marginTop: ScreenUtil.autoheight(5),
    },
    inptout: {
        paddingHorizontal: ScreenUtil.autowidth(15),
        borderBottomWidth: 1,
    },
    rankout: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(15),
        paddingLeft: ScreenUtil.autowidth(5),
    },
    falsehints: {
        fontSize: ScreenUtil.setSpText(12),
        textAlign: 'right',
    },
    inpt: {
        flex: 4,
        fontSize: ScreenUtil.setSpText(15),
        height: ScreenUtil.autoheight(40),
        paddingLeft: ScreenUtil.autowidth(2),
    },
    company: {
        textAlign: 'center',
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
    },
    ramnetcputext: {
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(30),
    },
    companytext: {
        fontSize: ScreenUtil.setSpText(15), 
        paddingBottom: ScreenUtil.autoheight(10),
    },
    clauseout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: ScreenUtil.autoheight(20),
    },
    clauseimg: { 
        width: ScreenUtil.autowidth(20), 
        height: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autowidth(10), 
    },
    createWalletout: {
        height: ScreenUtil.autoheight(45),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: ScreenUtil.autowidth(20),
        marginBottom: ScreenUtil.autoheight(50),
        borderRadius: 5,
    },
    createWallet: {
        fontSize: ScreenUtil.setSpText(15),
    },
    modalStyle: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    subView: {
        width: ScreenWidth,  
        height: ScreenHeight*1/2,  
    },
    buttonView: {
        flexDirection: "row",
        justifyContent: "center",
        padding: ScreenUtil.autowidth(15),
    },
    cpuramnet: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(26),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(15), 
    },
    modalcompany: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(13),
        lineHeight: ScreenUtil.autoheight(10),
        paddingVertical: ScreenUtil.autoheight(10), 
    },
    buttontext: { 
        fontSize: ScreenUtil.setSpText(28),
        lineHeight: ScreenUtil.autoheight(25),
    },
    titleText: {
        flex: 1,
        paddingVertical: ScreenUtil.autoheight(5),
        marginLeft: ScreenUtil.autowidth(135),
        fontSize: ScreenUtil.setSpText(18),
        fontWeight: 'bold',
    },
    contentText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(18),
        lineHeight: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(10),
        paddingVertical: ScreenUtil.autoheight(15),
    },
    rowInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: ScreenUtil.autowidth(15),
    },
    separationline: {
        borderBottomWidth: 0.5,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(50),
        paddingLeft: ScreenUtil.autowidth(10),
        marginBottom: ScreenUtil.autoheight(10),
    },
    accountout: {
        flex: 1, 
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    btnoutsource: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(15),
        height: ScreenUtil.autoheight(45),
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
    },
});

export default APactivation;