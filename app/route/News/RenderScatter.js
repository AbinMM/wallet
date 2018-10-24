
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
            }).catch((error)=>{
                
            });
        },
        forgetIdentity:function(){
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        getVersion:function(id){
            alert('getVersion');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        getPublicKey:function(id){
            alert('getPublicKey');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        linkAccount:function(id){
            alert('linkAccount');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        hasAccountFor:function(id){
            alert('hasAccountFor');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        getOrRequestIdentity:function(id){
            alert('getOrRequestIdentity');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        identityFromPermissions:function(id){
            alert('identityFromPermissions');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        requestTransfer:function(id){
            alert('requestTransfer');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        requestSignature:function(id){
            alert('requestSignature');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        createTransaction:function(id){
            alert('createTransaction');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        requestArbitrarySignature:function(id){
            alert('requestArbitrarySignature');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        requestAddNetwork:function(id){
            alert('requestAddNetwork');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        authenticate:function(id){
            alert('authenticate');
            return new Promise((resolve, reject) => {
                if(iden){
                    resolve(iden);
                }else{
                    reject({});
                }
            }).catch((error)=>{
                
            });
        },
        eos:(e,t,r,n) =>{
            return {
                getInfo:function(){
                    alert('getInfo');
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"getInfo",params:{}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="getInfo" && obj.key===key){     
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
                            }
                        });
                    }).catch((error)=>{
                
                    });
                },
                delegatebw:function(account1,account2,net,cpu,number,obj_auth){
                    alert('delegatebw');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    }).catch((error)=>{
                
                    });
                },
                undelegatebw:function(account1,account2,net,cpu,obj_auth){
                    alert('undelegatebw');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    }).catch((error)=>{
                
                    });
                },
                buyrambytes:function(account1,account2,bytes,obj_auth){
                    alert('buyrambytes');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    }).catch((error)=>{
                
                    });
                },
                sellram:function(account,bytes,obj_auth){
                    alert('sellram');
                    return new Promise((resolve, reject) => {
                        if(iden){
                            resolve(iden);
                        }else{
                            reject({});
                        }
                    }).catch((error)=>{
                
                    });
                },
                getKeyAccounts:function(publicKey){
                    alert('getKeyAccounts');
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"getKeyAccounts",params:{publicKey}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="getKeyAccounts" && obj.key===key){     
                                if(obj.data)
                                {
                                    resolve(obj.data);
                                }else{
                                    reject({});
                                }
                            }
                        });
                    }).catch((error)=>{
                
                    });
                },
                getCurrencyBalance:function(contract,name,coin){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        var tmp_contract = '';
                        var tmp_name = '';
                        var tmp_coin = '';

                        var param_type = typeof(contract);
                        if(param_type === 'object')
                        {
                            tmp_contract = contract.contract ? contract.contract : '';
                            tmp_name = contract.name ? contract.name : '';
                            tmp_coin = contract.coin ? contract.coin : '';
                        }else{
                            tmp_contract = contract;
                            tmp_name = name;
                            tmp_coin = coin;
                        }
                        window.postMessage(JSON.stringify({key,scatter:"getCurrencyBalance",params:{contract:tmp_contract,name:tmp_name,coin:tmp_coin}}));
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
                    }).catch((error)=>{
                
                    });
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
                    }).catch((error)=>{
                
                    });
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
                    }).catch((error)=>{
                
                    });
                },
                transfer:function(from,to,amount,memo){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        var tmp_from = '';
                        var tmp_to = '';
                        var tmp_amount = '';
                        var tmp_memo = '';

                        var param_type = typeof(from);
                        if(param_type === 'object')
                        {
                            tmp_from = from.from ? from.from : '';
                            tmp_to = from.to ? from.to : '';
                            if(from.quantity){
                                tmp_amount = from.quantity;
                            }else if(from.amount){
                                tmp_amount = from.amount;
                            }
                            tmp_memo = from.memo ? from.memo : '';
                        }else{
                            tmp_from = fom;
                            tmp_to = to;
                            tmp_amount = amount;
                            tmp_memo = memo;
                        }
                        window.postMessage(JSON.stringify({key,scatter:"transfer",params:{from:tmp_from,to:tmp_to,amount:tmp_amount,memo:tmp_memo}}));
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
                    }).catch((error)=>{
                
                    });
                },
                transaction:function(actions){
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
                    }).catch((error)=>{
                
                    });
                },
                contract:function(name){
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"contract",params:{contract:name}}));
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
                                              "try{"+
                                                "var contract='"+name+"';"+
                                                "var name='"+action.name+"';"+
                                                "var structs=JSON.parse('"+sts+"');"+
                                                "var ide=JSON.parse('"+ide+"');"+
                                                "for(var j=0;j<structs.length;j++){"+
                                                    "var st=structs[j];"+
                                                    "if(st.name==name){"+
                                                        "var paramTypeObject = false;"+
                                                       
                                                        "var number=0;"+
                                                        "for(var g=0;g<st.fields.length;g++){"+
                                                            "var tmp_field=st.fields[g];"+
                                                            "var tmp_paramname=tmp_field.name;"+
                                                            "for(var jjj in arguments[0]){"+
                                                                "if(tmp_paramname==jjj){"+
                                                                    "number=number+1;"+
                                                                    "break;"+
                                                                "}"+
                                                            "}"+
                                                        "}"+
                                                        "if(number==st.fields.length){"+
                                                            "paramTypeObject=true;"+
                                                        "}"+

                                                        "var tx={'account':contract,'name':name,authorization:[{'actor':ide.accounts[0].name,'permission':ide.accounts[0].authority}],data:{}};"+
                                                        "for(var f=0;f<st.fields.length;f++){"+
                                                            "var field=st.fields[f];"+
                                                            "var paramname=field.name;"+
                                                            "var paramvalue='';"+
                                                            "if(paramTypeObject){"+
                                                                "for(var iii in arguments[0]){"+
                                                                    "if(paramname==iii){"+
                                                                        "paramvalue=arguments[0][iii];"+
                                                                    "}"+
                                                                "}"+
                                                            "}else{"+
                                                                "paramvalue=arguments[f]"+
                                                            "}"+
                                                            "tx.data[field.name]=paramvalue;"+
                                                        "}"+
                                                        "var key = new Date().getTime();"+
                                                        "window.postMessage(JSON.stringify({key,scatter:'transaction',params:{actions:[tx]}}));"+    
                                                        "document.addEventListener('message',function(msg){"+
                                                            "document.removeEventListener('message',this);"+
                                                            "var obj = JSON.parse(msg.data);"+
                                                            "if(obj.scatter=='transaction' && obj.key===key){"+
                                                                "if(obj.data){" +
                                                                    "resolve(obj.data);"+
                                                                "}else{"+
                                                                    "reject({});"+
                                                                "}"+
                                                            "}"+
                                                        "})"+
                                                    "}"+
                                                "}"+
                                            "}catch(error){"+
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
                    }).catch((error)=>{
                
                    });
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