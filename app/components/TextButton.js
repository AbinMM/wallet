import React, { Component } from 'react'
import {View,Text,Image, TouchableOpacity} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil';
import LinearGradient from 'react-native-linear-gradient'

export default class TextButton extends Component {

  constructor(props){
    super(props)
  }

  render(){
    return (
      <TouchableOpacity
        style={{borderRadius: 25, }}
        underlayColor="rgba(0,0,0,0.3)"
        onPress={this.props.onPress} >
        <LinearGradient colors={this.props.shadow?['#3A42F1','#69B6FF']:["rgba(0,0,0,0)","rgba(0,0,0,0)"]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{flexDirection:"row",borderRadius:this.props.borderRadius?this.props.borderRadius:0,justifyContent:"center",alignItems:"center",backgroundColor:this.props.bgColor?this.props.bgColor:"#fff",width:"100%",height:"100%",...this.props.style}}>
        {this.props.avatar?<Image source={this.props.avatar} style={{width:ScreenUtil.autowidth(19), height: ScreenUtil.autowidth(15),marginRight:ScreenUtil.autowidth(10),}} resizeMode={'contain'} />:null}
          <Text style={{color:this.props.textColor?this.props.textColor:"#CCCCCC",fontSize:this.props.fontSize?this.props.fontSize:ScreenUtil.setSpText(14)}}>{this.props.text}</Text>
        </LinearGradient>
      </TouchableOpacity>
      )
  }
}
