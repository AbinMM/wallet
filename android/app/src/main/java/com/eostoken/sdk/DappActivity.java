package com.eostoken.sdk;

import android.os.Bundle;

import android.app.Activity;
import android.content.Intent;

import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactActivity;

import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebSettings.LayoutAlgorithm;

import android.content.ContentValues;

import android.webkit.JavascriptInterface;
import android.widget.Toast;


// import com.nexgo.jlkfg.jsbridge.BridgeImpl;
// import com.nexgo.jlkfg.jsbridge.CallAppRet;
import com.eostoken.sdk.JSBridge;
import com.eostoken.sdk.JSBridgeWebChromeClient;
import com.eostoken.sdk.MessageToRN;
import com.eostoken.sdk.RNCallback;
import org.json.JSONException;
import org.json.JSONObject;
import de.greenrobot.event.EventBus;

import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.modules.core.DeviceEventManagerModule;


/**
 * 贴吧通用WebView，支持设置cookie、自定义javascript interface
 * <p/>
 * 文档： 工程根目录/doc/index.html
 *
 * @author zhaoxianlie
 */
public class DappActivity extends Activity {

    private  String mUrl= "";
    private static WebView mWebView;
    //android调用JS网页的时候会用到
    // private static final Handler mHandler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("DappActivity","onCreate()");
        setContentView(com.eostoken.R.layout.activity_main);
        
        Intent intent =  getIntent();
        if(intent != null){
            mUrl = intent.getStringExtra("params");
        }
        initWebView();
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d("DappActivity","onStart()");
        if(mWebView != null ){
            mWebView.loadUrl(mUrl);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d("DappActivity","onResume()");
        mWebView.getSettings().setJavaScriptEnabled(true);//打开js
    }

    @Override
    protected void onStop() {
        Log.d("DappActivity","onStop()");
        super.onStop();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d("DappActivity","onDestroy()");
        mWebView.setVisibility(View.GONE);
        mWebView.destroy(); //退出时释放webView
        EventBus.getDefault().unregister(this); //解除注册
        mWebView = null ;
    }

    @Override
    public void finish() {
        super.finish();
        Log.d("DappActivity","finish()");
    }

//     public static void clearWebview(){
//         mWebView.clearView();
//         mWebView.clearHistory();
//     }

    /**
     * 初始化webview的相关参数
     * @return
     */
    private void initWebView() {
        try {
            EventBus.getDefault().register(this);//注册

            mWebView = (WebView) findViewById(com.eostoken.R.id.webview_entity);

            //开启webview调试
            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                mWebView.setWebContentsDebuggingEnabled(true);
            }

            WebSettings webSettings = mWebView.getSettings();
            //设置编码
            webSettings.setDefaultTextEncodingName("utf-8");
            // 启用js功能
            webSettings.setJavaScriptEnabled(true);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);//设置JS自动打开窗口
            //设置背景颜色 透明
            mWebView.setBackgroundColor(Color.argb(0, 0, 0, 0));

            //设置本地调用对象及其接口
            mWebView.addJavascriptInterface(new TPJSBrigeClient(), "TPJSBrigeClient");
            // BridgeImpl.mActivity = this;
            // JSBridge.register(this,"bridge", BridgeImpl.class);
            webSettings.setSupportZoom(true);//支持缩放

            webSettings.setLayoutAlgorithm(LayoutAlgorithm.NARROW_COLUMNS);
            webSettings.setUseWideViewPort(true);
            webSettings.setLoadWithOverviewMode(true); 

            // 滚动条设置
            mWebView.setHorizontalScrollBarEnabled(false);
            mWebView.setHorizontalScrollbarOverlay(false);
            mWebView.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_OVERLAY);
            // 必须要设置这个，要不然，webview加载页面以后，会被放大，这里的100表示页面按照原来尺寸的100%显示，不缩放
            mWebView.setInitialScale(100);

            //打开网页时，不调用系统浏览器，而是在本WebView中显示，则放开
            //调用本地 html 不需要设置WebViewClient
            // 处理webview中的各种通知、请求事件等
            // 处理webview中的js对话框、网站图标、网站title、加载进度等
            mWebView.setWebChromeClient(new JSBridgeWebChromeClient());

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    //SDK回调数据给DAPP
     void callbakcToWebview(String methodName,String callback,String resp){
        if(!callback.isEmpty() && mWebView != null)
        {
            String str_res = resp;
            // String name = "eosbille1234";
            // String str_res = "{wallets:{eos:[{name:" + name + ",address:" + name + ",tokens:{eos:" + "4.7583"  + "}}]}}";
            String execJs = "javascript:TPJSBrigeClient.startFunction(" + callback + "('" + str_res + "'));";
            // Toast.makeText(getApplicationContext(), methodName +"=" + execJs, Toast.LENGTH_SHORT).show();
            mWebView.loadUrl(execJs);
        }
    }

    /**
     * 监听RN返回的数据
     * @param rnCallback
     */
    public void onEventMainThread(RNCallback rnCallback) {
        Log.d("DappActivity","onEventMainThread(rnCallback)");
        // Toast.makeText(getApplicationContext(), "DappActivity:rnCallback:" + rnCallback.resp, Toast.LENGTH_SHORT).show();
        if(rnCallback != null){
            callbakcToWebview(rnCallback.methodName,rnCallback.callback,rnCallback.resp);
        }
    }

    /**
 * 所有WebView对外公开的JavascriptInterface都在这里统一进行维护
 *
 * @author wanghongyang
 * @mark 必须在proguard.cfg文件中进行如下配置： <br />
 * -keep public class com.baidufe.libs.TbJsBridge { *;}
 */
    class TPJSBrigeClient {

        public TPJSBrigeClient() {
           
        }

        @JavascriptInterface
        public void callMessage(String methodName,String params,String callback) 
        {
            if(methodName.isEmpty()){
                return;
            }
            //主动调起RN
            sendEventToRN(methodName,params,callback);
        }

        private void sendEventToRN(String methodName,String params,String callback) {
           
            try {
                JSONObject object = new JSONObject();
                object.put("methodName", methodName);
                object.put("params", params);
                object.put("callback", callback);
                
               final String dataToRN = object.toString();          
                // Toast.makeText(getApplicationContext(), dataToRN, Toast.LENGTH_SHORT).show();
                // new Handler().post(new Runnable() {
                //     @Override
                //     public void run() {
                EventBus.getDefault().post(new MessageToRN(dataToRN));
                //     }
                // });
                    
            } catch (Exception e) {
                //TODO: handle exception
                Toast.makeText(getApplicationContext(), "1111111", Toast.LENGTH_SHORT).show();
            }
       
        }
    }

}
