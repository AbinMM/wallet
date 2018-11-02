import React, { Component } from 'react'
import {View,Text,TouchableHighlight} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil';
export default class TextButton extends Component {

  constructor(props){
    super(props)
  }

  render(){
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.3)"
        onPress={this.props.onPress} >
        <View style={{flexDirection:"row",borderRadius:this.props.borderRadius?this.props.borderRadius:0,justifyContent:"center",alignItems:"center",backgroundColor:this.props.bgColor?this.props.bgColor:"#fff",width:"100%",height:"100%",...this.props.style}}>
          <Text style={{color:this.props.textColor?this.props.textColor:"#CCCCCC",fontSize:this.props.fontSize?this.props.fontSize:ScreenUtil.setSpText(14)}}>{this.props.text}</Text>
        </View>
      </TouchableHighlight>
      )
  }
}
