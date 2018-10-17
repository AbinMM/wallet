
export default function RenderScatter(props) {
  let account = {name:props.defaultWallet.account,
    publicKey:props.defaultWallet.activePublic,
    perm_name:"active" };
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
        eos:(e,t,r,n) =>{
            return {
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
                transfer:function(from,to,amount,memo){
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
                    alert("a");
                    return new Promise((resolve, reject) => {
                        var key = new Date().getTime();
                        window.postMessage(JSON.stringify({key,scatter:"transaction",params:{...actions}}));
                        document.addEventListener("message",function(msg){
                            document.removeEventListener("message",this);
                            var obj = eval("(" + msg.data + ")");
                            if(obj.scatter==="transaction" && obj.key===key){ 
                                alert("b");
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