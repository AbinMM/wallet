import React from 'react';
import { StyleSheet, View, } from 'react-native';
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import BaseComponent from "../../components/BaseComponent";
import WalletWelcome from '../Wallet/WalletWelcome'

class createWalletWelcome extends BaseComponent {
    
    static navigationOptions =  {
        headerTitle: '创建钱包',
        header:null,
    };

    constructor(props) {
        super(props);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    render() {
        return (
        <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="创建钱包" />
                <WalletWelcome {...this.props}/>        
        </View>)
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    
});

export default createWalletWelcome;
