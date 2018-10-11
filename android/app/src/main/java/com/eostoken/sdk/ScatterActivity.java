package com.eostoken.sdk;

import android.os.Bundle;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.text.InputFilter;
import android.text.InputType;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;

import android.telephony.TelephonyManager;


import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.util.Log;

import android.net.http.SslError;

import android.view.LayoutInflater;
import android.view.View;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.RelativeLayout;

import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.webkit.ClientCertRequest;
import android.webkit.HttpAuthHandler;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings.LayoutAlgorithm;

import android.webkit.JavascriptInterface;
import android.widget.EditText;
import android.widget.Toast;
import android.graphics.drawable.ColorDrawable;

import com.eostoken.R;

import com.eostoken.sdk.JSBridge;
import com.eostoken.sdk.JSBridgeWebChromeClient;
import com.eostoken.sdk.MessageToRN;
import com.eostoken.sdk.ProgressDialog;
import com.eostoken.sdk.RNCallback;
import com.eostoken.sdk.ScanActivity;

import org.json.JSONException;
import org.json.JSONArray;
import org.json.JSONObject;

import de.greenrobot.event.EventBus;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.net.InetAddress;
import java.net.InetSocketAddress;
// import com.eostoken.MainActivity;

import java.net.URI;
import java.net.URISyntaxException;

import org.java_websocket.WebSocketImpl;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

public class ScatterActivity extends Activity {
    
    private  String mUrl = "";
    private  String title = "";
    private  static String device_id = "" ;
    private  WebView mWebView;
    //android调用JS网页的时候会用到
    private  final Handler mHandler = new Handler();
    private String invokeQRScanner_callback = "";  
    private RelativeLayout rl_title;
    private TextView tv_close;
    private TextView tv_title;
    private ImageButton btn_share;

    private ProgressBar mProgressBar;
    private ProgressDialog myProgressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        boolean theme = false;

        super.onCreate(savedInstanceState);
        Log.d("ScatterActivity","onCreate()");
        setContentView(R.layout.activity_main);
        
        Intent intent =  getIntent();
        if(intent != null){
            mUrl = intent.getStringExtra("url");
            title = intent.getStringExtra("title");
            theme = intent.getBooleanExtra("theme", false);
        }

