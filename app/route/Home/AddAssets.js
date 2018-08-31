import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,ListView,StyleSheet,Image,View,Text,Switch} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";

@connect(({wallet, assets}) => ({...wallet, ...assets}))
class AddAssets extends BaseComponent {

      static navigationOptions = {
        headerTitle: "添加资产",
        header:null, 
    };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {
      show:false,
      value: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null,
      isAdding: false,
    };
  }


  componentDidMount() {
    try {
      EasyShowLD.loadingShow();
      DeviceEventEmitter.emit('stopBalanceTimer', "");
      this.props.dispatch({ type: 'assets/list', payload: { page: 1}, callback: () => {
        EasyShowLD.loadingClose();
      } });

      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        if(this.props.defaultWallet && this.props.defaultWallet.name){
          this.props.dispatch({ type: 'assets/myAssetInfo', payload: { accountName: this.props.defaultWallet.name}});
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
    DeviceEventEmitter.emit('startBalanceTimer', "");
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  onPress(action){
    EasyShowLD.dialogShow("温馨提示","该功能正在紧急开发中，敬请期待!","知道了",null,()=>{EasyShowLD.dialogClose()});
  }

  _rightButtonClick() {  
    this._setModalVisible();  
  }  

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
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
  
  render() {
    return (
      <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
          <Header {...this.props} onPressLeft={true} title="添加资产" avatar={UImage.Magnifier} onPressRight={this._rightTopClick.bind()}/> 
          <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
            dataSource={this.state.dataSource.cloneWithRows(this.props.assetsList == null ? [] : this.props.assetsList)} 
            renderRow={(rowData, sectionID, rowID) => (      
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
                <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                  <View style={{borderRadius: 25,backgroundColor: UColor.secdColor,marginRight: ScreenUtil.autowidth(10),}}>
                    <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={styles.logimg}/>
                  </View>
                  <View style={styles.scrollView}>
                    <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>{rowData.name}</Text>
                    <Text style={[styles.quantity,{color: UColor.arrow}]}>合约账户 : {rowData.contractAccount == null ? "" : rowData.contractAccount}</Text>
                  </View>
                  <View style={styles.listInfoRight}>
                    <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.secdColor}
                        value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                          if(this.state.isAdding){
                            return;
                          }
                          this.setState({isAdding: true});
                          this.setState({selectasset: rowData, value: value});
                          this.addAsset(rowData, value);
                        }}/>
                  </View>
                </View>
                
            </View>
            )}                
          /> 
      </View>
    )
  }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
    },

    listItem: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
   
    listInfo: {
      height: ScreenUtil.autoheight(60),
      paddingHorizontal: ScreenUtil.autowidth(16),
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth:1,
    },
    logimg: {
      width: ScreenUtil.autowidth(28), 
      height: ScreenUtil.autowidth(28), 
      resizeMode: "cover", 
      overflow:"hidden", 
      borderRadius: 10, 
    },
    scrollView: {
      flex: 1,
      paddingLeft: ScreenUtil.autowidth(10),
      justifyContent: "center",
    },
    listInfoTitle: {
      fontSize: ScreenUtil.setSpText(16)
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center"
    },

    quantity: {
      fontSize: ScreenUtil.setSpText(14),
    },
   
})
export default AddAssets;