import FingerprintScanner from 'react-native-fingerprint-scanner';
var CryptoJS = require("crypto-js");
const appkey="eostoken";
const Security = {
  payPass:{},
  paySalt:{},
  hasTouchID:false,
  chechTouchId:function(){
    FingerprintScanner.isSensorAvailable().then(biometryType =>this.hasTouchID=true).catch(error => this.hasTouchID=false);
  },
  salt:function() {
    var salt = CryptoJS.lib.WordArray.random(32);
    return salt;
  },
  pbkdf2:function(password,salt){
    var key128Bits = CryptoJS.PBKDF2(password,salt,{keySize:32});
    return key128Bits.toString();
  },
  encrypt:function(content,password){
    var ciphertext = CryptoJS.AES.encrypt(content,password);
    return ciphertext.toString();
  },
  decrypt:function(content,password){
    var bytes  = CryptoJS.AES.decrypt(content,password);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  },
  hasPayPass:function(account){
    if(this.payPass[account] && this.paySalt[account]){
      return true
    }
    return false;
  },
  savePayPass:function(account,password){
    let salt = this.salt();
    let sk = this.pbkdf2(appkey,salt);
    let spass = this.encrypt(password,sk)
    this.payPass[account]=spass;
    this.paySalt[account]=salt;
  },
  getPayPass:function(account){
    if(this.payPass[account] && this.paySalt[account]){
      try{
          let sk = this.pbkdf2(appkey,this.paySalt[account]);
          return this.decrypt(this.payPass[account],sk);
      }catch(e){
        return null;
      }
    }
    return null;
  }
}

module.exports = Security;
