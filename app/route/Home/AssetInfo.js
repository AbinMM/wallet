import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, Dimensions, TouchableOpacity, ListView, StyleSheet, Image, View, RefreshControl, Text, } from 'react-native';
import moment from 'moment';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const BTN_SELECTED_STATE_ARRAY = ['isTransfer','isDelegatebw', 'isMemory', 'isExchange']; 
const logOption = ['转账','抵押记录','内存交易','ET交易'];
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
            balance: this.props.navigation.state.params.asset.balance,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            type: '',
            asset: this.props.navigation.state.params.asset,
            // detailInfo: "请稍候...",
            logRefreshing: false,
            logId: "-1",
            isTransfer: true,
            isDelegatebw: false, 
            isMemory: false,
            isExchange: false,
            tradeLog:[],
            logType: "transfer"
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            try {
                this.getBalance();
                DeviceEventEmitter.emit('wallet_info');
            } catch (error) {
            }
        });
    }

    _rightTopClick = (tradename) =>{
        const { navigate } = this.props.navigation;
        navigate('Detailsofmoney', {tradename:tradename});
    }

    componentDidMount() {
        try {
            this.setState({logRefreshing: true});
            //加载地址数据
            // EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'wallet/getDefaultWallet' });
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
        // if(resp == null || resp.code == null){
        //     return;
        // }
        // if(resp.code != '0'){
        //     // this.setState({detailInfo: "暂未找到交易哟~"});
        // }else if((resp.code == '0') && (this.props.tradeLog.length == 0)){
        //     this.setState({logId: this.props.tradeLog[tradeLog.length - 1]._id});
        // }else if((resp.code == '0') && (this.props.tradeLog.length > 0)){
        //     this.setState({logId: this.props.tradeLog[tradeLog.length - 1]._id});
        // }
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
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: this.props.navigation.state.params.asset.asset.contractAccount, account: this.props.defaultWallet.name, symbol: this.props.navigation.state.params.asset.asset.name }, callback: (data) => {
              if (data.code == '0') {
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
        })
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

    onRefresh(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
        this.getBalance();
        if(this.state.logRefreshing){
            return;
        }
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: "-1", countPerPage: 10, type: this.state.logType}, callback: (resp) => {
            this.processResult();
            this.setState({logRefreshing: false});
        }}); 
    }

    // 返回转账，抵押记录，内存交易，ET交易  
    ownOthersButton(style, selectedSate, stateType, buttonTitle) {  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {borderBottomWidth: 2,borderBottomColor: UColor.tintColor} : {}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.arrow}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    }  

    changeLogType(type){
        this.onRefresh();
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

        if(currentPressed == BTN_SELECTED_STATE_ARRAY[0]){ // 转账
            this.state.logType = "transfer"
        }else if(currentPressed == BTN_SELECTED_STATE_ARRAY[1]){
            this.state.logType = "delegatebw";
        }else if(currentPressed == BTN_SELECTED_STATE_ARRAY[2]){
            this.state.logType = "ram";
        }else if(currentPressed == BTN_SELECTED_STATE_ARRAY[3]){
            this.state.logType = "ET";
        }
        this.changeLogType();
    }  

    render() {
        const c = this.props.navigation.state.params.asset;
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title={c.asset.name} avatar={UImage.pool_explain} onPressRight={this._rightTopClick.bind(this,this.props.navigation.state.params.asset.asset.name)}/>  
                <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>
                    <Text style={[styles.headbalance,{color: UColor.fontColor}]}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} {c.asset.name}</Text>
                    <Text style={[styles.headmarket,{color: UColor.lightgray}]}>≈ {(this.state.balance == null || c.asset.value == null) ? "0.00" : (this.state.balance.replace(c.asset.name, "") * c.asset.value).toFixed(2)} ￥</Text>
                </View>
                <View style={styles.btn}>
                    <View style={[styles.OwnOthers]}>  
                        {this.ownOthersButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', logOption[0])}  
                        {this.state.asset.asset.name == "EOS" && this.ownOthersButton(styles.tabbutton, this.state.isDelegatebw, 'isDelegatebw', logOption[1])}  
                        {this.state.asset.asset.name == "EOS" && this.ownOthersButton(styles.tabbutton, this.state.isMemory, 'isMemory', logOption[2])}  
                        {this.ownOthersButton(styles.tabbutton, this.state.isExchange, 'isExchange', logOption[3])}
                    </View>
                    {/* <Button onPress={this._openDetails.bind(this)}> 
                        <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                            <View style={{alignItems: 'center',justifyContent: 'center',marginRight: ScreenUtil.autowidth(15)}}>
                                <Image source={UImage.shift_to} style={styles.shiftturn} />
                            </View>
                            <View style={styles.top}>
                                <View style={styles.timequantity}>
                                    <Text style={[styles.timetext,{color: UColor.arrow}]}>2018-07-30 18:31</Text>
                                    <Text style={[styles.quantity,{color: UColor.fontColor}]}>eos123451234</Text>
                                </View>
                                <View style={styles.typedescription}>
                                    <Text style={[styles.typeto,{color:UColor.fallColor}]}>+0.36</Text>
                                </View>
                            </View>
                            <View style={styles.Ionicout}>
                                <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
                            </View>
                        </View>
                    </Button>  
                    <Button onPress={this._openDetails.bind(this)}> 
                        <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                            <View style={{alignItems: 'center',justifyContent: 'center',marginRight: ScreenUtil.autowidth(15)}}>
                                <Image source={UImage.turn_out} style={styles.shiftturn} />
                            </View>
                            <View style={styles.top}>
                                <View style={styles.timequantity}>
                                    <Text style={[styles.timetext,{color: UColor.arrow}]}>2018-07-30 18:31</Text>
                                    <Text style={[styles.quantity,{color: UColor.fontColor}]}>eos123451234</Text>
                                </View>
                                <View style={styles.typedescription}>
                                    <Text style={[styles.typeto,{color:UColor.warningRed}]}>-0.36</Text>
                                </View>
                            </View>
                            <View style={styles.Ionicout}>
                                <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
                            </View>
                        </View>
                    </Button>   */}
                  
                    
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
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
                    <View>
                        {/* <Button onPress={this._openDetails.bind(this,rowData)}> 
                            <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={[styles.timetext,{color: UColor.arrow}]}>时间 : <Text style={{color: UColor.lightgray}}>{this.transferTimeZone(rowData.blockTime)}</Text></Text>
                                        <Text style={[styles.quantity,{color: UColor.arrow}]}>数量 : <Text style={{color: UColor.lightgray}}>{rowData.quantity.replace(c.asset.name, "")}</Text></Text>
                                    </View>
                                    {(rowData.blockNum == null || rowData.blockNum == '') ? 
                                        <View style={styles.unconfirmedout}>
                                            <Image source={UImage.unconfirm} style={styles.shiftturn} />
                                            <Text style={[styles.unconfirmed,{color: UColor.showy}]}>未确认...</Text>
                                        </View>
                                            :
                                        <View style={styles.typedescription}>
                                            <Text style={[styles.typeto,{color: rowData.type == '转出' ? UColor.tintColor: UColor.fallColor}]}>类型 : {rowData.type}</Text>
                                            <Text style={[styles.description,{color: UColor.arrow}]}>（{rowData.description}）</Text>
                                        </View>
                                    }
                                </View>
                                <View style={styles.Ionicout}>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </Button>   */}
                        <Button onPress={this._openDetails.bind(this, rowData)}> 
                            <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                                <View style={{alignItems: 'center',justifyContent: 'center',marginRight: ScreenUtil.autowidth(15)}}>
                                    <Image source={rowData.type=='转出'?UImage.turn_out:UImage.shift_to} style={styles.shiftturn} />
                                </View>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={[styles.timetext,{color: UColor.arrow}]}>{this.transferTimeZone(rowData.blockTime)}</Text>
                                        <Text style={[styles.quantity,{color: UColor.fontColor}]}>{rowData.type=='转出'? rowData.to : rowData.from}</Text>
                                    </View>
                                    <View style={styles.typedescription}>
                                        <Text style={[styles.typeto,{color:rowData.type=='转出'?UColor.warningRed:UColor.fallColor}]}>{(rowData.type=='转出'?'-':'+')+rowData.quantity.replace(c.asset.name, "")}</Text>
                                    </View>
                                </View>
                                <View style={styles.Ionicout}>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </Button>  
                    </View>)}                
                 /> 
                </View>
                <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                    <Button onPress={this.turnInAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]}>
                            <Image source={UImage.shift_to} style={styles.shiftturn} />
                            <Text style={[styles.shifttoturnout,{color: UColor.fallColor}]}>转入</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOutAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginLeft: 0.5}]}>
                            <Image source={UImage.turn_out} style={styles.shiftturn} />
                            <Text style={[styles.shifttoturnout,{color: UColor.warningRed}]}>转出</Text>
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
    header: {
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        margin: ScreenUtil.autowidth(5),
        height: ScreenUtil.autoheight(110),
    },
    headbalance: {
        fontSize: ScreenUtil.setSpText(20), 
    },
    headmarket: {
        marginTop: ScreenUtil.autowidth(5),
        fontSize: ScreenUtil.setSpText(14),
    },
    tab: {
        flex: 1,
    },
    btn: {
        flex: 1,
        paddingBottom: ScreenUtil.autoheight(50),
    },

    tabbutton: {  
        flex: 1,
        
        alignItems: 'center',   
        justifyContent: 'center', 
        height: ScreenUtil.autoheight(33),
    },  
   
    tabText: {  
        fontSize: ScreenUtil.setSpText(14),
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
        marginHorizontal: ScreenUtil.autowidth(10),
        marginVertical: ScreenUtil.autoheight(10),
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
        borderRadius: 5,
        flexDirection: "row",
        paddingVertical: ScreenUtil.autoheight(5),
        marginHorizontal: ScreenUtil.autowidth(5),
        marginVertical: ScreenUtil.autowidth(0.5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    timequantity: {
        flex: 4,
        flexDirection: "column",
        alignItems: 'flex-start',
        justifyContent: "space-around",
        height: ScreenUtil.autoheight(50),
    },
    timetext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(14),
    },
    quantity: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(14),
    },
    description: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autoheight(3),
    },
    unconfirmedout: { 
        flex: 2,
        alignItems: 'center',
        flexDirection: "column",
        justifyContent: "space-between",
    },
    unconfirmed: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
        marginTop:  ScreenUtil.autoheight(3),
    },
    typedescription: {
        flex: 2,
        alignItems: 'flex-end',
        flexDirection: "column",
        justifyContent: "space-around",
        height: ScreenUtil.autoheight(50),
    },
    typeto: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(14),
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
    shiftturn: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30),
    },
    shifttoturnout: {
        fontSize: ScreenUtil.setSpText(18),
        marginLeft: ScreenUtil.autowidth(20),
    },
    copytext: {
        fontSize: ScreenUtil.setSpText(16), 
    },

})
export default AssetInfo;