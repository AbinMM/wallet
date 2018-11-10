import React, { Component } from 'react'
import {StyleSheet,View,Text,TouchableHighlight,Image} from 'react-native'
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
          <Image style={styles.check} source={this.state.check?require("../img/modals/check.png"):require("../img/modals/uncheck.png")}/>
          <Text style={{marginLeft:ScreenUtil.autowidth(5),color:"#808080",fontSize:ScreenUtil.setSpText(10)}}>{this.props.text}</Text>
        </View>
      </TouchableHighlight>
      )
  }
}

const styles = StyleSheet.create({

  check:{
    width:ScreenUtil.autowidth(13),
    height:ScreenUtil.autowidth(13),
  }
});
