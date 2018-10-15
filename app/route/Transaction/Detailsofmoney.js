import React from 'react';
import { connect } from 'react-redux'
import { Linking, StyleSheet, Image, ScrollView, View, Text, Dimensions,} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

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
            coinInfodata: {},
        };
    }

    //组件加载完成
    componentDidMount() {
        this.props.dispatch({ type: 'transaction/getCoinInfo', payload:{coinname: this.props.navigation.state.params.tradename},callback: (data) => {
            if (data != null && data.code == 0) {
                this.setState({coinInfodata: data.data});
            }else{
                EasyToast.show('获取币详情失败');
            }
        } });
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    renderStars = (stars) => {
        const total = 5;
        let full, half, empty;
        full = parseInt(stars/2) -1;
        if(stars%2 === 1){
            full++;
            half = 1;
            empty = total - full - half;
        }else{
            full++;
            half = 0;
            empty = total - full;
        }
        const results = [];
        let i;
        for(i = 0; i < full; i++){
            results.push(<Image key={i} source={UImage.starfull} style={styles.starsimg} />)
        }
        if(half){
            results.push(<Image key={i} source={UImage.starhalf} style={styles.starsimg} />)
        }
        for (let j = 0; j < empty; j++){
            results.push(<Image key={i+j+1} source={UImage.starempty} style={styles.starsimg} />)
        }
        return (
            <View style={{flexDirection: 'row',}}>
                {results}
            </View>
        );
    }

    prot(key, data = {}) {
        const { navigate } = this.props.navigation;
        if (key == 'site') {
            Linking.openURL(this.state.coinInfodata.site);
        }else if (key == 'whitePaper') {
            Linking.openURL(this.state.coinInfodata.whitePaperUrl);
        }else if (key == 'blockQuery') {
            Linking.openURL(this.state.coinInfodata.blockQueryUrl);
        }else if (key == 'dm') {
            navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Disclaimer.html" });
        }
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.tradename} />   
            <ScrollView>
                <View style={[styles.row,{backgroundColor: UColor.mainColor}]}>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>类型</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]}>分布式底层平台</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>推荐指数</Text>
                        <View style={{flex: 2, justifyContent: 'flex-start'}}>
                            {this.renderStars(this.state.coinInfodata.recommendLevel)}
                        </View>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>当前市值</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]} numberOfLines={1}>{this.state.coinInfodata.marketValueDesc}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>发行总量</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]} numberOfLines={1}>{this.state.coinInfodata.totalDesc}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>项目创新</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]}>{this.state.coinInfodata.projectCreative}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>投资价值</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]}>{this.state.coinInfodata.investmentValue}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>官方网站</Text>
                        <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'site')}>{this.state.coinInfodata.site}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>募资成本</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingPrice}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>募资时间</Text>
                        <Text style={[styles.recordtext,{color:UColor.arrow}]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingDate}</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.secdColor,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>白皮书</Text>
                        <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'whitePaper')}>查看</Text>
                    </View>
                    <View style={[styles.outsource,{borderBottomColor: UColor.transport,}]}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>区块信息</Text>
                        <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'blockQuery')}>{this.state.coinInfodata.blockQueryUrl}</Text>
                    </View>
                </View>
                <View style={[styles.synopsisout]}>
                    <Text style={[styles.synopsis,{color:UColor.fontColor}]}>项目简介</Text>
                    <Text style={[styles.synopsiscenter,{color:UColor.arrow}]}>{this.state.coinInfodata.intr}</Text>
                </View>
                <View style={[styles.separateout]}>
                    <Text style={[styles.separatetext,{color:UColor.tintColor}]}>勘误</Text>
                    <Text style={[styles.separatetext,{color:UColor.tintColor}]} onPress={this.prot.bind(this, "dm")} >免责声明</Text>
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
        marginVertical: ScreenUtil.autowidth(20),
        paddingVertical: ScreenUtil.autowidth(15), 
        marginHorizontal: ScreenUtil.autowidth(15),
    },
    outsource:{
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginHorizontal: ScreenUtil.autowidth(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    nametext: {
        flex: 1, 
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(32), 
    },
    recordtext: {
        flex: 2, 
        fontSize: ScreenUtil.setSpText(14), 
        lineHeight: ScreenUtil.autoheight(32),  
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
    synopsis: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(20),
    },
    synopsiscenter: {
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(20),
    },
    separateout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: ScreenUtil.autoheight(6),
    },
    separatetext: {
        fontSize: ScreenUtil.setSpText(14),
        paddingHorizontal: ScreenUtil.autowidth(5),
    },
})
export default Detailsofmoney;