
import React from 'react';
import { Dimensions, Animated,View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import NavigationUtil from '../utils/NavigationUtil';
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import Constants from '../utils/Constants';
import { connect } from 'react-redux'
import JPush from '../utils/JPush'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({common,login}) => ({...common,...login}))
class Splash extends React.Component {
  
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //推送初始化
    const { navigate } = this.props.navigation;
    JPush.init(navigate);

    var th = this;
    this.props.dispatch({type: 'common/loadBoot',payload:{},callback:function(data){
      if(data==1){
        NavigationUtil.reset(th.props.navigation, 'Home');
      }else{
        NavigationUtil.reset(th.props.navigation, 'Boot');
      }
    }});
    this.props.dispatch({type:'login/getthemeSwitching',callback:(theme)=>{
      if(!theme.theme){  
        //白色版
          UColor.transport= 'rgba(0, 0, 0, 0.0)';
          UColor.mask= 'rgba(0, 0, 0, 0.4)'; //遮罩色 UColor.mask
          UColor.mainColor=  '#FFFFFF'; //主色调 UColor.mainColor
          UColor.secdColor= '#EDEDED'; //副色调 UColor.secdColor
          UColor.tintColor= '#65CAFF'; //字体浅色调 UColor.tintColor
          UColor.blueDeep= '#3baaff'; //蓝背景色 UColor.blueDeep
          UColor.fontColor= '#292F40'; //字体颜色 UColor.fontColor
          UColor.btnColor= '#ffffff'; //按钮字体颜色 UColor.btnColor
          UColor.riceWhite= '#ECECF0'; //米白色 UColor.riceWhite
          UColor.arrow= '#75859f'; //深字体色 UColor.arrow
          UColor.startup= '#21232E'; //启动也背景色 UColor.startup
          UColor.inash= '#4D607E'; // 列表底色 UColor.inash
          UColor.lightgray= '#4c515b'; //浅字体色 UColor.lightgray
          UColor.showy= '#ff6565'; //显眼色调 UColor.showy 
          UColor.baseline= '#cccccc'; //底色调 UColor.baseline
          UColor.blackColor= '#000000'; //纯黑色 UColor.blackColor
          UColor.riseColor= '#F25C49'; //涨卖收色 UColor.riseColor
          UColor.fallColor= '#25B36B'; //跌买出色 UColor.fallColor
          UColor.navigation= '#2279C5'; //顶部标题背景色 UColor.navigation
          UColor.receivables= "#65CAFF";
          UColor.bgEchar= "#ffffff"; // Echar背景色
          UColor.warningRed= "#FF4F4F",//警告字体色彩
          UColor.invalidbtn= "#BFBFBF";
          UColor.mainsecd= "#EDEDED";
          UColor.tintfont= "#65CAFF";
          UColor.titletop= '#2279C5'; //顶部标题背景色 UColor.navigation
          UColor.secdfont= "#FFFFFF";
          UColor.mainfont= "#FFFFFF";
          UColor.tintstart= '#3baaff'; //Loading背景色
          UColor.fonttint= "#FFFFFF";
          UColor.tintnavigation= '#2279C5';
          UColor.fontrice= "#EDEDED";
          UImage.guide=require('../img/day/guide.png');
          UImage.my_community=require('../img/day/my_community.png');
          UImage.account_manage=require('../img/day/account_manage.png');
          UImage.my_help=require('../img/day/my_help.png');
          UImage.my_recovery=require('../img/day/my_recovery.png');
          UImage.my_share=require('../img/day/my_share.png');
          UImage.my_system=require('../img/day/my_system.png');
          UImage.my_wallet=require('../img/day/my_wallet.png');
          UImage.signed=require('../img/day/signed.png');
          UImage.tab_5_h=require('../img/day/tab_5_h.png');
          UImage.tab_5=require('../img/day/tab_5.png');
          UImage.integral_bg=require('../img/day/integral_bg.png');
          UImage.cmy_wx=require('../img/day/cmy_wx.png');
          UImage.cmy_qq=require('../img/day/cmy_qq.png');
          UImage.cmy_gzh=require('../img/day/cmy_gzh.png');
          UImage.cmy_wb=require('../img/day/cmy_wb.png');
          UImage.cmy_db=require('../img/day/cmy_db.png');
          UImage.cmy_kydz=require('../img/day/cmy_kydz.png');
          UImage.cmyhead=require('../img/day/cmyhead.png');
          UImage.up=require('../img/day/up.png');
          UImage.down=require('../img/day/down.png');
          UImage.newscoins=require('../img/day/newscoins.png');
          UImage.home_bg=require('../img/day/home_bg.png');
          UImage.lock=require('../img/day/lock.png');
          UImage.privatekey=require('../img/day/privatekey.png');
          UImage.publickey=require('../img/day/publickey.png');
          UImage.resources_f=require('../img/day/resources_f.png');
          UImage.details=require('../img/day/details.png');
          UImage.adminA=require('../img/day/adminA.png');
          UImage.transactionA=require('../img/day/transactionA.png');
          UImage.transactionB=require('../img/day/transactionB.png');
          UImage.tx_slide0=require('../img/day/tx_slide0.png');
          UImage.tx_slide1=require('../img/day/tx_slide1.png');
          UImage.aab1=require('../img/day/aab1.png');
          UImage.aab2=require('../img/day/aab2.png');
          UImage.share_i=require('../img/day/share_i.png');
          UImage.fav=require('../img/day/fav.png');
          UImage.warning=require('../img/day/warning.png');
          UImage.signln_bg=require('../img/day/signln_bg.png');
          UImage.logo=require('../img/day/logo1.png');
          UImage.coinsbg1=require('../img/day/coinsbg1.png');
          UImage.coinsbg2=require('../img/day/coinsbg2.png');
          UImage.add= require('../img/day/add.png');
          UImage.qr= require('../img/day/qr.png');
          UImage.transfer= require('../img/day/transfer.png');
          UImage.resources= require('../img/day/resources.png');
          UImage.line_bg= require('../img/day/line_bg.png');
          UImage.more= require('../img/day/more.png');
          UImage.tokenissue= require('../img/day/tokenissue.png');
          UImage.vote_node= require('../img/day/vote_node.png');
          UImage.candy= require('../img/day/candy.png');
          UImage.free_mortgage= require('../img/day/free_mortgage.png');
          UImage.navigation= require('../img/day/navigation.png');
          UImage.tab_1= require('../img/day/tab_1.png');
          UImage.tab_2= require('../img/day/tab_2.png');
          UImage.tab_3= require('../img/day/tab_3.png');
          UImage.tab_4= require('../img/day/tab_4.png');
          UImage.tab_5= require('../img/day/tab_5.png');
          UImage.tab_5_h= require('../img/day/tab_5_h.png');
          UImage.add_h= require('../img//day/add_h.png');
          UImage.qr_h= require('../img//day/qr_h.png');
          UImage.transfer_h= require('../img/day/transfer_h.png');
          UImage.resources_h= require('../img/day/resources_h.png');
          UImage.more_h= require('../img//day/more_h.png');
          UImage.votea_bj= require('../img/day/votea_bj.png');
          UImage.votec_bj= require('../img/day/votec_bj.png');
          UImage.scan= require('../img/day/scan.png');
          UImage.authExchangeBlue= require('../img/day/authExchangeBlue.png');
      }else{
        //黑色版
          UColor.transport= 'rgba(0, 0, 0, 0.0)';
          UColor.mask= 'rgba(0, 0, 0, 0.4)'; //遮罩色 UColor.mask
          UColor.mainColor=  '#4e5e7d'; //主色调 UColor.mainColor
          UColor.secdColor= '#43536D'; //副色调 UColor.secdColor
          UColor.tintColor= '#65CAFF'; //字体浅色调 UColor.tintColor
          UColor.blueDeep= '#3baaff'; //蓝背景色 UColor.blueDeep
          UColor.fontColor= '#ffffff'; //字体颜色 UColor.fontColor
          UColor.btnColor= '#ffffff'; //按钮字体颜色 UColor.btnColor
          UColor.riceWhite= '#ECECF0'; //米白色 UColor.riceWhite
          UColor.arrow= '#8696B0'; //深字体色 UColor.arrow
          UColor.startup= '#21232E'; //启动也背景色 UColor.startup
          UColor.inash= '#4D607E'; // 列表底色 UColor.inash
          UColor.lightgray= '#abb9d7'; //浅字体色 UColor.lightgray
          UColor.showy= '#ff6565'; //显眼色调 UColor.showy 
          UColor.baseline= '#cccccc'; //底色调 UColor.baseline
          UColor.blackColor= '#000000'; //纯黑色 UColor.blackColor
          UColor.riseColor= '#F25C49'; //涨卖收色 UColor.riseColor
          UColor.fallColor= '#25B36B'; //跌买出色 UColor.fallColor
          UColor.navigation= '#43536D'; //顶部标题背景色 UColor.navigation
          UColor.receivables= '#43536D';
          UColor.bgEchar= "#2f3b50"; // Echar背景色
          UColor.warningRed= "#FF4F4F",//警告字体色彩
          UColor.invalidbtn= '#4e5e7d', //按钮默认颜色 UColor.invalidbtn
          UColor.mainsecd= "#4e5e7d",
          UColor.tintfont= "#FFFFFF",
          UColor.titletop= '#4e5e7d'; //顶部标题背景色 UColor.navigation
          UColor.secdfont= "#43536D";
          UColor.mainfont= '#4e5e7d';
          UColor.tintstart= '#21232E'; //Loading背景色
          UColor.fonttint= "#65CAFF";
          UColor.tintnavigation= "#65CAFF";
          UColor.fontrice= "#FFFFFF";
          UImage.tab_1= require('../img/tab_1.png');
          UImage.tab_2= require('../img/tab_2.png');
          UImage.tab_3= require('../img/tab_3.png');
          UImage.tab_4= require('../img/tab_4.png');
          UImage.tab_5= require('../img/tab_5.png');
          UImage.tab_5_h= require('../img/tab_5_h.png');
      }
    }});
  }

  render() {
    return (
      <View style={{backgroundColor: UColor.secdColor}}/>
    );
  }
}

export default Splash;