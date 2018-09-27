import React from 'react';
import { connect } from 'react-redux'
import { Linking, StyleSheet, Image, ScrollView, View, Text, Dimensions,ImageBackground} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import Button from '../../components/Button'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({transaction}) => ({...transaction}))
class Tradingpool extends BaseComponent {

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

    _rightTopClick() {

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

    turnInAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnInAsset', {coins, balance: this.state.balance });
    }

    turnOutAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOutAsset', { coins, balance: this.state.balance });
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <ImageBackground style={[styles.bgout,{height:ScreenWidth*0.6066}]} source={UImage.pool_bg} resizeMode="stretch">
            <Header {...this.props} onPressLeft={true} backgroundColor={UColor.transport} title={this.props.navigation.state.params.tradename+'交易池子'} avatar={UImage.pool_explain} onPressRight={this._rightTopClick.bind(this,this.props.navigation.state.params.tradename)}/>  
            <View style={{flex: 1, alignItems: 'center',justifyContent: 'space-around'}}>
                <Text style={{fontSize: ScreenUtil.autowidth(12),color: UColor.lightgray}}>昨日收益</Text>
                <Text style={{fontSize: ScreenUtil.autowidth(25),color: UColor.tintColor}}>0.22</Text>
                <Text style={{fontSize: ScreenUtil.autowidth(12),color: UColor.btnColor}}>总投入：2592.26 OCT</Text>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.lightgray,textAlign: 'center'}}>池子总额(OCT)</Text>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.lightgray,textAlign: 'center'}}>万份收益(OCT)</Text>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.lightgray,textAlign: 'center'}}>七日年化（%）</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.btnColor,textAlign: 'center'}}>123,746,521.01</Text>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.btnColor,textAlign: 'center'}}>1.2016</Text>
                    <Text style={{flex: 1,fontSize: ScreenUtil.autowidth(12),color: UColor.btnColor,textAlign: 'center'}}>0.08</Text>
                </View>
            </View>
        </ImageBackground>
            <ScrollView>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>当前交易总量</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>36,168,734,.02 OCT</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>手续费</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>0.08%</Text>
                </View>
                <View style={[styles.outsource,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>交易深度</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>150,620.0123</Text>
                </View>
                <View style={[styles.separateout,{backgroundColor: UColor.mainColor,}]}>
                    <Text style={[styles.nametext,{flex: 2,color:UColor.arrow}]}>已投人数</Text>
                    <Text style={[styles.recordtext,{color:UColor.fontColor}]} numberOfLines={1}>1,261</Text>
                </View>
                <View style={[styles.synopsisout]}>
                    <Text style={[styles.synopsis,{color:UColor.fontColor}]}>池子收益规则</Text>
                    <Text style={[styles.synopsiscenter,{color:UColor.arrow}]}>{this.state.coinInfodata.intr}</Text>
                </View>
            </ScrollView>
                <View style={[styles.footer,{backgroundColor: UColor.secdColor}]}>
                    <Button onPress={this.turnInAsset.bind(this)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]}>
                            <Image source={UImage.take_out} style={styles.shiftturn} />
                            <Text style={[styles.shifttoturnout,{color: UColor.warningRed}]}>取出</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOutAsset.bind(this)} style={{ flex: 1 }}>
                        <View style={[styles.shiftshiftturnout,{backgroundColor: UColor.mainColor,marginLeft: 0.5}]}>
                            <Image source={UImage.deposit_in} style={styles.shiftturn} />
                            <Text style={[styles.shifttoturnout,{color: UColor.fallColor}]}>存入</Text>
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


    footer: {
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        flexDirection: 'row',
        height: ScreenUtil.autoheight(45),
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
        fontSize: ScreenUtil.setSpText(15),
        marginLeft: ScreenUtil.autowidth(20),
    },
    copytext: {
        fontSize: ScreenUtil.setSpText(16), 
    },
})
export default Tradingpool;