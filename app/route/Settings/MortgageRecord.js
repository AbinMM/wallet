import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Clipboard, TouchableOpacity, TextInput, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs"
import Header from '../../components/Header'
import Button from '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
import {formatEosQua} from '../../utils/FormatUtil'
import { EasyShowLD } from '../../components/EasyShow'
var AES = require("crypto-js/aes")
var CryptoJS = require("crypto-js")
var dismissKeyboard = require('dismissKeyboard')
const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class MortgageRecord extends React.Component {

  static navigationOptions = {
    title: "抵押记录",
    header:null,
  };
 
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      delegateLoglist: [],
      show: false,
      password: "",
      labelname: '',
    }
  }

  //加载地址数据
  componentDidMount() {
    this.getAccountInfo();
    this.props.dispatch({type: 'wallet/info',payload: { address: "1111"}});
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this._query(data.toaccount);
      }
    }); 
  }

  getAccountInfo() {
    EasyShowLD.loadingShow();
    this.props.dispatch({
      type: 'vote/getDelegateLoglist',
      payload: {account_name: this.props.navigation.state.params.account_name},
      callback: (resp) => {
        EasyShowLD.loadingClose();
        if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
          this.setState({show: true, delegateLoglist: []});
        }else{
          this.setState({show: false, delegateLoglist: resp.data.rows});
        }
      }
  });
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
    });
    this.dismissKeyboardClick();
  }

  _query =(labelname) => {
    if (labelname == ""||labelname == undefined||labelname==null) {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      EasyShowLD.loadingShow();
      this.dismissKeyboardClick();
      this.props.dispatch({ type: 'vote/getDelegateLoglist', payload: {account_name: labelname},
        callback: (resp) => {
          EasyShowLD.loadingClose();
          if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
            this.setState({show: true, delegateLoglist: []});
          }else{
            this.setState({show: false, delegateLoglist: resp.data.rows});
          }
        }
      });
    }
  }

  _setModalVisible(redeem) {
    this. dismissKeyboardClick();
    EasyShowLD.dialogShow("您确认要赎回这笔抵押吗？", (
        <View style={[styles.warningout,{borderColor: UColor.showy}]}>
            <Image source={UImage.warning_h} style={styles.imgBtn} />
            <Text style={[styles.headtitle,{color: UColor.showy}]}>建议保留少量抵押，否则可能影响您的账号正常使用！赎回的EOS将于3天后，返还到您的账户。</Text>
        </View>
    ), "执意赎回", "取消", () => {
      this.undelegateb(redeem);
    }, () => { EasyShowLD.dialogClose() });
  }

  //赎回
  undelegateb = (redeem) => { 
    const view =
    <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go"  
            selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" maxLength={Constants.PWD_MAX_LENGTH}
            style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor, borderBottomColor: UColor.baseline,}]} 
            placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
        {/* <Text style={[styles.inptpasstext,{color: UColor.lightgray}]}>提示：赎回 {Number(redeem.cpu_weight.replace("EOS", ""))+Number(redeem.net_weight.replace("EOS", ""))} EOS</Text> */}
    </View>
    EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyShowLD.loadingShow();
                // 解除抵押
                Eos.undelegate(plaintext_privateKey, redeem.from, redeem.to, formatEosQua(redeem.cpu_weight), formatEosQua(redeem.net_weight), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("赎回成功");
                    }else{    
                        if(r.data){
                          if(r.data.code){
                            var errcode = r.data.code;
                            if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                                || errcode == 3081001)
                            {
                              this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                if(resp.code == 608)
                                { 
                                    //弹出提示框,可申请免费抵押功能
                                    const view =
                                    <View style={styles.Explainout}>
                                      <Text style={[styles.Explaintext,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                      <Text style={[styles.Explaintext,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                    </View>
                                    EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                        
                                    const { navigate } = this.props.navigation;
                                    navigate('FreeMortgage', {});
                                    // EasyShowLD.dialogClose();
                                    }, () => { EasyShowLD.dialogClose() });
                                }
                            }});
                            }
                        　　}
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("赎回失败");
                            }
                        }else{
                            EasyToast.show("赎回失败");
                        }
                    }
                })
            } else {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyShowLD.loadingClose();
            EasyToast.show('未知异常');
        }
        // EasyShowLD.dialogClose();
    }, () => { EasyShowLD.dialogClose() });
  };

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }

  copyaccount(trade) {
    Clipboard.setString(trade.to);
    EasyToast.show('账号复制成功');
  }

  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
     <Header {...this.props} onPressLeft={true} title="抵押记录" />
      <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
          <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor}]} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} maxLength={12} 
                  placeholder="输入EOS账号" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}  numberOfLines={1} 
                  />    
              <TouchableOpacity onPress={this.Scan.bind(this)}>  
                  <Image source={UImage.account_scan} style={styles.headleftimg} />
              </TouchableOpacity>  
          </View>    
          <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
              <Text style={[styles.canceltext,{color: UColor.fontColor}]}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={[styles.canceltext,{color: UColor.fontColor}]}>清空</Text>
          </TouchableOpacity>  
      </View>   
      {this.state.show && <View style={[styles.nothave,{backgroundColor: UColor.mainColor}]}><Text style={[styles.copytext,{color: UColor.fontColor}]}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.delegateLoglist == null ? [] : this.state.delegateLoglist)} 
        renderRow={(rowData, sectionID, rowID) => (   
            <View style={[styles.outsource,{backgroundColor: UColor.mainColor}]}>
              <View style={styles.leftout}>
                <Button onPress={this._setModalVisible.bind(this,rowData)} style={{flex: 1,}}>
                    <View>
                        <Text style={{fontSize: ScreenUtil.setSpText(12), color: UColor.tintColor,}}>一键赎回</Text>
                    </View>
                </Button> 
                <View style={{flex: 1,justifyContent: 'space-between',}}>
                  <Text style={[styles.fromtotext,{color: UColor.fontColor}]} onLongPress={this.copyaccount.bind(this,rowData)}>{rowData.to}</Text>
                  <Text style={[styles.Receivercpu,{color: UColor.arrow}]}>Receiver</Text>
                </View>
              </View>
              <View style={styles.rightout}>
                  <Text style={[styles.fromtotext,{color: UColor.fontColor}]}>{rowData.net_weight}</Text>
                  <Text style={[styles.payernet,{color: UColor.arrow}]}>Net bandwidth</Text>
                  <Text style={[styles.fromtotext,{color: UColor.fontColor}]}>{rowData.cpu_weight}</Text>
                  <Text style={[styles.Receivercpu,{color: UColor.arrow}]}>CPU bandwidth</Text>
              </View>
            </View>
        )}                   
      />  
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 1,
      flexDirection: "column",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: ScreenUtil.autoheight(5),
      paddingVertical: ScreenUtil.autoheight(7), 
    },
    headleftout: {
      paddingLeft: ScreenUtil.autowidth(15),
    },
    headleftimg: {
      width: ScreenUtil.autowidth(18),
      height: ScreenUtil.autowidth(18),
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
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    inpt: {
      flex: 1,
      height: ScreenUtil.autoheight(45),
      fontSize: ScreenUtil.setSpText(14),
    },
    canceltext: {
      textAlign: 'center',
      fontSize: ScreenUtil.setSpText(15),
      paddingRight: ScreenUtil.autowidth(15),
    },
    btn: {
      flex: 1,
    },
    nothave: {
      borderRadius: 5,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      margin: ScreenUtil.autowidth(5),
      height: ScreenUtil.autoheight(110),
      paddingHorizontal: ScreenUtil.autowidth(20),
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16), 
    },
    outsource: {
      borderRadius: 5,
      flexDirection: "row",
      margin: ScreenUtil.autowidth(5),
      height: ScreenUtil.autoheight(90),
      paddingVertical: ScreenUtil.autoheight(10),
      paddingHorizontal: ScreenUtil.autowidth(20),
    },
    leftout:{
      flex: 1, 
      alignItems: "flex-start",
    },
    rightout: {
      flex: 1, 
      alignItems: "flex-end", 
      justifyContent: 'space-between',
    },
    fromtotext: {
      fontSize: ScreenUtil.setSpText(12),
    },
    payernet: {
      fontSize: ScreenUtil.setSpText(12),
    },
    Receivercpu: {
      fontSize: ScreenUtil.setSpText(12),
    },
    warningout: {
      borderWidth: 1,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: 'center', 
      width: ScreenWidth-ScreenUtil.autowidth(80),
    },
    imgBtn: {
      margin: ScreenUtil.autowidth(5),
      width: ScreenUtil.autowidth(30),
      height: ScreenUtil.autowidth(30),
    },
    headtitle: {
      flex: 1,
      fontSize: ScreenUtil.setSpText(14),
      lineHeight: ScreenUtil.autoheight(25),
      paddingLeft: ScreenUtil.autowidth(10),
    },
    passoutsource: {
      alignItems: 'center',
      flexDirection: 'column', 
    },
    inptpass: {
      textAlign: "center",
      borderBottomWidth: 1,
      height: ScreenUtil.autoheight(45),
      fontSize: ScreenUtil.setSpText(16),
      paddingBottom: ScreenUtil.autoheight(5),
      width: ScreenWidth-ScreenUtil.autowidth(100),
    },
    inptpasstext: {
      fontSize: ScreenUtil.setSpText(14),
      marginTop: ScreenUtil.autoheight(5),
      lineHeight: ScreenUtil.autoheight(25),
    },
    subViewBackup: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      height: ScreenUtil.autoheight(20),
      paddingHorizontal: ScreenUtil.autowidth(5),
      width: ScreenWidth-ScreenUtil.autowidth(20),
    },
    buttonView2: {
      alignItems: 'center',
      justifyContent: 'center',
      width: ScreenUtil.autowidth(30),
      height: ScreenUtil.autoheight(20),
    },
    contentText: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: ScreenUtil.setSpText(18),
      paddingBottom: ScreenUtil.autoheight(20),
    },
    buttonView: {
      alignItems: 'flex-end',
    },
    Explainout: {
      flexDirection: 'column', 
      alignItems: 'flex-start'
    },
    Explaintext: {
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30), 
    },

});
export default MortgageRecord;