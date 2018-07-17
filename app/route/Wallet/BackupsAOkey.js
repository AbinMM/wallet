import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableOpacity,Switch,ImageBackground,ProgressViewIOS} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import ViewShot from "react-native-view-shot";
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');

@connect(({wallet}) => ({...wallet}))
class BackupsAOkey extends BaseComponent {
      static navigationOptions = ({ navigation }) => {
       
        return {                       
          headerTitle:'备份私钥',
          headerStyle:{
                  paddingTop:Platform.OS == 'ios' ? 30 : 20,
                  backgroundColor: UColor.mainColor,
                  borderBottomWidth:0,
                },
          headerRight: (<Button  onPress={navigation.state.params.onPress}>  
                <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>跳过</Text>
          </Button>),                  
        };
      };

      _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('WalletManage', {});
      }

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
        password: "",
        ownerPk: '',
        activePk: '',
        show: false,
    };
  }

  importActivation() {
    const { navigate } = this.props.navigation;
    navigate('ActivationAt', {});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }


    render() {
        return (<View style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <View style={styles.header}>
                    <View style={styles.inptoutbg}>
                        <View style={styles.headout}>
                            <Text style={styles.inptitle}>确认你的钱包私钥</Text>
                            <Text style={styles.headtitle}>请填入你所抄写的私钥，确保你填入无误后，按下一步</Text>
                        </View>   
                        <View style={styles.inptoutgo} >
                            <Text style={styles.inptitle}>ActivePrivateKey</Text>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(activePk) => this.setState({ activePk })}   keyboardType="default"
                                placeholder="粘贴或输入私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>
                        <View style={styles.inptoutgo} >
                            <Text style={styles.inptitle}>OwnerPrivateKey</Text>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.ownerPk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(ownerPk) => this.setState({ ownerPk })}   keyboardType="default" 
                                placeholder="粘贴或输入私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>
                    </View>
                    <Button onPress={() => this.importActivation()}>
                        <View style={styles.importPriout}>
                            <Text style={styles.importPritext}>下一步</Text>
                        </View>
                    </Button>
                </View>
            </TouchableOpacity>
         </ScrollView> 
     </View>)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
    },
    scrollView: {

    },
    weltitle: {
        color: UColor.fontColor, 
        fontSize: 15, 
        marginTop: 15, 
        marginLeft: 10
    },
    welcome: {
        color: UColor.arrow,
        marginTop: 5, 
        marginLeft: 10, 
        marginBottom: 25
    },
    backupsout: {
        height: 45, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 20, 
        borderRadius: 5 
    },
    backups:{
        fontSize: 15, 
        color: UColor.fontColor,
    },

    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: ScreenWidth -100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    header: {
        marginTop: 10,
        backgroundColor: UColor.secdColor,
    },
    headout: {
        paddingTop: 40,
        paddingBottom: 30,
    },
    headtitle: {
        color: UColor.arrow,
        fontSize: 14,
        lineHeight: 25,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
    },

    row: {
        flex: 1,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        padding: 20,
        paddingTop: 10,
        justifyContent: "space-between",
    },
    left: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: 'red'
    },
    right: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: 'black'
    },
    incup: {
        fontSize: 12,
        color: UColor.fontColor,
        backgroundColor: '#F25C49',
        padding: 5,
        textAlign: 'center',
        marginLeft: 10,
        borderRadius: 5,
        minWidth: 60,
        maxHeight: 25
    },
    incdo: {
        fontSize: 12,
        color: UColor.fontColor,
        backgroundColor: '#25B36B',
        padding: 5,
        textAlign: 'center',
        marginLeft: 10,
        borderRadius: 5,
        minWidth: 60,
        maxHeight: 25
    },

    inptout: {
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        backgroundColor: UColor.mainColor,
        borderBottomColor: UColor.secdColor,
    },
    inptitle: {
        flex: 1,
        fontSize: 15,
        lineHeight: 30,
        color: UColor.fontColor,
    },
    inpt: {
        height: 50,
        fontSize: 16,
        color: UColor.arrow,
    },
    inptoutgo: {
        paddingBottom: 15,
        backgroundColor: UColor.mainColor,
    },
    inptgo: {
        flex: 1,
        height: 60,
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
        paddingHorizontal: 10,
        textAlignVertical: 'top',
        backgroundColor: UColor.secdColor,
    },

    readout: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    readtext: {
        fontSize: 15,
        color: UColor.tintColor,
    },



    servicetext: {
        fontSize: 14,
        color: UColor.tintColor,
    },

    importPriout: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 50,
        borderRadius: 5,
        backgroundColor:  UColor.tintColor,
    },
    importPritext: {
        fontSize: 15,
        color: UColor.fontColor,
    },

    privatekeytext: {
        fontSize: 15,
        color: UColor.tintColor,
    },
    pupuo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalStyle: {
        width: ScreenWidth - 20,
        backgroundColor: UColor.fontColor,
        borderRadius: 5,
        paddingHorizontal: 25,
    },
    subView: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        marginVertical: 15,
    },
    buttonView: {
        height: 50,
        marginVertical: 10,
        borderRadius: 6,
        backgroundColor: UColor.showy,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttoncols: {
        fontSize: 16,
        color: UColor.fontColor
    },
    titleText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleout: {
        width: 40,
        color: '#CBCBCB',
        fontSize: 28,
        textAlign: 'center',
    },
    contentText: {
        fontSize: 14,
        color: UColor.showy,
        textAlign: 'left',
        marginVertical: 20,
    },
    prompttext: {
        fontSize: 14,
        color: UColor.tintColor,
        marginHorizontal: 5,
    },
    codeout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    copytext: {
        fontSize: 14,
        color: '#808080',
        textAlign: 'left'
    },

});
export default BackupsAOkey;