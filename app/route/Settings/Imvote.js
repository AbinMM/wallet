import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,ListView,StyleSheet,View,Text,Image,Platform,TextInput,TouchableOpacity} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import { Eos } from "react-native-eosjs";
import Header from '../../components/Header'
import Button from  '../../components/Button'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Imvote extends BaseComponent {
 
    static navigationOptions =  {
        title: "我的投票",
        header:null, 
    };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
            votelist: [],
        };
    }

    componentDidMount() {
        EasyShowLD.loadingShow();
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {     
                this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (data) => {
                    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account} });
                    EasyShowLD.loadingClose();
                }});
            }
        }) 
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount(); 
    }

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
                        }else{
                            if(r.data.code){
                                var errcode = r.data.code;
                                if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                                    || errcode == 3081001)
                                {
                                    this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                    if(resp.code == 608)
                                    { 
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


    selectItem = (item) => { // 单选
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }

    _openAgentInfo(coins) {
        const { navigate } = this.props.navigation;
        navigate('AgentInfo', {coins});
    }

    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="我的投票" />
                <View style={[styles.headout,{backgroundColor: UColor.mainColor}]}>         
                    <Text style={[styles.nodename,{color: UColor.fontColor}]}>节点名称</Text>           
                    <Text style={[styles.rankingticket,{color: UColor.fontColor}]}>排名/票数</Text>           
                    <Text style={[styles.choice,{color: UColor.fontColor}]}>选择</Text>          
                </View>
                <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.producers == null ? [] : this.props.producers)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <Button onPress={this._openAgentInfo.bind(this,rowData)}> 
                            <View style={styles.outsource} backgroundColor={(parseInt(rowID)%2 == 0) ? UColor.secdColor : UColor.mainColor}>
                                <View style={[styles.logview,{backgroundColor: UColor.titletop}]}>
                                   <Image source={rowData.icon==null ? UImage.eos : {uri: rowData.icon}} style={styles.logimg}/>
                                </View>
                                <View style={styles.nameregion}>
                                    <Text style={[styles.nameranking,{color: UColor.fontColor}]} numberOfLines={1}>{rowData.name}</Text>
                                    <Text style={[styles.regiontotalvotes,{color: UColor.lightgray,}]} numberOfLines={1}>地区：{rowData.region==null ? "未知" : rowData.region}</Text>
                                </View>
                                <View style={styles.rankvote}>
                                    <Text style={[styles.nameranking,{color: UColor.fontColor}]}>{rowData.ranking}</Text>
                                    <Text style={[styles.regiontotalvotes,{color: UColor.lightgray,}]}>{parseInt(rowData.total_votes)}</Text>
                                </View>
                                <TouchableOpacity style={styles.taboue} onPress={ () => this.selectItem(rowData)}>
                                    <View style={[styles.tabview,{borderColor: UColor.lightgray}]} >
                                        <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                    </View>  
                                </TouchableOpacity>  
                            </View> 
                        </Button>  
                    </View>         
                    )}                   
                />               
                <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                    <Button  style={styles.btn}>
                        <View style={[styles.btnnode,{backgroundColor: UColor.mainColor}]}>
                            <Text style={[styles.nodenumber,{color: UColor.fontColor}]}>{this.props.producers == null ? 30 : 30 - this.props.producers.length}</Text>
                            <Text  style={[styles.nodetext,{color: UColor.lightgray,}]}>剩余可投票数</Text>
                        </View>
                    </Button>
                    <Button onPress={this.unapprove.bind(this)} style={styles.btn}>
                        <View style={[styles.btnvote,{backgroundColor: UColor.mainColor}]}>
                            <Image source={UImage.vote_h} style={styles.voteimg} />
                            <Text style={[styles.votetext,{color: UColor.fontColor}]}>撤票</Text>
                        </View>
                    </Button>
                </View>  
            </View>
        );
    }
};


const styles = StyleSheet.create({
    passoutsource: {
        alignItems: 'center',
        flexDirection: 'column', 
    },
    passoutsource2: {
        flexDirection: 'column', 
        alignItems: 'flex-start'
    },
    Explaintext2: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30), 
    },
    inptpass: {
        borderBottomWidth: 1,
        textAlign: "center",
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
        flexDirection: 'column',
        justifyContent: 'center',
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
});

export default Imvote;
