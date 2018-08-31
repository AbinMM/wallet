import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, TouchableOpacity, Image, Platform, StatusBar, TextInput, Clipboard } from 'react-native';
import ScreenUtil from '../../utils/ScreenUtil'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import Header from '../../components/Header'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
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
    DeviceEventEmitter.addListener('updateDefaultWallet', (tab) => {
        this.props.dispatch({ type: 'wallet/walletList' });
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
      {/* <View style={styles.header}>  
        <View style={styles.leftout} >
        {Platform.OS === 'ios' && <Ionicons style={{ color: UColor.fontColor,   }} name="ios-arrow-back" size={ScreenUtil.setSpText(38)} onPress={this._leftTopClick.bind()}/>}
        {Platform.OS === 'android' && <Ionicons style={{ color: UColor.fontColor,   }} name="md-arrow-back" size={ScreenUtil.setSpText(30)} onPress={this._leftTopClick.bind()}/> }
        </View>
          <View style={styles.inptout} >
              <Text style={{ fontSize: ScreenUtil.setSpText(18),color: UColor.fontColor, justifyContent: 'center',alignItems: 'center',}} numberOfLines={1} ellipsizeMode='middle'>钱包管理</Text>
          </View>     
          <TouchableOpacity onPress={this._rightTopClick.bind()}>
            <View style={styles.Rightout} >
              <Image source={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet} style={styles.imgTeOy}/>
            </View>
          </TouchableOpacity>
      </View>  */}

      <View style={{paddingBottom: 60}}>
        <ListView initialListSize={10} style={{ backgroundColor: UColor.secdColor, }} enableEmptySections={true}
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
          refreshControl={<RefreshControl refreshing={false} tintColor={UColor.fontColor} colors={[UColor.lightgray, UColor.tintColor]} progressBackgroundColor={UColor.fontColor} />}
          dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
          renderRow={(rowData, sectionID, rowID) => (
            <Button onPress={this.onPress.bind(this, rowData, sectionID, rowID)}>
              <View style={[styles.row,{backgroundColor:UColor.mainColor}]} > 
                <View style={{flex: 1,}}>
                  <View style={styles.topout}>
                      <Button onPress={this.copyname.bind(this,rowData)} underlayColor={UColor.mainColor}>
                        <View style={{flexDirection: "row",}}>
                          <Text style={[styles.outname,{color: UColor.fontColor}]}>{rowData.name}</Text>
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
              <View  style={[styles.footoutsource,{backgroundColor:UColor.mainColor}]}>
                  <Image source={UImage.xin1} style={styles.footimg}/>
                  <Text style={[styles.footText,{color:UColor.fontColor}]}>创建账户</Text>
              </View>
          </Button>
          <Button  onPress={this.importWallet.bind(this)} style={{flex:1}}>
              <View style={[styles.footoutsource,{backgroundColor:UColor.mainColor}]}>
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
    justifyContent: "center",
    alignItems: "center",
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
    paddingLeft: ScreenUtil.autowidth(30),
    paddingHorizontal: ScreenUtil.autowidth(20),
    justifyContent: 'center', 
  },

  imgTeOy: {
    width: ScreenUtil.autowidth(28),
    height: ScreenUtil.autowidth(18),
    marginHorizontal: ScreenUtil.autowidth(5),
  },

  row:{
    height: ScreenUtil.autoheight(80),
    flexDirection:"row",
    paddingVertical: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(15),
    justifyContent:"center",
    borderRadius: 5,
    marginTop: ScreenUtil.autoheight(10),
    marginHorizontal: ScreenUtil.autowidth(10),
  },
  topout: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
  },
  outname: {
    fontSize: ScreenUtil.setSpText(14),
    textAlign: 'left',
  },
  imgBtn: {
    width: ScreenUtil.autowidth(20),
    height: ScreenUtil.autowidth(20),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  stopoutBackupsout: {
    marginHorizontal: ScreenUtil.autowidth(2),
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopoutBackups: {
    fontSize: ScreenUtil.setSpText(10),
    textAlign: 'center',
    paddingHorizontal: ScreenUtil.autowidth(8),
    paddingVertical: ScreenUtil.autoheight(1),
  },

  notactivedout: {
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notactived: {
    fontSize: ScreenUtil.setSpText(10),
    textAlign: 'center', 
    paddingHorizontal: ScreenUtil.autowidth(8),
    paddingVertical: 1,
  },
 
  outaccount: {
    flex: 1,
    fontSize: ScreenUtil.setSpText(18),
    textAlign: 'left',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topouttext: {
    fontSize: ScreenUtil.setSpText(18),
  },
  bomout: {
    width: ScreenUtil.autowidth(40),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  footer:{
      paddingTop: ScreenUtil.autoheight(5),
      height: ScreenUtil.autoheight(60),    
      flexDirection:'row',  
      position:'absolute',
      bottom: 0,
      left: 0,
      right: 0,
  },
  footoutsource:{
      flex:1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection:'row',
      marginRight:1,
  },
  footimg: {
      width: ScreenUtil.autowidth(30),
      height: ScreenUtil.autowidth(30),
  },
  footText:{
      marginLeft: ScreenUtil.autowidth(20),
      fontSize: ScreenUtil.setSpText(18),
  },
});

export default WalletManage;
