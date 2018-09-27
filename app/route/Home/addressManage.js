/**
 * Created by zhuang.haipeng on 2017/9/12.
 */
import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,ListView,StyleSheet,Image,View,Text, TextInput,Dimensions,Modal,TouchableOpacity,} from 'react-native';
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
            isShowBottom: false,
            selectMap: new Map(),
            labelName:'',
            address:'',
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
            coinType: (this.props.navigation.state.params.coinType == null || this.props.navigation.state.params.coinType == "") ? "eos" : this.props.navigation.state.params.coinType,
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    newlyAddedClick() {  
        //   console.log('右侧按钮点击了');  
        this._setModalVisible();  
    }  
    
       // 显示/隐藏 modal  
    _setModalVisible() { 
        this.state.labelName = ''; 
        this.state.address = '';
        let isShow = this.state.show;  
        this.setState({  
          show:!isShow,  
        });  
    }  

    verifyAccount(obj){
        var ret = true;
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        if(obj == "" || obj.length > 12){
            return false;
        }
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }

            if(j >= charmap.length){
                //非法字符
                // obj = obj.replace(tmp, ""); 
                ret = false;
                break;
            }
        }
        return ret;
    }

    chkAccount(obj) {
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }
            if(j >= charmap.length){
                //非法字符
                obj = obj.replace(tmp, ""); 
                EasyToast.show('请输入正确的账号');
            }
        }
        // if (obj == this.props.defaultWallet.account) {
        //     EasyToast.show('收款账户和转出账户不能相同，请重输');
        //     obj = "";
        // }
        return obj;
    }

    componentDidMount() {
        // this.setState({
        //     dataSource: this.state.dataSource.cloneWithRows(collectionArray)
        // })
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});

        DeviceEventEmitter.addListener('scan_result', (data) => {
            if(data && data.toaccount){
                if(this.verifyAccount(data.toaccount)){
                    this.setState({address:data.toaccount,show:true});
                }else{
                    EasyToast.show('请输入正确的账号');
                }
            }
        });

    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    confirm() {
        if (this.state.labelName == "") {
            EasyToast.show('请输入标签名称');
            return;
          }
        if (this.state.address == "") {
            EasyToast.show('请输入收款人地址');
            return;
        }
        try {
            EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'addressBook/saveAddress', payload: { address: this.state.address, labelName: this.state.labelName }, callback: (data) => {
                EasyShowLD.loadingClose();
                this._setModalVisible();
            } });
        } catch (error) {
            EasyShowLD.loadingClose();
        }
    }

    selectAddress(selectAccount){
        var jsoncode = '{"toaccount":"' + selectAccount + '","symbol":"' + this.state.coinType + '"}';
        var coins = JSON.parse(jsoncode);
        this.props.navigation.goBack();  //正常返回上一个页面
        if(this.state.isTurnOut){
            DeviceEventEmitter.emit('transfer_scan_result',coins);
        }else{
            const { navigate } = this.props.navigation;
            navigate('TurnOut', { coins: coins });
        }
        console.log("selectAddress:%s",selectAccount);
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    renderRow = (rowData, sectionID, rowID) => { // cell样式
        let map = this.state.selectMap;
        let isChecked = map.has(parseInt(rowID))
        // 选中的时候, 判断上一个索引不等于rowID的时候,不让他选中   **** 单选逻辑 ****
        // let isChecked = parseInt(rowID) == this.state.preIndex ?  map.has(parseInt(rowID)) : false; // 将rowID转成Int,然后将Int类型的ID当做Key传给Map
        return (
            <View style={styles.selectout}>
               {this.state.isEdit ? 
               <TouchableOpacity style={[styles.touchSelect,{backgroundColor: UColor.secdColor}]} onPress={() => this.selectItem(parseInt(rowID), rowData.labelName, isChecked)}>
                    <Image source={isChecked ? UImage.aab1:UImage.aab2} style={styles.selectoutimg}/>
                </TouchableOpacity> : null}
                <Button  onPress={this.state.isEdit ?null:this.selectAddress.bind(this,rowData.address)}>
                    <View style={[styles.selout,{backgroundColor: UColor.mainColor,borderColor: UColor.mainColor}]}>
                        <Text style={[styles.outlabelname,{color: UColor.fontColor}]}>{"标签:"+rowData.labelName}</Text>
                        <Text style={[styles.outaddress,{color: UColor.arrow}]}>{"账号:"+rowData.address}</Text>
                    </View>
                </Button>    
           </View>
        )
    }

    scan() {
        if (this.state.labelName == "") {
            EasyToast.show('请输入标签名称');
            return;
        }
        this.setState({show:false});  
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.coinType});
    }

    editClick = () => { // 管理地址
        this.setState({
            isEdit: !this.state.isEdit,
            selectMap: new Map()
        }, () => {
            this.setState({
                isShowBottom: this.state.isEdit ? true : false
            })
        })    
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});   
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

    render() {
        let temp = [...this.state.selectMap.values()];
        let isChecked = temp.length === this.state.dataSource._cachedRowCount;
        console.log(temp, '......')
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="联系人" />
                <ListView renderRow={this.renderRow}  
                enableEmptySections = {true}  
                dataSource={this.state.dataSource.cloneWithRows((this.props.addressBook == null ? [] : this.props.addressBook))}> 
                </ListView> 

                { this.state.isShowBottom == false ? 
                <View style={[styles.replace,{backgroundColor: UColor.secdColor}]}>
                    <TouchableOpacity onPress={this.newlyAddedClick.bind(this)} style={[styles.added,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>新增地址</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.editClick(this)} style={[styles.editClickout,{backgroundColor: UColor.tintColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>管理地址</Text>
                    </TouchableOpacity>                 
                </View> : null
                }             
                { this.state.isShowBottom == true ? 
                <View style={[styles.alternate,{backgroundColor: UColor.secdColor}]}>                         
                    <TouchableOpacity onPress={() => this.deleteItem(this)} style={[styles.deleteItemout,{backgroundColor: UColor.riseColor}]}>
                        <Text style={[styles.address,{color:UColor.btnColor}]}>删除地址</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => this.editClick(this)} style={[styles.completeout,{backgroundColor: UColor.tintColor}]}>                              
                        <Text style={[styles.address,{color:UColor.btnColor}]}>完成</Text>
                    </TouchableOpacity> */}
                </View> : null
                }
                <View style={{backgroundColor: UColor.riceWhite}}>  
                    <Modal  animationType='slide'  transparent={true}  visible={this.state.show}  onShow={() => {}}  onRequestClose={() => {}} >  
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={[styles.modalStyle,{backgroundColor: UColor.mask}]}>   
                                <View style={[styles.subView,{backgroundColor: UColor.btnColor}]} >  
                                    <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>  
                                        <Text style={[styles.buttoncols,{color: UColor.baseline}]}>×</Text>                                          
                                    </Button>  
                                    <Text style={styles.titleText}>添加地址</Text> 
                                    <View style={[styles.inptout,{backgroundColor: UColor.riceWhite}]} >
                                        <TextInput onChangeText={(labelName) => this.setState({ labelName })} returnKeyType="next" maxLength = {20}
                                        selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip}
                                        placeholder="输入标签名称" underlineColorAndroid="transparent" value={this.state.labelName} />
                                    </View>    
                                    <View style={[styles.inptoutsource,{backgroundColor: UColor.riceWhite}]}>
                                        <View style={styles.accountoue} >
                                            <TextInput onChangeText={(address) => this.setState({ address: this.chkAccount(address) })} returnKeyType="next" maxLength = {12}
                                            selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.arrow}]} placeholderTextColor={UColor.inputtip}
                                            placeholder="输入账户名称" underlineColorAndroid="transparent"  value={this.state.address}/>
                                        </View>    
                                        <View style={styles.scanning}>
                                            <Button onPress={() => this.scan()}>                                  
                                                <Image source={UImage.account_scan} style={styles.scanningimg} />                                 
                                            </Button>
                                        </View>                           
                                    </View>  

                                    <Button onPress={() => this.confirm(this) }>
                                        <View style={[styles.conout,{backgroundColor: UColor.tintColor}]}>
                                            <Text style={[styles.context,{color: UColor.btnColor}]}>确认</Text>
                                        </View>
                                    </Button>
                                </View>  
                            </TouchableOpacity>
                        </Modal>  
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
    deleteItemout: {
        borderRadius: 5,
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        margin: ScreenUtil.autowidth(10),
    },
    completeout: {
        borderRadius: 5,
        flexDirection:'row',
        alignItems: 'center',
        width: ScreenWidth - 20,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        margin: ScreenUtil.autowidth(10),
    },
    modalStyle: {  
        flex:1,  
        alignItems: 'center',  
        justifyContent:'center',  
    }, 
    buttonView:{  
        alignItems: 'flex-end', 
    },  
    buttoncols: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
        fontSize: ScreenUtil.setSpText(28),
    },
    subView:{  
        borderRadius: 10,  
        width:ScreenWidth-20,
        alignSelf: 'stretch',  
        justifyContent:'center',
        marginHorizontal: ScreenUtil.autowidth(10),  
    },  
    titleText:{   
        fontWeight:'bold',  
        textAlign:'center',  
        fontSize: ScreenUtil.setSpText(18),  
        marginBottom: ScreenUtil.autoheight(10),  
    }, 
    inptout: {
        width:ScreenWidth-40,
        justifyContent: 'center',
        height: ScreenUtil.autoheight(40),
        marginBottom: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(10),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    inpt: {
        height: ScreenUtil.autoheight(40),
        fontSize: ScreenUtil.setSpText(14),
        paddingLeft: ScreenUtil.autowidth(2),
    },
    conout: {
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(40),
    },
    context: {
        fontSize: ScreenUtil.setSpText(16), 
    },
    inptoutsource: {
        width:ScreenWidth-40,
        flexDirection: 'row',
        height: ScreenUtil.autoheight(40),
        marginBottom: ScreenUtil.autoheight(10),
        marginHorizontal: ScreenUtil.autowidth(10),
    },
    accountoue: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'center',
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    scanning: {
        alignSelf: 'center',
        flexDirection: "row",
        justifyContent: "center",
        width: ScreenUtil.autowidth(50),
    },
    scanningimg: {
        width: ScreenUtil.autowidth(25),
        height: ScreenUtil.autowidth(25),
    },
})

export default addressManage;