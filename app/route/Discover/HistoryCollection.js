import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Image, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity, ListView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UImage from '../../utils/Img';
import UColor from '../../utils/Colors'
import { kapimg } from '../../utils/Api'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Constants from '../../utils/Constants'
import ScreenUtil from '../../utils/ScreenUtil'
import {encryptedMsg} from '../../utils/AlgoUtil';
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import {AlertModal,AlertModalView} from '../../components/modals/AlertModal'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var tick = 60;
var dismissKeyboard = require('dismissKeyboard');

@connect(({ login, wallet, dapp }) => ({ ...login, ...wallet, ...dapp }))
class HistoryCollection extends BaseComponent {

  static navigationOptions = {
    title: '我的DApps',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
      isHistory: true,
      isCollection: false,
      dappList: [],
      dappListCollection: [], //收藏列表
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };
  }

  //组件加载完成
  componentDidMount() {
    this.setDapplist('isHistory');
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  businesButton(style, selectedSate, stateType, buttonTitle) {
      let BTN_SELECTED_STATE_ARRAY = ['isHistory', 'isCollection'];
      return(
          <TouchableOpacity style={[style, ]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>
              <Text style={[styles.tabText, {color: selectedSate ? '#3B80F4' : '#323232'}]}>{buttonTitle}</Text>
              <View style={[{width: 5, height: 5, borderRadius: 5,backgroundColor:selectedSate ? '#3B80F4' : 'rgba(0, 0, 0, 0.0)'}]}/>
          </TouchableOpacity>
      );
  }

  // 更新"历史记录 我的收藏"按钮的状态
  _updateBtnState(currentPressed, array) {
    if (!currentPressed || !array) {
        return;
    }
    let newState = {...this.state};
    for (let type of array) {
        if (currentPressed == type) {
            newState[type] ? {} : newState[type] = !newState[type];
            this.setState(newState);
        } else {
            newState[type] ? newState[type] = !newState[type] : {};
            this.setState(newState);
        }
    }
    this.setDapplist(currentPressed);
  }

  setDapplist(currentPressed) {
    if(currentPressed == "isHistory") {
      this.props.dispatch({ type: 'dapp/mydappInfo', payload: {}, 
        callback: (mydappBook) => {
          if(mydappBook){
            this.setState({dappList: mydappBook})
          }
        }  
      });
    }else if(currentPressed == "isCollection"){
      this.props.dispatch({ type: 'dapp/collectionDappInfo', payload: {},
        callback: (collectionDapp) => {
          if(collectionDapp){
            this.setState({dappListCollection: collectionDapp})
          }
        } 
      });
    }
  }

  //点DAPP跳转
  onPressDapp(data) {
    const { navigate } = this.props.navigation;
    var title = '您所访问的页面将跳至第三方DApp' + data.name;
    var content = '提示：您所访问的页面将跳转至第三方DApp'+ data.name +'。您在第三方DApp上的使用行为将适用该第三方DApp的用户协议和隐私政策，由其直接并单独向您承担责任。';
    AlertModal.show(title,content,'确认','取消',(resp)=>{
      if(resp){
          navigate('DappWeb', { data: data});
          this.props.dispatch({ type: 'dapp/saveMyDapp', payload: data });
        }
    });
  }

  showDappList()
  {
    if(this.state.isCollection){
      return this.state.dappListCollection == null ? [] : this.state.dappListCollection;
    }else{
      return this.state.dappList == null ? [] : this.state.dappList;
    }
  }
  render() {
    return (
      <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
        <Header {...this.props} onPressLeft={true} title="我的DApps" />
        <View style={[styles.businestab,{backgroundColor: '#FFFFFF'}]}>
            {this.businesButton([styles.buytab,], this.state.isHistory, 'isHistory', '历史记录')}
            {this.businesButton([styles.selltab,], this.state.isCollection, 'isCollection', '我的收藏')}
        </View>
        <View style={{flex: 1,}}>
          <ListView  enableEmptySections={true}  contentContainerStyle={[styles.listViewStyle,{backgroundColor:'#FFFFFF'}]}
            dataSource={this.state.dataSource.cloneWithRows(this.showDappList())} 
            renderRow={(rowData) => (  
              <TouchableOpacity  onPress={this.onPressDapp.bind(this, rowData)}  style={styles.headDAPP}>
                  <View style={styles.headbtnout}>
                      <Image source={{uri:rowData.icon}} style={styles.imgBtnDAPP} resizeMode='stretch'/>
                      <View style={{flex: 1}}>
                          <Text style={[styles.headbtntext,{color: '#323232'}]}>{rowData.name}</Text>
                          <Text style={[styles.descriptiontext,{color: '#808080'}]} numberOfLines={1}>{rowData.description}</Text>
                      </View>
                      {this.state.isCollection &&
                      <TouchableOpacity onPress={() => {}}>
                        <Image source={UImage.collection_h} style={{ width: ScreenUtil.autowidth(20),height: ScreenUtil.autowidth(20),margin: ScreenUtil.autowidth(15),}} resizeMode='stretch'/>
                      </TouchableOpacity>
                      }
                  </View>
              </TouchableOpacity>
            )}                
          /> 
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  businestab: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: ScreenUtil.autoheight(40),
  },
  buytab: {
      flex: 1,
      
      alignItems: 'center',
      justifyContent: 'center',
      
      height: ScreenUtil.autoheight(26),
  },
  selltab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: ScreenUtil.autoheight(26),
  },
  tabText: {
      fontSize: ScreenUtil.setSpText(16),
      lineHeight:  ScreenUtil.autoheight(23),
  },

  listViewStyle:{ 
    flexDirection:'column', 
    width: ScreenWidth, 
  }, 
  headDAPP: {
    paddingVertical: ScreenUtil.autoheight(8),
    
  },
  headbtnout: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: "center",
  },
  imgBtnDAPP: { 
    width: ScreenUtil.autowidth(45),
    height: ScreenUtil.autowidth(45),
    marginHorizontal: ScreenUtil.autowidth(15),
  },
  headbtntext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(23), 
  },
  descriptiontext: {
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(14), 
  },



  butimg: { 
    width: ScreenUtil.autowidth(100), 
    height: ScreenUtil.autowidth(45), 
  },
  inp: {
    textAlign: "center",
    width: ScreenUtil.autowidth(120),
    height: ScreenUtil.autoheight(45),
    fontSize: ScreenUtil.setSpText(15),
    marginLeft: ScreenUtil.autowidth(10),
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  outsource: {
    flexDirection: 'column',
  },
  inptout: {
    padding: ScreenUtil.autowidth(20), 
    height: ScreenUtil.autoheight(80), 
  },
  inpt: {
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  inptitle: {
    fontSize: ScreenUtil.setSpText(14), 
  },
  separate: {
    height: 0.5,
  },
  forgetpass: {
    flexDirection: "row",
    justifyContent: 'flex-end',
    padding: ScreenUtil.autowidth(20),
  },
  forgettext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  vfanout: {
    flexDirection: 'row',
  },
  vfantext: {
    width: ScreenUtil.autowidth(200),
    height: ScreenUtil.autoheight(80),
    padding: ScreenUtil.autowidth(20),
  },
  verificationout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end",
    marginRight: ScreenUtil.autowidth(10),
  },
  verification: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: ScreenUtil.autowidth(100),
    height: ScreenUtil.autoheight(40),
    marginTop: ScreenUtil.autoheight(15),
  },
  verificationtext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  butout: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(45),
    marginVertical: ScreenUtil.autoheight(20),
    marginHorizontal: ScreenUtil.autowidth(20),
  },
  buttext: {
    fontSize: ScreenUtil.setSpText(15),
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ScreenUtil.autoheight(20),
  },
  readtext: {
    fontSize: ScreenUtil.setSpText(14),
  },
  servicetext: {
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(5),
  },

  logoutone:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: ScreenUtil.autoheight(320),
    paddingBottom: ScreenUtil.autoheight(100),
  },
  logouttow:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(100),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(30),
  }
});

export default HistoryCollection;
