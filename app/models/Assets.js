import Request from '../utils/RequestUtil';
import {pocketAsset, getBalance, submitAssetInfo} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import { DeviceEventEmitter } from 'react-native';

export default {
    namespace: 'assets',
    state: {
        assetsData:{},
        newsRefresh:false,
        updateTime:"",
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            if(payload.page==1){
                yield put({type:'upstatus',payload:{newsRefresh:true}});
            }
            const resp = yield call(Request.request,pocketAsset, 'post', payload);
            if(resp.code=='0'){
                let dts = new Array();
                resp.data.map((item)=>{
                    item.row=3;
                    dts.push(item);
                });
                yield put({type:'update',payload:{data:dts,...payload}});
            }else{
                EasyToast.show(resp.msg);
            }
            yield put({type:'upstatus',payload:{newsRefresh:false}});
        } catch (error) {
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            EasyToast.show('网络繁忙,请稍后!');
        }
      },
    
      *addMyAsset({payload, callback},{call,put}){
        var myAssets = yield call(store.get, 'myAssets');
        // alert(JSON.stringify(payload.asset) + "   " +JSON.stringify(myAssets));
        if (myAssets == null) {
            var  myAssets = [];
        }
        for (var i = 0; i < myAssets.length; i++) {
            if (myAssets[i].asset.name == payload.asset.name) {
                if(payload.value){ // 添加资产,  但资产已存在
                    return;
                }else{ // 删除资产
                    myAssets.splice(i, 1);
                    yield call(store.save, 'myAssets', myAssets);
                    yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
                    if(callback) callback(myAssets);
                    // DeviceEventEmitter.emit('updateMyAssets', payload);
                    return;
                }
            }
        }

        // 如果目前我的资产没有传入的资产
        if(!payload.value){ // 删除资产直接退出
            return;
        }

        // 添加资产
        var _asset = {
            asset: payload.asset,
            value: payload.value,
            balance: '0.0000',
        }
        myAssets[myAssets.length] = _asset;
        // alert("777777777 " + JSON.stringify(payload.asset));
        yield call(store.save, 'myAssets', myAssets);
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        if(callback) callback(myAssets);
        // DeviceEventEmitter.emit('updateMyAssets', payload);
     },
     *myAssetInfo({payload, callback},{call,put}){
        const myAssets = yield call(store.get, 'myAssets');
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        if(callback){
            callback(myAssets);
        }
    },
    *updateMyAsset({payload},{call,put}){
        var myAssets = yield call(store.get, 'myAssets');
        alert(JSON.stringify(payload) + "   " +JSON.stringify(myAssets));
        if (myAssets == null) {
            myAssets = [];
        }
        for (var i = 0; i < myAssets.length; i++) {
            if (myAssets[i].asset.name == payload.asset.name) {
                // 删除资产
                myAssets.splice(i, 1);
            }
        }

        // 添加资产
        var _asset = {
            asset: payload.asset,
            value: true,
            balance: payload.balance,
        }
        myAssets[myAssets.length] = _asset;
        yield call(store.save, 'myAssets', myAssets);
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
     },
     *getBalance({payload, callback}, {call, put}){
        try{
            // alert("------ " + JSON.stringify(payload));
            for(let i in payload.assets){
                let item = payload.assets[i];
                const resp = yield call(Request.request, getBalance, 'post', {contract: item.asset.contractAccount, account: payload.accountName, symbol: item.asset.name});
                // alert("------ " + JSON.stringify(resp));
                if(resp && resp.code=='0'){
                    item.balance = resp.data;
                }
            }
            yield call(store.save, 'myAssets', payload.assets);
            yield put({ type: 'updateMyAssets', payload: {myAssets: payload.assets} });
            if(callback){
                callback(payload.assets);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
    },
    *submitAssetInfoToServer({payload, callback},{call,put}){
        try{
            const resp = yield call(Request.request, submitAssetInfo, 'post', {contract_account: payload.contractAccount, name: payload.name});
            if(resp && resp.code=='0'){
                DeviceEventEmitter.emit('updateAssetList', payload);
            }
            if(callback){
                callback(resp);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
     },

    },

    reducers: {
        update(state, action) {
            // alert('update: '+JSON.stringify(action));
            let assetsData = action.payload.data;
            // if(action.payload.page==1){
            //     assetsData[action.payload.type]=action.payload.data;
            // }else{
            //     assetsData[action.payload.type]= assetsData[action.payload.type].concat(action.payload.data)
            // }
            return {...state,assetsData,updateTime:Date.parse(new Date())};
        },
        open(state, action) {
            
            let assetsData = state.assetsData;

            let dts = new Array();
           
            assetsData[action.key].map((item)=>{
                if(item.id==action.nid){
                    if(item.row==3){
                        item.row=1000;
                    }else{
                        item.row=3;
                    }
                }
                dts.push(item);
            });
            assetsData[action.key]=dts;

            return {...state,assetsData,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateAction(state,action){
            let n = action.news;
            let assetsData = state.assetsData;
            let list = assetsData[n.tid];
            list.map((item, i) => {
                if(item.id==n.id){
                    item=n;  
                                    
                }
            })
            state.something = Date.parse(new Date());
            assetsData[n.tid] = list;
            return {...state,assetsData};
        },
        updateMyAssets(state, action) {
            return { ...state, ...action.payload };
        },
    }
  }
  