import React from 'react';
import {Dimensions, ImageBackground,View,StyleSheet,Text,Image} from 'react-native';
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import Swiper from 'react-native-swiper';
import store from 'react-native-simple-store';
import NavigationUtil from '../utils/NavigationUtil';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

class Boot extends React.Component {
  
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
  }

  comin = () => {
    store.save("boot","1");
    NavigationUtil.reset(this.props.navigation, 'Home');
  }

  render() {
    return (
        <View style={[styles.container,{backgroundColor: UColor.startup}]}>
            <ImageBackground source={UImage.boot_bg} resizeMode="cover" style={{width:ScreenWidth,height:ScreenHeight}}>
                <Swiper loop={false} activeDotColor={UColor.tintColor}>
                    <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                        <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:UColor.btnColor,fontSize:24,textAlign:'center'}}>ET去中心化交易所</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,marginTop:30,textAlign:'center'}}>——链上治理，公开透明</Text>
                            {/* <Text style={{color:UColor.fontColor,fontSize:18,textAlign:'center',marginTop:10}}>去中心化钱包，无第三方留存</Text> */}
                        </View>
                        <View style={{height:'50%',alignItems:'center'}}>
                            <Image source={UImage.a} style={{width:210,height:253,marginTop:50}} />
                        </View>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                        <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:UColor.btnColor,fontSize:24,textAlign:'center'}}>世界的另一头，近在咫尺</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,marginTop:30,textAlign:'center'}}>快速转账，无手续费</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,textAlign:'center',marginTop:10}}>百万级高并发无压力</Text>
                        </View>
                        <View style={{height:'50%',alignItems:'center'}}>
                            <Image source={UImage.b} style={{width:245,height:253,marginTop:50}} />
                        </View>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                        <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:UColor.btnColor,fontSize:24,textAlign:'center'}}>您关心的EOS资讯</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,marginTop:30,textAlign:'center'}}>您最关心的EOS独家情报</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,textAlign:'center',marginTop:10}}>最新、最快、最全面</Text>
                        </View>
                        <View style={{height:'50%',alignItems:'center'}}>
                            <Image source={UImage.c} style={{width:215,height:253,marginTop:50}} />
                        </View>
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                        <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:UColor.btnColor,fontSize:24,textAlign:'center'}}>欢迎使用EosToken</Text>
                            <Text style={{color:UColor.btnColor,fontSize:18,marginTop:30,textAlign:'center'}}>您的EOS数字资产管家</Text>
                        </View>
                        <View style={{height:'50%',alignItems:'center'}}>
                            <Image source={UImage.d} style={{width:215,height:283,marginTop:50}} />
                        </View>
                        <Text onPress={()=>{this.comin()}} style={{color:UColor.btnColor,fontSize:22,width:100,textAlign:"center",position: 'absolute',left: ScreenWidth-100,right: 0,top: ScreenHeight-80,bottom: 0,}}>进入→</Text>
                    </View>
                </Swiper>
            </ImageBackground>
        </View>
    );
  }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        
    }
});  
export default Boot;