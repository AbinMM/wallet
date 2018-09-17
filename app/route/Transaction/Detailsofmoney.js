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
        if (key == 'site') {
            Linking.openURL(this.state.coinInfodata.site);
        }else if (key == 'whitePaper') {
            Linking.openURL(this.state.coinInfodata.whitePaperUrl);
        }else if (key == 'blockQuery') {
            Linking.openURL(this.state.coinInfodata.blockQueryUrl);
        }
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
            <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.tradename} />   
            <ScrollView>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.fontColor}]}>类型</Text>
                    <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(8),color:UColor.fontColor}]}>分布式底层平台</Text>
                    <View style={{flexDirection: 'row',alignItems: 'flex-start',justifyContent: 'center'}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>（推荐指数：</Text>
                        {this.renderStars(this.state.coinInfodata.recommendLevel)}
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>）</Text>
                    </View>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{color:UColor.arrow}]}>同比该行业产品</Text>
                    <View style={{flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>项目创新</Text>
                        <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(5),color:UColor.tintColor}]}>{this.state.coinInfodata.projectCreative}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Text style={[styles.nametext,{color:UColor.fontColor}]}>投资价值</Text>
                        <Text style={[styles.nametext,{paddingLeft: ScreenUtil.autowidth(5),color:UColor.tintColor}]}>{this.state.coinInfodata.investmentValue}</Text>
                    </View>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>市值</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>{this.state.coinInfodata.marketValueDesc}</Text>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>总量</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>{this.state.coinInfodata.totalDesc}</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>官方网站</Text>
                    <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'site')}>{this.state.coinInfodata.site}</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>募资成本</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingPrice}</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>募资时间</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>{this.state.coinInfodata.crowdfundingDate}</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>白皮书</Text>
                    <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'whitePaper')}>查看</Text>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>区块信息</Text>
                    <Text style={[styles.recordtext,{color:UColor.tintColor}]} numberOfLines={1} onPress={this.prot.bind(this, 'blockQuery')}>{this.state.coinInfodata.blockQueryUrl}</Text>
                </View>
                <View style={[styles.synopsisout,{backgroundColor: UColor.mainColor}]}>
                    <Text style={[styles.synopsis,{color:UColor.fontColor}]}>简介</Text>
                    <Text style={[styles.synopsiscenter,{color:UColor.arrow}]}>{this.state.coinInfodata.intr}</Text>
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
    outsource:{
        marginBottom: 1,
        flexDirection: 'row',
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    separateout: {
        flexDirection: 'row',
        marginBottom: ScreenUtil.autoheight(6),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },
    nametext: {
        textAlign: "left", 
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(32), 
    },
    recordtext: {
        flex: 4, 
        textAlign: "right", 
        fontSize: ScreenUtil.setSpText(12), 
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
        paddingVertical:ScreenUtil.autowidth(10), 
        paddingHorizontal:ScreenUtil.autowidth(15),
    },
    synopsis: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
    },
    synopsiscenter: {
        fontSize: ScreenUtil.setSpText(12), 
        lineHeight: ScreenUtil.autoheight(20),
    },
})
export default Detailsofmoney;