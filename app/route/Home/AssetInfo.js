import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, Dimensions,TouchableHighlight, TouchableOpacity,ListView, StyleSheet, Image, View, RefreshControl, Text, ImageBackground} from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import HeaderWhite from '../../components/HeaderWhite'

import Ionicons from 'react-native-vector-icons/Ionicons'

const BTN_SELECTED_STATE_ARRAY = ['isTransfer','isDelegatebw', 'isMemory']; 
const logOption = ['转账','抵押','内存'];
@connect(({ wallet, assets}) => ({ ...wallet, ...assets }))
class AssetInfo extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.asset.asset.name,
            header:null,
        };
    };
    
     // 构造函数  
     constructor(props) {
        super(props);
        this.state = {
            balance: "0.0000",
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            type: '',
            asset: this.props.navigation.state.params.asset,
            logRefreshing: false,
            logId: "-1",
            isTransfer: true,
            isDelegatebw: false, 
            isMemory: false,
            tradeLog:[],
            logType: "transfer",
            isFilter: this.props.isFilter || false,
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            try {
                this.getBalance();
                DeviceEventEmitter.emit('wallet_info');
            } catch (error) {
            }
        });
    }

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('Detailsofmoney', {tradename:this.props.navigation.state.params.asset.asset.name,contract_account:this.props.navigation.state.params.asset.asset.contractAccount});
    }

    componentDidMount() {
        try {
            this.setState({logRefreshing: true});
            //加载地址数据
            // EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'wallet/getDefaultWallet' , payload: {}, callback: () => {
                this.getBalance();
            }});

            this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: "-1", countPerPage: 10, type: this.state.logType}, callback: (resp) => {
                this.setState({logRefreshing: false});
                this.processResult();
            }});  
        } catch (error) {
            this.setState({logRefreshing: false});
        }
    }

    componentWillMount() {
        super.componentWillMount();
        this.props.dispatch({type: 'assets/clearTradeDetails',payload:{}});
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    processResult(){
        if(this.props.tradeLog && (this.props.tradeLog.length > 0)){
            this.setState({logId: this.props.tradeLog[this.props.tradeLog.length - 1]._id});
        }else{
            this.setState({logId: "-1"});
        }
    }

    turnInAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnInAsset', { coins, Choicesymbol: false, getbalance: true });
    }

    turnOutAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOutAsset', { coins, Choicesymbol: false, getbalance: true });
    }

    getBalance() {
        try {
            if(!this.props.defaultWallet || !this.props.defaultWallet.name){
                return;
            }
            this.props.dispatch({
                type: 'wallet/getBalance', payload: { contract: this.props.navigation.state.params.asset.asset.contractAccount, account: this.props.defaultWallet.name, symbol: this.props.navigation.state.params.asset.asset.name }, callback: (data) => {
                  if (data && data.code == '0') {
                    if (data.data == "") {
                      this.setState({
                        balance: '0.0000 ' + this.props.navigation.state.params.asset.asset.name,
                      })
                    } else {
                        this.setState({ balance: data.data });
                    }
                  } else {
                    // EasyToast.show('获取余额失败：' + data.msg);
                  }
                  EasyShowLD.loadingClose();
                }
            });
        } catch (error) {

        }

    }

    _openDetails(trade) {  
        const { navigate } = this.props.navigation;
        navigate('TradeDetails', {trade});
    }

    transferTimeZone(blockTime){
        var timezone;
        try {
            timezone = moment(blockTime).add(8,'hours').format('YYYY-MM-DD HH:mm');
        } catch (error) {
            timezone = blockTime;
        }
        return timezone;
    }

    onEndReached(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
        if(this.state.logRefreshing || this.state.logId == "-1"){
            return;
        }
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: this.state.logId, countPerPage: 10, type: this.state.logType}, callback: (resp) => {
            this.processResult();
            this.setState({logRefreshing: false});
        }}); 
    }

    doRefresh(logType){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
            return;
          }
          this.getBalance();
          if(this.state.logRefreshing){
              return;
          }
          this.setState({logRefreshing: true});
          this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: "-1", countPerPage: 10, type: logType}, callback: (resp) => {
              this.processResult();
              this.setState({logRefreshing: false});
          }}); 
    }

    onRefresh(){
        this.doRefresh(this.state.logType);
    }

   // 返回转账，抵押记录，内存交易，ET交易  
   ownOthersButton(style, selectedSate, stateType, buttonTitle) {  
        return(  
            <TouchableOpacity style={[style, ]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>
                <Text style={[styles.tabText, {color: selectedSate ? '#3B80F4' : '#323232'}]}>{buttonTitle}</Text>
                <View style={[{width: 5, height: 5, borderRadius: 5,backgroundColor:selectedSate ? '#3B80F4' : 'rgba(0, 0, 0, 0.0)'}]}/>
            </TouchableOpacity>
        );  
    }  

    changeLogType(type){
    this.doRefresh(type);
    }

    checkClick() {
        this.setState({
          isFilter: !this.state.isFilter
        });
      }

    // 更新"转账，抵押记录，内存交易，ET交易"按钮的状态  
     _updateBtnState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
        let newState = {...this.state};  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        }  
        let action = "transfer";
        if(currentPressed == BTN_SELECTED_STATE_ARRAY[0]){ // 转账
            this.setState({logType:"transfer"})
            action="transfer";
        }else if(currentPressed == BTN_SELECTED_STATE_ARRAY[1]){
            this.setState({logType:"delegatebw"})
            action="delegatebw";
        }else if(currentPressed == BTN_SELECTED_STATE_ARRAY[2]){
            this.setState({logType:"ram"})
            action="ram";
        }
        this.changeLogType(action);
    }  

    _renderHeader() {
        const c = this.props.navigation.state.params.asset;
        return(<View>
             <ImageBackground style={{width: ScreenWidth, height: ScreenWidth*0.7893,position:'absolute',top: 0,}} source={UImage.home_bg} />
            <HeaderWhite {...this.props} onPressLeft={true} title={c.asset.name} backgroundColors={UColor.transport} avatar={UImage.pool_explain} onPressRight={this._rightTopClick.bind(this)} imgWidth={ScreenUtil.autowidth(21)} imgHeight={ScreenUtil.autowidth(21)}/>  
            <View style={[{alignItems: "center",justifyContent: "center",}]}>
                <Text style={[styles.headbalance,{color: UColor.mainColor,}]}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} <Text style={{fontSize: ScreenUtil.setSpText(20),color: UColor.mainColor, }}>{c.asset.name}</Text></Text>
                <Text style={[styles.headmarket,{color: UColor.mainColor,}]}>(≈￥{(this.state.balance == null || c.asset.value == null) ? "0.00" : (this.state.balance.replace(c.asset.name, "") * c.asset.value).toFixed(2)})</Text>
            </View>
            <View style={styles.Subcolumn}>
                <Text style={[styles.recordText,{color: UColor.mainColor}]}>交易记录</Text>
                <View style={styles.filterView}>
                    <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()} >
                        <View style={{flexDirection: 'row'}}>
                            <Ionicons color={'#FFF'}  name={this.state.isFilter ? "ios-checkmark-circle-outline" : "ios-radio-button-off"} size={ScreenUtil.autowidth(18)} />
                            <Text style={[styles.filterText,{color: UColor.mainColor}]} > 过滤垃圾交易 </Text> 
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
            <View style={[styles.OwnOthers,{backgroundColor: '#FFFFFF'}]}>  
                {this.ownOthersButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', logOption[0])}  
                {this.state.asset.asset.name == "EOS" && this.ownOthersButton(styles.tabbutton, this.state.isMemory, 'isMemory', logOption[2])}  
                {this.state.asset.asset.name == "EOS" && this.ownOthersButton(styles.tabbutton, this.state.isDelegatebw, 'isDelegatebw', logOption[1])}  
            </View>
        </View>)
    }

    render() {
        const c = this.props.navigation.state.params.asset;
        return (
            <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
                <View style={styles.btn}>
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
                    renderHeader={() => this._renderHeader()}
                    onEndReached={() => this.onEndReached()}
                    refreshControl={
                    <RefreshControl
                        refreshing={this.state.logRefreshing}
                        onRefresh={() => this.onRefresh()}
                        tintColor={UColor.fontColor}
                        colors={[UColor.tintColor]}
                        progressBackgroundColor={UColor.btnColor}
                    />
                    }
                    dataSource={this.state.dataSource.cloneWithRows(this.props.tradeLog == null ? [] : this.props.tradeLog)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View style={{paddingHorizontal: ScreenUtil.autowidth(15),}}>
                        <Button onPress={this._openDetails.bind(this, rowData)}> 
                            <View style={[styles.row,{backgroundColor: UColor.mainColor,borderBottomWidth: ScreenUtil.autowidth(1),borderBottomColor: '#F9FAF9'}]}>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={[styles.quantity,{color: UColor.fontColor}]}>{rowData.type=='转出'? rowData.to : rowData.from}</Text>
                                        <Text style={[styles.timetext,{color: UColor.arrow}]}>{this.transferTimeZone(rowData.blockTime)}</Text>
                                    </View>
                                    <View style={styles.typedescription}>
                                        <Text style={[styles.typeto,{color:rowData.type=='转出'?UColor.tradedetail_prompt:'#FFB02E'}]} numberOfLines={1}>{(rowData.type=='转出'?'-':'+') +  Math.floor(rowData.quantity.replace(c.asset.name, "")*10000)/10000 + c.asset.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </Button>  
                    </View>)}                
                 /> 
                </View>
                <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                    <Button onPress={this.turnOutAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]}>
                            <Image source={UImage.shift_to} style={styles.shiftimg} />
                            <Text style={[styles.shifttoturnout,{color: UColor.tintColor}]}>转账</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnInAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginLeft: 0.5}]}>
                            <Image source={UImage.turn_out} style={styles.turnimg} />
                            <Text style={[styles.shifttoturnout,{color: UColor.tintColor}]}>收款</Text>
                        </View>
                    </Button>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    bgtopout: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autowidth(24),
        width: ScreenWidth-ScreenUtil.autowidth(60),
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: ScreenUtil.autowidth(20),
    },
    headbalance: {
        fontSize: ScreenUtil.setSpText(32), 
        marginTop: ScreenUtil.setSpText(30), 
    },
    headmarket: {
        marginTop: ScreenUtil.autowidth(5),
        fontSize: ScreenUtil.setSpText(12),
    },
    tab: {
        backgroundColor: '#FFFFFF',
    },
    btn: {
        flex: 1,
        paddingBottom: ScreenUtil.autoheight(50),
       
    },


    tabbutton: {  
        flex: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
        height: ScreenUtil.autoheight(50),
    },  
   
    tabText: {  
        fontSize: ScreenUtil.setSpText(16),
        lineHeight:  ScreenUtil.autoheight(23),
    }, 
    tablayout: {   
        alignItems: 'center',
        flexDirection: 'row',  
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },  
  
    OwnOthers: {
        flexDirection: 'row',
        marginHorizontal: ScreenUtil.autowidth(15),
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
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
    row: {
        flexDirection: "row",
        paddingVertical: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    timequantity: {
        flex: 1,
        flexDirection: "column",
        alignItems: 'flex-start',
        justifyContent: "space-between",
        height: ScreenUtil.autoheight(40),
    },
    timetext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(10),
    },
    quantity: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(16),
    },
    description: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(16),
        marginTop: ScreenUtil.autoheight(3),
    },


    typedescription: {
        flex: 1,
        alignItems: 'flex-end',
        flexDirection: "column",
        justifyContent: "space-around",
        height: ScreenUtil.autoheight(50),
    },
    typeto: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(16),
    },
    Ionicout: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: ScreenUtil.autowidth(20),
    },
    footer: {
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        flexDirection: 'row',
        height: ScreenUtil.autoheight(50),
        paddingTop: ScreenUtil.autoheight(1),
    },
    shiftshiftturnout: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    shiftimg: {
        width: ScreenUtil.autowidth(19), 
        height: ScreenUtil.autowidth(19),
    },
    turnimg: {
        width: ScreenUtil.autowidth(16), 
        height: ScreenUtil.autowidth(19),
    },
    shifttoturnout: {
        fontSize: ScreenUtil.setSpText(18),
        marginLeft: ScreenUtil.autowidth(20),
    },
    copytext: {
        fontSize: ScreenUtil.setSpText(16), 
    },

    Subcolumn:{
        alignItems: 'center',
        flexDirection: "row",
        height:  ScreenUtil.autoheight(38),
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    
    recordText: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(12),
    },
    filterView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    filterText: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(12),
        paddingLeft: ScreenUtil.autowidth(5),
    },

})
export default AssetInfo;