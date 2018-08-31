import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, StyleSheet, View,  Text, ScrollView, Platform, TextInput, TouchableOpacity, KeyboardAvoidingView, Modal } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
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
                style={styles.inptpass} 
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
          {!this.state.show?<View style={[styles.outsource,{backgroundColor: UColor.secdColor}]}>
            <Text style={{fontSize: 14, color: UColor.arrow, textAlign: 'right', marginHorizontal: 20, marginTop: 5,}}>账号资源配置</Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5,}}>
                    <View style={{flex: 1, height: 2, backgroundColor: UColor.mainColor,}}/>
                    <Text style={{ color: UColor.arrow, fontSize: 16,}} > (账号资源概况) </Text>
                    <View style={{flex: 1, height: 2, backgroundColor: UColor.mainColor,}}/>
                </View>
                <View style={{ flexDirection: 'row',}}>
                    <View  style={{ flex: 1,  alignItems: 'center',}}>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30, }}>{this.state.ram}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>分配内存( EOS )</Text>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30,}}>{this.state.net}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>网络抵押( EOS )</Text>
                    </View>
                    <View style={{ flex: 1,  alignItems: 'center',}}>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30,}}>{this.state.cpu}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>CPU抵押( EOS )</Text>
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
                <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', }} activeOpacity={1.0}>
                <View style={{ width: ScreenWidth,  height: ScreenHeight*1/2,  backgroundColor: UColor.btnColor,}}>
                        <View style={{flexDirection: "row",padding: 15,justifyContent: "center",}}>
                            <Text style={{flex: 1,paddingVertical: 5,marginLeft: 135,fontSize: 18,fontWeight: 'bold',color: UColor.mainColor}}>订单详情</Text>
                            <Button  onPress={this._setModalVisible.bind(this)}>
                                <Text style={[styles.buttontext,{color: UColor.baseline}]}>×</Text>
                            </Button>
                        </View>
                        <View style={[styles.separationline,{borderBottomColor: UColor.lightgray}]} >
                            <View style={{flexDirection: "row",padding: 15,justifyContent: "center",}}>
                                <Text style={{fontSize: 26,paddingVertical: 15, lineHeight: 10,color: UColor.blackColor,textAlign: 'center',}}>{parseFloat(this.state.cpu)+parseFloat(this.state.ram)+parseFloat(this.state.net)} </Text>
                                <Text style={{fontSize: 13,paddingVertical: 10, lineHeight: 10,color: UColor.blackColor,textAlign: 'center',}}> EOS</Text>
                            </View>
                        </View>
                        <View style={{flex: 1, paddingLeft: 10, paddingRight:10,paddingHorizontal: 20}}>
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
    inptpasstext: {
        fontSize: 12,
        marginBottom: 15,
        lineHeight: 20,
      },
      Becarefultext: {
         fontSize: 12,
      },
      linkout: {
        flexDirection: 'row',
        paddingTop: 20,
        justifyContent: 'flex-end'
      },
      linktext: {
        paddingLeft: 15,
        fontSize: 14,
      },

    inptoutgo: {
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    inptgo: {
        flex: 1,
        paddingHorizontal: 10,
    },
    inptext: {
        fontSize: 14,
        lineHeight: 25,
    },

    readtext: {
        textAlign: 'right',
        fontSize: 13,
        marginHorizontal: 20,
        marginBottom: 10,
    },

  container: {
    flex: 1,
    flexDirection: 'column',
  },
  significantout: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 10,
  },
  significanttext: {
    fontSize: 24,
  },
  nametext: {
    fontSize: 16,
  },

  inptout: {
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  rankout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inptitle: {
    flex: 1,
    fontSize: 15,
    paddingLeft: 5,
  },
  falsehints: {
    fontSize: 12,
    textAlign: 'right',
  },
  inpt: {
    flex: 4,
    fontSize: 15,
    height: 40,
    paddingLeft: 2
  },

  company: {
      textAlign: 'center',
      flex: 1,
     fontSize: 14,
  },

  clauseout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  clauseimg: { 
    width: 20, 
    height: 20,
    marginHorizontal: 10, 
  },

  createWalletout: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 50,
    borderRadius: 5,
  },
  createWallet: {
    fontSize: 15,
  },


  pupuo: {
    
},
// modal的样式  
modalStyle: {
    backgroundColor: UColor.mask,  
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
},
// modal上子View的样式  
subView: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: UColor.fontColor,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: UColor.baseline,
},
buttonView: {
    alignItems: 'flex-end',
},
buttontext: {
    // width: 30,
    // height: 30,
    // marginTop:1,
    // marginRight: 1,
    // paddingVertical: 12, 
    lineHeight: 25,
    marginBottom: 0,
    fontSize: 28,
},
// 标题  
titleText: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
},
// 内容  
contentText: {
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 10,
    paddingVertical: 15,
    fontSize: 18,
    textAlign: 'left',
},

rowInfo: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
  },

//转帐信息提示分隔线
separationline: {
    paddingLeft: 10,
    height: 50,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    justifyContent: 'center',
},

// 按钮  
btnoutsource: {
    margin: 15,
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
},
btntext: {
    fontSize: 16,
},

});

export default APactivation;