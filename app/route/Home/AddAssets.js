import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, Switch, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView, RefreshControl,Linking, TouchableWithoutFeedback, } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'

import Header from '../../components/Header'


import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ wallet, assets }) => ({ ...wallet, ...assets }))
class AddAssets extends BaseComponent {

  static navigationOptions = {
    tabBarLabel: '添加资产',
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      // show:false,
      value: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null,
      isAdding: false,
    };
  }

  componentDidMount() {
    try {
      EasyShowLD.loadingShow();
      // DeviceEventEmitter.emit('stopBalanceTimer', "");
      this.props.dispatch({ type: 'assets/list', payload: { page: 1}, callback: () => {
        EasyShowLD.loadingClose();
      } });

      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        if(this.props.defaultWallet && this.props.defaultWallet.name){
          this.props.dispatch({ type: 'assets/getMyAssetList', payload: { accountName: this.props.defaultWallet.name}});
        }
      }});

      DeviceEventEmitter.addListener('updateAssetList', (data) => {
        this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
      });
    } catch (error) {
      EasyShowLD.loadingClose();
    }
  }

  _rightTopClick = () =>{
    const { navigate } = this.props.navigation;
    navigate('AssetSearch', {});
  }

  componentWillUnmount(){
    DeviceEventEmitter.emit('updateMyAssets', '');
    // DeviceEventEmitter.emit('startBalanceTimer', "");
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }


  addAsset(asset, value) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }
    try {
      EasyShowLD.loadingShow();
      this.props.dispatch({ type: 'assets/addMyAsset', payload: {accountName: this.props.defaultWallet.account, asset: asset, value: value}, callback: (data) => {
        this.setState({isAdding: false});
        EasyShowLD.loadingClose();
      } });
    } catch (error) {
      EasyShowLD.loadingClose();
    }

  }

  isMyAsset(rowData){
    if(this.props.myAssets == null){
        return false;
    }
    if(this.state.selectasset != null && this.state.selectasset.name == rowData.name){
      if(this.state.value){
        return true;
      }else{
        return false;
      }
    }
    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].asset.name == rowData.name ){
            return true;
        } 
    }
    return false;
  }

  _renderRow = (rowData, sectionID, rowID) => {
    return(<View style={[{marginHorizontal: ScreenUtil.autowidth(15),marginBottom: ScreenUtil.autoheight(15), borderRadius: 8, overflow: 'hidden',},rowID == 0 && {marginTop: ScreenUtil.autowidth(10)}]}>
          <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
            <View style={styles.lefts}>
              <View style={{borderRadius: 25,backgroundColor: UColor.secdfont,marginRight: ScreenUtil.autowidth(15)}}> 
                <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={styles.leftimg} />
              </View>
              <Text style={[styles.lefttext,{color: '#262626'}]}>{rowData.name}</Text>
            </View>
            <View style={styles.rights}>
              <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.fontrice}
                value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                  if(this.state.isAdding){ return }
                  this.setState({isAdding: true});
                  this.setState({selectasset: rowData, value: value});
                  this.addAsset(rowData, value);
                }}/>
            </View>
          </View>
    </View>)
  }

  render() {
      return (
        <View style={[styles.container,{backgroundColor: '#F7F8F9'}]}>
          <Header {...this.props} onPressLeft={true} title="添加资产" avatar={UImage.Magnifier_ash} onPressRight={this._rightTopClick.bind()} imgWidth={ScreenUtil.autowidth(17)} imgHeight={ScreenUtil.autowidth(18)}/> 
          <ListView 
            enableEmptySections={true} initialListSize={10}
            dataSource={this.state.dataSource.cloneWithRows(this.props.assetsList == null ? [] : this.props.assetsList)} 
            renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
          />
        </View>
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: ScreenUtil.autowidth(20),
    paddingVertical: ScreenUtil.autowidth(15),
  },

  
  
  head: {
    flexDirection: "row",
    width: ScreenWidth,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
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
  },
  rights: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: "column",
    justifyContent: "center",
  },
  
  
});

export default AddAssets;
