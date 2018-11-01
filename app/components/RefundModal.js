import React from 'react';
import { StyleSheet, Modal,Animated, Text, Platform, TouchableHighlight, KeyboardAvoidingView, TouchableWithoutFeedback, View, Dimensions, ActivityIndicator} from 'react-native';
import UColor from '../utils/Colors';
import ScreenUtil from '../utils/ScreenUtil';
import TextButton from './TextButton';
import LineView from './LineView';

export class RefundModal {

  static bind(RefundModal) {
    this.map["RefundModal"] = RefundModal;
  }

  static unBind() {
    this.map["RefundModal"] = null;
    delete this.map["RefundModal"];
  }

  static show(data,callback) {
    this.map["RefundModal"].show(data,callback);
  }

}

RefundModal.map = {};

export class RefundModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      data:{}
    };

    constructor(props) {
      super(props);
      RefundModal.bind(this);
    }

    show = (data,callback) =>{
      if(this.isShow)return;
      this.RefundModalCallback = callback;
      this.setState({data,modalVisible:true});
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
          Animated.timing(this.state.mask,{toValue:0,duration:300}),
          Animated.timing(this.state.alert,{toValue:0,duration:300})
      ]).start(() => {
          this.setState({modalVisible:false});
          this.isShow = false;
      });
    }

    ok = () =>{
      this.dimss();
      this.RefundModalCallback && this.RefundModalCallback();
    }

    componentWillUnmount() {
      RefundModal.unBind();
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
                      <Text style={styles.title}>赎回资源</Text>
                      <View style={styles.ctx}>
                        <View style={styles.ctx_account}>
                          <Text style={styles.ctx_txt}>抵押账号:</Text>
                          <Text style={styles.ctx_txt}>{this.state.data.account?this.state.data.account:""}</Text>
                        </View>
                        <View style={[styles.input,{marginTop:ScreenUtil.autowidth(15)}]}>
                          <Text style={styles.ctx_txt}>计算资源:</Text>
                          <Text style={styles.input_right}>{this.state.data.cpu?this.state.data.cpu:0} EOS</Text>
                        </View>
                        <View style={styles.input}>
                          <Text style={styles.ctx_txt}>网络资源:</Text>
                          <Text style={styles.input_right}>{this.state.data.net?this.state.data.net:0} EOS</Text>
                        </View>
                      </View>
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
    paddingHorizontal:ScreenUtil.autowidth(30)
  },
  ctx_account:{
    marginTop:ScreenUtil.autowidth(10),
    flexDirection:"row",
    justifyContent:"space-between"
  },
  ctx_txt:{
    color:"#1A1A1A",
    marginHorizontal:ScreenUtil.autowidth(10),
    fontSize:ScreenUtil.setSpText(14),
  },
  input:{
    marginBottom:ScreenUtil.autowidth(11),
    borderColor:"#E6E6E6",
    borderWidth:ScreenUtil.autowidth(0.4),
    borderRadius:4,
    backgroundColor:"#F7F8F9",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    height:ScreenUtil.autowidth(45),
  },
  input_right:{
    color:"#808080",
    marginRight:ScreenUtil.autowidth(10),
    fontSize:ScreenUtil.setSpText(12.5),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(49),
    marginTop:ScreenUtil.autowidth(10)
  }
});
