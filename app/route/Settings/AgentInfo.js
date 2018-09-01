import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, ScrollView, Image, ImageBackground } from 'react-native';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import BaseComponent from "../../components/BaseComponent";

@connect(({wallet}) => ({...wallet}))
class AgentInfo extends BaseComponent {

    static navigationOptions =  {
        title: "代理人信息",
        header:null, 
    };

    constructor(props) {
        super(props);
        this.state = {
            isAllSelected: true,  
            isNotDealSelected: false,        
        };
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
 
    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: this.props.navigation.state.params.coins.name, url: this.props.navigation.state.params.coins.url });
      }

    render() {
        const agent = this.props.navigation.state.params.coins;
        return (
            <View style={[styles.container,{backgroundColor: UColor.btnColor}]}> 
            <Header {...this.props} onPressLeft={true} title="代理人信息" />
                <ScrollView>
                    <View style={[styles.outsource,{backgroundColor: UColor.secdColor}]}>
                        <ImageBackground style={styles.AgentInfo} source={UImage.AgentInfo_bg} resizeMode="stretch">                  
                            <View style={[styles.bjoutsource,{backgroundColor: UColor.mainColor}]}>
                                <Image style={styles.imgtext} source={{uri: agent.icon}}/>
                            </View>
                            <Text style={[styles.nametext,{color: UColor.fontColor,backgroundColor: UColor.tintColor}]}>{agent.name}</Text>           
                        </ImageBackground> 
                        <View style={[styles.dasoutsource,{backgroundColor: UColor.mainColor}]}>
                            {/* <Image style={styles.dasimg} source={UImage.AgentInfo_bg}/> */}
                            <View style={styles.minbag}>
                                <View style={[styles.frame,{backgroundColor: UColor.secdColor}]}>
                                    <Text style={[styles.number,{color: UColor.fontColor}]}>{agent.region}</Text>
                                    <Text style={[styles.state,{color: UColor.lightgray}]}>地区</Text>
                                </View>
                                <View style={[styles.frame,{backgroundColor: UColor.secdColor}]}>
                                    <Text style={[styles.numbers,{color: UColor.fontColor}]}>{parseInt(agent.total_votes)}</Text>
                                    <Text style={[styles.state,{color: UColor.lightgray}]}>得票总数</Text>
                                </View>
                            </View>   
                            <View style={styles.minbag}>
                                <View style={[styles.frame,{backgroundColor: UColor.secdColor}]}>
                                    <Text style={[styles.number,{color: UColor.fontColor}]}>{agent.ranking}</Text>
                                    <Text style={[styles.state,{color: UColor.lightgray}]}>排名</Text>
                                </View>
                                <View style={[styles.frame,{backgroundColor: UColor.secdColor}]}>
                                    <Text style={[styles.number,{color: UColor.fontColor}]}> </Text>
                                    <Text style={[styles.state,{color: UColor.lightgray}]}>出块状态</Text>
                                </View>
                            </View> 
                            <View style={styles.Official}>
                                <Text style={[styles.Officialtitle,{color: UColor.arrow}]}>官网：</Text>
                                <Text onPress={() => this.prot()} style={[styles.Officialtext,{color: UColor.tintColor}]}>{agent.url}</Text>
                            </View>
                        </View>
                    </View> 
                    <View style={[styles.synopsis,{backgroundColor: UColor.btnColor}]}>  
                        <View style={styles.spsoutsource}>
                            <Text style={[styles.spstext,{color: UColor.blackColor}]}>{agent.introduce}</Text>
                        </View>
                    </View>
                </ScrollView>        
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
    },

    outsource: { 
        paddingHorizontal: ScreenUtil.autowidth(5),
        paddingBottom: ScreenUtil.autoheight(10), 
    },

    AgentInfo: {
        justifyContent: "center", 
        alignItems: 'center', 
        height: ScreenUtil.autoheight(118), 
        flexDirection:'column', 
        marginVertical: ScreenUtil.autoheight(5),
    },

    bjoutsource: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50), 
        justifyContent: "center", 
        alignItems: 'center', 
        borderRadius: 25, 
        margin: ScreenUtil.autowidth(5),
    },

    imgtext: {
        width: ScreenUtil.autowidth(40), 
        height: ScreenUtil.autowidth(40),
    },

    nametext: {
        width: ScreenUtil.autowidth(117), 
        height: ScreenUtil.autoheight(24), 
        lineHeight: ScreenUtil.autoheight(24), 
        textAlign: 'center', 
        borderRadius: 5,
    },

    dasoutsource: {
        padding: ScreenUtil.autowidth(5),  
        borderRadius: 5,
    },

    dasimg: {
        width: ScreenUtil.autowidth(35), 
        height: ScreenUtil.autoheight(26), 
        position: 'absolute', 
        top: 0, 
        left: ScreenUtil.autowidth(15), 
        zIndex: 999
    },

    minbag: {
        flexDirection: "row",
    },

    frame: {
        flex: 1,
        height: ScreenUtil.autoheight(60),
        margin: ScreenUtil.autowidth(2), 
        paddingVertical: ScreenUtil.autowidth(10),
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
    },
    numbers: {
        fontSize: ScreenUtil.setSpText(12), 
    },

    number: {
        fontSize: ScreenUtil.setSpText(18), 
    },

    state: {  
        fontSize: ScreenUtil.setSpText(12), 
    },

    tablayout: {   
        flexDirection: 'row',  
    },  

    buttontab: {  
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(100),
        height: ScreenUtil.autoheight(33),
        borderRadius: 15,
        alignItems: 'center',   
        justifyContent: 'center', 
    },

    Official: {
        height: ScreenUtil.autoheight(35), 
        flexDirection: "row", 
        justifyContent: 'flex-start', 
        alignItems: 'center'
    },

    Officialtitle: {
        fontSize: ScreenUtil.setSpText(12), 
        marginTop: ScreenUtil.autoheight(5),
    },

    Officialtext: {
        fontSize: ScreenUtil.setSpText(13), 
        marginTop: ScreenUtil.autoheight(5),
    },

    synopsis: {
        flex: 1,  
        paddingTop: ScreenUtil.autoheight(5), 
        paddingHorizontal: ScreenUtil.autowidth(35),
    },

    spsoutsource: {
        paddingVertical: ScreenUtil.autoheight(25),
    },

    spstext: {  
       fontSize: ScreenUtil.setSpText(14),
       lineHeight: ScreenUtil.autoheight(25),
    },  

    
});

export default AgentInfo;
