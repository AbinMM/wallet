import Request from '../utils/RequestUtil';
import {newsTypes} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'newsType',
    state: {
        types:[]
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,newsTypes,'get');
            if(resp.code=='0'){
                var ret = [];
                for(var i = 0; i < resp.data.length; i++){
                    if(resp.data[i].title != "DAPP"){
                        ret.push(resp.data[i]);
                    }
                }

                yield call(store.save,'newsTypes',ret);
                yield put({type:'update',payload:{types:ret}});
            }else{
                EasyToast.show(resp.msg);
            }
        }catch(error){
            EasyToast.show('网络繁忙,请稍后!');
        }
      },
      *loadStorage(action, { call, put }) {
        const types = yield call(store.get, 'newsTypes')
        if(types){
            yield put({type:'update',payload:{types}});
        }
      },
    },
    reducers: {
        update(state, action) {
            return {...state,
                types:action.payload.types
            };
        },
    },
    subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'loadStorage' })
        },
      },
  }
  