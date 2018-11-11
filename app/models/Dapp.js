import Request from '../utils/RequestUtil';
import {getEosTableRows, dappfindAllHotRecommend, dappfindAllRecommend, dappAdvertisement, dappfindByName, dappfindAllByType} from '../utils/Api';
import { EasyToast } from '../components/Toast';

import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import Constants from '../utils/Constants'
export default {
    namespace: 'dapp',
    state: {
    },
    effects: {
        //我的Dapps 历史记录
        *mydappInfo({ payload,callback }, { call, put }) {
            try {
                let mydappBook = yield call(store.get, 'mydappBook');
                if(callback) callback(mydappBook);
                yield put({ type: 'updateAction', payload: { data: mydappBook.reverse(), ...payload } });
            } catch (error) {
                // EasyToast.show('获取失败!');
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
        //我的收藏
        *collectionDappInfo({ payload,callback }, { call, put }) {
            try {
                let collectionDapp = yield call(store.get, 'collectionDapp');
                if(callback) callback(collectionDapp);
                yield put({ type: 'updateCollection', payload: { data: collectionDapp.reverse(), ...payload } });
            } catch (error) {
                // EasyToast.show('获取失败!');
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
        *deleteCollectionDapp({ payload,callback}, { call, put }) {
            var collectionDapp = yield call(store.get, 'collectionDapp');        
            if (!collectionDapp) {
                return ;    
            }

            for (var i = 0; i < collectionDapp.length; i++) {
                if ((collectionDapp[i].id == payload.id) && (collectionDapp[i].categoryId == payload.categoryId)) {
                        collectionDapp.splice(i,1);
                    break;
                }
            }

            yield call(store.save, 'collectionDapp', collectionDapp);
            let tmp_collectionDapp = collectionDapp.reverse();
            yield put({ type: 'updateCollection', payload: { data: tmp_collectionDapp, ...payload } });
            if(callback) callback(tmp_collectionDapp);
        },

        //搜索的历史记录History
        *historyDappInfo({ payload,callback }, { call, put }) {
            try {
                let historyDapp = yield call(store.get, 'historyDapp');
                if(callback) callback(historyDapp);
                yield put({ type: 'updatehistory', payload: { data: historyDapp.reverse(), ...payload } });
            } catch (error) {
                // EasyToast.show('获取失败!');
            }
        },
        //添加到历史记录里
        *savehistoryDapp({ payload,callback}, { call, put }) {
            var historyDapp = yield call(store.get, 'historyDapp');        
            if (historyDapp == null) {
                historyDapp = [];              
            }

            for (var i = 0; i < historyDapp.length; i++) {
                if ((historyDapp[i].id == payload.id)
                      && (historyDapp[i].categoryId == payload.categoryId)) {
                        historyDapp.splice(i,1);
                    break;
                }
            }

            historyDapp[historyDapp.length] = payload;
            yield call(store.save, 'historyDapp', historyDapp);
            let tmp_historyDapp = historyDapp.reverse();
            yield put({ type: 'updatehistory', payload: { data: tmp_historyDapp, ...payload } });
            if(callback) callback(tmp_historyDapp);
        },
        *deletehistoryDapp({ payload,callback}, { call, put }) {
            yield call(store.save, 'historyDapp', []);
            yield put({ type: 'updatehistory', payload: { data: [], ...payload } });
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
                const resp = yield call(Request.request,  dappfindAllHotRecommend, 'get');
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *dappAdvertisement({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request,  dappAdvertisement, 'post', payload);
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *dappfindByName({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request,  dappfindByName, 'post', payload);
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
        updatehistory(state, action) {
            let historyDapp = action.payload.data;
            return { ...state, historyDapp };
        },
    }
}