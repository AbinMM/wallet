// import WalletUtils from "../utils/WalletUtils";

export default function RenderScatter(props) {
    //   let account = WalletUtils.selectAccount();
        var account = {name:"eosbille1234",publicKey:"EOS6tqnNR3AiUVFdX29rYFy6mEasi7whzVQ5wUTe2kcGgQhmY6gum",
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
                    transaction:function(actions){
                        alert("a");
                        return new Promise((resolve, reject) => {
                            var key = new Date().getTime();
                            window.postMessage(JSON.stringify({key,scatter:"transaction",params:{...actions}}));
                            document.addEventListener("message",function(msg){
                                document.removeEventListener("message",this);
                                var obj = eval("(" + msg.data + ")");
                                if(obj.scatter==="transaction" && obj.key===key){ 
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