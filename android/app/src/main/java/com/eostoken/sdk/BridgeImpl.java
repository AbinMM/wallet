package com.eostoken.sdk;

import android.app.Activity;
import android.os.RemoteException;
import android.text.TextUtils;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;
import java.util.Map;


/**
 * @author lizhangqu
 * @since 2016-02-27 22:11
 */
public class BridgeImpl implements IBridge {

    public static Activity mActivity;

    // 下述方法，执行完后必须回调到javascript，以onFinish()，否则会造成内存泄露
    @Override
    public String toString() {
        return super.toString();
    }
    @Override
    public int hashCode() {
        return super.hashCode();
    }
    @Override
    public boolean equals(Object o) {
        return super.equals(o);
    }
    // /** 组装json对象 */
    // public static JSONObject getJSONObject(int code, String msg, JSONObject result) {
    //     JSONObject object = new JSONObject();
    //     try {
    //         object.put("code", code);
    //         object.put("msg", msg);
    //         object.putOpt("result", result);
    //         return object;
    //     } catch (JSONException e) {
    //         e.printStackTrace();
    //     }
    //     return null;
    // }

    // /**
    //  * 出现异常时，回调到javascript
    //  * @param callback
    //  */
    // private static void callbackException(final Callback callback) {
    //     int code = JSBridgeRetStatus.CODE_ERROR;
    //     String msg = JSBridgeRetStatus.MSG_ERROR;
    //     JSONObject object = new JSONObject();

    //     callback.apply(getJSONObject(code, msg, object));
    // }

    /**
     * 二维码扫描
     *
     * @param webView
     * @param param    jsson : param 5
     * @param callback 回调函数 返回扫描内容
     */
    public static void scanQRcode(WebView webView, JSONObject param, final Callback callback) throws RemoteException {
        // //1.取javascript传递过来的入参
        // int timeout = (int) param.opt("timeout");

        // //3.回调计算结果，传递code,msg,object返回给javascript
        // OnScannedListener onScannedListener = new OnScannedListener() {
        //     @Override
        //     public void callbackFun(String contentResult, int status) {
        //         int code = status;
        //         String msg = JSBridgeRetStatus.MSG_ERROR;
        //         JSONObject object = new JSONObject();
        //         try {
        //             if (status == 0) {
        //                 code = JSBridgeRetStatus.CODE_OK;
        //                 msg = JSBridgeRetStatus.MSG__OK;
        //                 object.put("scanJsonStr", contentResult);
        //                 LogUtil.v("BridgeImpl scanQRcode", contentResult);
        //             } else {
        //                 LogUtil.v("BridgeImpl scanQRcode", "receive err");
        //             }
        //         } catch (Exception e) {
        //             e.printStackTrace();
        //         }
        //         callback.apply(getJSONObject(code, msg, object));
        //     }
        // };
        // //2.计算执行
        // try {
        //     ScannerBinder scannerBinder = new ScannerBinder(XgdApi.getInstance().getContext());
        //     scannerBinder.startScan(timeout, onScannedListener);
        // } catch (RemoteException e) {
        //     e.printStackTrace();
        //     callbackException(callback);
        // }

    }

   
    
}