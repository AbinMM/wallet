import React from 'react';
import {StyleSheet,Animated,Text,TouchableWithoutFeedback,View,FlatList} from 'react-native';
import ScreenUtil from '../../utils/ScreenUtil';
import TextButton from '../TextButton';
import Button from '../Button';
import { ScrollView } from 'react-native-gesture-handler';

export class DappSignModal {

  static bind(DappSignModal) {
    this.map["DappSignModal"] = DappSignModal;
  }

  static unBind() {
    this.map["DappSignModal"] = null;
    delete this.map["DappSignModal"];
  }

  static show(data,callback) {
    this.map["DappSignModal"].show(data,callback);
  }

}

DappSignModal.map = {};

export class DappSignModalView extends React.Component {

    state = {
      modalVisible: false,
      mask: new Animated.Value(0),
      alert: new Animated.Value(0),
      data:null,
      props:true,
      actions:[],
      actiontext:{},
      account:""
    };

    constructor(props) {
      super(props);
      DappSignModal.bind(this);
    }

    show = (data,callback) =>{
      if(this.isShow)return;
      this.isShow = true;
      //如果需要支持返回关闭，请添加这句，并且实现dimss方法
      window.currentDialog = this;
      this.DappSignModalCallback = callback;

      if(data && data.length>0){
        let action = data[0];
        if(action && action.authorization && action.authorization.length>0){
          let auth = action.authorization[0];
          if(auth){
            this.setState({account:auth.actor+"@"+auth.permission});
          }
        }
      }
      this.setState({actions:data,actiontext:JSON.stringify(data,null,"\t"),modalVisible:true});
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
      this.DappSignModalCallback && this.DappSignModalCallback(false);
    }

    ok = () =>{
      this.dimss();
      this.DappSignModalCallback && this.DappSignModalCallback(true);
    }

    onCheck = (check) =>{
      this.setState({props:check});
    }

    listData = (data) =>{
      let arr = new Array();
      for(var key in data){
        arr.push(<View style={{flexDirection:"row",justifyContent:"space-between"}}>
          <Text numberOfLines={1} style={styles.param}>{key}</Text>
          <View style={styles.paramCover}>
            <Text numberOfLines={1} style={styles.paramr}>{JSON.stringify(data[key])}</Text>
          </View>
        </View>);
      }
      return arr;
    }

    render() {
        return (
          this.state.modalVisible && <View style={styles.continer}>
            <TouchableWithoutFeedback>
              <View style={styles.content}>
                <Animated.View style={[styles.mask,{opacity:this.state.mask}]}></Animated.View>
                <View style={styles.alertContent}>
                  <Animated.View style={[styles.alert,{opacity:this.state.alert}]}>
                    <Text style={styles.title}>签名请求</Text>
                    <View style={styles.ctx}>
                      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                        <View style={{flexDirection:"column"}}>
                          <Text style={styles.account}>{this.state.account}</Text>
                          <Text style={styles.contract}>合约操作</Text>
                        </View>
                        <View style={{flexDirection:"column"}}>
                          <View style={{flexDirection:"column"}}>
                            <Button onPress={()=>this.onCheck(true)}>
                              <View style={[this.state.props?styles.check:styles.uncheck,{borderTopLeftRadius:5,borderTopRightRadius:5,}]}>
                                <Text style={this.state.props?styles.checkText:styles.uncheckText}>属性</Text>
                              </View>
                            </Button>
                            <Button onPress={()=>this.onCheck(false)}>
                              <View style={[this.state.props?styles.uncheck:styles.check,{ borderBottomLeftRadius:5,borderBottomRightRadius:5,}]}>
                                <Text style={this.state.props?styles.uncheckText:styles.checkText}>JSON</Text>
                              </View>
                            </Button>
                          </View>
                        </View>
                      </View>
                      <View style={styles.code}>
                        {
                          this.state.props && <FlatList
                          showsVerticalScrollIndicator={false}
                          keyExtractor={(item, index) => item.name}
                          initialListSize={10}
                          style={{backgroundColor:"rgba(0,0,0,0)"}}
                          enableEmptySections={true}
                          data={this.state.actions?this.state.actions:[]}
                          renderItem={({item,index}) => (
                            <Button>
                              <View style={{flexDirection:"column",padding:8}}>
                                <Text style={styles.action}>{item.account} > {item.name}</Text>
                                {
                                  this.listData(item.data)
                                }
                              </View>
                            </Button>
                          )}/>
                        }
                        {
                          !this.state.props && <ScrollView style={{height:"100%"}}>
                            <Button>
                              <View>
                                <Text style={styles.json}>{this.state.actiontext}</Text>
                              </View>
                            </Button>
                          </ScrollView>
                        }
                      </View>
                    </View>
                    <View style={styles.bottom}>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.cancel()}} bgColor="#fff" text="取消" style={{height:ScreenUtil.setSpText(49),borderTopWidth:ScreenUtil.setSpText(0.3),borderColor:"rgba(204,204,204,0.5)",borderBottomLeftRadius:4}} />
                      </View>
                      <View style={{width:"50%"}}>
                        <TextButton onPress={()=>{this.ok()}} bgColor="#6DA0F8" textColor="#fff" text="确认" style={{height:ScreenUtil.setSpText(49),borderBottomRightRadius:4}} />
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
    marginBottom:ScreenUtil.setSpText(5),
    marginHorizontal:ScreenUtil.setSpText(20),
    flexDirection:"column"
  },
  contract:{
    color:"#1A1A1A",
    fontSize:ScreenUtil.setSpText(13),
    marginTop:ScreenUtil.setSpText(4),
  },
  account:{
    color:"#6DA0F8",
    fontSize:ScreenUtil.setSpText(13),
  },
  bottom:{
    flex:1,
    flexDirection: 'row',
    maxHeight:ScreenUtil.autowidth(49),
    marginTop:ScreenUtil.autowidth(10)
  },
  check:{
    backgroundColor:"#6DA0F8",
    justifyContent:"center",
    alignItems:"center"
  },
  checkText:{
    color:"#fff",
    fontSize:ScreenUtil.setSpText(8),
    paddingVertical:ScreenUtil.setSpText(3),
    paddingHorizontal:ScreenUtil.setSpText(10)
  },
  uncheck:{
    backgroundColor:"#F7F8F9",
    justifyContent:"center",
    alignItems:"center"
  },
  uncheckText:{
    color:"#6DA0F8",
    fontSize:ScreenUtil.setSpText(8),
    paddingVertical:ScreenUtil.setSpText(3),
    paddingHorizontal:ScreenUtil.setSpText(10)
  },
  code:{
    backgroundColor:"#F7F8F9",
    height:ScreenUtil.autowidth(130),
    marginTop:ScreenUtil.autowidth(10)
  },
  json:{
    padding:8,
    color:"#808080",
    fontSize:ScreenUtil.setSpText(12),
  },
  action:{
    color:"#1A1A1A",
    fontSize:ScreenUtil.setSpText(13),
    marginBottom:ScreenUtil.setSpText(4)
  },
  param:{
    lineHeight:ScreenUtil.setSpText(18),
    color:"#808080",
    fontSize:ScreenUtil.setSpText(12),
  },
  paramr:{
    textAlign:"right",
    lineHeight:ScreenUtil.setSpText(18),
    color:"#808080",
    fontSize:ScreenUtil.setSpText(12),
    width:(ScreenUtil.screenWidth-ScreenUtil.autowidth(136))/2
  },
  paramCover:{
    marginLeft:ScreenUtil.setSpText(15),
  }
});
