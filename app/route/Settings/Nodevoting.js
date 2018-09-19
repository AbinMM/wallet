import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, RefreshControl, ImageBackground} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Header from '../../components/Header'
import Button from  '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from "../../components/EasyShow"
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
import { SegmentedControls } from 'react-native-radio-buttons'
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
const buttonSubscript = ['投票','已投'];

@connect(({vote, wallet}) => ({...vote, ...wallet}))
class Nodevoting extends BaseComponent {

    static navigationOptions =  {
        title: "投票",
        header:null, 
    };

    _rightTopClick = () =>{  
        DeviceEventEmitter.emit('voteShare',""); 
    }  
      
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            arr1: 0,
            producers:[],
            isvoted: false,
            labelname: '',
            switchButton: buttonSubscript[0],
            voteDatalist: [],
            logRefreshing: false,
        };
    }

    componentDidMount() {
        this.props.dispatch({ type: 'wallet/getDefaultWallet', callback: (data) => {     
            this.onRefreshing()
        } })
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    addunapp(){
        if(this.state.switchButton==buttonSubscript[0]){
            this.addvote();
        }else if(this.state.switchButton==buttonSubscript[1]){
            this.unapprove();
        }
    }
    
    //投票
    addvote = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        var selectArr= [];
        const { dispatch } = this.props;
        this.props.voteData.forEach(element => {
            if(element.isChecked){
                selectArr.push(element.account);
            }
        });
        if(selectArr && selectArr.length == 0){
            EasyToast.show('请先选择投票节点!');
            return;
        }
        selectArr.sort();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  maxLength={Constants.PWD_MAX_LENGTH}
                style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]} 
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={[styles.inptpasstext,{color: UColor.arrow}]}>提示：为确保您的投票生效成功，EOS将进行锁仓三天，期间转账或撤票都可能导致投票失败。</Text>  
        </View>
        EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
            if (!this.state.password || this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyShowLD.loadingShow();
                    //投票
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'voteproducer',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    voter: this.props.defaultWallet.account,
                                    proxy: '',
                                    producers: selectArr //["producer111j", "producer111p"]
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.data && r.data.transaction_id){
                            AnalyticsUtil.onEvent('vote');
                            EasyToast.show("投票成功");
                            this.onRefreshing();
                        }else{
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                        if(resp.code == 608){ 
                                            //弹出提示框,可申请免费抵押功能
                                            const view =
                                            <View style={styles.passoutsource2}>
                                                <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                            </View>
                                            EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                const { navigate } = this.props.navigation;
                                                navigate('FreeMortgage', {});
                                            }, () => { EasyShowLD.dialogClose() });
                                        }
                                    }});
                                }
                            }
                            var errmsg = "投票失败: "+ r.data.msg;
                            EasyToast.show(errmsg);
                        }
                    }); 
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        }, () => { EasyShowLD.dialogClose() });
    };

    //撤票
    unapprove = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(!this.props.producers || this.props.producers.length <=0){
            EasyToast.show('您还未投票');
            return;
        }
        var selectArr= [];
        for(var i = 0; i < this.props.producers.length; i++){
            selectArr.push(this.props.producers[i].account);
        }
        const { dispatch } = this.props;
        this.props.voteData.forEach(element => {
            if(element.isChecked){
                selectArr.splice(selectArr.indexOf(element.account), 1);
            }
        });
        selectArr.sort();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  maxLength={Constants.PWD_MAX_LENGTH}
                    style={[styles.inptpass,{color: UColor.tintColor,backgroundColor: UColor.btnColor,borderBottomColor: UColor.baseline}]} 
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyShowLD.loadingShow();
                    //撤票
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'voteproducer',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    voter: this.props.defaultWallet.account,
                                    proxy: '',
                                    producers:  selectArr, //["producer111f"]
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.data && r.data.transaction_id){
                            this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account} });
                            EasyToast.show("撤票成功");
                            this.onRefreshing();
                        }else{
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005 || errcode == 3081001){
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                        if(resp.code == 608){ 
                                            //弹出提示框,可申请免费抵押功能
                                            const view =
                                            <View style={styles.passoutsource2}>
                                                <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>该账号资源(NET/CPU)不足！</Text>
                                                <Text style={[styles.Explaintext2,{color: UColor.arrow}]}>EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                            </View>
                                            EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                const { navigate } = this.props.navigation;
                                                navigate('FreeMortgage', {});
                                                // EasyShowLD.dialogClose();
                                            }, () => { EasyShowLD.dialogClose() });
                                        }
                                    }});
                                }
                            }
                            var errmsg = "撤票失败: "+ r.data.msg;
                            EasyToast.show(errmsg);
                        }
                    }); 
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        }, () => { EasyShowLD.dialogClose() });
    };



    selectItem = (item,section) => { 
        if(this.state.switchButton==buttonSubscript[0]){
            this.props.dispatch({ type: 'vote/up', payload: { item:item} });
            let arr = this.props.voteData;
            var cnt = 0;
            for(var i = 0; i < arr.length; i++){ 
                if(arr[i].isChecked == true){
                    cnt++;              
                }     
            }
            if(cnt == 0 && this.props.producers){
                this.state.arr1 = this.props.producers.length;
            }else{
                this.state.arr1 = cnt;
            }
        }else if(this.state.switchButton==buttonSubscript[1]){
            this.props.dispatch({ type: 'vote/up', payload: { item:item} });
        }
       
    }

    _openAgentInfo(coins) {
        const { navigate } = this.props.navigation;
        navigate('AgentInfo', {coins});
    }

    isvoted(rowData){
        if(this.props.producers == null){
            return false;
        }
        for(var i = 0; i < this.props.producers.length; i++){
            if(this.props.producers[i].account == rowData.account){
                rowData.isChecked = true;
                return true;
            }
        }
        return false;
    }

    //查询
    _query =(labelname) => {
        this.dismissKeyboardClick();
        if (labelname == "") {
            EasyToast.show('请输入名称或账号');
            return;
        }else{
            let NumberArr = this.props.voteData;
            for (var i = 0; i < NumberArr.length; i++) {
                if (NumberArr[i].name.toUpperCase() == labelname.toUpperCase() || NumberArr[i].name.toLowerCase() == labelname.toLowerCase()) {
                    this.setState({
                        switchButton: buttonSubscript[0],
                        voteDatalist:[NumberArr[i]],
                    });
                    break;
                }
            }
            if(i == NumberArr.length){
                EasyToast.show('没有搜索到该节点');
            }
        }
    }

    //清空
    _empty = () => {
        this.dismissKeyboardClick();
        this.onRefreshing();
        this.setState({ labelname: ''});
    }

    resources = () => {
        const { navigate } = this.props.navigation;
        navigate('Resources', {account_name:this.props.navigation.state.params.account_name});
    }

    //投票，已投
    setSwitchButton(opt){
        if(opt== buttonSubscript[0]){
            this.fetchTrackLine(0,opt);
        }else if(opt== buttonSubscript[1]){
            this.fetchTrackLine(1,opt);
        }
    }

    fetchTrackLine(type,opt, onRefreshing = false){
        this.setState({switchButton:opt,logRefreshing: true,labelname: ''});
        if(type == 0){
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: () => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account}, callback: () => {
                    this.setState({
                        logRefreshing: false,
                        arr1 : this.props.producers.length,
                        voteDatalist: this.props.voteData,
                    })
                } });
            } });
        }else{
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: () => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account}, callback: () => {
                    this.setState({
                        logRefreshing: false,
                        arr1 : this.props.producers.length,
                        voteDatalist: this.props.producers,
                    })
                } });
            }});
        }
    }

    onRefreshing() {
        this.setState({logRefreshing: true});
        if(this.state.switchButton==buttonSubscript[0]){
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (datalist) => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account}, callback: () => {
                    this.setState({
                        logRefreshing: false,
                        arr1 : this.props.producers.length,
                        producers : this.props.producers,
                        voteDatalist: this.props.voteData,
                    });
                } });
            }});
        }else if(this.state.switchButton==buttonSubscript[1]){
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (data) => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: () => {
                    this.setState({
                        logRefreshing: false,
                        arr1 : this.props.producers.length,
                        voteDatalist: this.props.producers,
                    });
                } });
            }});
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="投票" subName="邀请投票" onPressRight={this._rightTopClick.bind()}/>
                <View style={[styles.header,{backgroundColor: UColor.mainColor}]}>  
                    <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor}]} >
                        <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
                        <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} selectionColor={UColor.tintColor}
                            style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.arrow} autoCorrect={true}
                            placeholder="输入名称或账号" underlineColorAndroid="transparent" keyboardType="default" 
                            returnKeyType="go" onChangeText={(labelname) => this.setState({ labelname })} />
                    </View>    
                    <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
                        <Text style={[styles.canceltext,{color: UColor.fontColor}]}>查询</Text>
                    </TouchableOpacity>  
                    <TouchableOpacity   onPress={this._empty.bind(this,this.state.labelname)}>  
                        <Text style={[styles.canceltext,{color: UColor.fontColor}]}>清空</Text>
                    </TouchableOpacity>  
                </View> 
                <View  style={styles.lockoutsource} > 
                    <View style={{flexDirection: 'row',padding: ScreenUtil.autowidth(10),}}>
                        <View style={styles.locktitleout} />
                        <Image source={UImage.votebc_bj} style={{width:ScreenWidth-ScreenUtil.autowidth(160),height:(ScreenWidth-ScreenUtil.autowidth(160))*0.1963}}/>
                        <TouchableOpacity style={styles.locktitleout} onPress={this.resources.bind(this)}>
                            <Text style={[styles.locktitle,{color:UColor.tintnavigation}]}>资源管理</Text>
                            <Ionicons color={UColor.tintnavigation} name="ios-arrow-forward-outline" size={13}/>
                        </TouchableOpacity> 
                    </View>
                    <View style={styles.locktextout}>
                       <Text style={[styles.locktext,{color: UColor.fontColor}]}>·  参与EOS超级节点投票，需要抵押EOS。投票不消耗EOS数量</Text>
                       <Text style={[styles.locktext,{color: UColor.fontColor}]}>·  抵押的EOS数量在撤销投票后72小时返还到投票账户</Text>
                       <View style={{flexDirection: 'row',width: ScreenWidth-ScreenUtil.autowidth(30),}}>
                            <Text style={[styles.locktext,{color: UColor.fontColor}]}>·  </Text>
                            <Text style={[styles.locktext,{color: UColor.fontColor}]}>每次投票最多可选择30个超级节点，撤消或更改再次投票生效有一定的延迟</Text>
                       </View>
                    </View>     
                </View>     
                <View style={styles.toptabout}>
                    <SegmentedControls tint= {UColor.tintColor} selectedTint= {UColor.btnColor} onSelection={this.setSwitchButton.bind(this) }
                        selectedOption={this.state.switchButton} backTint= {UColor.secdColor} options={buttonSubscript} />
                </View>
                <View style={[styles.headout,{backgroundColor: UColor.mainColor}]}>         
                    <Text style={[styles.nodename,{color: UColor.fontColor}]}>节点名称</Text>           
                    <Text style={[styles.rankingticket,{color: UColor.fontColor}]}>排名/票数</Text>           
                    <Text style={[styles.choice,{color: UColor.fontColor}]}>选择</Text>          
                </View>
                <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
                    refreshControl={<RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()} 
                    tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}
                    style={{backgroundColor: UColor.transport}}/>}
                    dataSource={this.state.dataSource.cloneWithRows(this.state.voteDatalist == null ? [] : this.state.voteDatalist)} 
                    renderRow={(rowData, sectionID, rowID) => (                  
                    <View>
                        <Button onPress={this._openAgentInfo.bind(this,rowData)}> 
                            <View style={styles.outsource} backgroundColor={(parseInt(rowID)%2 == 0) ? UColor.secdColor : UColor.mainColor}>
                                <View style={[styles.logview,{backgroundColor: UColor.titletop}]}>
                                    <Image source={rowData.icon==null ? UImage.eos : {uri: rowData.icon}} style={styles.logimg}/>
                                </View>
                                <View style={styles.nameregion}>
                                    <Text style={[styles.nameranking,{color: UColor.fontColor}]} numberOfLines={1}>{rowData.name}</Text>
                                    <Text style={[styles.regiontotalvotes,{color: UColor.lightgray}]} numberOfLines={1}>地区：{rowData.region==null ? "未知" : rowData.region}</Text>                                    
                                </View>
                                <View style={styles.rankvote}>
                                    <Text style={[styles.nameranking,{color: UColor.fontColor}]}>{rowData.ranking}</Text>
                                    <Text style={[styles.regiontotalvotes,{color: UColor.lightgray}]}>{parseInt(rowData.total_votes)}</Text> 
                                </View>
                                {this.state.switchButton==buttonSubscript[0] && 
                                    <TouchableOpacity style={styles.taboue} onPress={ () => this.selectItem(rowData)}>
                                        <View style={[styles.tabview,{borderColor: UColor.lightgray}]} >
                                            <Image source={this.isvoted(rowData) ? UImage.Tick_h : rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                        </View>  
                                    </TouchableOpacity> 
                                }
                                {this.state.switchButton==buttonSubscript[1] && 
                                    <TouchableOpacity style={styles.taboue} onPress={ () => this.selectItem(rowData)}>
                                        <View style={[styles.tabview,{borderColor: UColor.lightgray}]} >
                                            <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                        </View>  
                                    </TouchableOpacity>  
                                }     
                            </View> 
                        </Button>  
                    </View>             
                    )}                                   
                /> 
                <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                    <Button style={styles.btn}>
                        <View style={[styles.btnnode,{backgroundColor: UColor.mainColor}]}>
                            <Text style={[styles.nodenumber,{color: UColor.fontColor}]}>{this.props.producers == null ? 30 : 30 - this.state.arr1}</Text>
                            <Text style={[styles.nodetext,{color: UColor.lightgray,}]}>剩余可投节点</Text>
                        </View>
                    </Button>
                    <Button onPress={this.addunapp.bind(this)} style={styles.btn}>
                        <View style={[styles.btnvote,{backgroundColor: UColor.mainColor}]}>
                            <Image source={this.state.switchButton==buttonSubscript[0]?UImage.vote:UImage.vote_h} style={styles.voteimg} />
                            <Text style={[styles.votetext,{color: UColor.fontColor}]}>{this.state.switchButton==buttonSubscript[0]?'投票':'撤票'}</Text>
                        </View>
                    </Button>
                </View>         
            </View>
        );
    }
};
    
