package com.eostoken.sdk;

public class RNCallback {
    public String methodName;
    public String callback;
    public String resp;

    public RNCallback(String methodName,String callback,String resp)
    {
        this.methodName = methodName;
        this.callback = callback;
        this.resp = resp;
    }
}