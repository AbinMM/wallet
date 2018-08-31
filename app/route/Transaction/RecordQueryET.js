import React from 'react';
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform,  TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
var dismissKeyboard = require('dismissKeyboard');

@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class RecordQueryET extends React.Component {
  static navigationOptions = {
    title: "搜索交易记录",
    header: null, 
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      newetTradeLog: [],
      show: false,
      labelname: '',
      logId: "-1",
      logRefreshing: false,
      selectcode:this.props.navigation.state.params.code,    //ET交易币种的唯一code
      tradename:this.props.navigation.state.params.tradename,     //ET交易币种
    }
  }

  //加载地址数据
  componentDidMount() {
    this.setState({logRefreshing: true});
    this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: this.props.navigation.state.params.record, last_id: this.state.logId}, callback: (resp) => {
      try {
        if(resp.code != '0' || ((resp.code == '0') && (this.props.etTradeLog.length == 0))){
          this.setState({
            newetTradeLog: [],
            show: true
          })
        }else{
          this.setState({
            newetTradeLog: resp.data,
            show: false,
          })
        }
      } catch (error) {
        
      }
      this.processLogId();
      this.setState({logRefreshing: false});

    }});  
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this.query(data.toaccount);
      }
    });   
  }

  processLogId(){
    if(this.state.newetTradeLog && (this.state.newetTradeLog.length > 0)){
        this.setState({logId: this.state.newetTradeLog[this.state.newetTradeLog.length - 1]._id});
    }else{
        this.setState({logId: "-1"});
    }
  }

  //小数点位数大于指定位数,强制显示指定位数,少于则按实际位数显示
  precisionTransfer(data,pos){
    try {
        var point = data.lastIndexOf(".");
        if(point <= 0){
            return data; //无小数位
        }
        var pointnum = data.length - point - 1;
        var precisionData = data;
        if(pointnum > pos){
            precisionData = data.substring(0,point + 1 + pos);
        }
        return precisionData;
    } catch (error) {
        return data;
    }
  }
  //检测查询时，是否同一个账户重复查询
  checkIsRepeatQueryByAccount(accountname)
  {
    try {
      if(this.state.newetTradeLog && this.state.newetTradeLog.length > 0){
        if(this.state.newetTradeLog[0].account == accountname){
           return true;  //重复查询
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  // 根据账号查找交易记录
  query = (labelname) =>{
   
    if (labelname == ""||labelname == undefined||labelname==null) {
      EasyToast.show('请输入账号');
      return;
    }else{
      if(this.state.logRefreshing){
        return;
      }
      this.setState({logRefreshing: true});

      var repeatquery = this.checkIsRepeatQueryByAccount(labelname);
      var last_id;
      if(repeatquery == false){
        //新的账户名，清除原记录
        this.setState({newetTradeLog: [],logId:-1});
        last_id = -1;
      }else{
        last_id = this.state.logId;
      }
      this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: labelname.toLowerCase(), last_id: last_id}, callback: (resp) => {
        try {
            if(resp.code != '0'){
              this.setState({
                newetTradeLog: [],
                show: true
              })
            }else if((resp.code == '0') && (this.props.etTradeLog.length == 0)){
                 if(repeatquery){
                   EasyToast.show("没有新交易记录");
                 }else{
                   //没有交易
                  this.setState({
                    newetTradeLog: [],
                    show: true
                  })
                 }
            }else{
              this.setState({
                  newetTradeLog: resp.data,
                  show: false,
              })
            }
          } catch (error) {

          }
          this.processLogId();
          this.setState({logRefreshing: false});

      }});  
    }  
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
    });
    this.dismissKeyboardClick();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  onRefresh(){
    //能进来刷新，列表肯定有交易记录
    if(this.state.logRefreshing){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: accountName.toLowerCase(),last_id: this.state.logId}, callback: (resp) => {
      try {
          if(resp.code != '0'){
            this.setState({
              newetTradeLog: [],
              show: true
            })
          }else if((resp.code == '0') && (this.props.etTradeLog.length == 0)){
            EasyToast.show("没有新交易记录");
          }else{
            this.setState({
                newetTradeLog: resp.data,
                show: false,
            })
          }
        } catch (error) {

        }
        this.processLogId();
        this.setState({logRefreshing: false});

    }}); 
  }

  _openDetails =(transaction) => {
     const { navigate } = this.props.navigation;
     navigate('TradeDetails', {transaction});
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }

  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
    <Header {...this.props}  onPressLeft={true} title="搜索交易记录" />
      <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
          <View style={[styles.inptout,{backgroundColor: UColor.riceWhite}]} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} maxLength={12} 
                  placeholder="输入账号" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}   
                  />  
              <TouchableOpacity onPress={this.Scan.bind(this,this.state.labelname)}>  
                  <Image source={UImage.account_scan} style={styles.headleftimg} />
              </TouchableOpacity>     
          </View>    
          <TouchableOpacity onPress={this.query.bind(this,this.state.labelname)}>  
              <Text style={[styles.canceltext,{color: UColor.fontColor}]}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={[styles.canceltext,{color: UColor.fontColor}]}>清空</Text>
          </TouchableOpacity> 
      </View>   
      {this.state.show && <View style={[styles.nothave,{backgroundColor: UColor.mainColor}]}><Text style={[styles.copytext,{color: UColor.fontColor}]}>还没有交易记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        refreshControl={
          <RefreshControl
            refreshing={this.state.logRefreshing}
            onRefresh={() => this.onRefresh()}
            tintColor={UColor.fontColor}
            colors={[UColor.lightgray, UColor.tintColor]}
            progressBackgroundColor={UColor.fontColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.state.newetTradeLog == null ? [] : this.state.newetTradeLog)} 
        renderRow={(rowData, sectionID, rowID) => (  
          <Button onPress={this._openDetails.bind(this,rowData)}>   
            <View style={[styles.package,{backgroundColor: UColor.mainColor}]}>
              <View style={styles.leftout}>
                <Text style={[styles.payertext,{color: UColor.fontColor}]}>{rowData.account}</Text>
                <Text style={[styles.timetext,{color: UColor.arrow}]}>{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text>
              </View>
              <View style={styles.rightout}>
                {rowData.action_name == 'selltoken' ? 
                <Text style={[styles.selltext,{color: UColor.riseColor}]}>卖 {(rowData.price == null || rowData.price == '0') ? this.precisionTransfer(rowData.token_qty,8) : rowData.eos_qty}</Text>
                :
                <Text style={[styles.buytext,{color: UColor.fallColor,}]}>买 {rowData.eos_qty}</Text>
                }
                <Text style={[styles.presentprice,{color: UColor.arrow}]}>{(rowData.price == null || rowData.price == '0') ? '' : this.precisionTransfer(rowData.price,8)}{(rowData.price == null || rowData.price == '0') ? '' :  ' ' + this.state.tradename}</Text>
              </View>
              <View style={styles.Ionicout}>
                <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
              </View>
            </View>
          </Button>
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
    headleftimg: {
      width: ScreenUtil.autowidth(18),
      height: ScreenUtil.autowidth(18),
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    inptout: {
      flex: 1,
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
      height: ScreenUtil.autoheight(80),
      paddingHorizontal: ScreenUtil.autowidth(20),
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16), 
    },

    package: {
      borderRadius: 5,
      flexDirection: "row",
      height: ScreenUtil.autoheight(52),
      marginVertical: ScreenUtil.autoheight(5),
      paddingVertical: ScreenUtil.autoheight(5),
      marginHorizontal: ScreenUtil.autowidth(10),
      paddingHorizontal: ScreenUtil.autowidth(10),
    },
    leftout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    payertext: {
      fontSize: ScreenUtil.setSpText(15),
    },
    timetext: {
      fontSize: ScreenUtil.setSpText(15),
    },
   
    rightout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    selltext: {
      flex: 5,
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(15),
    },
    buytext: {
      flex: 5,
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(15),
    },
    presentprice: {
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(14),
    },
    Ionicout: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      width: ScreenUtil.autowidth(30),
    },
});
export default RecordQueryET;