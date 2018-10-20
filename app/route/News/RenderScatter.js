
export default function RenderScatter(props) {
    let isActive=(props.defaultWallet.activePublic!=null && props.defaultWallet.activePublic.length==53)?true:false; 
    let account = {name:props.defaultWallet.account,
    publicKey:(isActive==false)?props.defaultWallet.ownerPublic:props.defaultWallet.activePublic,
    perm_name:(isActive==false)?"owner":"active" };

  if(account){
    return `
    var iden = {
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
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        forgetIdentity:function(){
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        getVersion:function(id){
            alert('getVersion');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        getPublicKey:function(id){
            alert('getPublicKey');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        linkAccount:function(id){
            alert('linkAccount');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        hasAccountFor:function(id){
            alert('hasAccountFor');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        getOrRequestIdentity:function(id){
            alert('getOrRequestIdentity');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        identityFromPermissions:function(id){
            alert('identityFromPermissions');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        requestTransfer:function(id){
            alert('requestTransfer');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        requestSignature:function(id){
            alert('requestSignature');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        createTransaction:function(id){
            alert('createTransaction');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        requestArbitrarySignature:function(id){
            alert('requestArbitrarySignature');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        requestAddNetwork:function(id){
            alert('requestAddNetwork');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        authenticate:function(id){
            alert('authenticate');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            })
        },
        eos:(e,t,r,n) =>{
            return {
                getInfo:function(publicKey){
                    alert('getInfo');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    })
                },
                delegatebw:function(account){
                    alert('delegatebw');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    })
                },
                undelegatebw:function(account){
                    alert('undelegatebw');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    })
                },
                buyrambytes:function(account){
                    alert('buyrambytes');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    })
                },
                sellram:function(account){
                    alert('sellram');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    })
                },
                getKeyAccounts:function(publicKey){
                    alert('getKeyAccounts');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
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
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
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
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
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
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
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
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
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
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
                            }
                        });
                    })
                },
                contract:function(name){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"contract",params:{account:name}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="contract" && obj.key===key){
                                if(obj.data && obj.data.fc && obj.data.fc.abi)
                                {
                                    var resultContract = {};
                                    var ide = JSON.stringify(iden);
                                    var sts = JSON.stringify(obj.data.fc.abi.structs);
                                    for(var i=0;i<obj.data.fc.abi.actions.length;i++){
                                        var action = obj.data.fc.abi.actions[i];
                                        var fc = new Function(
                                            "return new Promise((resolve, reject) => {"+
                                                "var contract='"+name+"';"+
                                                "var name='"+action.name+"';"+
                                                "var structs=JSON.parse('"+sts+"');"+
                                                "var ide=JSON.parse('"+ide+"');"+
                                                "for(var j=0;j<structs.length;j++){"+
                                                    "var st=structs[j];"+
                                                    "if(st.name==name){"+
                                                    
                                                        "var tx={'account':contract,'name':name,authorization:[{'actor':ide.accounts[0].name,'permission':ide.accounts[0].authority}],data:{}};"+
                                                        "for(var f=0;f<st.fields.length;f++){"+
                                                            "var field=st.fields[f];"+
                                                            "var paramname=field.name;"+
                                                            "var paramvalue='';"+
                                                            "for(var iii in arguments[0]){"+
                                                                "if(paramname==iii){"+
                                                                    "paramvalue=arguments[0][iii];"+
                                                                "}"+
                                                            "}"+
                                                            "tx.data[field.name]=paramvalue;"+
                                                        "}"+
                                                        "var key = new Date().getTime();"+
                                                        "window.postMessage(JSON.stringify({key,scatter:'transaction',params:{actions:[tx]}}));"+    
                                                        "document.addEventListener('message',function(msg){"+
                                                            "document.removeEventListener('message',this);"+
                                                            "var obj = JSON.parse(msg.data);"+
                                                            "if(obj.scatter=='transaction' && obj.key===key){"+
                                                                "alert('bbb'+JSON.stringify(obj.data));"+
                                                                "if(obj.data){" +
                                                                    "resolve(obj.data);"+
                                                                "}else{"+
                                                                    "reject({});"+
                                                                "}"+
                                                            "}"+
                                                        "})"+
                                                    "}"+
                                                "}"+
                                            "})"
                                        );
                                        resultContract[action.name]=fc;
                                    }
                                    resolve(resultContract);
                                }else
                                {
                                    reject({});
                                }
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