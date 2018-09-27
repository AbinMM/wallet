import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import UImage from "../../utils/Img";
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');

@connect(({news}) => ({...news}))
class Activity extends BaseComponent {

  static navigationOptions = {
    title: '活动',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
        periodstext: '', //当前进行第几期活动
        periodsseq: '', //当前进行第几期下标
        status: false,
    };
  }

  //组件加载完成
  componentDidMount() {
    try {
        this.props.dispatch({type: 'news/getInfo', payload:{activityId:"1"},callback: (datainfo) => {
            if(datainfo && datainfo != null){
                if(datainfo.status == 'doing'){
                    this.setState({status: true})
                }else{
                    this.setState({status: false})
                }
            }
            this.props.dispatch({type: 'news/getActivityStages', payload:{activityId:"1"},callback: (periodsdata) => {
                let periodstext= '';
                let periodsseq= '';
                for(var i = 0; i < periodsdata.length; i++){
                    if(periodsdata[i].status == 'doing'){
                        periodstext= periodsdata[i].name;
                        periodsseq= periodsdata[i].seq;
                    }
                }
                this.setState({periodstext:periodstext,periodsseq:periodsseq});
            } })
        } })
    } catch (error) {
        
    }
    
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

 
  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'OCTactivity') {
        navigate('OCTactivity',{ periodstext:this.state.periodstext, periodsseq:this.state.periodsseq,});
    }else{

    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="活动" />
        <Button  onPress={this.onPress.bind(this, 'OCTactivity')}  style={[styles.headbtn,{backgroundColor: UColor.mainColor}]}>
            <View style={styles.headbtnout}>
                <View style={{flex: 1,flexDirection:'row',}}>
                    <View style={[styles.statustext,this.state.status && {backgroundColor:UColor.warningRed,}]}/>
                    <Text style={[styles.headbtntext,{color: UColor.fontColor}]}>5000OCT派送活动</Text>
                </View>
                <Text style={[styles.headbtntext,{color: UColor.tintColor}]}>查看</Text>
            </View>
        </Button>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },
  headbtn: {
    alignItems: 'center',
    justifyContent: "center", 
  },
  headbtnout: {
    flexDirection:'row',
    alignItems: 'center', 
    justifyContent: "space-between",
    paddingHorizontal: ScreenUtil.autowidth(10),
    paddingVertical: ScreenUtil.autowidth(15),
  },
  statustext: {
    borderRadius: 10,
    width: ScreenUtil.autowidth(5),
    height:ScreenUtil.autowidth(5),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(14),
  },

});

export default Activity;