const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        textAlign: "center",
        borderBottomWidth: 1,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(16),
        width: ScreenWidth-ScreenUtil.autowidth(100),
    },
    inptpasstext: {
        fontSize: ScreenUtil.setSpText(14),
        marginTop: ScreenUtil.autowidth(10),
        lineHeight: ScreenUtil.autoheight(20),
    },
    container: {
      flex: 1,
      flexDirection:'column',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: ScreenUtil.autoheight(1),
        paddingVertical: ScreenUtil.autoheight(7),
    },
    inptout: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        height: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    headleftimg: {
        width: ScreenUtil.autowidth(18),
        height: ScreenUtil.autowidth(18),
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    inpt: {
        flex: 1,
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
    },
    canceltext: {
        justifyContent: 'flex-end',
        fontSize: ScreenUtil.setSpText(15),
        paddingRight: ScreenUtil.autowidth(10),
    },

    toptabout: {
        paddingTop:ScreenUtil.autoheight(10),
        paddingBottom: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(60),
    },

    lockoutsource: {
        alignItems: 'center', 
        flexDirection:'column', 
        justifyContent: "flex-end", 
    },
    locktitleout: {
        flex: 1,
        flexDirection:'row', 
        alignItems: 'flex-start',
        justifyContent: 'flex-end', 
    },
    locktitle: {
        fontSize:ScreenUtil.setSpText(12),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },

    locktextout: {
        width: ScreenWidth,
        flexDirection:'column',
        justifyContent: 'flex-end', 
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    locktext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(20),
    },

    headout: {
        flexDirection: 'row', 
        height: ScreenUtil.autoheight(25),
    },
    nodename:{
        textAlign:'center', 
        width: ScreenUtil.autowidth(140), 
        fontSize: ScreenUtil.setSpText(16),  
        lineHeight: ScreenUtil.autoheight(25),
    },
    rankingticket: {
        flex: 1,
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(25),
    },
    choice: {
        textAlign: 'center',
        width: ScreenUtil.autowidth(50),
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(25),
    },
    outsource: {
        flexDirection: 'row', 
        height: ScreenUtil.autoheight(60),
        paddingVertical: ScreenUtil.autoheight(10),
    },
    logview: {
        borderRadius: 25,
        alignItems: 'center', 
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30), 
        margin: ScreenUtil.autowidth(10),
    },
    logimg: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30), 
    },
    nameregion: {
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: ScreenUtil.autowidth(100),
    },
    rankvote: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nameranking: { 
        fontSize: ScreenUtil.setSpText(14),
    }, 
    regiontotalvotes: {
        fontSize: ScreenUtil.setSpText(14),
    },
    taboue: {
        alignItems: 'center',
        justifyContent: 'center', 
    },
    tabview: {
        borderWidth: 1,
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(27),
        height: ScreenUtil.autowidth(27),
    },
    tabimg: {
        width: ScreenUtil.autowidth(25), 
        height: ScreenUtil.autowidth(25),
    },
    footer: {
        flexDirection: 'row', 
        height: ScreenUtil.autoheight(50),
    },
    btn: {
        flex: 1
    },
    btnnode: {
        flex: 1,
        marginRight: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    nodenumber: {
        fontSize: ScreenUtil.setSpText(18), 
    },
    nodetext: {
        fontSize: ScreenUtil.setSpText(14), 
    },
    btnvote: {
        flex: 1,
        marginLeft: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voteimg: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30),
    },
    votetext: {
        fontSize: ScreenUtil.setSpText(18),
        marginLeft: ScreenUtil.autowidth(20),
    },
    passoutsource2: {
        flexDirection: 'column', 
        alignItems: 'flex-start',
    },
    Explaintext2: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30), 
    },
});

export default Nodevoting;
