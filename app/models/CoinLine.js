import Request from '../utils/RequestUtil';
import { line, coinInfo } from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import Constants from '../utils/Constants'
export default {
    namespace: 'coinLine',
    state: {
        lineDatas: {},
        info: {}
    },
    effects: {
        *list({ payload }, { call, put }) {
            var conLineDataInCache = yield call(store.get, 'coinLineData_'+payload.coin+"_"+payload.type);

            try {
                const resp = yield call(Request.request, line + payload.coin + "?type=" + payload.type, 'get');
                if (resp.code == '0') {
                    yield put({ type: 'update', payload: { data: resp.data, ...payload } });
                    yield call(store.save, 'coinLineData_'+payload.coin+"_"+payload.type,resp.data);
                } else {
                    EasyToast.show(resp.msg);
                    if(conLineDataInCache){
                        yield put({ type: 'update', payload: { data: conLineDataInCache, ...payload } });
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(conLineDataInCache){
                    yield put({ type: 'update', payload: { data: conLineDataInCache, ...payload } });
                }
            }
        },

        *info({ payload }, { call, put }) {
            var coinInfoInCache = yield call(store.get, 'coinInfo_'+payload.id);

            try {
                const resp = yield call(Request.request, coinInfo + payload.id, 'get');
                if (resp.code == '0') {
                    yield put({ type: 'updateInfo', payload: { info: resp.data, ...payload } });
                    yield call(store.save, 'coinInfo_'+payload.id,resp.data);
                } else {
                    EasyToast.show(resp.msg);
                    if(coinInfoInCache){
                        yield put({ type: 'updateInfo', payload: { info: coinInfoInCache, ...payload } });
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(coinInfoInCache){
                    yield put({ type: 'updateInfo', payload: { info: coinInfoInCache, ...payload } });
                }
            }
        },

        *clear({ payload }, { call, put }) {
            try {
                    yield put({ type: 'clearInfo', payload: { data: null, ...payload } });
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },


    },
    reducers: {
        update(state, action) {
            let lineDatas = combine(action.payload.data);
            return { ...state, lineDatas };
        },
        updateInfo(state, action) {
            return { ...state, ...action.payload };
        },
        clearInfo(state, action) {
            let lineDatas = null;
            return { ...state, lineDatas };
        },
    }
}


function combine(data) {
    return  {
        //backgroundColor: "#2f3b50",
        color: ['#556E95', '#65CAFF'],
        grid: {
            top: '3%',
            left: '2%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisTick: {
                    alignWithLabel: true
                },
                axisTick: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisLabel: {
                    color: "#96BAF0"
                },
            }
        ],
        yAxis: [
            {
                show: false,
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    formatter: '',
                    color: "#93B5EE"
                }
            },
            {
                position: "left",
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    formatter: '',
                    color: "#93B5EE"
                }
            }
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '交易量',
                type: 'bar',
                barWidth: '50%',
                data: data.txs
            },
            {
                yAxisIndex: 1,
                name: "价格走势",
                data: data.ps,
                type: 'line',
                itemStyle: {
                    borderWidth: 0,
                    color:  '#65CAFF',
                },
            }
        ]
    }
}
