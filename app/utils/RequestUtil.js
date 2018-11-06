import Constants from '../utils/Constants'
var MD5 = require("crypto-js/md5");
const key = "b1ced3b3e19d11e88a1a00163e047765";
// const request = (url, method, body) => {
//   let isOk;
//   return new Promise((resolve, reject) => {
//     fetch(url, {
//       method,
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8',
//         "uid":Constants.uid|'',
//         "token":Constants.token,
//         "version":Constants.version,
//         "os":Constants.os,
//         "osVersion":Constants.osVersion,
//         "model":Constants.model,
//         "deviceId":Constants.deviceId
//       },
//       body:JSON.stringify(body)
//     })
//       .then((response) => {
//         if (response.ok) {
//           isOk = true;
//         } else {
//           isOk = false;
//         }
//         return response.json();
//       })
//       .then((responseData) => {
//         if (isOk) {
//           resolve(responseData);
//         } else {
//           reject(responseData);
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };
const signGetParams = (url) => {
  let i = url.indexOf("?");
  if(i>0){
    let params = url.substring(i+1,url.length);
    url = url.substring(0,i);
    params = params.split("&");
    params.push("time="+new Date().getTime());
    params.sort();
    let paramsStr="";
    params.map(item=>{
      paramsStr += item+"&";
    })
    paramsStr=paramsStr.substr(0,paramsStr.length-1);
    let sign = MD5(paramsStr+"&key="+key);
    url = url+"?"+paramsStr+"&sign="+sign;
  }else{
    let params = "time="+new Date().getTime();
    let sign = MD5(params+"&key="+key);
    url = url+"?"+params+"&sign="+sign;
  }
  return url;
}

signPostParams = (body) =>{
  let params = [];
  params.push("time="+new Date().getTime());
  if(body){
    for(let key in body){
      params.push(key+"="+body[key]);
    }
  }
  params.sort();
  let paramsStr="";
  let newbody={};
  params.map(item=>{
    paramsStr += item+"&";
    let ps = item.split("=");
    newbody[ps[0]]=ps[1];
  })
  paramsStr=paramsStr.substr(0,paramsStr.length-1);
  let sign = MD5(paramsStr+"&key="+key)+"";
  newbody["sign"]=sign;
  return newbody;
}

const requestO = (url,method, body, timeout=30000) => {
  //  timeout=60000
  const request1 = new Promise((resolve, reject) => {
    if(method.toLowerCase()=="get"){
      url = signGetParams(url);
    }else if(method.toLowerCase()=="post"){
      body = signPostParams(body);
    }
    fetch(url,{
        method: method,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          "uid":Constants.uid|'',
          "token":Constants.token,
          "version":Constants.version,
          "os":Constants.os,
          "osVersion":Constants.osVersion,
          "model":Constants.model,
          "deviceId":Constants.deviceId
        },
        body:JSON.stringify(body)
    }).then((response) => {
        if (response.ok) {
          isOk = true;
        } else {
          isOk = false;
        }
        return response.json();
      })
      .then((responseData) => {
        if (isOk) {
          resolve(responseData);
        } else {
          reject(responseData);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

// 定义一个延时函数
  const timeoutRequest = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'Request timed out');
  });

// 竞时函数，谁先完成调用谁
  return Promise
    .race([request1, timeoutRequest])
    .then(res => {
      return res
    }, m => {
      throw new Error(m);
    });
};

const request = (url,method,body, timeout = 30000)=>{
   if(Constants.isNetWorkOffline){
    return { code: 500, msg: '网络繁忙，请稍后再试' };
   }
   return getRootaddr().then(res=>{
      let okUrl = url
      let rootaddr = res
      if(okUrl.indexOf("/")==0){
        okUrl = rootaddr+url
      }

      return requestO(okUrl, method, body, timeout)
   }).catch(e=>{
    console.log(e);
    return { code: 500, msg: '网络繁忙，请稍后再试' };
   })
};

const getRootaddr = ()=>{
  return requestO(Constants.gateurl, 'post',{})
    .then(res => {
      Constants.rootaddr = res.url
      return Constants.rootaddr;
    })
    .catch(e=>{
      Constants.rootaddr = Constants.defaultrootaddr
      return Constants.rootaddr;
      console.log(e);
    })
}

export default {
  request,
  requestO,
  getRootaddr
};
