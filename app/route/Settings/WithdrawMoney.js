import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform,  TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import moment from 'moment';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'

class WithdrawMoney extends React.Component {

  static navigationOptions = {
    title: "领取记录",
    header:null, 
  };
  
  constructor(props) {
    super(props);
  }

  //加载地址数据
  componentDidMount() {
   //alert(JSON.stringify(this.props.navigation.state.params.carry.data));
  }

  render() {
    const carry = this.props.navigation.state.params.carry.data;
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
      <Header {...this.props} onPressLeft={true} title="领取记录" />
      <View style={[styles.package,{backgroundColor: UColor.mainColor}]}>
        <View style={styles.leftout}>
          <Text style={[styles.payertext,{color: UColor.arrow}]}>领取数量：<Text style={{color: UColor.fontColor}}>{carry.eost} EOS</Text></Text>
          <Text style={[styles.payertext,{color: UColor.arrow}]}>接受账号：<Text style={{color: UColor.fontColor}}>{carry.eos_account}</Text></Text>
          <Text style={[styles.payertext,{color: UColor.arrow}]}>时间：<Text style={{color: UColor.fontColor}}>{moment(carry.createdate).format("YYYY-MM-DD HH:mm")}</Text></Text>
          {/* <Text style={[styles.timetext,{color: UColor.arrow}]}>时间{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text> */}
        </View>
        <View style={styles.rightout}>
          {carry.type == 'audit' && <Text style={[styles.selltext,{color: UColor.riseColor}]}>审核中</Text>}
          {carry.type == 'receive' && <Text style={[styles.buytext,{color: UColor.tintColor}]}>已提取</Text>}
          {carry.type == 'notpass' && <Text style={[styles.buytext,{color: UColor.tintColor}]}>未通过</Text>}
          <Text style={[styles.presentprice,{color: UColor.arrow}]}>状态</Text>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: "flex-end",}}>
          <View style={[styles.significantout,{borderColor: UColor.arrow}]}>
              <Text style={[styles.significanttext,{color: UColor.arrow}]} >审核中说明</Text>
              <Text style={[styles.significanttext,{color: UColor.arrow}]} >您的领取奖励已提交成功！奖励将在3个工作日内到账，请注意查收！</Text>
          </View>
      </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
    },
    package: {
      borderRadius: 5,
      flexDirection: "row",
      marginVertical: ScreenUtil.autoheight(5),
      paddingVertical: ScreenUtil.autoheight(5),
      marginHorizontal: ScreenUtil.autowidth(10),
      paddingHorizontal: ScreenUtil.autowidth(10),
    },
    leftout: {
      flex: 3,
      flexDirection: "column",
      justifyContent: "center",
    },
    payertext: {
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    timetext: {
      fontSize: ScreenUtil.setSpText(15),
    },
    rightout: {
      flex: 1,
      alignItems: 'center',
      flexDirection: "column",
      justifyContent: "center",
    },
    selltext: {
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    buytext: {
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    presentprice: {
      fontSize: ScreenUtil.setSpText(14),
    },
    significantout: {
      borderWidth: 1,
      borderRadius: 10,
      margin: ScreenUtil.autowidth(20),
      padding: ScreenUtil.autowidth(10),
    },
    significanttext: {
      fontSize: ScreenUtil.setSpText(14), 
      lineHeight: ScreenUtil.autoheight(25),
    },
});
export default WithdrawMoney;