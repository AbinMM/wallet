import React, { Component } from 'react'
import {View,StyleSheet} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil'


export default class LineView extends Component {

  constructor(props){
    super(props)
  }

  render(){
    return <View style={{flex:1,flexDirection:"row",justifyContent:"center",alignSelf:"center",maxHeight:ScreenUtil.autowidth(1) ,paddingLeft:ScreenUtil.autowidth(this.props.left)}}>
        <View style={[styles.line]}></View>
    </View>
  }
}
const styles = StyleSheet.create({
    line:{
      backgroundColor:"#CCCCCC",
      height:ScreenUtil.setSpText(0.3),
      alignSelf:"center",
      width:"100%",
      opacity:0.7
    }
});
