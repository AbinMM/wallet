import React from 'react';
import {StyleSheet,Text,View,Animated,Easing} from 'react-native';
import ScreenUtil from "../utils/ScreenUtil";

export class EasyToast {

  static bind(toast) {
    toast && (this.map['toast'] = toast);
  }

  static unBind() {
    this.map["toast"] = null
    delete this.map["toast"];
  }

  static show(text,duration, callback) {
    this.map["toast"].show(text,duration, callback);
  }

  static dismis() {
    this.map["toast"].close();
  }

  static switchRoute(){

  }

}

EasyToast.map = {};

export const DURATION = {LENGTH_SHORT: 800,FOREVER: 0};

export class Toast extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        isShow: false,
        text: '',
        transformY:new Animated.Value(-150),
        opacityValue: new Animated.Value(0.7),
      }
      EasyToast.bind(this);
    }

    show(text) {
      if(this.isShow) return;
      this.isShow=true;
      this.setState({isShow:true,text:text});
      Animated.timing(this.state.transformY,{toValue:0,duration:300,easing:Easing.linear}).start(() => {this.close()});
    }

    close() {
      if(!this.isShow)return;
      this.ToastTimer && clearTimeout(this.ToastTimer);
      this.ToastTimer = setTimeout(() => {
        clearTimeout(this.ToastTimer);
        Animated.timing(this.state.transformY,{toValue: 0-ScreenUtil.autowidth(70),duration: 300,easing: Easing.linear}).start(() => {
          this.setState({isShow:false});
          this.isShow=false;
        });
      },1500);
    }

    render() {
        const view = this.state.isShow ?
        <Animated.View style={[styles.container,{transform:[{translateY:this.state.transformY}]}]}>
          <View style={styles.content}>
            <Text style={styles.text}>{this.state.text}</Text>
          </View>
        </Animated.View>
        : null;
        return view;
    }
}

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 9999999999,
      width:"100%",
      height:ScreenUtil.autowidth(ScreenUtil.isIphoneX()?88:66),
      backgroundColor:"#6DA0F8",
      elevation:4,
      shadowColor:"rgba(0,0,0,0.5)",
      shadowOffset:{width:3,height:3},
      shadowOpacity:0.9,
      shadowRadius:5
    },
    content: {
      marginTop: ScreenUtil.autowidth(ScreenUtil.isIphoneX()?36:16),
      borderRadius: ScreenUtil.autowidth(5),
      padding: ScreenUtil.autowidth(10),
      height:ScreenUtil.autowidth(50),
      flexDirection: 'row',
      justifyContent: 'center',
    },
    text: {
      color: '#ffffff',
      alignSelf: 'center',
      fontSize: ScreenUtil.autowidth(15),
    }
});
