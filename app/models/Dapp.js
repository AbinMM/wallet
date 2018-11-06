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

        *mydappInfo({ payload }, { call, put }) {
            try {
                let mydappBook = yield call(store.get, 'mydappBook');
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
    }
}