import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,ListView,StyleSheet,Image,View,Text, Switch,Dimensions,TouchableHighlight,Modal,TouchableOpacity,ScrollView} from 'react-native';
import UImage from '../../utils/Img'
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;


import Ionicons from 'react-native-vector-icons/Ionicons'
@connect(({addressBook}) => ({...addressBook}))
class addressManage extends BaseComponent {

    static navigationOptions = {
        title: '联系人',  
        header:null, 
    };

    // 构造函数  
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            show:false,
            dataSource: ds.cloneWithRows([]),
            isEdit: false,
            isChecked: false,
            isAllSelect: false,
            isShowSelect: false, //新建联系人
            selectMap: new Map(),
            labelName:'',
            address:'',
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
            coinType: (this.props.navigation.state.params.coinType == null || this.props.navigation.state.params.coinType == "") ? "eos" : this.props.navigation.state.params.coinType,
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
   
    }

    componentDidMount() {
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    selectAddress(selectAccount){
        var jsoncode = '{"toaccount":"' + selectAccount + '","symbol":"' + this.state.coinType + '"}';
        var coins = JSON.parse(jsoncode);
        this.props.navigation.goBack();  //正常返回上一个页面
        if(this.state.isTurnOut){
            DeviceEventEmitter.emit('transfer_scan_result',coins);
        }else{
            const { navigate } = this.props.navigation;
            navigate('TurnOutAsset', { coins: coins });
        }
    }

    createAddr = () => { 
        //跳转到 新
        const { navigate } = this.props.navigation;
        navigate('addressCreate', {callback:(()=>{
            this.props.dispatch({ type: 'addressBook/addressInfo'});
        })});
    };

    selectedClick = () => { 

        //确认选择
        this.props.navigation.goBack();  //正常返回上一个页面
    };

    deleteItem = () => { // 删除地址
        let {selectMap} = this.state;
        // let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/delAddress', payload: { keyArr: keyArr},callback: (data) => {
            this.props.dispatch({ type: 'addressBook/addressInfo'});   
        }});
    };

    // allSelect = (isChecked) => { // 全选
    //     this.setState({
    //         isAllSelect: !isChecked
    //     });
    //     if (isChecked) { // 如果已经勾选了,则取消选中
    //         let {selectMap} = this.state;
    //         selectMap = new Map();
    //         this.setState({selectMap})
    //     } else { // 没有勾选的, 全部勾选
    //         let newMap = new Map();
    //         for (let key = 0; key < collectionArray.length; key++) {
    //             let value = collectionArray[key].collectItem; // 拿到数组的collectItem
    //             newMap.set(key, value) // 第一个key, 第二个是value
    //         }
    //         this.setState({selectMap: newMap})
    //     }
    // }

    selectItem = (key, value, isChecked) => { // 单选
        this.setState({
            isChecked: !this.state.isChecked,
            // preIndex: key  //  **** 单选逻辑 ****
        }, () => {
            let map = this.state.selectMap;
            if (isChecked) {
                map.delete(key, value) // 再次点击的时候,将map对应的key,value删除
            } else {
                // map = new Map() // ------>   **** 单选逻辑 ****
                map.set(key, value) // 勾选的时候,重置一下map的key和value
            }
            this.setState({selectMap: map})
        })
    }

    btnRightSelect() { 
         //选择
         let isShow = this.state.isShowSelect;  
         if(isShow == false){
             //选择
         }else{
             //取消
             this.props.navigation.goBack();  //正常返回上一个页面
         }
 
         this.setState({  
             isShowSelect:!isShow,  
         });  
    }

    onEndReached(){
        this.props.dispatch({ type: 'addressBook/addressInfo'});
    }

    checkClick() {
        // this.setState({
        //   isChecked: !this.state.isChecked
        // });
      }
    render() {
        let temp = [...this.state.selectMap.values()];
        let isChecked = temp.length === this.state.dataSource._cachedRowCount;
        console.log(temp, '......')
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="联系人" subName={this.state.isShowSelect == false ?"选择":"取消"} onPressRight={this.btnRightSelect.bind(this)} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
            <ScrollView  keyboardShouldPersistTaps="always">
            <View style={styles.btn}>
               <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
                    onEndReached={() => this.onEndReached()}
                    dataSource={this.state.dataSource.cloneWithRows((this.props.addressBook == null ? [] : this.props.addressBook))} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    
                        <View style={styles.top}>
                        <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                            <View style={[{width: ScreenUtil.autowidth(12), height: ScreenUtil.autowidth(12),marginRight: ScreenUtil.autowidth(5), marginTop: ScreenUtil.autowidth(10), borderColor: this.state.isChecked?UColor.tintColor:UColor.arrow,borderRadius: 25,borderWidth: 0.5,backgroundColor:this.state.isChecked?UColor.tintColor:UColor.mainColor}]}/>
                        </TouchableHighlight>
                            <View style={styles.timequantity}>
                                <Text style={[styles.quantity,{color: UColor.fontColor}]}>{rowData.labelName}</Text>
                                <Text style={[styles.timetext,{color: UColor.arrow}]}>{rowData.address}</Text>
                            </View>
                            <View style={styles.typedescription}>
                                <Ionicons name="ios-arrow-forward-outline" size={ScreenUtil.autowidth(20)} color='#B5B5B5' />
                            </View>
                        </View>
                   )}                
                 /> 
                </View>

                { this.state.isShowSelect == false ? 
                <View style={[styles.replace,{backgroundColor: UColor.secdColor}]}>
                    <TouchableOpacity onPress={() => this.createAddr(this)} style={[styles.editClickout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>新建联系人</Text>
                    </TouchableOpacity>                 
                </View> : null
                }             
                { this.state.isShowSelect == true ? 
                <View style={[styles.replace,{backgroundColor: UColor.secdColor}]}>
                    <TouchableOpacity onPress={() => this.selectedClick(this)} style={[styles.editClickout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>确定</Text>
                    </TouchableOpacity>                 
                </View> : null
                }   
                   
            </ScrollView>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    selectout: {
        flex: 1,
        flexDirection: "row",
    },
    selectouttou: {
        position:'absolute',
        left: ScreenUtil.autowidth(3),
    },
    selectoutimg: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
        marginTop: ScreenUtil.autoheight(10),
    },
    touchSelect:{ 
        alignItems: "center", 
        justifyContent: 'center', 
        width: ScreenUtil.autowidth(60), 
        height: ScreenUtil.autowidth(60), 
    },
    selout: {
        borderWidth: 1,
        borderRadius: 5,
        width: ScreenWidth-20,
        alignItems: "flex-start",
        justifyContent: 'center',
        height: ScreenUtil.autoheight(60),
        marginTop: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(10),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    outlabelname:{
        fontSize: ScreenUtil.setSpText(15),
    },
    outaddress: {
        fontSize: ScreenUtil.setSpText(15),
    },
    container: {
        flex: 1,
    },
    replace: {
        width: ScreenWidth,
        alignItems: "center",
        flexDirection: 'column',
        justifyContent: "space-between",
    },
    alternate: {
        width: ScreenWidth,
        alignItems: "center",
        flexDirection: 'column',
        justifyContent: "space-between",
    },
    added: {
        borderRadius: 5,
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(45),
    },
    address: {
        fontSize: ScreenUtil.setSpText(17),
    },
    editClickout: {
        borderRadius: 5,
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(45),
    },


    tab: {
        flex: 1,
        top:ScreenUtil.autoheight(12),
        marginLeft:ScreenUtil.autowidth(10),
        marginRight:ScreenUtil.autowidth(10),
        backgroundColor:UColor.mainColor,
    },
    btn: {
        flex: 1,
        paddingBottom: ScreenUtil.autoheight(50),
    },

    latelytext: {
        fontSize: ScreenUtil.setSpText(14),
        
       
    },

    tabbutton: {  
        flex: 1,
        
        alignItems: 'center',   
        justifyContent: 'center', 
        height: ScreenUtil.autoheight(33),
    },  
   
    tabText: {  
        fontSize: ScreenUtil.setSpText(14),
    }, 
    tablayout: {   
        alignItems: 'center',
        flexDirection: 'row',  
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },  

  top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        marginLeft:ScreenUtil.autowidth(10),
        marginRight:ScreenUtil.autowidth(10),
    },
    timequantity: {
        flex: 4,
        flexDirection: "column",
        alignItems: 'flex-start',
        justifyContent: "space-between",
        height: ScreenUtil.autoheight(40),
    },
    timetext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(10),
    },
    quantity: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(14),
    },

    typedescription: {
        flex: 2,
        alignItems: 'flex-end',
        flexDirection: "column",
        justifyContent: "space-around",
        height: ScreenUtil.autoheight(50),
    },
})

export default addressManage;