import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text, View, Image, StyleSheet, Dimensions, Platform, TouchableHighlight, TouchableOpacity, AlertIOS, SwitchIOS, Switch, TouchableNativeFeedback} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
import Button from './Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const Font = {
  Ionicons,
  FontAwesome
}

class ItemButton extends Component {
    constructor(props){
      super(props)
    }
    render(){
      return (
        <TouchableOpacity style={{marginTop: this.props.first?10:0}} onPress={this.props.onPress}>
          <View style={[styles.button,{height: itemHeight?itemHeight: ScreenUtil.autoheight(55)}]}>
            <Text style={{color: this.props.color || UColor.riseColor}}>{this.props.name}</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

export default class Item extends Component {

  state = {
    value: false,
    thcolor:UColor.secdColor
  }

  constructor(props){
    super(props)
  }
  static propTypes = {
    itemHeight: PropTypes.number,
    icon: PropTypes.string,
    name: PropTypes.string.isRequired,
    subName: PropTypes.string,
    color: PropTypes.string,
    topfirst: PropTypes.number,
    first: PropTypes.number,
    avatar: PropTypes.number,
    disable: PropTypes.bool,
    iconSize: PropTypes.number,
    font: PropTypes.string,
    onPress: PropTypes.func,
    swt:PropTypes.string,
  }

  _render(){
    let {itemHeight, swt,icon, iconSize, name, subName, color, topfirst, first, avatar, disable, font} = this.props
    font = font||"Ionicons"
 
    return (
      <View style={[styles.listItem,{height: itemHeight?itemHeight: ScreenUtil.autoheight(55),backgroundColor: UColor.mainColor,marginTop: topfirst?topfirst:0}]}>
        {icon?(<Icon name={icon} size={iconSize||ScreenUtil.setSpText(20)} style={{width: ScreenUtil.autowidth(22), marginRight:ScreenUtil.autowidth(5), textAlign:"center"}} color={color || UColor.blueDeep} />):null}
        <View style={[styles.listInfo, first && {borderBottomColor: '#F9FAF9',borderBottomWidth: first},{height: itemHeight?itemHeight: ScreenUtil.autoheight(55),}]}>
          {avatar?(<Image source={avatar} style={{width: ScreenUtil.autowidth(19), height: ScreenUtil.autowidth(17), resizeMode: "contain", overflow:"hidden",marginRight:ScreenUtil.autowidth(13),}}/>):null}
          <View style={{flex: 1}}><Text style={{color: '#555555', fontSize:ScreenUtil.autowidth(16)}}>{name}</Text></View>
          <View style={styles.listInfoRight}>
            {subName?(<Text style={{color: '#808080', fontSize:ScreenUtil.autowidth(16),}}>{subName}</Text>):null}            
            {disable?null:(<Font.Ionicons name="ios-arrow-forward-outline" size={ScreenUtil.autowidth(20)} color='#B5B5B5' style={{paddingLeft: ScreenUtil.autowidth(20),}} />)}
            {!swt?null:( 
            <Switch 
              tintColor={UColor.secdColor}
              onTintColor={UColor.tintColor}
              thumbTintColor={UColor.fontrice}
              value={this.state.value} onValueChange={(value)=>{
              this.setState({value:value})}}
            />)
            }
          </View>
        </View>
      </View>
    )
  }
  render(){
    let { onPress, first, disable } = this.props
    onPress = onPress || (() => {})
    return disable?
      this._render():
      <TouchableOpacity onPress={onPress}>{this._render()}</TouchableOpacity>
  }
}
Item.Button = ItemButton
const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button:{
    backgroundColor: UColor.mainColor,
    justifyContent: "center",
    alignItems: "center"
  },
  listInfo: {
    flex: 1,
    paddingHorizontal: ScreenUtil.autowidth(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center",
  }
})
