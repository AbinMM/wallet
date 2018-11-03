import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Clipboard, TouchableOpacity, TextInput,Modal } from 'react-native';
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
import {RefundModal,RefundModalView} from '../../components/modals/RefundModal'
import {AuthModal, AuthModalView} from '../../components/modals/AuthModal'

var AES = require("crypto-js/aes")
var CryptoJS = require("crypto-js")
var dismissKeyboard = require('dismissKeyboard')
const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class DelegatebwRecord extends React.Component {

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
    RefundModal.show({account:redeem.to,net:redeem.net_weight,cpu:redeem.cpu_weight},()=>{
      this.undelegateb(redeem);
    })
  }

  //赎回
  undelegateb = (redeem) => { 
    AuthModal.show((authInfo)=>{
      try {
        EasyShowLD.loadingShow();
        // 解除抵押
        Eos.transaction({
          actions: [
              {
                  account: "eosio",
                  name: "undelegatebw", 
                  authorization: [{
                  actor: redeem.from,
                  permission: authInfo.permission,
                  }], 
                  data: {
                      from: redeem.from,
                      receiver: redeem.to,
                      unstake_net_quantity: formatEosQua(redeem.net_weight),
                      unstake_cpu_quantity: formatEosQua(redeem.cpu_weight),
                  }
              },
          ]
      }, authInfo.pk, (r) => {
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
      });
      } catch (error) {
        EasyShowLD.loadingClose();
        EasyToast.show('未知异常');
      }

    })
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

  chkPrice(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    try {
    value = parseFloat(obj);
    } catch (error) {
    value = 0.0000;
    }
    if(value < min|| value > max){
    EasyToast.show("输入错误");
    obj = "";
    }
    return obj;
  }

  

  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdfont}]}>
     <Header {...this.props} onPressLeft={true} title="抵押赎回" />
      {/* <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
          <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor}]} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}/>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip} maxLength={12} 
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
      </View>   */}

      {this.state.show && <View style={[styles.nothave,{backgroundColor: UColor.mainColor}]}><Text style={[styles.copytext,{color: UColor.fontColor}]}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.delegateLoglist == null ? [] : this.state.delegateLoglist)} 
        renderRow={(rowData, sectionID, rowID) => (   
          <Button onPress={this._setModalVisible.bind(this,rowData)} style={{flex: 1,}}>
            <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
              <View style={styles.leftout}>
                <Text style={[styles.fromtotext,{color: UColor.fontColor}]} onLongPress={this.copyaccount.bind(this,rowData)}>{rowData.to}</Text>
              </View>
              <View style={styles.rightout}>
                <Text style={[styles.payernet,{color: UColor.arrow}]}>{"[CPU] " +rowData.cpu_weight}</Text>
                <Text style={[styles.payernet,{color: UColor.arrow}]}>{"[NET] " +rowData.net_weight}</Text>
              </View>
            </View>
          </Button>
        )}                   
      /> 
      <RefundModalView />
      <AuthModalView {...this.props}/>
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      height: ScreenUtil.autoheight(60),
      paddingHorizontal: ScreenUtil.autowidth(20),
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16), 
    },
    outsource: {
      flexDirection: "row",
      marginBottom: 0.5,
      height: ScreenUtil.autoheight(60),
      paddingVertical: ScreenUtil.autoheight(15),
      paddingHorizontal: ScreenUtil.autowidth(17),
    },
    leftout:{
      flex: 1, 
      alignItems: "flex-start",
      justifyContent: 'center',
    },
    rightout: {
      flex: 1, 
      alignItems: "flex-end", 
      justifyContent: 'space-between',
    },
    fromtotext: {
      fontSize: ScreenUtil.setSpText(16),
    },
    payernet: {
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
export default DelegatebwRecord;