import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, StyleSheet, View, Text, Image, ImageBackground, TouchableHighlight,Linking} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({login}) => ({...login}))
class Community extends BaseComponent {

  static navigationOptions = {
    title: 'ET社区',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
        wechat: 'EOS-TOKEN',
        public: 'EosToken钱包',
        qq: '3090679927',
        telegraph: 't.me/eostokens',
        source: 'github.com/eostoken/wallet',
    }
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
  
  logout = () =>{
    if(this.props.loginUser){
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
        AnalyticsUtil.onEvent('Sign_out');
      }});
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    } 
  }

  prot(key, data = {}) {
    const { navigate } = this.props.navigation; 
    if (key == 'microblog') {
        navigate('Web', { title: "官网微博", url: "http://weibo.com/eostoken" });   
    } else if(key == 'wechat'){
        Clipboard.setString(this.state.wechat);
        EasyToast.show('微信号已复制成功');
    } else if(key == 'qq'){
      Clipboard.setString(this.state.qq);
      EasyToast.show('QQ号已复制成功');
    }else if(key == 'public'){
      Clipboard.setString(this.state.public);
      EasyToast.show('微信公众号已复制成功');
    }else if(key == 'telegraph'){
      Clipboard.setString(this.state.telegraph);
      EasyToast.show('电报群号已复制成功');
    }else if (key == 'source') {
      // navigate('Web', { title: "代码开源地址", url: "https://github.com/eostoken/wallet" });   
      Linking.openURL("https://github.com/eostoken/wallet");
    }
  }
  
  render() {
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>    
          <Header {...this.props} onPressLeft={true} title="ET社区" />
          <Image source={UImage.cmyhead} style={styles.headimg} />
          <View style={{padding: ScreenUtil.autoheight(5),}} >
            <View style={{flexDirection:'row',}}>
              <TouchableHighlight onPress={this.prot.bind(this, 'wechat')} style={{flex: 1, marginRight: ScreenUtil.autowidth(2.5), }} underlayColor={UColor.secdColor}>
                <ImageBackground  style={styles.wechatqq} source={UImage.cmy_wx} resizeMode="stretch">                  
                  <Text style={[styles.textname,{color:UColor.btnColor}]}>官方微信</Text>
                  <Text style={[styles.textlinktwo,{color: UColor.tintnavigation}]}>{this.state.wechat}</Text>           
                </ImageBackground>
              </TouchableHighlight>
              <TouchableHighlight onPress={this.prot.bind(this, 'qq')} style={{flex: 1, marginLeft: ScreenUtil.autowidth(2.5),}} underlayColor={UColor.secdColor}>
                <ImageBackground style={styles.wechatqq} source={UImage.cmy_qq} resizeMode="stretch">          
                  <Text style={[styles.textname,{color:UColor.btnColor}]}>官方QQ</Text>
                  <Text style={[styles.textlinktwo,{color: UColor.tintnavigation}]}>{this.state.qq}</Text>           
                </ImageBackground>  
              </TouchableHighlight>      
            </View>
            <TouchableHighlight onPress={this.prot.bind(this, 'public')} underlayColor={UColor.secdColor}>
              <ImageBackground style={styles.publicout} source={UImage.cmy_gzh} resizeMode="stretch">              
                <Text style={[styles.textname,{color:UColor.btnColor}]}>官方公众号</Text>
                <Text style={[styles.textlinktwo,{color: UColor.tintnavigation}]}>{this.state.public}</Text>     
              </ImageBackground>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.prot.bind(this, 'microblog')} underlayColor={UColor.secdColor}>
              <ImageBackground style={styles.sourceout} source={UImage.cmy_wb} resizeMode="stretch">            
                <Text style={[styles.textname,{color:UColor.btnColor}]}>官方微博</Text>
                <Text style={[styles.textlink,{color: UColor.tintnavigation}]}>weibo.com/eostoken</Text>         
              </ImageBackground>    
            </TouchableHighlight>   
            <TouchableHighlight onPress={this.prot.bind(this, 'telegraph')} underlayColor={UColor.secdColor}>      
              <ImageBackground style={styles.sourceout} source={UImage.cmy_db} resizeMode="stretch">       
                <Text style={[styles.textname,{color:UColor.btnColor}]}>EosToken电报群</Text>
                <Text style={[styles.textlink,{color: UColor.tintnavigation}]}>{this.state.telegraph}</Text>
              </ImageBackground>   
            </TouchableHighlight>
            <TouchableHighlight onPress={this.prot.bind(this, 'source')} underlayColor={UColor.secdColor}>      
              <ImageBackground style={styles.sourceout} source={UImage.cmy_kydz} resizeMode="stretch">       
                <Text style={[styles.textname,{color:UColor.btnColor}]}>代码开源地址</Text>
                <Text style={[styles.textlink,{color: UColor.tintnavigation}]}>{this.state.source}</Text>
              </ImageBackground>   
            </TouchableHighlight>        
          </View>   
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headimg: {
    width: ScreenWidth,
    height: ScreenWidth * 0.2213,
    marginTop: ScreenUtil.autoheight(5),
  },
  texts: {
    alignItems:'center',  
    flexDirection:'row',
    justifyContent:'center',
    height: ScreenUtil.autoheight(35),
    paddingLeft:ScreenUtil.autowidth(20), 
  },
  wechatqq: {
    width: (ScreenWidth - 15) / 2,
    paddingTop: ScreenUtil.autoheight(10),
    height: (ScreenWidth - 15) / 2 * 0.6572,
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  publicout: {
    justifyContent:'center',
    width: ScreenWidth - 10,
    height: (ScreenWidth - 10) * 0.3664,
    marginTop: ScreenUtil.autoheight(5),
    paddingTop: ScreenUtil.autoheight(10),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  sourceout: {
    width: ScreenWidth - 10,
    alignItems: 'flex-start',
    justifyContent: "space-between",
    height: (ScreenWidth - 10) * 0.1444,
    marginTop: ScreenUtil.autoheight(5),
    paddingVertical: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autowidth(10),
  },
  textname: {
    fontSize: ScreenUtil.setSpText(16),
  },
  textlinktwo: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(16),
    paddingTop: ScreenUtil.autoheight(5),
  },
  textlink: {
    textAlign: 'left',
    fontSize: ScreenUtil.setSpText(16),
  }
});

export default Community;
