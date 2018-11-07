import React, { Component } from 'react'
import {View,Text} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export default class Bar extends Component {

  constructor(props){
    super(props)
  }

  render(){
    return (
        <View style={{flex:1,flexDirection:"column"}}>
            <View style={{top:0,left:0,width:this.props.width,height:this.props.height,position:"absolute",backgroundColor:'#D9D9D9',borderRadius:2}}>

            </View>
            <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}}  style={{top:0,left:0,width:(this.props.current/this.props.max>1)?1*this.props.width:this.props.current/this.props.max*this.props.width,height:this.props.height,position:"absolute",borderRadius:2}}>

            </LinearGradient>
        </View>
    )
  }
}
