import React from 'react';
import { connect } from 'react-redux'
import { Linking, StyleSheet, Image, ScrollView, View, Text, Dimensions,} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import moment from 'moment';

@connect(({transaction}) => ({...transaction}))
class Detailsofmoney extends BaseComponent {

    static navigationOptions = {
        headerTitle: '币详情',
        header:null,   
    };

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            coinInfodata: {
                marketValueDesc:'',  //当前市值
                total:'',   //发行总量
                marke:'',            //流通量
                issueDate: 0, //发行时间
                site:'',    //官方网站
                crowdfundingPrice:'', //募资成本
                crowdfundingDate:'',  //募资时间
                whitePaperUrl:'',   //白皮书
                contractAccount:'', //合约账户   
                intr:'', //项目简介
            },
        };
    }

    //组件加载完成
    componentDidMount() {
        this.props.dispatch({ type: 'transaction/getCoinInfo', payload:{ coinname: this.props.navigation.state.params.tradename,},callback: (data) => {
            if (data != null && data.code == 0) {
                this.setState({coinInfodata: {
                        marketValueDesc: data.data.marketValueDesc ? data.data.marketValueDesc : '',  //当前市值
                        total:data.data.total ? data.data.total : '',   //发行总量
                        marke:data.data.marke ? data.data.marke : '',            //流通量
                        issueDate: data.data.issueDate ? data.data.issueDate : 0, //发行时间
                        site:data.data.site ? data.data.site : '',    //官方网站
                        crowdfundingPrice:data.data.crowdfundingPrice ? data.data.crowdfundingPrice : '', //募资成本
                        crowdfundingDate:data.data.crowdfundingDate ? data.data.crowdfundingDate : '',  //募资时间
                        whitePaperUrl:data.data.whitePaperUrl ? data.data.whitePaperUrl : '',   //白皮书
                        contractAccount:data.data.contractAccount ? data.data.contractAccount : '', //合约账户   
                        intr:data.data.intr ? data.data.intr :'', //项目简介
                    }});
            }else{
                EasyToast.show('获取币详情失败');
            }
        } });
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    prot(key, data = {}) {
        try {
            const { navigate } = this.props.navigation;
            if (key == 'site') {
                if(this.state.coinInfodata.site && this.state.coinInfodata.site != '')
                {
                   Linking.openURL(this.state.coinInfodata.site);
                }
            }else if (key == 'whitePaper') {
                if(this.state.coinInfodata.whitePaperUrl && this.state.coinInfodata.whitePaperUrl != ''){
                   Linking.openURL(this.state.coinInfodata.whitePaperUrl);
                }
            }else if (key == 'contractAccount') {
                   Linking.openURL("https://eoseco.com/accounts/" + this.state.coinInfodata.contractAccount);
            }else if (key == 'feedback') {
                navigate('Web', { title: "ET官方客服", url: "https://static.meiqia.com/dist/standalone.html?_=t&eid=126524" });
            }else if (key == 'dm') {
                navigate('Web', { title: "帮助中心", url: "http://news.eostoken.im/html/Disclaimer.html" });
            }
        } catch (error) {
            
        }
    }
    transferTimeZone(blockTime){
        if(blockTime <= 0){
            return "";
        }
        var timezone;
        try {
            timezone = moment(blockTime).add(8,'hours').format('YYYY-MM-DD');
        } catch (error) {
            timezone = blockTime;
        }
        return timezone;
    }
    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.tradename + '概况'} />   
            <ScrollView>
                <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>类        型</Text>
                        <Text style={[styles.recordtext]}>分布式底层平台</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>当前市值</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.state.coinInfodata.marketValueDesc}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>发行总量</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.state.coinInfodata.total}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>流  通  量</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.state.coinInfodata.marke}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>发行时间</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.transferTimeZone(this.state.coinInfodata.issueDate)}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>官方网站</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1} onPress={this.prot.bind(this, 'site')}>{this.state.coinInfodata.site}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>募资成本</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingPrice}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>募资时间</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingDate}</Text>
                    </View>
                    <View style={[styles.outsource]}>
                        <Text style={[styles.nametext]}>白  皮  书</Text>
                        <Text style={[styles.recordtext,{color:UColor.turnout_eos}]} numberOfLines={1} onPress={this.prot.bind(this, 'whitePaper')}>查看</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                        <Text style={[styles.nametext]}>合约账户</Text>
                        <Text style={[styles.recordtext]} numberOfLines={1} onPress={this.prot.bind(this, 'contractAccount')}>{this.state.coinInfodata.contractAccount}</Text>
                    </View>
                </View>
                <View style={[styles.synopsisout]}>
                    <Text style={[styles.nametext]}>项目简介</Text>
                    <Text style={[styles.synopsiscenter]}>{this.state.coinInfodata.intr}</Text>
                </View>
                <View style={[styles.separateout]}>
                    <Text style={[styles.separatetext]} onPress={this.prot.bind(this, "feedback")} >问题反馈</Text>
                    <Text style={[styles.separatetext]} onPress={this.prot.bind(this, "dm")} >免责声明</Text>
                </View>
            </ScrollView>
        </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        marginVertical: ScreenUtil.autowidth(12),
        paddingVertical: ScreenUtil.autowidth(15), 
        marginHorizontal: ScreenUtil.autowidth(12),
    },
    outsource:{
        flexDirection: 'row',
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(18),
    },
    nametext: {
        flex: 1, 
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(32), 
        color:'#262626',
    },
    recordtext: {
        flex: 2, 
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(32),  
        color:UColor.arrow,
    },
    starsimg: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
        marginHorizontal: ScreenUtil.autowidth(2),
        marginVertical: ScreenUtil.autoheight(6),
    },
    synopsisout: {
        flex: 1, 
        flexDirection: 'column',
        marginBottom: ScreenUtil.autoheight(6),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },

    synopsiscenter: {
        fontSize: ScreenUtil.setSpText(8), 
        lineHeight: ScreenUtil.autoheight(20),
        color:'#555555',
    },
    separateout: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginTop: ScreenUtil.autoheight(6),
        marginRight: ScreenUtil.autoheight(6),
    },
    separatetext: {
        fontSize: ScreenUtil.setSpText(10),
        paddingHorizontal: ScreenUtil.autowidth(5),
        color:UColor.turnout_eos,
    },
})
export default Detailsofmoney;