import React from 'react';
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
var dismissKeyboard = require('dismissKeyboard');

@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class RecordQueryRam extends React.Component {
  static navigationOptions = {
    title: "搜索交易记录",
    header: null, 
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      newramTradeLog: [],
      show: false,
      labelname: this.props.navigation.state.params.record,
      logId: "-1",
      logRefreshing: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    this.setState({logRefreshing: true});
    this.setState({logId: "-1"});
    this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: this.props.navigation.state.params.record, last_id: this.state.logId}, callback: (resp) => {
      try {
        this.setState({logRefreshing: false});

        if(this.props.personalRamTradeLog && this.props.personalRamTradeLog.length > 0){
          this.setState({
            newramTradeLog: this.props.personalRamTradeLog,
            show: false,
          });
        }else{
          this.setState({
            show: true
          });
        }
      } catch (error) {

      }
      this.processLogId();

    }});   
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this.query(data.toaccount);
      }
    }); 
  }

  processLogId(){
    if(this.props.personalRamTradeLog && (this.props.personalRamTradeLog.length > 0)){
        this.setState({logId: this.props.personalRamTradeLog[this.props.personalRamTradeLog.length - 1]._id});
        // logId = this.props.personalRamTradeLog[this.props.personalRamTradeLog.length - 1]._id;
    }else{
        this.setState({logId: "-1"});
    }
  }

  //检测查询时，是否同一个账户重复查询
  checkIsRepeatQueryByAccount(accountname)
  {
    try {
      if(this.state.newramTradeLog && this.state.newramTradeLog.length > 0){
        if(this.state.newramTradeLog[0].payer == accountname){
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
      EasyToast.show('请输入EOS账号');
      return;
    }else{
      if(this.state.logRefreshing){
        return;
      }
      this.setState({logRefreshing: true});

      var last_id;
      var repeatquery = this.checkIsRepeatQueryByAccount(labelname);
      if(!repeatquery){
        //新的账户名，清除原记录
        this.setState({newramTradeLog: []});
        last_id = "-1";
      }else{
        last_id = this.state.logId;
      }
      // alert(repeatquery+labelname + this.state.logId);
      this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: labelname.toLowerCase(), last_id: last_id}, callback: (resp) => {
        try {
          this.setState({logRefreshing: false});
  
          if(this.props.personalRamTradeLog && this.props.personalRamTradeLog.length > 0){
            this.setState({
              newramTradeLog: this.props.personalRamTradeLog,
              show: false,
            });
          }else{
            this.setState({
              show: true
            });
          }
        } catch (error) {
  
        }
        this.processLogId();

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
    if(this.state.logRefreshing || this.state.logId == "-1"){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    
    this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: accountName.toLowerCase(), last_id: this.state.logId}, callback: (resp) => {
      try {
          this.setState({logRefreshing: false});

          if(this.props.personalRamTradeLog && this.props.personalRamTradeLog.length > 0){
            this.setState({
              newramTradeLog: this.props.personalRamTradeLog,
              show: false,
            });
          }else{
            EasyToast.show("没有新交易记录");
            this.setState({
              show: true
            });
          }

        } catch (error) {

        }
        this.processLogId();

    }}); 
  }

  onEndReached(){
    if(this.state.logRefreshing || this.state.logId == "-1"){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    
    this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: accountName.toLowerCase(), last_id: this.state.logId}, callback: (resp) => {
      try {
        this.setState({logRefreshing: false});
        if((resp.code == '0') && resp.data && resp.data.length == 0){
                EasyToast.show("没有更多交易记录了哟");
        }
        if(this.props.personalRamTradeLog && this.props.personalRamTradeLog.length > 0){
          this.setState({
            newramTradeLog: this.props.personalRamTradeLog,
            show: false,
          });
        }else{
          this.setState({
            show: true
          });
        }
      } catch (error) {

      }
      this.processLogId();
    }}); 
  }

  _openDetails =(ramtransaction) => {
    const { navigate } = this.props.navigation;
    navigate('TradeDetails', {ramtransaction});
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }

  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
    <Header {...this.props}  onPressLeft={true} title="搜索交易记录" />
      <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
          <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor}]} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} maxLength={12} 
                  placeholder="输入EOS账号" underlineColorAndroid="transparent" keyboardType="default"
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
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true}  onEndReachedThreshold = {50}
        onEndReached={() => this.onEndReached.bind(this)}
        refreshControl={
          <RefreshControl
            refreshing={this.state.logRefreshing}
            onRefresh={() => this.onRefresh()}
            tintColor={UColor.fontColor}
            colors={[UColor.lightgray, UColor.tintColor]}
            progressBackgroundColor={UColor.fontColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.state.newramTradeLog == null ? [] : this.state.newramTradeLog)} 
        renderRow={(rowData, sectionID, rowID) => ( 
          <Button onPress={this._openDetails.bind(this,rowData)}>  
            <View style={[styles.package,{backgroundColor: UColor.mainColor}]}>
              <Text style={[styles.timetext,{color: UColor.arrow}]} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text>
              <Text style={[styles.presentprice,{color: UColor.fontColor}]} numberOfLines={1}>{(rowData.price == null || rowData.price == '0') ? '' : (rowData.price * 1).toFixed(4)}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
              {rowData.action_name == 'sellram' ? 
                <Text style={[styles.selltext,{color: UColor.riseColor}]} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
              :
                <Text style={[styles.buytext,{color: UColor.fallColor}]} numberOfLines={1}>买 {rowData.eos_qty}</Text>
              }
              <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
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
      flexDirection: "column",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: ScreenUtil.autoheight(7),
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
      shadowOpacity: 1,
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
      paddingTop: ScreenUtil.autoheight(8),
    },
    nothave: {
      borderRadius: 5,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      margin: ScreenUtil.autowidth(5),
      height: ScreenUtil.autowidth(84),
      paddingHorizontal: ScreenUtil.autowidth(20),
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16), 
    },
    package: {
      flexDirection: "row",
      padding: ScreenUtil.autowidth(5),
      marginBottom: ScreenUtil.autoheight(2),
    },
    timetext: {
      flex: 3,
      fontSize: ScreenUtil.setSpText(13),
    },
    selltext: {
      flex: 3.3,
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(13),
    },
    buytext: {
      flex: 3.3,
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(13),
    },
    presentprice: {
      flex: 3.7,
      textAlign: 'left',
      fontSize: ScreenUtil.setSpText(13),
    },
});
export default RecordQueryRam;