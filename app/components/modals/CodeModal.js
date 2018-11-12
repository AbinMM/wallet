import React from 'react';
import {StyleSheet,Animated,Text,TouchableWithoutFeedback,View,TextInput,Image,Keyboard,Platform} from 'react-native';
import ScreenUtil from '../../utils/ScreenUtil';
import TextButton from '../TextButton';
import Button from '../Button';
import Constants from '../../utils/Constants';
import {kapimg} from '../../utils/Api';

export class CodeModal {

  static bind(CodeModal) {
    this.map["CodeModal"] = CodeModal;
  }

  static unBind() {
    this.map["CodeModal"] = null;
    delete this.map["CodeModal"];
  }

  static show(phone,callback) {
    this.map["CodeModal"].show(phone,callback);
  }

}

CodeModal.map = {};

export class CodeModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      url:""
    };

    constructor(props) {
      super(props);
      CodeModal.bind(this);
    }

    show = (phone,callback) =>{
      if(this.isShow)return;
      this.isShow = true;
      this.phone=phone;
      //如果需要支持返回关闭，请添加这句，并且实现dimss方法
      window.currentDialog = this;
      this.CodeModalCallback = callback;
      this.setState({modalVisible:true});
      this.refreshImage();
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
          this.phone=null;
      });
    }

    cancel = () =>{
      this.dimss();
      this.CodeModalCallback && this.CodeModalCallback({isok:false});
    }

    ok = () =>{
      this.dimss();
      this.CodeModalCallback && this.CodeModalCallback({isok:true,value:this.state.password});
    }

    refreshImage = () =>{
      this.setState({
        url:Constants.rootaddr+kapimg+this.phone+"?v="+Math.ceil(Math.random()*100000)
      })
    }

    componentWillMount(){
      Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
      Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    _keyboardDidShow(e){
      if(this.isShow && Platform.OS=="ios"){
        this.setState({
          keyboardHeight:e.startCoordinates.height
        })
      }
    }

    _keyboardDidHide(e){
      if(this.isShow && Platform.OS=="ios"){
        this.setState({
          keyboardHeight:0
        });
      }
    }

    render() {
        return (
          this.state.modalVisible && <View style={styles.continer}>
            <TouchableWithoutFeedback onPress={()=>{this.dimss()}}>
              <View style={styles.content}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask}]}></Animated.View>
                <View style={[styles.alertContent,Platform.OS=="ios"?{marginBottom:this.state.keyboardHeight*0.7}:{}]}>
                  <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                    <Text style={styles.title}>计算结果</Text>
                    <View style={{flex:1,flexDirection:"row",alignItems:"center",justifyContent:"space-between",maxHeight:ScreenUtil.autowidth(90)}}>
                      <View style={{width:"50%",flexDirection:"row",justifyContent:"center",paddingLeft:20,paddingRight:10,marginTop:-10}}>
                        <Button onPress={()=>{this.refreshImage()}} style={{width:"100%"}}>
                          <Image onError={(e)=>{this.loaderror()}} style={{width:"100%",height:ScreenUtil.autowidth(40)}} source={{uri:this.state.url}} />
                        </Button>
                      </View>
                      <View style={{width:"50%",flexDirection:"row",justifyContent:"center",paddingRight:15}}>
                        <View style={[styles.input]}>
                          <TextInput keyboardType="numeric" autoFocus={true} style={{width:"100%",paddingHorizontal:7,fontSize:ScreenUtil.setSpText(13),color:"#1A1A1A",opacity: 0.8}} ref={(ref)=>this._i1=ref} defaultValue={this.state.password} maxLength={5} returnKeyType="go" onSubmitEditing={() => this.okPass()}  onChangeText={(password) => this.setState({password})} selectionColor={"#6DA0F8"} underlineColorAndroid="transparent" placeholder="请输入计算结果" placeholderTextColor="#999" />
                        </View>
                      </View>
                    </View>
                    <View style={styles.bottom}>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.cancel()}} textColor="#D9D9D9" bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(44),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                      </View>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.ok()}} bgColor="#3B80F4" textColor="#fff" text="确认" style={{height:ScreenUtil.setSpText(44),borderBottomRightRadius:4}} />
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
    color:"#3B80F4",
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
    fontSize:ScreenUtil.setSpText(12),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(44),
    marginTop:ScreenUtil.autowidth(10)
  },
  input:{
    marginBottom:ScreenUtil.autowidth(11),
    borderColor:"#D9D9D9",
    borderWidth:ScreenUtil.autowidth(0.4),
    borderRadius:4,
    backgroundColor:"#F7F8F9",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    height:ScreenUtil.autowidth(40),
  },
});
