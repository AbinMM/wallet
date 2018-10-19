
export default function RenderScatter(props) {
    let isActive=(props.defaultWallet.activePublic!=null && props.defaultWallet.activePublic.length==53)?true:false; 
    let account = {name:props.defaultWallet.account,
    publicKey:(isActive==false)?props.defaultWallet.ownerPublic:props.defaultWallet.activePublic,
    perm_name:(isActive==false)?"owner":"active" };

  if(account){
    return `
    iden = {
        name:"${account.name}",
        publicKey:"${account.publicKey}",
        accounts:[{
            name:"${account.name}",
            blockchain:"eos",
            authority:"${account.perm_name}"
        }]
    };
    window.scatter={
        identity:iden,
        getIdentity:function(id){
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        forgetIdentity:function(){
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        getVersion:function(id){
            alert('getVersion');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        getPublicKey:function(id){
            alert('getPublicKey');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        linkAccount:function(id){
            alert('linkAccount');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        hasAccountFor:function(id){
            alert('hasAccountFor');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        getOrRequestIdentity:function(id){
            alert('getOrRequestIdentity');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        identityFromPermissions:function(id){
            alert('identityFromPermissions');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        requestTransfer:function(id){
            alert('requestTransfer');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        requestSignature:function(id){
            alert('requestSignature');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        createTransaction:function(id){
            alert('createTransaction');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        requestArbitrarySignature:function(id){
            alert('requestArbitrarySignature');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        requestAddNetwork:function(id){
            alert('requestAddNetwork');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        authenticate:function(id){
            alert('authenticate');
            return new Promise((resolve, reject) => {
                resolve(iden);
            })
        },
        eos:(e,t,r,n) =>{
            return {
                claimbalance:function(publicKey){
                    alert('claimbalance');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                getInfo:function(publicKey){
                    alert('getInfo');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                delegatebw:function(account){
                    alert('delegatebw');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                undelegatebw:function(account){
                    alert('undelegatebw');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                buyrambytes:function(account){
                    alert('buyrambytes');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                sellram:function(account){
                    alert('sellram');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                getKeyAccounts:function(publicKey){
                    alert('getKeyAccounts');
                    return new Promise((resolve, reject) => {
                        resolve(iden);
                    })
                },
                contract:function(contract){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"contract",params:{contract}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="contract" && obj.key===key){     
                                resolve(obj.data);
                            }
                        });
                    })
                },
                getCurrencyBalance:function(contract,name,coin){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"getCurrencyBalance",params:{contract,name,coin}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="getCurrencyBalance" && obj.key===key){     
                                resolve(obj.data);
                            }
                        });
                    })
                },
                getAccount:function(account){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"getAccount",params:{account}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="getAccount" && obj.key===key){     
                                resolve(obj.data);
                            }
                        });
                    })
                },
                getTableRows:function(obj_param){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"getTableRows",params:{obj_param}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="getTableRows" && obj.key===key){   
                                resolve(obj.data);
                            }
                        });
                    })
                },
                transfer:function(from,to,amount,memo){
                    alert('transfer');
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"transfer",params:{from,to,amount,memo}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="transfer" && obj.key===key){ 
                                resolve(obj.data);
                            }
                        });
                    })
                },
                transaction:function(actions){
                    alert('transaction');
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"transaction",params:{...actions}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="transaction" && obj.key===key){ 
                                alert(obj.data);
                                resolve(obj.data);
                            }
                        });
                    })
                }
            }
        }
    };
    setTimeout(function(){
        var event = document.createEvent('HTMLEvents');
        event.initEvent("scatterLoaded", true, true);
        event.eventType = 'scatterLoaded';
        document.dispatchEvent(event);
    },1000)
  `
  }else{
    return ``
  }
}