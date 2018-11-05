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

        *getEosTableRows({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getEosTableRows, 'post', payload);
                // alert('getEosTableRows: '+JSON.stringify(resp) + " " + JSON.stringify(payload));
                // if(resp.code=='0'){    

                // }else{
                //     EasyToast.show(resp.msg);
                // }
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
       
    }
}