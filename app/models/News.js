import Request from '../utils/RequestUtil';
import {newsList,newsDown,newsUp,newsShare,newsView,shareAddPoint,atcgetInfo,getActivityStages,getWinActivityStageUsers,getActivityStageUsers} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import Constants from '../utils/Constants'
export default {
    namespace: 'news',
    state: {
        newsData:{},
        newsRefresh:false,
        updateTime:"",
    },
    effects: {
        *list({payload},{call,put}) {
            try{
                if(payload.page==1){
                    yield put({type:'upstatus',payload:{newsRefresh:true}});
                }

                var news = yield call(store.get, "news_list_"+payload.type);

                const resp = yield call(Request.request,'http://192.168.1.21:8088/api' + newsList+payload.type+"?page="+payload.page,'get');
                if(resp.code=='0'){
                    let dts = new Array();
                    for(let i in resp.data){
                        let item = resp.data[i];
                        if(item && item.id){
                            let up = yield call(store.get, "news_up_"+item.id);
                            if(up=="1"){
                                item.isUp=true;
                            }
                            let down = yield call(store.get, "news_down_"+item.id);
                            if(down=="1"){
                                item.isDown=true;
                            }
                         }
                         item.row = 3;
                         dts.push(item);
                    }
                    yield put({type:'update',payload:{data:dts,...payload}});
                    if(payload.page == 1){
                        yield call(store.save, "news_list_"+payload.type, dts);
                    }else{
                        var newsInCache = yield call(store.get, "news_list_"+payload.type);
                        if(newsInCache){
                            yield call(store.save, "news_list_"+payload.type, newsInCache.concat(dts));
                        }
                    }
                }else{
                    EasyToast.show(resp.msg);
                    if(payload.page==1){
                        yield put({type:'update',payload:{data:news,...payload}});
                    }
                }
                yield put({type:'upstatus',payload:{newsRefresh:false}});
            } catch (error) {
                yield put({type:'upstatus',payload:{newsRefresh:false}});
                if(payload.page==1){
                    yield put({type:'update',payload:{data:news,...payload}});
                }
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *up({payload},{call,put}) {
            try{
                const up = yield call(store.get, "news_up_"+payload.news.id);
                if(up=="1"){
                    EasyToast.show("您已赞过了哦");
                    return;
                }
                yield call(store.save, "news_up_"+payload.news.id,"1");
                const resp = yield call(Request.request,newsUp+payload.news.id,'get');
                if(resp.code==0){
                    payload.news.isUp=true;
                    payload.news.up=payload.news.up+1;
                    yield put({type:'updateAction',...payload});
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *down({payload},{call,put}) {
            try{
                const up = yield call(store.get, "news_down_"+payload.news.id);
                if(up=="1"){
                    EasyToast.show("您已踩过了哦");
                    return;
                }
                yield call(store.save, "news_down_"+payload.news.id,"1");
                const resp = yield call(Request.request,newsDown+payload.news.id,'get');
                if(resp.code==0){
                    payload.news.isDown=true;
                    payload.news.down=payload.news.down+1;
                    yield put({type:'updateAction',...payload});
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *view({payload},{call,put}) {
            try{
                const resp = yield call(Request.request,newsView+payload.news.id,'get');
                if(resp.code==0){
                    payload.news.view=payload.news.view+1;
                    yield put({type:'updateAction',...payload});
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *share({payload},{call,put}) {
            try{
                const resp = yield call(Request.request,newsShare+payload.news.id,'get');
                if(resp.code==0){
                    payload.news.share=payload.news.share+1;
                    yield put({type:'updateAction',...payload});
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *shareAddPoint({payload},{call,put}){
            try{
                const resp = yield call(Request.request,shareAddPoint,'post');
                if(resp.code==0){
                    EasyToast.show("恭喜您获得分享积分哟！");
                }else{
                    // EasyToast.show(resp.msg);
                }
            } catch (error) {
                // EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *openView({payload},{call,put}) {
            yield put({type:'open',...payload});
        },
      
        *getInfo({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, atcgetInfo, 'post', payload);
                //alert(''+JSON.stringify(resp));
                // if(resp && resp.code=='0'){               
                    // yield put({ type: 'updateAccountInfo', payload: { accountInfo:resp.data } });
                // }else{
                //     EasyToast.show(resp.msg);
                // }
                if (callback) callback(resp.data);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
       
        *getActivityStages({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getActivityStages, 'post', payload);
                //alert(''+JSON.stringify(resp));
                // if(resp && resp.code=='0'){               
                    // yield put({ type: 'updateAccountInfo', payload: { accountInfo:resp.data } });
                // }else{
                //     EasyToast.show(resp.msg);
                // }
                if (callback) callback(resp.data);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        *getWinActivityStageUsers({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getWinActivityStageUsers, 'post', payload);
                //alert(''+JSON.stringify(resp));
                // if(resp && resp.code=='0'){               
                //     yield put({ type: 'updateWinActivityStageUsers', payload: { nameList:resp.data } });
                // }else{
                //     EasyToast.show(resp.msg);
                // }
                if (callback) callback(resp.data);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        
        *getActivityStageUsers({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getActivityStageUsers, 'post', payload);
                //alert(''+JSON.stringify(resp));
                // if(resp && resp.code=='0'){               
                //     yield put({ type: 'updateWinActivityStageUsers', payload: { nameList:resp.data } });
                // }else{
                //     EasyToast.show(resp.msg);
                // }
                if (callback) callback(resp.data);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },

        *dapplist({payload,callback},{call,put}) {
            var coinsInfoInCache = yield call(store.get, 'coinsInfo');
    
            try{
              yield put({type:'updateLoading',payload:{loading:true}});
              
              const resp = yield call(Request.request,sticker,'get');
              if(resp.code=='0'){
                  yield put({type:'update',payload:{...payload,data:resp.data}});
                  yield call(store.save, 'coinsInfo',resp.data);
              }else{
                yield put({type:'updateLoading',payload:{loading:false}});
                EasyToast.show(resp.msg);
                if(coinsInfoInCache){
                  yield put({type:'update',payload:{type: -1, data: coinsInfoInCache}});
                }
              }
              if (callback) callback();
            }catch(err){
              yield put({type:'updateLoading',payload:{loading:false}});
              EasyToast.show('网络繁忙,请稍后!');
              if(coinsInfoInCache){
                yield put({type:'update',payload:{type: -1, data: coinsInfoInCache}});
              }
            }
        },
        *loadStorage(action,{ call, put }) {
            let coinSelf = yield call(store.get, 'coinSelf');
            if(coinSelf==undefined || coinSelf==null || coinSelf=="null"){
              coinSelf={"eos":1};
              yield call(store.save, 'coinSelf',coinSelf);
            }
            yield put({type:'updateSelf',payload:{coinSelf}});
        },
        *doCoinSelf({payload,callback},{call,put}){
            let coinSelf = yield call(store.get,'coinSelf');
            if(!coinSelf || coinSelf==null){
              coinSelf = {};
            }
            if(payload.action=="add"){
              coinSelf[payload.name.toLowerCase()]=1;
            }else{
              coinSelf[payload.name.toLowerCase()]=0;
            }
            yield call(store.save, 'coinSelf',coinSelf);
            yield put({type:'loadStorage'});
            if(callback)callback();
        }

    },
   
    reducers: {
        update(state, action) {
            let newsData = state.newsData;
            if(action.payload.page==1){
                newsData[action.payload.type]=action.payload.data;
            }else{
                newsData[action.payload.type]= newsData[action.payload.type].concat(action.payload.data)
            }
            return {...state,newsData,updateTime:Date.parse(new Date())};
        },
        open(state, action) {
            
            let newsData = state.newsData;

            let dts = new Array();
           
            newsData[action.key].map((item)=>{
                if(item.id==action.nid){
                    if(item.row==3){
                        item.row=1000;
                    }else{
                        item.row=3;
                    }
                }
                dts.push(item);
            });
            newsData[action.key]=dts;

            return {...state,newsData,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateAction(state,action){
            let n = action.news;
            let newsData = state.newsData;
            let list = newsData[n.tid];
            list.map((item, i) => {
                if(item.id==n.id){
                    item=n;  
                                    
                }
            })
            state.something = Date.parse(new Date());
            newsData[n.tid] = list;
            return {...state,newsData};
        },
    }
  }
  