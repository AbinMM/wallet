import React from 'react';
import { connect } from 'react-redux'
import { Animated,DeviceEventEmitter,StyleSheet,Image,View,Text,Platform,Dimensions,TouchableHighlight,ImageBackground,} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({vote, wallet}) => ({...vote, ...wallet}))
class Bvote extends BaseComponent {

    static navigationOptions = { 
        title: "节点投票",
        header:null, 
    };

  _rightTopClick = () =>{  
    DeviceEventEmitter.emit('voteShare',""); 
  }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,
      showShare:false,
      news:{},
      arr: 0,
    }
  }

  componentDidMount() {
    EasyShowLD.loadingShow();
    this.props.dispatch({
        type: 'wallet/getDefaultWallet', callback: (data) => {     
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (data) => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account}, callback: (data) => {
                    this.setState({
                        arr : this.props.producers.length,
                    });
                } });
                EasyShowLD.loadingClose();
            }});
        }
    })
  }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Imvote') {
      navigate('Imvote', {});
    }else if (key == 'Nodevoting') {
      navigate('Nodevoting', {});
    }else {
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="节点投票" subName="邀请投票" onPressRight={this._rightTopClick.bind()}/>  
                 <View style={[styles.outsource,{backgroundColor: UColor.mainColor}]}>
                    <View style={styles.headoutsource}>
                        <Text style={[styles.headSizeone,{color: UColor.fontColor}]}>进度：37.131%</Text>
                        <Text style={[styles.headSizetwo,{color: UColor.fontColor}]}>可投票数：{30 - this.state.arr}</Text>
                    </View>
                    <View>
                      <View style={[styles.Underschedule,{backgroundColor: UColor.secdColor}]}></View> 
                      <View style={styles.Aboveschedule}>
                        <View style={[styles.Abovestrip,{backgroundColor: UColor.tintColor}]}></View>
                        <View style={[styles.Abovecircular,{backgroundColor: UColor.tintColor}]}></View>
                      </View>                     
                    </View>             
                </View>
                
                <TouchableHighlight onPress={this.goPage.bind(this, 'Imvote')} activeOpacity={0.8} underlayColor={UColor.secdColor} style={{marginTop: ScreenUtil.autoheight(6), marginHorizontal: ScreenUtil.autowidth(5)}}>
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votea_bj} resizeMode="stretch" >              
                    <Text style={[styles.locktitle,{color: UColor.btnColor}]}>我的投票</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.voteb} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>     
                </TouchableHighlight> 
                <TouchableHighlight onPress={this.goPage.bind(this, 'Nodevoting')} activeOpacity={0.8}  underlayColor={UColor.secdColor} style={{marginTop: ScreenUtil.autoheight(6), marginHorizontal: ScreenUtil.autowidth(5)}}>      
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votec_bj} resizeMode="stretch">              
                    <Text style={[styles.locktitle,{color: UColor.btnColor}]}>超级节点</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.votec} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>  
                </TouchableHighlight>       
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
  },
  outsource: {
    borderRadius: 5,
    padding: ScreenUtil.autowidth(20),
    height: ScreenUtil.autoheight(78),
    marginTop: ScreenUtil.autoheight(5),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  headoutsource: {
    flexDirection:'row', 
    alignItems: "center",
    justifyContent: "center", 
    marginBottom: ScreenUtil.autoheight(15),
  },
  headSizeone: {
    fontSize: ScreenUtil.setSpText(12), 
    marginRight: ScreenUtil.autowidth(10),
  },
  headSizetwo: {
    fontSize: ScreenUtil.setSpText(12), 
    marginLeft: ScreenUtil.autowidth(10),
  },
  Underschedule: {
    position:'relative', 
    top: ScreenUtil.autoheight(3),
    height: ScreenUtil.autoheight(2),
  },
  Aboveschedule: {
    width: '100%',
    flexDirection:'row', 
    position:'absolute', 
    alignItems: 'center', 
  },
  Abovestrip: {
    width: '24.2218%',
    height: ScreenUtil.autoheight(2),
  },
  Abovecircular: {
    borderRadius: 5,
    width: ScreenUtil.autowidth(8), 
    height: ScreenUtil.autowidth(8),  
  },
  lockoutsource: {
    alignItems: 'center', 
    flexDirection:'row', 
    justifyContent: "flex-end", 
    height: ScreenUtil.autoheight(115), 
    paddingRight: ScreenUtil.autowidth(10),
    width: ScreenWidth-ScreenUtil.autowidth(10),
  },
  locktitle: {
    fontSize:ScreenUtil.setSpText(16), 
  },
  locktext: {
    alignItems: 'center',
    justifyContent: 'center', 
  },
  lockimg: {
    width: ScreenUtil.autowidth(30), 
    height: ScreenUtil.autowidth(30), 
    margin: ScreenUtil.autowidth(10),
  },
})
export default Bvote;