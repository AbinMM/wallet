import React, { Component } from 'react';
import { StyleSheet, DeviceEventEmitter, View,} from 'react-native';
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import Barcode from 'react-native-smart-barcode'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";

export default class App extends BaseComponent {

    static navigationOptions = {
        title: '扫码',
        header:null,  
      };
     
    //构造方法
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
            show: false,
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
            coinType: (this.props.navigation.state.params.coinType == null || this.props.navigation.state.params.coinType == "") ? "eos" : this.props.navigation.state.params.coinType,
        };
    }
    componentDidMount() {
        //启动定时器
        this.timer = setTimeout(
            () => this.setState({ viewAppear: true }),
            250
        );
    }
    //组件销毁生命周期
    componentWillUnmount() {
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        //清楚定时器
        this.timer && clearTimeout(this.timer);
    }
    
    _errExit(){
        EasyToast.show('无效的' + this.state.coinType + '二维码');
        this.props.navigation.goBack();
        return;
    }

    activeWallet(data){
        if(data == null || data.action == null || data.action != "activeWallet"){
            return this._errExit();
        }

        var account = data.account;
        var owner = data.owner;
        var active = data.active;
        var cpu = data.cpu;
        var net = data.net;
        var ram = data.ram;
        if(account == null || owner == null || active == null || cpu == null || net == null || ram == null){
            return this._errExit();
        }

        var jsoncode = '{"account":"' + account + '","owner":"' + owner + '","active":"' + active  + '","cpu":"' + cpu  + '","net":"' + net  + '","ram":"' + ram + '"}';
        var jdata = JSON.parse(jsoncode);
        this.props.navigation.goBack();  //正常返回上一个页面

        const { navigate } = this.props.navigation;
        navigate('APactivation', { accountInfo: jdata });
    }

    _onBarCodeRead = (e) => {
        var strQRcode = JSON.stringify(e.nativeEvent.data.code);
        let coinType = strQRcode.match(/token=(\S*)"/)[1]
        this._stopScan();
        try {
            var strcoins = e.nativeEvent.data.code;
            if(strcoins == undefined || strcoins == null){
                return this._errExit();
            }
            try{
                var jActionData = JSON.parse(strcoins);
                if(jActionData != null && jActionData.action != null && jActionData.action == "activeWallet"){
                    this.activeWallet(jActionData);
                    return;            
                }
            }catch(e){

            }
           
            var lowerCointType = coinType.toLowerCase();
            var upperCointType = coinType.toUpperCase();
            var length = strcoins.length;
            var index = strcoins.lastIndexOf(lowerCointType + ':'); //"eos:"
            if (index == 0) {
                index += (lowerCointType.length + 1); //"eos:"
                var point = strcoins.lastIndexOf("?");
                if(point <= index || point >= length){
                    return this._errExit();
                }
                var account = strcoins.substring(index,point);
                if(account == undefined || account == null || account == ""){
                    return this._errExit();
                }

                index = point + 1; //"?"
                var pointamount = strcoins.lastIndexOf("amount=");    
                if(index != pointamount || pointamount >= length){
                    return this._errExit();
                }
                index += 7; //"amount="
                var point2 = strcoins.indexOf("&");    
                if(point2 <= index || point2 >= length){
                    return this._errExit();
                }
                var amount = strcoins.substring(index,point2);
                if(amount == undefined || amount == null){
                    return this._errExit();
                }

                index = point2 + 1 ; //"1&"
                var pointAccount = strcoins.lastIndexOf("contractAccount=");   
                if(index != pointAccount || pointAccount >= length){
                    return this._errExit();
                } 
                index += 16 //"contractAccount="
                var point3 = strcoins.lastIndexOf("&"); 
                var contractAccount = strcoins.substring(index,point3);
                if(contractAccount == null || contractAccount == undefined){
                    return this._errExit();
                }

                index = point3 + 1; //"2&"
                var pointtoken = strcoins.lastIndexOf("token=");   
                if(index != pointtoken || pointtoken >= length){
                    return this._errExit();
                } 
                index += 6; //"token="
                var symbol = strcoins.substring(index,length);
                if(symbol == null || symbol != upperCointType){
                    return this._errExit();
                }

                var jsoncode = '{"toaccount":"' + account + '","amount":"' + amount + '","contractAccount":"' + contractAccount + '","symbol":"' + coinType + '"}';
                var coins = JSON.parse(jsoncode);
                this.props.navigation.goBack();  //正常返回上一个页面

                if(this.state.isTurnOut){
                    DeviceEventEmitter.emit('scan_result',coins);
                }else{
                    const { navigate } = this.props.navigation;
                    navigate('TurnOutAsset', { coins: coins});
                }
                
            } else {
                 //兼容上一版本
                 var coins = JSON.parse(e.nativeEvent.data.code);
                 if (coins.toaccount != null) {
                     coins.name = coins.symbol;
                     this.props.navigation.goBack(); //正常返回上一个页面

                     if(this.state.isTurnOut){
                         DeviceEventEmitter.emit('scan_result',coins);
                     }else{
                         const { navigate } = this.props.navigation;
                         navigate('TurnOutAsset', { coins: coins });
                     }
                 } else {
                    return this._errExit();
                 }
            }
        } catch (error) {
            this._errExit();
        }
    };

    _startScan = (e) => {
        this._barCode.startScan()
    };

    _stopScan = (e) => {
        this._barCode.stopScan()
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header {...this.props} onPressLeft={true} title="扫码" />
                {this.state.viewAppear ?
                    <Barcode style={{ flex: 1, }} ref={component => this._barCode = component}
                        onBarCodeRead={this._onBarCodeRead} />
                    : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
   
});