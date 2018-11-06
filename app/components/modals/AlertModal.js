import React from 'react';
import {StyleSheet,Animated,Text,TouchableWithoutFeedback,View} from 'react-native';
import ScreenUtil from '../../utils/ScreenUtil';
import TextButton from '../TextButton';

export class AlertModal {

  static bind(AlertModal) {
    this.map["AlertModal"] = AlertModal;
  }

  static unBind() {
    this.map["AlertModal"] = null;
    delete this.map["AlertModal"];
  }

  static show(title,content,ok,cancel,callback) {
    this.map["AlertModal"].show(title,content,ok,cancel,callback);
  }

}

AlertModal.map = {};

export class AlertModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0)
    };

    constructor(props) {
      super(props);
      AlertModal.bind(this);
    }

    show = (title,content,ok,cancel,callback) =>{
      if(this.isShow)return;
      this.isShow = true;
      //如果需要支持返回关闭，请添加这句，并且实现dimss方法
      window.currentDialog = this;
      this.AlertModalCallback = callback;
      this.setState({title,content,ok,cancel,modalVisible:true});
      Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0.6,duration:500}),
        Animated.timing(this.state.alert,{toValue:1,duration:200})
      ]).start(() => {});
    }

    dimss = () => {
      if(!this.isShow)return;
      window.currentDialog = null;
      Animated.parallel([
          Animated.timing(this.state.mask,{toValue:0,duration:500}),
          Animated.timing(this.state.alert,{toValue:0,duration:200})
      ]).start(() => {
          this.setState({modalVisible:false});
          this.isShow = false;
      });
    }

    cancel = () =>{
      this.dimss();
      this.AlertModalCallback && this.AlertModalCallback(false);
    }

    ok = () =>{
      this.dimss();
      this.AlertModalCallback && this.AlertModalCallback(true);
    }

    render() {
        return (
          this.state.modalVisible && <View style={styles.continer}>
            <TouchableWithoutFeedback onPress={()=>{this.dimss()}}>
              <View style={styles.content}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask}]}></Animated.View>
                <View style={styles.alertContent}>
                  <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                    <Text style={styles.title}>{this.state.title?this.state.title:"提示"}</Text>
                    <Text style={styles.ctx}>{this.state.content?this.state.content:""}</Text>
                    <View style={styles.bottom}>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.cancel()}} bgColor="#fff" text={this.state.cancel?this.state.cancel:"取消"} style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                      </View>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.ok()}} bgColor="#6DA0F8" textColor="#fff" text={this.state.ok?this.state.ok:"确认"} style={{height:ScreenUtil.setSpText(49),borderBottomRightRadius:4}} />
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )
    }
}

const styles = StyleSheet.create({
  continer:{
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 99999,
    flex: 1,
    width:"100%",
    height:"100%"
  },
  content:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(0, 0, 0, 0.0)"
  },
  mask: {
    flex:1,
    left:0,
    top:0,
    position: 'absolute',
    zIndex: 0,
    width:"100%",
    height:"100%",
    backgroundColor:"#000",
  },
  alertContent:{
    width:"100%",
    height:"100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(0, 0, 0, 0.0)",
    padding:ScreenUtil.autowidth(40)
  },
  alert:{
    flex:1,
    flexDirection: 'column',
    borderRadius:4,
    width:"100%",
    backgroundColor:"#fff"
  },
  title:{
    color:"#1A1A1A",
    textAlign:"center",
    lineHeight:ScreenUtil.setSpText(26),
    fontSize:ScreenUtil.setSpText(16),
    fontWeight:"bold",
    marginTop:ScreenUtil.setSpText(18),
    margin:ScreenUtil.setSpText(10)
  },
  ctx:{
    marginBottom:ScreenUtil.setSpText(10),
    marginHorizontal:ScreenUtil.setSpText(20),
    color:"#808080",
    lineHeight:ScreenUtil.setSpText(24),
    fontSize:ScreenUtil.setSpText(12.5),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(49),
    marginTop:ScreenUtil.autowidth(10)
  }
});
