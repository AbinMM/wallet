import React, { Component } from 'react'
import {SafeAreaView,InteractionManager,Text,View,WebView,Animated,Platform,Dimensions,StyleSheet} from 'react-native'
// import {Colors,WalletUtils} from '../utils'
import UColor from '../../utils/Colors'

import Header from '../../components/Header'
import RenderScatter from './RenderScatter';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { connect } from 'react-redux';
// import { Toast } from '../comps/Toast';
// import {DappTx} from '../comps';
// import { Auth } from '../comps/Auth';
// import { Eos } from '../comps/eosjs';
// import { Loading } from '../comps/Loading';
// import Globle from '../utils/Globle';
// import { WalletList } from '../comps/WalletList';

@connect(({ wallet }) => ({ }))
export default class DappWeb extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
      return {title:navigation.state.params.title,
        header:null,
    }
  }

  constructor(props){
      super(props)
      this.state = {
        progress: new Animated.Value(10),
        error: false
      }
      this.props.navigation.setParams({onPress:this.share});
      let noop = () => {}
      this.__onLoad = this.props.onLoad || noop
      this.__onLoadStart = this.props.onLoadStart || noop
      this.__onError = this.props.onError || noop
  }

  _onLoad() {
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth,
      duration: 200
    }).start(() => {
      setTimeout(() => {
        this.state.progress.setValue(0);
      }, 300)
    })
    this.__onLoad()
  }
  _onLoadStart() {
    this.state.progress.setValue(0);
    Animated.timing(this.state.progress, {
      toValue: ScreenWidth * .7,
      duration: 5000
    }).start()
    this.__onLoadStart()
  }
  _onError() {
    setTimeout(() => {
      this.state.progress.setValue(0);
    }, 300)
    this.setState({ error: true })
    this.__onError()
  }
  onMessage = (e) =>{
    let result = JSON.parse(e.nativeEvent.data);
    if(result.scatter==="getCurrencyBalance"){
      this.props.dispatch({type:'wallet/balanceScatter',payload:{...result.params},callback:(res)=>{
        this.refs.refWebview.postMessage(JSON.stringify({...result,data:res}));
      }});
    }else if(result.scatter==="getAccount"){
      this.props.dispatch({type:'wallet/getAccount',payload:{...result.params},callback:(res)=>{
        if(res.code==0){
          this.refs.refWebview.postMessage(JSON.stringify({...result,data:res.data}));
        }else{
        //   Toast.show(res.msg);
        }
      }});
    }else if(result.scatter==="transaction"){
    //   DappTx.show(result.params.actions,()=>{
    //     account = WalletUtils.selectAccount();
    //     Auth.show(account,(pk)=>{
    //       Loading.show("提交中...");
    //       Eos.transaction(pk,result.params.actions,(r)=>{
    //         Loading.dismis();
    //         if(r.isSuccess){
    //           this.refs.refWebview.postMessage(JSON.stringify({...result,data:r.data}));
    //         }else{
    //         //   Toast.show(r.msg);
    //         }
    //       })
    //     },()=>{
          
    //     });
    //   });
    }else if(result.scatter==="noaccount"){
    //   Toast.show("请导入账户");
      InteractionManager.runAfterInteractions(() => {
        // WalletList.show(Globle.wallet,false,(select)=>{
          
        // });
      });
    }
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.btnColor }}>
        <Header {...this.props} onPressLeft={true} title={this.props.navigation.state.params.title} avatar={this.state.news && UImage.share_i} onPressRight={this.state.news && this.share.bind()}/>
        <WebView
            ref="refWebview"
            source={{uri:this.props.navigation.state.params.url}}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            scalesPageToFit={false}
            injectedJavaScript = {RenderScatter(this.props)}
            style={[styles.webview_style,{backgroundColor: UColor.btnColor}]}
            onLoad={this._onLoad.bind(this)}
            onLoadStart={this._onLoadStart.bind(this)}
            onError={this._onError.bind(this)}
            onMessage={(e)=>{this.onMessage(e)}}
          >
        </WebView>
        <View style={[styles.infoPage,{backgroundColor: UColor.secdColor},this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <Animated.View style={[styles.progress, {backgroundColor: UColor.tintColor, width: this.state.progress }]}></Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    webview_style: {
      flex: 1,
    },
    progress: {
      position: "absolute",
      height: 2,
      left: 0,
      top: 0,
      overflow: "hidden",
    },
    infoPage: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      paddingTop: 50,
      alignItems: "center",
      transform: [
        { translateX: ScreenWidth }
      ],
    },
    showInfo: {
      transform: [
        { translateX: 0 }
      ]
    }
  })