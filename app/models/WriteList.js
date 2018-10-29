import Request from '../utils/RequestUtil';
import { address } from '../utils/Api';
import { EasyToast } from '../components/Toast';
import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import { DeviceEventEmitter } from 'react-native';


export default {
    namespace: 'writeList',
    state: {
        list: [],
        total: {},
        totalOpt: {}
    },
    effects: {
        *writeListInfo({ payload }, { call, put }) {
            try {
                    let writeList = yield call(store.get, 'writeList');
                    yield put({ type: 'updateAction', payload: { data: writeList, ...payload } });

            } catch (error) {
                EasyToast.show('刷新失败!');
            }
        },
        *saveWriteList({ payload,callback}, { call, put }) {
            var writeList = yield call(store.get, 'writeList');        
            if (writeList == null) {
                writeList = [];              
            }

            for (var i = 0; i < writeList.length; i++) {
                if (writeList[i].dappUrl == payload.dappUrl) {
                    // EasyToast.show('dappUrl已存在！');
                    if(callback) callback(writeList);
                    return ;
                }
            }

            var _writeListBuffer = {
                dappUrl: payload.dappUrl,
                dappWriteList: payload.isWriteListFlag,               
            }         
            writeList[writeList.length] = _writeListBuffer;
            yield call(store.save, 'writeList', writeList);
            yield put({ type: 'updateAction', payload: { data: writeList, ...payload } });
            if(callback) callback(writeList);
            
        },

        //查找白名单
        *findWriteList({ payload,callback}, { call, put }) {
            var writeList = yield call(store.get, 'writeList');        
            if (writeList == null) {
                return false;          
            }

            for (var i = 0; i < writeList.length; i++) {
                if (writeList[i].dappUrl == payload.dappUrl) {
                    // EasyToast.show('dappUrl已找到！');
                    if(callback) callback(writeList[i].dappWriteList);
                    return;
                }
            }
            if(callback) callback(false);
            return;
        },

        
        *delWriteList({ payload ,callback}, { call, put }) {          
            var writeList = yield call(store.get, 'writeList');
            for (var i = payload.keyArr.length; i > 0 ; i--) {
                writeList.splice(payload.keyArr[i-1], 1);
                yield call(store.save, 'writeList', writeList);
                yield put({ type: 'update', payload: { data: writeList, ...payload } });
                // EasyToast.show('删除成功，点击完成刷新');
            }
            if(callback) callback("ok");
            return;
        }
    },
    reducers: {
        update(state, action) {
            return {...state,...action.payload};
        },
        updateAction(state, action) {
            let writeList = action.payload.data;
            return { ...state, writeList };
        },
    }
}