package com.eostoken.sdk;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;
import de.greenrobot.event.EventBus;
import com.eostoken.sdk.MessageToRN;
import com.eostoken.sdk.RNCallback;

/**
 * Created by wangfei on 17/8/28.
 */

public class SDKModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext context;

    public SDKModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;

        EventBus.getDefault().register(this);//注册
    }

    @Override
    public String getName() {
        return "SDKModule";
    }
    @ReactMethod
    public void startActivityFromReactNative(String url,String title,boolean theme){
        try {
            Activity currentActivity = getCurrentActivity();
            if(currentActivity != null){
                Intent intent = new Intent(currentActivity,DappActivity.class);
                intent.putExtra("url",url);
                intent.putExtra("title",title);
                intent.putExtra("theme",theme);
                currentActivity.startActivity(intent);
            }
        } catch (Exception e) {
            throw new JSApplicationIllegalArgumentException("open activity fail: " + e.getMessage());
        }
    }
    @ReactMethod
    public void callbackFromReactNative(String methodName,String callback,String resp){

        // Toast.makeText(context, "SDKModule:callbackFromReactNative:" + resp, Toast.LENGTH_SHORT).show();
        //收到rn回调信息，传给SDK
        EventBus.getDefault().post(new RNCallback(methodName,callback,resp));
    }
    
    /**监听，并调起RN */
    public void onEventMainThread(MessageToRN messageToRN) {
        Log.d("SDKModule","onEventMainThread(messageToRN)");
        if(messageToRN != null){
            String dataToRN = messageToRN.dataToRN;
            // Toast.makeText(context, "SDKModule:messageToRN:" + dataToRN, Toast.LENGTH_SHORT).show();
            sendEvent(dataToRN);
        }
    }

    public static void sendEvent(String dataToRN)
    {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("CallToRN", dataToRN);
    }
   
}
