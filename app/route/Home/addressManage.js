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

import CheckMarkCircle from '../../components/CheckMarkCircle'
import TextButton from '../../components/TextButton';
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
            addressBook:[],
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
        this.getAddressBook();
    }

    getAddressBook(){
        this.props.dispatch({ type: 'addressBook/addressInfo',callback:(resp)=>{
            if(resp){
                var result = new Array();
                for(var i=0;i<resp.length;i++){
                    var elemnt = resp[i];
                    elemnt.isChecked = false;

                    result[i] = elemnt;
                }
                this.setState({addressBook:result});
            }
        }
     });
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

    selectedClick = (choose) => { 
        if(choose)
        {
            //确认选择
            this.props.navigation.goBack();  //正常返回上一个页面
            if(this.props.navigation.state.params.callback){
                var resp = new Array();
                var index = 0;
                for(var i = 0;i < this.state.addressBook.length;i++)
                {
                    if(this.state.addressBook[i].isChecked){
                        resp[index] = this.state.addressBook[i];
                    }
                }
                this.props.navigation.state.params.callback(resp);
            }
        }else{
            //跳转到 新
            const { navigate } = this.props.navigation;
            navigate('addressCreate', {callback:((resp)=>{
                if(resp && resp.address)
                {
                    var obj_resp = resp;

                    var result = this.state.addressBook;
                    for(var i = 0;i < result.length;i++)
                    {
                        if(obj_resp.address == result[i].address){
                            break;
                        }
                    }
                    if(i >= result.length)
                    {   //新创建加入
                        obj_resp.isChecked = false;
                        result[result.length] = obj_resp;

                        this.setState({addressBook:result});
                    }
                }
            })});
        }
    };

    deleteItem = () => { // 删除地址
        let {selectMap} = this.state;
        // let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/delAddress', payload: { keyArr: keyArr},callback: (data) => {
            this.getAddressBook();
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

    checkClick(rowData,sectionID, rowID) {
        let tmparray = this.state.addressBook;
        tmparray[rowID].isChecked = !tmparray[rowID].isChecked;
        this.setState({
            addressBook: tmparray
        });

      }
    render() {
        let temp = [...this.state.selectMap.values()];
        let isChecked = temp.length === this.state.dataSource._cachedRowCount;
        console.log(temp, '......')
        return (
            <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
                <Header {...this.props} onPressLeft={true} title="联系人" subName={this.state.isShowSelect == false ?"选择":"取消"} onPressRight={this.btnRightSelect.bind(this)} imgWidth={ScreenUtil.autowidth(18)} imgHeight={ScreenUtil.autowidth(18)}/>
                <View style={styles.tablayout}>
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
                        onEndReached={() => this.onEndReached()}
                        dataSource={this.state.dataSource.cloneWithRows((this.state.addressBook == null ? [] : this.state.addressBook))} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                            <View style={styles.top}>
                                {this.state.isShowSelect == true &&
                                <View style={{paddingRight: ScreenUtil.autowidth(18),}}>
                                    <CheckMarkCircle selected={rowData.isChecked} width={ScreenUtil.autowidth(13)} height={ScreenUtil.autowidth(13)} onPress={() => {this.checkClick(rowData,sectionID, rowID);}}/>
                                </View>
                                }
                                <View style={styles.timequantity}>
                                    <Text style={[styles.quantity,{color: '#323232'}]}>{rowData.labelName}</Text>
                                    <Text style={[styles.timetext,{color: '#808080'}]}>{rowData.address}</Text>
                                </View>
                                <View style={styles.typedescription}>
                                    <Ionicons name="ios-arrow-forward-outline" size={ScreenUtil.autowidth(20)} color='#B5B5B5' />
                                </View>
                            </View>
                        )}                
                    /> 
                </View>
                
                
                <View style={[styles.footer,{backgroundColor:'#FAFAF9'}]}>
                    <View style={{paddingBottom: ScreenUtil.autowidth(20), alignItems: 'center',justifyContent: 'center',}}>
                        <TextButton onPress={this.selectedClick.bind(this,this.state.isShowSelect)} textColor="#FFFFFF" text={this.state.isShowSelect ? "确认" : "新建联系人"}  shadow={true} style={{width: ScreenUtil.autowidth(175), height: ScreenUtil.autowidth(42),borderRadius: 25}} />
                    </View>
                </View>
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
        width: ScreenWidth - ScreenUtil.autowidth(30),
        backgroundColor:'#FFFFFF',
        borderRadius: 6,
        paddingVertical: ScreenUtil.autowidth(15),
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
        justifyContent: 'center',
        paddingVertical: ScreenUtil.autoheight(15),
        paddingHorizontal: ScreenUtil.autowidth(15),
    },  

    top: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        borderBottomColor: '#F9FAF9',
        borderBottomWidth: ScreenUtil.autoheight(1), 
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    timequantity: {
        flex: 1,
        flexDirection: "column",
        alignItems: 'flex-start',
        justifyContent: "space-between",
    },
    timetext: {
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(10),
        lineHeight:  ScreenUtil.autoheight(14),
    },
    quantity: {
        fontWeight: '600',
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(16),
        lineHeight: ScreenUtil.autoheight(23),
    },

    typedescription: {
        alignItems: 'flex-end',
        flexDirection: "column",
        justifyContent: "space-around",
        height: ScreenUtil.autoheight(50),
    },

    footer:{
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center', 
        position:'absolute',
        height: ScreenUtil.autoheight(62),   
        paddingTop: ScreenUtil.autoheight(1),
      },
})

export default addressManage;