        if(device_id.isEmpty())
        {
            try {
                TelephonyManager telephonyManager = (TelephonyManager) getApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);
                device_id = telephonyManager.getDeviceId();
                if (device_id == null) {
                    device_id = "";
                }
            } catch (Exception error) {
                error.printStackTrace();
            }
        }
        rl_title = (RelativeLayout)findViewById(R.id.title_user_artical);
        tv_close =  (TextView)findViewById(R.id.tv_close);
        tv_title =  (TextView)findViewById(R.id.titleName);
        btn_share =  (ImageButton)findViewById(R.id.share_imbtn);
        mProgressBar =  (ProgressBar)findViewById(R.id.progressBar);

        tv_title.setText(title);
        tv_close.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                finish();
            }
        });

        btn_share.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                rightOnclick();
            }
        });

        Window window = getWindow();
        //取消设置透明状态栏,使 ContentView 内容不再覆盖状态栏
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        //需要设置这个 flag 才能调用 setStatusBarColor 来设置状态栏颜色
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        //设置状态栏颜色
        if(!theme)
        {
            window.setStatusBarColor(getResources().getColor(R.color.blue));
            rl_title.setBackgroundColor(getResources().getColor(R.color.blue));
        }else{
            window.setStatusBarColor(getResources().getColor(R.color.black));
            rl_title.setBackgroundColor(getResources().getColor(R.color.black));
        }

        if(myProgressDialog == null)
        {
            myProgressDialog = new ProgressDialog(ScatterActivity.this);
        }
        initWebView();
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d("ScatterActivity","onStart()");
        if(mWebView != null ){
            // mWebView.loadUrl(mUrl);
            // mWebView.loadUrl("file:///android_asset/www/index.html");
            mWebView.loadUrl("file:///android_asset/sample01/index.html");
            // mWebView.loadUrl("http://developer.mathwallet.org/sample01/");
        }
         //开始监听
        try {
            WebSocketService socketServer = new WebSocketService(50005);
            socketServer.start();
        } catch (Exception e) {
            //TODO: handle exception
            // MainActivity.Test("ScatterActivity启动错:" +  e.getMessage());//debug
        }
       
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d("ScatterActivity","onResume()");
        mWebView.getSettings().setJavaScriptEnabled(true);//打开js
    }
   
    @Override
    protected void onStop() {
        Log.d("ScatterActivity","onStop()");
        super.onStop();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d("ScatterActivity","onDestroy()");
        if(mWebView != null)
        {
            try {
                mWebView.stopLoading();
                // mWebView.setWebChromeClient(null);
                // mWebView.setWebViewClient(null);
                mWebView.setVisibility(View.GONE);
                // mWebView.clearCache(true);   
                // mWebView.clearHistory();  
                // mWebView.loadUrl("about:blank");
                // mWebView.freeMemory();
                // mWebView.pauseTimers();
                // mWebView.removeAllViews();
                mWebView.destroy(); //退出时释放webView
            } catch (Exception e) {
                //TODO: handle exception
                e.printStackTrace();
            }
            mWebView = null ;
        }
        EventBus.getDefault().unregister(this); //解除注册

        //停止监听
    }

    @Override
    public void finish() {
        super.finish();
        Log.d("ScatterActivity","finish()");
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            if (keyCode == KeyEvent.KEYCODE_BACK) { 
                if(mWebView.canGoBack()){
                    mWebView.goBack();  
                }else{
                    finish();
                }
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

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
            // mWebView.addJavascriptInterface(new ScatterJS(mWebView), "scatter");
            
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

            webSettings.setAppCacheEnabled(true); //设置 缓存模式 
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT); // 开启 DOM storage API 功能 
            webSettings.setDomStorageEnabled(true); 

            // webSettings.setUserAgentString("Name/tokenbank");
            mWebView.requestFocusFromTouch();//支持获取手势焦点

            //打开网页时，不调用系统浏览器，而是在本WebView中显示，则放开
            //调用本地 html 不需要设置WebViewClient
            // 处理webview中的各种通知、请求事件等
            // 处理webview中的js对话框、网站图标、网站title、加载进度等
            mWebView.setWebChromeClient(new JSBridgeWebChromeClient(mProgressBar));
            mWebView.setWebViewClient(new WebViewClient(){
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    view.loadUrl(url);
                    return true;
                }          
                @Override
                //重写此方法才能够处理在浏览器中的按键事件。
                public boolean shouldOverrideKeyEvent(WebView view, KeyEvent event) {
                    return super.shouldOverrideKeyEvent(view, event);
                }

                @Override
                public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error){

                    //handler.cancel(); 默认的处理方式，WebView变成空白页
                    handler.proceed();  // let's ignore ssl error

                    //handleMessage(Message msg); 其他处理
                }

                @Override
                public void onReceivedClientCertRequest(WebView view, ClientCertRequest request) {
                    super.onReceivedClientCertRequest(view, request);
                }

                @Override
                public void onReceivedHttpAuthRequest(WebView view, HttpAuthHandler handler, String host, String realm) {
                    super.onReceivedHttpAuthRequest(view, handler, host, realm);
                }

            });

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    //SDK回调数据给DAPP
    public void callbakcToWebview(String methodName,String callback,String resp)
     {
        if(!callback.isEmpty() && mWebView != null)
        {
            //WebSocket 通讯

        }
    }

    /**
     * 监听RN返回的数据
     * @param rnCallback
     */
    public void onEventMainThread(RNCallback rnCallback) {
        Log.d("ScatterActivity","onEventMainThread(rnCallback)");
        String errmsg = "";
        boolean result = false;

        //SDK 有错误信息返回，则提示 错误信息
        String resp = rnCallback.resp;
        if(!resp.isEmpty()){
            try {
                JSONObject obj = new JSONObject(resp);
                if(!obj.isNull("result"))
                {
                    result = obj.getBoolean("result");
                    if(result == false){
                        if(!obj.isNull("msg"))
                        {
                            String msg =  obj.getString("msg");
                            if(!msg.isEmpty())
                            {
                                errmsg = msg;
                                Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show();
                            }
                        }
                    }   
                }
            } catch (Exception error) {
                //TODO: handle exception
            }
        }

        //已经显示,关闭进度条
        if(rnCallback.methodName.equals("eosTokenTransfer") || rnCallback.methodName.equals("pushEosAction"))
        {
            if(myProgressDialog != null)
            {
                if(myProgressDialog.isShowing())
                {
                    myProgressDialog.cancelDialog();
                    if(result)
                    {
                        Toast.makeText(getApplicationContext(), "操作成功", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        }
        if(rnCallback != null){
            //  if(errmsg.equals("密码错误"))
            //  {  //不能兼容，eosAuthSign ,eosSign 调用本身密码错，应该要回调
            //      //不回调给dapp;兼容EOSBET
            //  }else
            //  {
                callbakcToWebview(rnCallback.methodName,rnCallback.callback,rnCallback.resp);
            //  }
        }
    }

    /**
 * 所有WebView对外公开的JavascriptInterface都在这里统一进行维护
 *
 * @author wanghongyang
 * @mark 必须在proguard.cfg文件中进行如下配置： <br />
 * -keep public class com.baidufe.libs.TbJsBridge { *;}
 */
    class scatter {

        public scatter() {
           
        }
        @JavascriptInterface
        public void callMessage(String methodName, String params,String callback) 
        {
            if(methodName.isEmpty()){
                return;
            }
        }
    
    }

    // 回调获取扫描得到的条码值
    @Override
   protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        String resp = "";
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if(result != null) {
            if(result.getContents() == null) {
                // Toast.makeText(this, "扫码取消！", Toast.LENGTH_LONG).show();
            } else {
                // resp = parseQRScanner(result.getContents());
                String qrResult = result.getContents();  //TODO 直接返回，不解析
                try {
                    JSONObject obj = new JSONObject();
                    obj.put("qrResult", qrResult);
                    resp = obj.toString();
                } catch (Exception e) {
                    //TODO: handle exception
                    resp = "";
                }
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
        callbakcToWebview("invokeQRScanner",invokeQRScanner_callback,resp);
    }


     //刷新提示
     private void rightOnclick()
     {
         final Dialog  mShareDialog = new Dialog(this, R.style.dialog_bottom_full);
         mShareDialog.setCanceledOnTouchOutside(true);
         mShareDialog.setCancelable(true);
 
         Window window = mShareDialog.getWindow();
         window.setGravity(Gravity.BOTTOM);
         window.setWindowAnimations(R.style.popupAnimation);
         View view = View.inflate(this, R.layout.dialog_share, null);
 
         final RelativeLayout rl_refresh = (RelativeLayout) view.findViewById(R.id.view_refresh);
         final RelativeLayout rl_copy_url = (RelativeLayout) view.findViewById(R.id.view_copy_url);
         final RelativeLayout rl_share = (RelativeLayout) view.findViewById(R.id.view_share);
         rl_refresh.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View view) {
                 if (mShareDialog != null && mShareDialog.isShowing()) {
                     mShareDialog.dismiss();
                 }
                
                 if(mWebView != null ){
                    mWebView.loadUrl(mUrl);
                }
             }
         });
         rl_copy_url.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (mShareDialog != null && mShareDialog.isShowing()) {
                    mShareDialog.dismiss();
                }
                ClipboardManager cm = (ClipboardManager) ScatterActivity.this.getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("text",mUrl));

                Toast.makeText(getApplicationContext(),  mUrl + "已复制", Toast.LENGTH_SHORT).show();
            }
        });

        rl_share.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (mShareDialog != null && mShareDialog.isShowing()) {
                    mShareDialog.dismiss();
                }
                Toast.makeText(getApplicationContext(), "暂不支持", Toast.LENGTH_SHORT).show();
                // testWbClient();
            }
        });
 
         window.setContentView(view);
         window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT);//设置横向全屏
         
         window.setBackgroundDrawableResource(R.color.white);
         mShareDialog.show();
     }

    //  private void testWbClient()
    //  {
    //      try {
    //     WebSocketClient mSocketClient = new WebSocketClient(new URI("ws://127.0.0.1:50005/"), new Draft_6455()) {
    //         @Override
    //         public void onOpen(ServerHandshake handshakedata) {
    //             Log.d("picher_log", "打开通道" + handshakedata.getHttpStatus());
    //             // handler.obtainMessage(0, message).sendToTarget();
    //         }

    //         @Override
    //         public void onMessage(String message) {
    //             Log.d("picher_log", "接收消息" + message);
    //             // handler.obtainMessage(0, message).sendToTarget();
    //         }

    //         @Override
    //         public void onClose(int code, String reason, boolean remote) {
    //             Log.d("picher_log", "通道关闭");
    //             // handler.obtainMessage(0, message).sendToTarget();
    //         }

    //         @Override
    //         public void onError(Exception ex) {
    //             Log.d("picher_log", "链接错误");
    //         }
    //     };
    //     mSocketClient.connect();
    //     } catch (Exception e) {
    //         //TODO: handle exception
    //         MainActivity.Test("testWbClient error:" +  e.getMessage());//debug
    //     }
    //  }
}
