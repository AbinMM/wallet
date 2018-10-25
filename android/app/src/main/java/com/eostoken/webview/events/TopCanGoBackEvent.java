
package com.eostoken.webview.events; 

import javax.annotation.Nullable;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Picture;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils;
import android.view.ViewGroup.LayoutParams;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.CookieManager;

import com.facebook.common.logging.FLog;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.ContentSizeChangeEvent;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.views.webview.events.TopLoadingErrorEvent;
import com.facebook.react.views.webview.events.TopLoadingFinishEvent;
import com.facebook.react.views.webview.events.TopLoadingStartEvent;
import com.facebook.react.views.webview.events.TopMessageEvent;
import com.facebook.react.uimanager.events.RCTEventEmitter;


import org.json.JSONObject;
import org.json.JSONException;


public class TopCanGoBackEvent extends Event<TopCanGoBackEvent> {
    public static final String EVENT_NAME = "topChange";
    private WritableMap mEventData;
    public TopCanGoBackEvent(int viewId, WritableMap eventData) {
     super(viewId);
     mEventData = eventData;
    }
    @Override
    public String getEventName() {
     return EVENT_NAME;
    }
    @Override
    public boolean canCoalesce() {
     return false;
    }
    @Override
    public short getCoalescingKey() {
     // All events for a given view can be coalesced.
     return 0;
    }
    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
     rctEventEmitter.receiveEvent(getViewTag(), getEventName(), mEventData);
    }
   }