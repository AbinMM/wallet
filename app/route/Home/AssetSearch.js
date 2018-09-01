import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, TextInput, Modal, Switch, TouchableOpacity  } from 'react-native';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import UImage from '../../utils/Img'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
@connect(({wallet, assets}) => ({...wallet, ...assets}))
class AssetSearch extends BaseComponent {

  static navigationOptions = {
    title: '资产搜索',
    header:null,  
  };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ search: this._leftTopClick, cancel:this._rightTopClick  });
    this.state = {
      show:false,
      value: false,
      labelname: '',
      tokenname: '',
      address: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null,
      newAssetsList: [],
      reveal: true,
    }
  }

  componentDidMount() {
    try {
      EasyShowLD.loadingShow();
      DeviceEventEmitter.emit('stopBalanceTimer', "");
      this.props.dispatch({ type: 'assets/list', payload: { page: 1}, callback: () => {
        EasyShowLD.loadingClose();
      } });
      this.props.dispatch({ type: 'assets/myAssetInfo'});
      DeviceEventEmitter.addListener('updateAssetList', (data) => {
        this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
      });
    } catch (error) {
      EasyShowLD.loadingClose();
    }
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this._query(data.toaccount);
      }
    }); 
  }

  //清空
  _empty = () => {
    this.dismissKeyboardClick();
    this.setState({
      reveal: true,
      labelname: '',
      newAssetsList:[],
    });
  }
  //查询
  _query =(labelname) => {
    this.dismissKeyboardClick();
    if (labelname == "") {
      EasyToast.show('请输入token名称或合约地址');
      return;
    }else{
      let NumberArr = this.props.assetsList;
      for (var i = 0; i < NumberArr.length; i++) {
        if (NumberArr[i].name == labelname.toUpperCase() || NumberArr[i].contractAccount == labelname.toLowerCase()) {
            this.setState({
              newAssetsList:[NumberArr[i]],
              reveal: false,
            });
            break;
        }
      }
      if(i == NumberArr.length){
        EasyToast.show('没有搜索到该token，请尝试手动添加');
        this.setState({
          reveal: true,
        });
      }
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
  //手动添加
  logout() {
    this._setModalVisible();  
    this.setState({
      tokenname: '',
      address: '',
    });
  }

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  submit() {
    if (this.state.tokenname == "") {
      EasyToast.show('请输入token名称');
      return;
    }
    if (this.state.address == "") {
      EasyToast.show('请输入合约账户');
      return;
    }
    // EasyShowLD.dialogShow();
    this.props.dispatch({ type: 'assets/submitAssetInfoToServer', payload: { contractAccount: this.state.address.toLowerCase(), name: this.state.tokenname.toUpperCase() }, callback: (data) => {
      if(data && data.code=='0'){
        this.setState({
          show: false,
        });
        EasyToast.show('添加成功');
      }else{
        this.setState({
          show: false,
        });
        EasyToast.show(data.msg);
      }
    }});

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
    // EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'assets/addMyAsset', payload: {accountName: this.props.defaultWallet.account, asset: asset, value: value}, callback: (data) => {
      // EasyShowLD.loadingClose();
    } });
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

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }
    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title="资产搜索" />
                <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
                    <View style={[styles.inptout,{shadowColor:UColor.arrow,backgroundColor:UColor.btnColor}]} >
                        <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
                        <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} autoCorrect={true}
                            placeholder="输入token名称或合约账户" underlineColorAndroid="transparent" keyboardType="default"
                            onChangeText={(labelname) => this.setState({ labelname })} 
                            />
                        <TouchableOpacity onPress={this.Scan.bind(this)}>  
                            <Image source={UImage.account_scan} style={styles.headleftimg} />
                        </TouchableOpacity>       
                    </View>    
                    <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
                        <Text style={[styles.canceltext,{color: UColor.fontColor}]}>查询</Text>
                    </TouchableOpacity>  
                    <TouchableOpacity   onPress={this._empty.bind(this,this.state.labelname)}>  
                        <Text style={[styles.canceltext,{color: UColor.fontColor}]}>清空</Text>
                    </TouchableOpacity>  
                </View> 
                {this.state.reveal&&<View style={styles.btnout}>
                  <View style={styles.manualout}>
                      <Text style={[styles.prompttext,{color: UColor.arrow}]}>提示：如果您没有搜索到您要找的Token，可以使用手动添加。</Text>
                      <Button onPress={() => this.logout()}>
                          <View style={[styles.btnloginUser,{backgroundColor: UColor.tintColor}]}>
                              <Text style={[styles.btntext,{color: UColor.btnColor}]}>手动添加</Text>
                          </View>
                      </Button>
                  </View>
                  <View style={styles.logout}>
                      <Image source={UImage.bottom_log} style={styles.logimg}/>
                      <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
                  </View>
                </View>}
                <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
                  dataSource={this.state.dataSource.cloneWithRows(this.state.newAssetsList == null ? [] : this.state.newAssetsList)} 
                  renderRow={(rowData, sectionID, rowID) => (      
                  <View style={[styles.listItem,{backgroundColor: UColor.mainColor}]}>
                      <View style={[styles.listInfo,{borderTopColor: UColor.secdColor}]}>
                        <View style={{borderRadius: 25,backgroundColor: UColor.secdColor,marginRight: ScreenUtil.autowidth(10),}}>
                          <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={{width: ScreenUtil.autowidth(28), height: ScreenUtil.autowidth(28), resizeMode: "cover", overflow:"hidden", borderRadius: 10,}}/>
                        </View>
                        <View style={styles.scrollView}>
                          <Text style={[styles.listInfoTitle,{color:UColor.fontColor}]}>{rowData.name}</Text>
                          <Text style={[styles.quantity,{color: UColor.arrow}]}>合约账户 : {rowData.contractAccount == null ? "" : rowData.contractAccount}</Text>
                        </View>
                        <View style={styles.listInfoRight}>
                          <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor={UColor.secdColor}
                              value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                              this.setState({selectasset: rowData, value: value});
                              this.addAsset(rowData, value);
                          }}/>
                        </View>
                      </View>
                  </View>
                  )}                
                /> 
                <View style={{backgroundColor: UColor.riceWhite}}>
                  <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={[styles.modalStyle,{backgroundColor: UColor.mask}]}>
                      <View style={[styles.subView,{borderColor: UColor.mask,backgroundColor: UColor.btnColor}]} >
                        <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                          <Text style={[styles.butclose,{color: UColor.baseline}]}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>手动添加</Text>
                        <View style={styles.passoutsource}>
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.tokenname}  returnKeyType="next" 
                                selectionColor={UColor.tintColor}  placeholderTextColor={UColor.arrow}
                                style={[styles.inptpass,{backgroundColor: UColor.riceWhite,color: UColor.tintColor}]}   
                                placeholder="输入Token名称" underlineColorAndroid="transparent" keyboardType="default"   
                                onChangeText={(tokenname) => this.setState({ tokenname })}/>
                                
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.address}  returnKeyType="go"  
                                selectionColor={UColor.tintColor}  placeholderTextColor={UColor.arrow} maxLength = {12}
                                style={[styles.inptpass,{backgroundColor: UColor.riceWhite,color: UColor.tintColor}]} 
                                placeholder="输入合约账户" underlineColorAndroid="transparent"  keyboardType="default"  
                                onChangeText={(address) => this.setState({ address })} />
                        </View>
                        <Button onPress={() => { this.submit() }}>
                          <View style={[styles.copyout,{backgroundColor: UColor.tintColor}]}>
                            <Text style={[styles.copytext,{color: UColor.btnColor}]}>提交</Text>
                          </View>
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: ScreenUtil.autoheight(7),
    },
    leftout: {
      paddingLeft: ScreenUtil.autowidth(15),
    },
    headleftimg: {
      width: ScreenUtil.autowidth(18),
      height: ScreenUtil.autowidth(18),
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    inptout: {
      flex: 1,
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
    listItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    listInfo: {
      flex: 1,
      borderTopWidth:1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: ScreenUtil.autoheight(65),
      paddingHorizontal: ScreenUtil.autowidth(16),
    },
    scrollView: {
      flex: 1,
    },
    listInfoTitle: {
      fontSize: ScreenUtil.setSpText(16)
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    modalStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subView: {
      borderRadius: 5,
      borderWidth: 0.5,
      alignSelf: 'stretch',
      justifyContent: 'center',
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    buttonView: {
      alignItems: 'flex-end',
    },
    butclose: {
      width: ScreenUtil.autowidth(30),
      height: ScreenUtil.autowidth(30),
      fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: ScreenUtil.setSpText(18),
      marginBottom: ScreenUtil.autoheight(5),
    },
    passoutsource: {
      alignItems: 'center',
      flexDirection: 'column', 
      padding:  ScreenUtil.autowidth(10),
    },
    inptpass: {
      width: '100%',
      height: ScreenUtil.autoheight(45),
      fontSize: ScreenUtil.setSpText(16),
      marginVertical: ScreenUtil.autoheight(10),
      paddingHorizontal: ScreenUtil.autowidth(15),
    },
    copyout: {
      borderRadius: 3,  
      alignItems: 'center',
      justifyContent: 'center', 
      margin: ScreenUtil.autowidth(10), 
      height: ScreenUtil.autoheight(45), 
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16),
    },
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    }, 
    canceltext: {
      justifyContent: 'flex-end',
      fontSize: ScreenUtil.setSpText(18),
      paddingRight: ScreenUtil.autowidth(10),
    },
    prompttext: {
      padding: ScreenUtil.autowidth(30),
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    btnout: {
        width: ScreenWidth,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenHeight - 100,
    },
    manualout: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnloginUser: {
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      width: ScreenUtil.autowidth(150),
      height: ScreenUtil.autoheight(45),
    },
    btntext: {
      fontSize: ScreenUtil.setSpText(17),
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
    },
})
export default AssetSearch;