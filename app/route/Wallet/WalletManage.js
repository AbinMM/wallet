import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, TouchableOpacity, Image, Platform, StatusBar, TextInput, Clipboard } from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";

@connect(({ wallet }) => ({ ...wallet }))
class WalletManage extends BaseComponent {

  static navigationOptions = {
    title: '钱包管理',
    header:null,  
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      isEye: false,
    }
    DeviceEventEmitter.addListener('modify_password', () => {
        this.props.dispatch({ type: 'wallet/walletList' });
    });
  }
  _leftTopClick =() => {
    const {goBack} = this.props.navigation;
    goBack();
  }

  _rightTopClick = () => {
    this.props.dispatch({type:'wallet/changeRevealWallet',callback:(reveal)=>{
      this.setState({
        isEye:reveal.reveal,
      });
    }});
  };

  //组件加载完成
  componentDidMount() {
    const { dispatch } = this.props;
    var th = this;
    this.props.dispatch({type:'wallet/getRevealWallet',callback:(reveal)=>{ this.setState({isEye:reveal.reveal,});}});
    this.props.dispatch({ type: 'wallet/walletList' });
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.getAllWalletEosBalance();
    }});
    DeviceEventEmitter.addListener('updateDefaultWallet', (tab) => {
        this.props.dispatch({ type: 'wallet/walletList' });
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
          this.getAllWalletEosBalance();
        } });
      });
    DeviceEventEmitter.addListener('delete_wallet', (tab) => {
      this.props.dispatch({ type: 'wallet/walletList' });
    });

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  onPress = (data, sectionID, rowID) => {
    const { navigate } = this.props.navigation;
    var func = this.updateState;
    navigate('WalletDetail', { data, func, isEye: this.state.isEye });
  }

  getAllWalletEosBalance(){
    if(this.props.walletList == null){
      return;
    }

    for(var i = 0; i < this.props.walletList.length; i++) {
      if (this.props.walletList[i] != null && this.props.walletList[i].name != null && (this.props.walletList[i].isactived && this.props.walletList[i].hasOwnProperty('isactived'))) {
        this.props.dispatch({
          type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.walletList[i].name, symbol: 'EOS' }
        })
  
      }
    }
  }

  // 创建钱包
  createWallet() {
    if(this.props.walletList != null){
      for(var i = 0; i < this.props.walletList.length; i++){
        if(!this.props.walletList[i].isactived){
          EasyToast.show("您已有未激活钱包,不能再创建!");
          return;
        }
      }
    }
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {});
  }

  // 导入钱包
  importWallet() {
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey',{});
  }

  updateState(state) {
    alert(state);
  }

  copyname(data) {
    Clipboard.setString(data.name);
    EasyToast.show('账号复制成功');
  }
  getAssertDisp(rowData){
     if(!this.state.isEye){
       return "******";
     }
     var disp = rowData.isactived && rowData.balance != null && rowData.balance != ""? rowData.balance : '0.0000';
     return disp;
  }

  render() {
    return (<View style={[styles.container,{backgroundColor: UColor.secdColor}]}>  
      <Header {...this.props} onPressLeft={true} title="钱包管理" onPressRight={this._rightTopClick.bind()} avatar={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet}/>
      <View style={{paddingBottom: 50}}>
        <ListView initialListSize={10} style={{ backgroundColor: UColor.secdColor, }} enableEmptySections={true}
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
          refreshControl={<RefreshControl refreshing={false} tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor} />}
          dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
          renderRow={(rowData, sectionID, rowID) => (
            <Button onPress={this.onPress.bind(this, rowData, sectionID, rowID)}>
              <View style={[styles.row,{backgroundColor:UColor.mainColor}]} > 
                <View style={{flex: 1,}}>
                  <View style={styles.topout}>
                      <Button onPress={this.copyname.bind(this,rowData)} underlayColor={UColor.mainColor}>
                        <View style={{flexDirection: "row",}}>
                          <Text style={[styles.outname,{color: UColor.fontColor}]}>{"地址 : "+rowData.name}</Text>
                          <Image source={UImage.copy} style={styles.imgBtn} />
                        </View>
                      </Button>
                      {(!rowData.isactived|| !rowData.hasOwnProperty('isactived')) ? <View style={[styles.notactivedout,{borderColor: UColor.showy}]}><Text style={[styles.notactived,{color: UColor.showy}]}>未激活</Text></View>:(rowData.isBackups ? null : <View style={[styles.stopoutBackupsout,{borderColor: UColor.tintColor}]}><Text style={[styles.stopoutBackups,{color: UColor.tintColor}]}>未备份</Text></View>) }   
                      {(rowData.ownerPublic==null || rowData.ownerPublic=="" )&&(rowData.activePublic !=null && rowData.activePublic.length==53 ) ? <View style={[styles.stopoutBackupsout,{borderColor: UColor.tintColor}]}><Text style={[styles.stopoutBackups,{color: UColor.tintColor}]}>Active</Text></View>:null}
                      {(rowData.ownerPublic!=null && rowData.ownerPublic.length==53 )&&(rowData.activePublic==null || rowData.activePublic=="" )? <View style={[styles.stopoutBackupsout,{borderColor: UColor.tintColor}]}><Text style={[styles.stopoutBackups,{color: UColor.tintColor}]}>Owner</Text></View>:null  }
                  </View>
                  <View style={styles.topout}>               
                    <Text style={[styles.outaccount,{color: UColor.fontColor}]} numberOfLines={1} ellipsizeMode='middle'>{this.getAssertDisp(rowData)}<Text style={[styles.topouttext,{color: UColor.arrow}]}> EOS</Text></Text>
                  </View>
                </View> 
                <View style={styles.bomout}> 
                    <Ionicons color={UColor.fontColor} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(20)} />     
                </View>
              </View>
            </Button>          
          )}
        /> 
      </View> 
      <View style={[styles.footer,{backgroundColor:UColor.secdColor}]}>
          <Button  onPress={() => this.createWallet()} style={{flex:1}}>
              <View style={[styles.footoutsource,{marginRight:0.5,backgroundColor:UColor.mainColor}]}>
                  <Image source={UImage.xin1} style={styles.footimg}/>
                  <Text style={[styles.footText,{color:UColor.fontColor}]}>创建账户</Text>
              </View>
          </Button>
          <Button  onPress={this.importWallet.bind(this)} style={{flex:1}}>
              <View style={[styles.footoutsource,{marginLeft: 0.5, backgroundColor:UColor.mainColor}]}>
                  <Image source={UImage.xin0} style={styles.footimg}/>
                  <Text style={[styles.footText,{color:UColor.fontColor}]}>导入钱包</Text>
              </View>
          </Button>
      </View> 
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: ScreenUtil.autoheight(20),
    paddingBottom: ScreenUtil.autoheight(5),
  },
  leftout: {
    paddingLeft: ScreenUtil.autowidth(15)
  },
  Rightout: {
    paddingRight: ScreenUtil.autowidth(15),
  },

  inptout: {
    flex: 1,
    justifyContent: 'center', 
    paddingLeft: ScreenUtil.autowidth(30),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },

  imgTeOy: {
    width: ScreenUtil.autowidth(28),
    height: ScreenUtil.autowidth(18),
    marginHorizontal: ScreenUtil.autowidth(5),
  },

  row:{
    borderRadius: 5,
    flexDirection:"row",
    justifyContent:"center",
    height: ScreenUtil.autoheight(80),
    marginTop: ScreenUtil.autoheight(10),
    marginHorizontal: ScreenUtil.autowidth(10),
    paddingVertical: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  topout: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
  },
  outname: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(14),
  },
  imgBtn: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  stopoutBackupsout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: ScreenUtil.autowidth(2),
  },
  stopoutBackups: {
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(10),
    paddingVertical: ScreenUtil.autoheight(1),
    paddingHorizontal: ScreenUtil.autowidth(8),
  },

  notactivedout: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notactived: {
    paddingVertical: 1,
    textAlign: 'center', 
    fontSize: ScreenUtil.setSpText(10),
    paddingHorizontal: ScreenUtil.autowidth(8),
  },
 
  outaccount: {
    flex: 1,
    textAlign: 'left',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: ScreenUtil.setSpText(18),
  },
  topouttext: {
    fontSize: ScreenUtil.setSpText(18),
  },
  bomout: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(40),
  },

  footer:{
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection:'row',  
    position:'absolute',
    height: ScreenUtil.autoheight(50),   
    paddingTop: ScreenUtil.autoheight(1),
  },
  footoutsource:{
    flex:1, 
    flexDirection:'row',
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  footimg: {
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
  },
  footText:{
    fontSize: ScreenUtil.setSpText(18),
    marginLeft: ScreenUtil.autowidth(20),
  },
});

export default WalletManage;
