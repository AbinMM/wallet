import React, { Component } from 'react'
import {StyleSheet,View,Text,TouchableHighlight} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil';
export default class RadioButton extends Component {

  state = {
    check:false
  }

  constructor(props){
    super(props)
  }

  check = () =>{
    let c = !this.state.check;
    this.setState({check:c});
    this.props.onChange && this.props.onChange(c);
  }


  render(){
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0)"
        onPress={()=>this.check()} >
        <View style={{flexDirection:"row",padding:5,alignItems:"center"}}>
          <View style={this.state.check?styles.check:styles.uncheck}></View>
          <Text style={{marginLeft:ScreenUtil.autowidth(5),color:"##808080",fontSize:ScreenUtil.setSpText(13)}}>{this.props.text}</Text>
        </View>
      </TouchableHighlight>
      )
  }
}

const styles = StyleSheet.create({
  uncheck:{
    width:ScreenUtil.autowidth(12),
    height:ScreenUtil.autowidth(12),
    borderColor: "#808080",
    borderWidth: ScreenUtil.autowidth(0.8),
    backgroundColor:"#fff",
    borderRadius: ScreenUtil.autowidth(1),
  },
  check:{
    width:ScreenUtil.autowidth(12),
    height:ScreenUtil.autowidth(12),
    backgroundColor:"#6DA0F8",
    borderRadius: ScreenUtil.autowidth(1),
  }
});
