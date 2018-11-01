import React from 'react';
import { StyleSheet, Modal,Animated, Text, Platform, TouchableHighlight, KeyboardAvoidingView, TouchableWithoutFeedback, View, Dimensions, ActivityIndicator} from 'react-native';
import UColor from '../utils/Colors';
import ScreenUtil from '../utils/ScreenUtil';
import TextButton from './TextButton';
import LineView from './LineView';

export class DappAlertModal {

  static bind(DappAlertModal) {
    this.map["DappAlertModal"] = DappAlertModal;
  }

  static unBind() {
    this.map["DappAlertModal"] = null;
    delete this.map["DappAlertModal"];
  }

  static show(dapp,callback) {
    this.map["DappAlertModal"].show(dapp,callback);
  }

}

DappAlertModal.map = {};

export class DappAlertModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      dapp:""
    };

    constructor(props) {
      super(props);
      DappAlertModal.bind(this);
    }

    show = (dapp,callback) =>{
      if(this.isShow)return;
      this.DappAlertModalCallback = callback;
      this.setState({dapp,modalVisible:true});
      Animated.parallel([
        Animated.timing(this.state.mask,{toValue:0.6,duration:1000}),
        Animated.timing(this.state.alert,{toValue:1,duration:500})
      ]).start(() => {
          this.isShow = true;
      });
    }

    dimss = () => {
      if(!this.isShow)return;
      Animated.parallel([
          Animated.timing(this.state.mask,{toValue:0,duration:500}),
          Animated.timing(this.state.alert,{toValue:0,duration:200})
      ]).start(() => {
          this.setState({modalVisible:false});
          this.isShow = false;
      });
    }

    ok = () =>{
      this.dimss();
      this.DappAlertModalCallback && this.DappAlertModalCallback();
    }

    componentWillUnmount() {
      DappAlertModal.unBind();
    }

    render() {
        return (
          <View style={styles.continer}>
            <Modal transparent={true} animationType={'fade'} onRequestClose={()=>{this.dimss()}} visible={this.state.modalVisible}>
              <TouchableWithoutFeedback onPress={()=>{this.dimss()}}>
                <View style={styles.content}>
                  <Animated.View style={[styles.mask,{opacity:this.state.mask}]}></Animated.View>
                  <View style={styles.alertContent}>
                    <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                      <Text style={styles.title}>您所访问的页面将跳至第三方DApp {this.state.dapp}</Text>
                      <Text style={styles.ctx}>提示：您所访问的页面将跳转至第三方DApp {this.state.dapp}。您在第三方DApp上的使用行为将适用该第三方DApp的用户协议和隐私政策，由其直接并单独向您承担责任。</Text>
                      <View style={styles.bottom}>
                        <View style={{width:"50%"}}>
                          <TextButton onPress={()=>{this.dimss()}} bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                        </View>
                        <View style={{width:"50%"}}>
                          <TextButton onPress={()=>{this.ok()}} bgColor="#6DA0F8" textColor="#fff" text="确认" style={{height:ScreenUtil.setSpText(49),borderBottomRightRadius:4}} />
                        </View>
                      </View>
                    </Animated.View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        )
    }
}

const styles = StyleSheet.create({
  continer:{
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
    backgroundColor:UColor.transport
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
    backgroundColor:UColor.transport,
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
