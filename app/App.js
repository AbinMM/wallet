import React from 'react';
import {StatusBar,Platform,View} from 'react-native';
import Colors from "./utils/Colors";
import Route from "./route/Nav";
import ScreenUtil from "./utils/ScreenUtil";
import {Toast} from './components/Toast';

import {LoadingDialog} from './components/EasyShow'
import { EosProvider } from "react-native-eosjs";
import Constants from './utils/Constants'

const App = () => (
 <View style={{flex:1,paddingBottom: 0,}}>
     {/* <EosProvider server="http://192.168.1.40:8888" />
     */}
    <EosProvider server= {Constants.EosNode} chainId="aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"/>

    <Toast />
    <LoadingDialog />
    {Platform.OS === 'ios' && <StatusBar barStyle="light-content" backgroundColor={Colors.secdColor} />}
    {Platform.OS === 'android' && <StatusBar barStyle="light-content" backgroundColor={Colors.transport} translucent={true} />}
    <Route/>
  </View>
);

export default App;




