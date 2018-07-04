import Request from '../utils/RequestUtil';
import { address, getAccountsByPuk, getActions, getintegral } from '../utils/Api';
import { EasyToast } from '../components/Toast';
import { EasyLoading } from '../components/Loading';
import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import { DeviceEventEmitter } from 'react-native';
import { Eos } from "react-native-eosjs";
import { createAccount, pushTransaction, getBalance, getInfo } from '../utils/Api';
import { pay } from 'react-native-wechat';
import JPushModule from 'jpush-react-native';

export default {
    namespace: 'wallet',
    state: {
        list: [],
        total: {},
        totalOpt: {},
        Details: []
    },
    effects: {
        *info({ payload, callback }, { call, put }) {
            var list = [];
            var totalOpt;
            var total;
            try {
                //获取数据
                const resp = yield call(Request.request, address, 'get');

                //解析数据
                if (resp.code == "0") {
                    let i = 0;
                    resp.data.coins.forEach(element => {
                        var other = new Object();
                        other.name = "其他";
                        other.value = resp.data.money - element.value;
                        var current = new Object();
                        current.name = element.name;
                        current.value = element.value;
                        element.opt = {
                            series: [
                                {
                                    name: '资产',
                                    type: 'pie',
                                    radius: [
                                        '65%', '80%'
                                    ],
                                    avoidLabelOverlap: false,
                                    hoverAnimation: false,
                                    label: {
                                        normal: {
                                            show: false
                                        },
                                        emphasis: {
                                            show: false
                                        }
                                    },
                                    labelLine: {
                                        normal: {
                                            show: false
                                        }
                                    },
                                    data: [
                                        current, other
                                    ],
                                    color: [resp.data.colors[i], '#708090']
                                }
                            ]
                        }
                        i++;
                        list.push(element);
                    });

                    totalOpt = {
                        series: [
                            {
                                name: '资产',
                                type: 'pie',
                                radius: [
                                    '98%', '100%'
                                ],
                                avoidLabelOverlap: false,
                                hoverAnimation: false,
                                label: {
                                    normal: {
                                        show: false
                                    },
                                    emphasis: {
                                        show: false
                                    }
                                },
                                labelLine: {
                                    normal: {
                                        show: false
                                    }
                                },
                                data: resp.data.coins,
                                color: resp.data.colors
                            }
                        ]
                    }
                    total = resp.data;
                } else {
                    EasyToast.show(resp.msg);
                }

            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }

            var walletList = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            // if (walletList == null || defaultWallet == null) {
            //     // walletList = [];
            //     return;
            // }

            yield put({ type: 'update', payload: { list, totalOpt, total, walletList: walletList, defaultWallet: defaultWallet } });
            DeviceEventEmitter.emit('wallet_info');
            if (callback) callback();
        },
        *saveWallet({ wallet, callback }, { call, put }) {

            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                DeviceEventEmitter.emit('wallet_10');
                return;
            }
            // if (defaultWallet != null && defaultWallet.account != null) {
            //     if (callback) callback({ error: '暂时只能注册一个账号' });
            //     DeviceEventEmitter.emit('wallet_10');
            //     return;
            // }
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == wallet.account) {
                    if(walletArr[i].isactived || !walletArr[i].hasOwnProperty('isactived') ){
                        if (callback) callback({}, error);
                        return;
                    }else if(wallet.isactived){
                        //激活账号，修改激活状态
                        walletArr[i].isactived = true;
                        yield call(store.save, 'walletArr', walletArr);
                        yield call(store.save, 'defaultWallet', walletArr[i]);
                        yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: defaultWallet} });
                        DeviceEventEmitter.emit('updateDefaultWallet', {});
                        if (callback) callback(_wallet,null);
                        return;
                    }
                   
                }
            }

            var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.ownerPrivate, wallet.password + wallet.salt);
            var _activePrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.activePrivate, wallet.password + wallet.salt);
            var _words = CryptoJS.AES.encrypt('eostoken' + wallet.data.words, wallet.password + wallet.salt);
            var _words_active = CryptoJS.AES.encrypt('eostoken' + wallet.data.words_active, wallet.password + wallet.salt);

            var _wallet = {
                name: wallet.name,
                account: wallet.name,
                ownerPublic: wallet.data.ownerPublic,
                activePublic: wallet.data.activePublic,
                ownerPrivate: _ownerPrivate.toString(),
                activePrivate: _activePrivate.toString(),
                words: _words.toString(),
                words_active: _words_active.toString(),
                salt: wallet.salt,
                isactived: wallet.isactived,
                isBackups: false
            }

            // walletArr[walletArr.length] = _wallet;
            // yield call(store.save, 'walletArr', walletArr);
            // yield call(store.save, 'defaultWallet', _wallet);
            // yield put({ type: 'updateAction', payload: { data: _wallet, ...payload } });
            // if (wallet.obj.method == 'eosjs_create_key') {
            // DeviceEventEmitter.emit('key_created', { wallet: _wallet, privateKey: wallet.ownerPrivate });
            // // Eos.createAccount("eosio", wallet.ownerPrivate, wallet.name, wallet.ownerPublic, wallet.activePublic, (r) => {

            walletArr[walletArr.length] = _wallet;


            yield call(store.save, 'walletArr', walletArr);
            DeviceEventEmitter.emit('key_created');
            if(wallet.isactived){
                yield call(store.save, 'defaultWallet', _wallet);
            }
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: _wallet } });
            // DeviceEventEmitter.emit('wallet_backup', _wallet);
            JPushModule.addTags([_wallet.name], map => {

            })
            DeviceEventEmitter.emit('updateDefaultWallet', {});
            if (callback) callback(_wallet,null);
        },
        *saveWalletList({ walletList, callback }, { call, put }) {
            // alert(" --- "+walletList);
            if(walletList == null || walletList.length == 0){
                return;
            }

            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                DeviceEventEmitter.emit('wallet_10');
                return;
            }

            for(var j = 0; j < walletList.length; j++){
                if(walletArr.length >= 10){
                    break;
                }
                var wallet = walletList[j];
                for (var i = 0; i < walletArr.length; i++) {
                    if (walletArr[i].account == wallet.account) {
                        // if(walletArr[i].isactived || !walletArr[i].hasOwnProperty('isactived') ){
                        //     break;
                        // }
                        if (callback) callback({error: wallet.account + "已存在"});
                        return;
                    }
                }

                var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.ownerPrivate, wallet.password + wallet.salt);
                var _activePrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.activePrivate, wallet.password + wallet.salt);
                var _words = CryptoJS.AES.encrypt('eostoken' + wallet.data.words, wallet.password + wallet.salt);
                var _words_active = CryptoJS.AES.encrypt('eostoken' + wallet.data.words_active, wallet.password + wallet.salt);
    
                var _wallet = {
                    name: wallet.name,
                    account: wallet.name,
                    ownerPublic: wallet.data.ownerPublic,
                    activePublic: wallet.data.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isactived: wallet.isactived,
                    isBackups: false
                }
    
                walletArr[walletArr.length] = _wallet;

                yield call(store.save, 'walletArr', walletArr);
                DeviceEventEmitter.emit('key_created');
                yield call(store.save, 'defaultWallet', _wallet);
                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: _wallet } });
                // DeviceEventEmitter.emit('wallet_backup', _wallet);
                JPushModule.addTags([_wallet.name], map => {
    
                })
                DeviceEventEmitter.emit('updateDefaultWallet', {});
                if (callback) callback(_wallet,null);
            }

        },
        *importPrivateKey({ payload, callback }, { call, put }) {
            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            // const walletArr = yield call(store.get, 'walletArr');
            // yield put({ type: 'update', payload: { data: walletArr, ...payload } });
            var walletArr = yield call(store.get, 'walletArr');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                if (callback) callback({ isSuccess: false });
                return;
            }
            // Encrypt
            var salt = Math.ceil(Math.random() * 100000000000000000).toString();
            var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + payload.privateKey, payload.password + salt);
            var _wallet = {
                name: payload.walletName,
                account: payload.walletName,
                // ownerPublic: wallet.ownerPublic,
                // activePublic: wallet.activePublic,
                ownerPrivate: _ownerPrivate.toString(),
                salt: salt,
                isBackups: true
                // activePrivate: _activePrivate.toString(),
                // words: _words.toString()
            }
            walletArr[walletArr.length] = _wallet;
            yield call(store.save, 'walletArr', walletArr);
            yield call(store.save, 'defaultWallet', _wallet);
            DeviceEventEmitter.emit('prikey_imported', _wallet);
        },
        *walletList({ payload }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
            yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });

        }, 
        *getWalletDetail({ payload }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
        },
        *modifyPassword({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == payload._wallet.account) {
                    walletArr[i] = payload._wallet;
                    yield call(store.save, 'walletArr', walletArr);
                    yield call(store.save, 'defaultWallet', payload._wallet);
                    yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload._wallet } });
                }
            }
            DeviceEventEmitter.emit('modify_password', payload);
            DeviceEventEmitter.emit('updateDefaultWallet', payload);
        }, 
        *delWallet({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr.length == 1) {
                walletArr = [];
                yield call(store.save, 'defaultWallet', []);
                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: [] } });
                yield call(store.save, 'walletArr', walletArr);
                DeviceEventEmitter.emit('delete_wallet', payload);
            } else {
                for (var i = 0; i < walletArr.length; i++) {
                    if (walletArr[i].account == payload.data.account) {
                        if (walletArr[i].account == defaultWallet.account) {
                            yield call(store.save, 'defaultWallet', walletArr[0]);
                            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
                        }
                        walletArr.splice(i, 1);
                        yield call(store.save, 'walletArr', walletArr);
                        DeviceEventEmitter.emit('delete_wallet', payload);
                    }
                }
            }
            DeviceEventEmitter.emit('updateDefaultWallet');
        }, 
        *getDefaultWallet({ payload, callback }, { call, put }) {
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (callback) callback({ defaultWallet });
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: defaultWallet } });
        }, 
        *changeWallet({ payload }, { call, put }) {
            yield call(store.save, 'defaultWallet', payload.data);
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
        }, 
        *backupWords({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            for (var i = 0; i < walletArr.length; i++) {
                // alert('backupWords: ' + walletArr[i].account + ' ' + payload.account);
                if (walletArr[i].account == payload.data.data.account) {
                    payload.data.data.isBackups = true;
                    walletArr[i] = payload.data.data;
                    yield call(store.save, 'walletArr', walletArr);
                    // DeviceEventEmitter.emit('backupWords', payload);
                }
            }
            // yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
        }, 
        *createAccount({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            if (walletArr == null) {
                walletArr = [];
            }
            walletArr[walletArr.length] = payload;
            yield call(store.save, 'walletArr', walletArr);
            yield call(store.save, 'defaultWallet', payload);
            DeviceEventEmitter.emit('wallet_backup', payload);
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
        }, 
        *createAccountService({ payload, callback }, { call, put }) {
            // var defaultWallet = yield call(store.get, 'defaultWallet');
            // if (defaultWallet != null && defaultWallet.account != null) {
            //     if (callback) callback({ code: '500',data:'暂时不支持创建更多账号' });
            //     // DeviceEventEmitter.emit('wallet_10');
            //     return;
            // }
            try {
                const resp = yield call(Request.request, createAccount, 'post', payload);
                if (callback) callback(resp);
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
            
        }, 
        *pushTransaction({ payload, callback }, { call, put }) {
            try {
                const resp = yield call(Request.request, pushTransaction, 'post', payload);
                if (callback) callback(resp);
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        }, 
        *getBalance({ payload, callback }, { call, put }) {
            // alert('getBalance: '+JSON.stringify(payload));
            try {
                const resp = yield call(Request.request, getBalance, 'post', payload);
                if (callback) callback(resp);
                const walletArr = yield call(store.get, 'walletArr');
                for(var i = 0; i < walletArr.length; i++){
                    if(walletArr[i].name == payload.account && resp.code == '0' && resp.data != null && resp.data != ""){
                        walletArr[i].balance = resp.data.replace("EOS", "");
                    }
                }
                yield call(store.save, 'walletArr', walletArr);
                yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });

                var defaultWallet = yield call(store.get, 'defaultWallet');
                if(defaultWallet.name != null && defaultWallet.name == payload.account){
                    DeviceEventEmitter.emit('eos_balance', resp);
                }
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        *getAccountsByPuk({payload, callback},{call,put}) {
            try{
                const resp = yield call(Request.request,getAccountsByPuk,"post", payload);
                alert('getAccountsByPuk: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    // yield put({ type: 'updateVote', payload: { voteData:resp.data.rows } });
                    // yield put({ type: 'updateVote', payload: { AgentData:resp.data } });
                    // if (callback) callback(resp.data.account_names[0]);
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }
         },
         *getTradeDetails({payload, callback},{call,put}) {
            EasyLoading.show();
            try{
                const resp = yield call(Request.request,getActions,"post", payload);
                // alert('getTradeDetails: '+JSON.stringify(resp));
               
                if(resp.code=='0'){               
                    // yield put({ type: 'updateVote', payload: { voteData:resp.data.rows } });
                    yield put({ type: 'updateDetails', payload: { DetailsData:resp.data } });
                    // if (callback) callback(resp.data.account_names[0]);
                    // alert('updateDetails: '+JSON.stringify(resp.data));
                    EasyLoading.dismis();
                }else{
                    EasyToast.show(resp.msg);
                    EasyLoading.dismis();
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
                EasyLoading.dismis();
            }
         },
    
         *getintegral({payload, callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getintegral, "post", payload);
                if(resp.code=='0'){              
                    if (callback) callback(resp);
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }
         },
    },
    reducers: {
        update(state, action) {
            let coinList = action.payload.data;
            return { ...state, ...action.payload };
        },
        updateAction(state, action) {
            let coinList = action.payload.data;
            return { ...state, coinList };
        },
        walletCreated(state, action) {
            let data = action.payload.data;
        }, 
        updateDefaultWallet(state, action) {
            return { ...state, ...action.payload };
        },
        updateDetails(state, action) {
            //  alert('getTradeDetails: '+JSON.stringify(action.payload.DetailsData.actions));
            return {...state,DetailsData:action.payload.DetailsData.actions};
        },
    }
}