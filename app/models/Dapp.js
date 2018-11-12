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
                let tmp_mydappBook = mydappBook.reverse();
                yield put({ type: 'updateAction', payload: { data: tmp_mydappBook, ...payload } });
                if(callback) callback(tmp_mydappBook);
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
                if (mydappBook[i].url == payload.url) {
                    mydappBook.splice(i,1);
                    break;
                }
            }
            if(mydappBook.length >= 100){
                //删除第一条记录
                mydappBook.splice(0,1);
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
                let tmp_collectionDapp = collectionDapp.reverse();
                yield put({ type: 'updateCollection', payload: { data: tmp_collectionDapp, ...payload } });
                if(callback) callback(tmp_collectionDapp);
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
                if (collectionDapp[i].url == payload.url) {
                        collectionDapp.splice(i,1);
                    break;
                }
            }
            if(collectionDapp.length >= 100){
               //删除第一条记录
                collectionDapp.splice(0,1);
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
                if (collectionDapp[i].url == payload.url) {
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
                let tmp_historyDapp = historyDapp.reverse();
                yield put({ type: 'updatehistory', payload: { data: tmp_historyDapp, ...payload } });
                if(callback) callback(tmp_historyDapp);
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
                if (historyDapp[i].url == payload.url) {
                        historyDapp.splice(i,1);
                    break;
                }
            }
            if(historyDapp.length >= 50){
                //删除第一条记录
                historyDapp.splice(0,1);
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
        //获取热门推荐
        *dappfindAllHotRecommend({ payload, callback }, { call, put }) {
            //默认用缓存
            let result = yield call(store.get, "AllHotRecommend_Info");
            try{
                const resp = yield call(Request.request,  dappfindAllHotRecommend, 'get');
                if(resp.code == '0'){     
                    //更新缓存
                    result = resp;
                    yield call(store.save, "AllHotRecommend_Info", resp);
                }
            } catch (error) {
                // EasyToast.show('网络繁忙,请稍后!');
            }
            if (callback) callback(result); 
        },
         //获取两个广告位
        *dappAdvertisement({ payload, callback }, { call, put }) {
            //默认用缓存
            let result = yield call(store.get, "Advertisement_Info");
            try{
                const resp = yield call(Request.request,  dappAdvertisement, 'post', payload);
                if(resp.code == '0')
                {
                    result = resp;
                    yield call(store.save, "Advertisement_Info", resp);
                }
            } catch (error) {
                 // EasyToast.show('网络繁忙,请稍后!');
            }
            if (callback) callback(result);          
        },
        //根据关键字模糊查询url
        *dappfindByName({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request,  dappfindByName, 'post', payload);
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //获取DAPP所有列表
        *dappfindAllRecommend({ payload, callback }, { call, put }) {
            //默认用缓存
            let result = yield call(store.get, "AllRecommend_Info");
            try{
                const resp = yield call(Request.request, dappfindAllRecommend, 'post');
                if(resp.code == '0'){
                    result = resp;
                    yield call(store.save, "AllRecommend_Info", resp);
                }
            } catch (error) {
                // EasyToast.show('网络繁忙,请稍后!');
            }
            if (callback) callback(result);      
        },
        //查询具体某类DAPP更多 分页查找
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