import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter,StyleSheet, View, Text, Image, ListView, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import UImage from "../../utils/Img";
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');

@connect(({login,wallet,assets}) => ({...login,...wallet,...assets}))
class ChoiceToken extends BaseComponent {

  static navigationOptions = {
    title: '选择代币',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
        delegatebw: "",
        assetRefreshing: false,
        isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
        dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };
  }

  componentDidMount() {
    this.props.dispatch({ 
      type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.props.dispatch({ 
          type: 'assets/myAssetInfo', payload: { page: 1, isInit: true, accountName: this.props.defaultWallet.name}, 
          callback: () => {} 
        })
      } 
    })
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  assetInfo(asset){
      this.props.navigation.goBack();  //正常返回上一个页面
      if(this.state.isTurnOut){
          DeviceEventEmitter.emit('transfer_token_result',asset);
      }else{
          const { navigate } = this.props.navigation;
          navigate('TurnOutAsset', { coins: asset });
      }
  }

  dismissKeyboardClick() {
      dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
      <Header {...this.props} onPressLeft={true} title="选择代币" />
      <ListView initialListSize={1} enableEmptySections={true} 
          refreshControl={
            <RefreshControl
              refreshing={this.state.assetRefreshing}
              onRefresh={() => this.onRefresh()}
              tintColor={UColor.fontColor}
              colors={[UColor.tintColor]}
              progressBackgroundColor={UColor.btnColor}
            />
          }
          dataSource={this.state.dataSource.cloneWithRows(this.props.myAssets == null ? [] : this.props.myAssets)} 
          renderRow={(rowData, sectionID, rowID) => (      
            <TouchableOpacity onPress={this.assetInfo.bind(this, rowData)}>
              <View style={[styles.row,{backgroundColor: '#FFFFFF',shadowColor: '#EFF4F8',shadowOffset:{height: 2,width: 0},shadowRadius: 5,shadowOpacity: 0.5,elevation: 5,}]}>
                <View style={styles.lefts}>
                  <Image source={rowData.asset.icon==null ? UImage.eos : { uri: rowData.asset.icon }} style={styles.leftimg} resizeMode='stretch'/>
                  <Text style={[styles.lefttext,{color: '#262626'}]}>{rowData.asset.name}</Text>
                </View>
                
                <View style={styles.rightout}>
                    <Text style={[styles.rightbalance,{color: '#262626'}]}>{(rowData.balance==null || rowData.balance=="" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.0000" : rowData.balance.replace(rowData.asset.name, "")}</Text>
                    <Text style={[styles.rightmarket,{color:  '#808080'}]}>{(rowData.balance==null || rowData.balance=="" || rowData.asset.value == null || rowData.asset.value == "" || rowData.asset.value == 0 || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? " " :  "≈（￥）" + (rowData.balance.replace(rowData.asset.name, "")*rowData.asset.value).toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}                
        />  
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },

  row: {
    borderRadius: 6,
    flexDirection:"row",
    justifyContent:"center",
    marginVertical: ScreenUtil.autoheight(7.5),
    marginHorizontal: ScreenUtil.autowidth(15),
    paddingVertical: ScreenUtil.autoheight(16),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  lefts: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  leftimg: {
    width: ScreenUtil.autowidth(39), 
    height: ScreenUtil.autowidth(39),
  },
  lefttext: {
    fontSize: ScreenUtil.setSpText(16),
    marginLeft: ScreenUtil.autowidth(15),
  },
  rights: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  rightout: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: "column",
    justifyContent: "center",
  },
  rightbalance: {
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(18), 
  },
  rightmarket: {
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(14),
  },


  textinptoue: {
    paddingTop: ScreenUtil.autoheight(20),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  inptout: {
    height: ScreenUtil.autoheight(300),
    paddingVertical: ScreenUtil.autoheight(20),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  inpt: {
    flex: 1, 
    textAlignVertical: 'top', 
    fontSize: ScreenUtil.setSpText(14),
    height: ScreenUtil.autoheight(266), 
    lineHeight: ScreenUtil.autoheight(25),
    paddingLeft: ScreenUtil.autowidth(10), 
  },
  Explaintext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(25),
  },
  Submissionout: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(47),
    marginTop: ScreenUtil.autoheight(30),
  },
  Submission: {
    fontSize: ScreenUtil.setSpText(15),
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
  }
});

export default ChoiceToken;
