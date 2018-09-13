import Request from '../utils/RequestUtil';
import {listProducers, getAccountInfo, getUndelegatebwInfo, listAgent, getGlobalInfo, queryRamPrice, listDelegateLoglist, getAccountDelegatebwInfo, delegatebw} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import Constants from '../utils/Constants'
let newarr = new Array();

export default {
    namespace: 'vote',
    state: {
        voteData:[],
        isChecked:false,
        accountInfo:[]
    },
    effects: {
     *list({payload, callback},{call,put}) {
        try{
            const resp = yield call(Request.request, listAgent,"post");
            //  alert('listAgent ：'+JSON.stringify(resp));
            // const resp = yield call(Request.request,listAgent,"get");
            if(resp && resp.code=='0'){               
                yield put({ type: 'updateVote', payload: { voteData:resp.data } });            
                // yield put({ type: 'updateVote', payload: { AgentData:resp.data } });
                if (callback) callback(resp.data);
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *up({payload},{call,put}) {
        try{
            yield put({ type: 'updateSelect', payload: { ...payload } });
            // alert(''+JSON.stringify(payload));
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     /**
      *  获取eos账户信息 获取账户投票信息
      */
     *getaccountinfo({payload,callback},{call,put}) {
        var accountInfo = yield call(store.get, 'accountInfo');

        if(payload && payload.username && accountInfo && accountInfo.account_name)
        {
            if(payload.username != accountInfo.account_name)
            {
                accountInfo = null; //输入参数与缓存不一样，不能用缓存
            }
        }
        try{
            const resp = yield call(Request.request, getAccountInfo, 'post', payload);
            if(resp && resp.code=='0'){ 
                yield put({ type: 'updateAccountInfo', payload: { producers:(resp.data.voter_info ? resp.data.voter_info.producers : "") } });
                yield put({ type: 'updateResources', payload: { Resources:resp.data}  });
                yield call(store.save, 'accountInfo', resp.data);
                if (callback) callback(resp.data);
            }else{
                EasyToast.show(resp.msg);
                if(accountInfo)
                {
                    yield put({ type: 'updateAccountInfo', payload: { producers:(accountInfo.voter_info ? accountInfo.voter_info.producers : "") } });
                    yield put({ type: 'updateResources', payload: { Resources:accountInfo}  });
                }
                if (callback) callback(accountInfo);
            }
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
            if(accountInfo)
            {
                yield put({ type: 'updateAccountInfo', payload: { producers:(accountInfo.voter_info ? accountInfo.voter_info.producers : "") } });
                yield put({ type: 'updateResources', payload: { Resources:accountInfo}  });
            }
            if (callback) callback(accountInfo);
        }
     },
     /**
      *  获取eos账户授权信息
      */
     *getAuthInfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getAccountInfo, 'post', payload);
            if(callback) callback(resp);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
            if (callback) callback({ code: 500, msg: "网络异常" });
        }
     },
    /**
      *  获取eos赎回信息
      */
     *getundelegatebwInfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getUndelegatebwInfo, 'post', payload);
            if(resp && resp.code=='0'){               
                // yield put({ type: 'updateAccountInfo', payload: { accountInfo:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp.data);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *getGlobalInfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getGlobalInfo, 'post', payload);
            let total = (resp.data.rows[0].max_ram_size / 1024 / 1024 / 1024).toFixed(2);
            let used = (resp.data.rows[0].total_ram_bytes_reserved / 1024 / 1024 / 1024).toFixed(2);
            let used_Percentage= (((resp.data.rows[0].total_ram_bytes_reserved / 1024 / 1024 / 1024).toFixed(2) / (resp.data.rows[0].max_ram_size / 1024 / 1024 / 1024).toFixed(2)) * 10000 / 100).toFixed()
            if(resp && resp.code=='0'){    
                yield put({ type: 'updateGlobal', payload: { total:total,used:used,used_Percentage:used_Percentage } });
                
            }else{
                EasyToast.show(resp.msg);
            }
            // if (callback) callback({total:total,used:used,used_Percentage:used_Percentage});
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *getqueryRamPrice({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, queryRamPrice, 'post', payload);
            if(resp && resp.code=='0'){               
                // yield put({ type: 'updatequeryRamPrice', payload: { Currentprice:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp.data);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *getDelegateLoglist({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, listDelegateLoglist, 'post', payload);
            if(resp && resp.code=='0' && resp.data){    
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *delegatebw({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, delegatebw, 'post', payload);
            if(resp && resp.code=='0' && resp.data){    
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
            if (callback) callback({ code: 500, msg: "网络异常" });
        }
     },

    },

    reducers : {
        updateVote(state, action) {      
            return {...state,voteData:action.payload.voteData};  
        },
        updateSelect(state, action) {
            let dts = state.voteData;
            let newarr = new Array();
            dts.map((item)=>{
                if(item==action.payload.item){
                    if(item.isChecked){
                        item.isChecked=false;
                    }else{
                        item.isChecked=true;
                    }
                }
                newarr.push(item);
            })
            return {...state,voteData:newarr}; 
        },
        updateAccountInfo(state, action) {    
            let arr = state.voteData;
            let arr1 = [];
            for(var i = 0; i < arr.length; i++){
                for(var j = 0; j < action.payload.producers.length; j++){
                    if(action.payload.producers[j] == (arr[i].account)){
                        arr1.push(arr[i]);
                    }
                }
            }
            return {...state, producers: arr1};      
        }, 
        updateResources(state, action) {      
            return {...state,Resources:action.payload.Resources};  
        },
        updateGlobal(state, action) {  
            return {...state,globaldata:action.payload};  
        },
    }
  }
  