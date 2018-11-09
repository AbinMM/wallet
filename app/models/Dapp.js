import Request from '../utils/RequestUtil';
import {getEosTableRows, dappfindAllHotRecommend,dappfindAllRecommend,dappfindAllByType} from '../utils/Api';
import { EasyToast } from '../components/Toast';

import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import Constants from '../utils/Constants'
export default {
    namespace: 'dapp',
    state: {
    },
    effects: {
        *mydappInfo({ payload,callback }, { call, put }) {
            try {
                let mydappBook = yield call(store.get, 'mydappBook');
                if(callback) callback(mydappBook);
                yield put({ type: 'updateAction', payload: { data: mydappBook.reverse(), ...payload } });
            } catch (error) {
                EasyToast.show('获取失败!');
            }
        },
        *saveMyDapp({ payload,callback}, { call, put }) {
            var mydappBook = yield call(store.get, 'mydappBook');        
            if (mydappBook == null) {
                mydappBook = [];              
            }

            for (var i = 0; i < mydappBook.length; i++) {
                if ((mydappBook[i].id == payload.id)
                      && (mydappBook[i].categoryId == payload.categoryId)) {
                    mydappBook.splice(i,1);
                    break;
                }
            }

            mydappBook[mydappBook.length] = payload;
            yield call(store.save, 'mydappBook', mydappBook);
            let tmp_dappBook = mydappBook.reverse();
            yield put({ type: 'updateAction', payload: { data: tmp_dappBook, ...payload } });
            if(callback) callback(tmp_dappBook);
        },

        *collectionDappInfo({ payload,callback }, { call, put }) {
            try {
                let collectionDapp = yield call(store.get, 'collectionDapp');
                if(callback) callback(collectionDapp);
                yield put({ type: 'updateCollection', payload: { data: collectionDapp.reverse(), ...payload } });
            } catch (error) {
                EasyToast.show('获取失败!');
            }
        },
        *saveCollectionDapp({ payload,callback}, { call, put }) {
            var collectionDapp = yield call(store.get, 'collectionDapp');        
            if (collectionDapp == null) {
                collectionDapp = [];              
            }

            for (var i = 0; i < collectionDapp.length; i++) {
                if ((collectionDapp[i].id == payload.id) && (collectionDapp[i].categoryId == payload.categoryId)) {
                        collectionDapp.splice(i,1);
                    break;
                }
            }

            collectionDapp[collectionDapp.length] = payload;
            yield call(store.save, 'collectionDapp', collectionDapp);
            let tmp_collectionDapp = collectionDapp.reverse();
            yield put({ type: 'updateCollection', payload: { data: tmp_collectionDapp, ...payload } });
            if(callback) callback(tmp_collectionDapp);
        },

        *getEosTableRows({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getEosTableRows, 'post', payload);
                // alert('getEosTableRows: '+JSON.stringify(resp) + " " + JSON.stringify(payload));
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },

        *getBalance({payload, callback},{call,put}){
            try{
                const resp = yield call(Request.requestO, Constants.EosNode + '/v1/chain/get_currency_balance', 'post', payload);
                // alert('getBalance: '+JSON.stringify(resp));
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback(null);                
            }
        },
        *getContract({payload, callback},{call,put}){
            try{
                const resp = yield call(Request.requestO, Constants.EosNode + '/v1/chain/get_abi', 'post', payload);
                // alert('getContract: '+JSON.stringify(resp));
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback(null);                
            }
        },
        *dappfindAllHotRecommend({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, dappfindAllHotRecommend, 'post');
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *dappfindAllRecommend({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, dappfindAllRecommend, 'post');
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *dappfindAllByType({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, dappfindAllByType, 'post', payload);
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
    },
    reducers: {
       
        updateAction(state, action) {
            let mydappBook = action.payload.data;
            return { ...state, mydappBook };
        },
        updateCollection(state, action) {
            let collectionDapp = action.payload.data;
            return { ...state, collectionDapp };
        },
    }
}