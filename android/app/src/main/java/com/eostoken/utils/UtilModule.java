package com.eostoken.utils;

import android.os.Handler;
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

/**
 * Created by wangfei on 17/8/28.
 */

public class UtilModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext context;

    public UtilModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "UtilModule";
    }
    @ReactMethod
    public void isNotchScreen(Callback callback){
        callback.invoke(ScreenUtil.hasNotchScreen(context));
    }
   
}
