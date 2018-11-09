import React, { Component } from 'react'
import {View,Text, TouchableOpacity} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ScreenUtil from '../utils/ScreenUtil'

export default class CheckPointCircle extends Component {

  constructor(props){
    super(props)
  }

  render(){
    let {selected, onPress, outSize, inSize} = this.props

    return (
        <View >
            {this.props.selected ? 
            <TouchableOpacity onPress={onPress ? onPress: ()=>{}} style={{flexDirection: "row", alignItems: 'center',justifyContent:'center'}}>
              <View style={{width: outSize ? outSize : ScreenUtil.autowidth(11), height: outSize ? outSize : ScreenUtil.autowidth(11), borderRadius:25,backgroundColor: '#D9D9D9',alignItems: 'center',justifyContent:'center',}}>
                <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}}  style={{width: inSize ? inSize : ScreenUtil.autowidth(5), height: inSize ? inSize : ScreenUtil.autowidth(5), borderRadius:25,alignItems: 'center', justifyContent:'center',}}>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={onPress ? onPress: ()=>{}} style={{flexDirection: "row", alignItems: 'center',justifyContent:'center'}}>
              <View style={{width: outSize ? outSize : ScreenUtil.autowidth(11), height: outSize ? outSize : ScreenUtil.autowidth(11), borderRadius:25,backgroundColor: '#D9D9D9',alignItems: 'center',justifyContent:'center',}}>

              </View>
              {/* <LinearGradient colors={['#3A42F1','#69B6FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}}  style={{width: width ? width : ScreenUtil.autowidth(18), height: height ? height : ScreenUtil.autowidth(18), borderRadius:25,alignItems: 'center', justifyContent:'center',}}>
                <Ionicons color={'#FFF'}  name="md-checkmark" size={markSize ? markSize : ScreenUtil.autowidth(12)} />
              </LinearGradient> */}
            </TouchableOpacity>

            }
        </View>
    )
  }
}
