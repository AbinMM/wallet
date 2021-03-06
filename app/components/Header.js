import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, View, Text, Image, TouchableOpacity, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import Constants from '../utils/Constants';
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
import BaseComponent from "../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

class Header extends BaseComponent {
   
    constructor(props) {
        super(props);
    }

    static propTypes = {
        onPressLeft: PropTypes.bool,
        onPressRightFun: PropTypes.func,
        title: PropTypes.string.isRequired,
        onPressRight: PropTypes.func,
        avatar: PropTypes.number,
        subName: PropTypes.string,
        backgroundColors: PropTypes.string,
        imgWidth: PropTypes.number,
        imgHeight: PropTypes.number,
        onDappBackFalg:PropTypes.bool,//DAPP返回
        onLeftCloseFun: PropTypes.func,
    }

    render(){
        let {backgroundColors, onPressLeft, onPressRightFun, title, onPressRight, avatar, subName, imgWidth, imgHeight, onDappBackFalg,onLeftCloseFun, } = this.props
        return (
        //<LinearGradient colors={backgroundColors?backgroundColors:UColor.Navigation} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={[styles.header,{height: ScreenUtil.autoheight(45) + Constants.FitPhone,}]} paddingTop={Constants.FitPhone}>
        <View style={[styles.header,{height: ScreenUtil.autoheight(45) + Constants.FitPhone,paddingTop: Constants.FitPhone,backgroundColor: backgroundColors?backgroundColors:'#FFFFFF'}]}> 
            <View style={styles.Leftout} >
                <TouchableOpacity style={styles.LeftBack} onPress={onPressLeft ? (onPressRightFun==undefined?() => {this.props.navigation.goBack()}:onPressRightFun) : () => {undefined}}>
                    {onPressLeft &&<Ionicons style={{color:'#080808'}} name="ios-arrow-back" size={ScreenUtil.setSpText(25)}/>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.LeftClose} onPress={onDappBackFalg ? (onLeftCloseFun==undefined?() => {this.props.navigation.goBack()}:onLeftCloseFun) : () => {undefined}}>
                    {onDappBackFalg &&<Ionicons style={{color:'#080808'}} name="md-close" size={ScreenUtil.setSpText(25)}/>}
                </TouchableOpacity>
            </View>
            <Text style={[styles.titletext,{color:'#080808'}]} ellipsizeMode='middle' numberOfLines={1}>{title}</Text>
            <TouchableOpacity style={styles.Rightout} onPress={onPressRight}>
                {avatar?<Image source={avatar} style={{width:imgWidth?imgWidth:ScreenUtil.autowidth(26), height: imgHeight?imgHeight:ScreenUtil.autowidth(26)}} resizeMode={'contain'} />:null}
                {subName?<Text style={[styles.Righttext,{color: '#080808'}]}>{subName}</Text>:null}
            </TouchableOpacity>
        </View>
        //</LinearGradient>
        )
    }
}
 
const styles = StyleSheet.create({
    header:{
        zIndex: 999,
        flexDirection:"row",
        alignItems:"center",
        marginBottom: 1,
    },
    Leftout: {
        flex: 1.5, 
        paddingLeft:ScreenUtil.autowidth(10), 
        alignItems:"flex-start",
        flexDirection:"row",
    },
    LeftBack: {
        flex: 1, 
        paddingLeft:ScreenUtil.autowidth(10), 
        alignItems:"flex-start",
    },
    LeftClose: {
        flex: 1, 
        paddingLeft:ScreenUtil.autowidth(10), 
        alignItems:"flex-start",
    },
    titletext: {
        flex: 2,  
        textAlign: "center",
        fontSize: ScreenUtil.setSpText(16.5),
    },
    Rightout: {
        flex: 1.5, 
        paddingRight: ScreenUtil.autowidth(20),  
        alignItems:"flex-end",
    },
    Rightimg: {
        width: ScreenUtil.autowidth(28),
        height: ScreenUtil.autowidth(28),
    },
    Righttext: {
        fontSize:ScreenUtil.autowidth(14),
    },
});

export default Header;