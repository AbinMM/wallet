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


import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactActivity;

import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
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

import android.content.ContentValues;

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


public class DappActivity extends Activity {
    
    private  String mUrl = "";
    private  String title = "";
    private  static String device_id = "" ;
    private  WebView mWebView;
    //android调用JS网页的时候会用到
    private  final Handler mHandler = new Handler();
    private String invokeQRScanner_callback = "";  
    // private static int testnum = 0;
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
        Log.d("DappActivity","onCreate()");
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
            myProgressDialog = new ProgressDialog(DappActivity.this);
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
        if(mWebView != null)
        {
            // mWebView.setVisibility(View.GONE);
            try {
                mWebView.clearCache(true);   
                mWebView.clearHistory();  
                mWebView.destroy(); //退出时释放webView
            } catch (Exception e) {
                //TODO: handle exception
                e.printStackTrace();
            }
            mWebView = null ;
        }
        EventBus.getDefault().unregister(this); //解除注册
    }

    @Override
    public void finish() {
        super.finish();
        Log.d("DappActivity","finish()");
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
            mWebView.addJavascriptInterface(new TPJSBrigeClient(), "TPJSBrigeClient");
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
            String str_res = resp;
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
    class TPJSBrigeClient {

        public TPJSBrigeClient() {
           
        }

        @JavascriptInterface
        public void callMessage(String methodName, String params,String callback) 
        {
            if(methodName.isEmpty()){
                return;
            }
            // Toast.makeText(getApplicationContext(), methodName + "" + params, Toast.LENGTH_SHORT).show();
            // if(testnum > 0)
            // {
            //     return;
            // }
            // testnum++;
            // try {
            //     JSONObject obj = new JSONObject();
            //     // obj.put("signdata", "eosbille1234");
            //     obj.put("from", "eosbille1234");
            //     obj.put("to", "chengengping");
            //     obj.put("amount", 0.0010);
            //     obj.put("tokenName", "EOS");
            //     obj.put("precision", "4");
            //     obj.put("contract", "eosio.token");
            //     obj.put("memo", "test");
            //     obj.put("address", "EOS6tqnNR3AiUVFdX29rYFy6mEasi7whzVQ5wUTe2kcGgQhmY6gum");
            //     // obj.put("publicKey", "EOS8aRN1UaqEw2xE1PtRtuPmkUwVQ13UMWjMaUVoKdJQUwoyQi2WN");
            //     params = "";
            //     params = obj.toString();

            //    methodName = "eosTokenTransfer";
               
            // } catch (Exception e) {
            //     //TODO: handle exception
            // }
            switch(methodName){
                case "eosTokenTransfer":
                    if(params.isEmpty() || callback.isEmpty()){
                        return;
                    }
                    showTransfer(methodName,params,callback);
                    break;

                case "pushEosAction":
                    if(params.isEmpty() || callback.isEmpty()){
                        return;
                    }
                    showActions(methodName,params,callback);
                    break;

                case "eosAuthSign":
                case "sign":
                    if(params.isEmpty() || callback.isEmpty()){
                        return;
                    }
                    showEditDialog(methodName,params,callback,null);
                    break;
                
                case "getDeviceId":
                    getDeviceId(methodName,callback);
                    break;
                
                case "shareNewsToSNS":
                    //原生页面开启分享
                    break;

                case "invokeQRScanner":
                    invokeQRScanner(callback);
                    break;
                
                default:
                    //其他情况，调RN处理
                    sendEventToRN(methodName,params,"",callback);
                    break;
            }
           
        }
    
    }

    private void sendEventToRN(final String methodName,final String params,final String password,final String callback) {
        try {
            JSONObject object = new JSONObject();
            object.put("methodName", methodName);
            object.put("params", params);
            object.put("password", password);
            object.put("device_id", device_id);
            object.put("callback", callback);
            
           final String dataToRN = object.toString();      
            // Toast.makeText(getApplicationContext(), dataToRN, Toast.LENGTH_SHORT).show();
            EventBus.getDefault().post(new MessageToRN(dataToRN));

            //需要提示，则显示
            if(methodName.equals("eosTokenTransfer") || methodName.equals("pushEosAction"))
            {
             mHandler.post(new Runnable(){
                 @Override
                 public void run() {
                      if(!myProgressDialog.isShowing())
                      {
                          myProgressDialog.showDialog();
                      } 
                 }
             });
            }
                
        } catch (Exception error) {
            Toast.makeText(getApplicationContext(), "sendEventToRN:" + error.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

     //提示订单详情
    private void showTransfer(final String methodName,final String params,final String callback)
    {
        // params 
        String to = "";
        String from = "";
        String memo = "";
        String amount = "";
        String tokenName = "";
        try {
            JSONObject obj = new JSONObject(params);
            from = obj.getString("from");
            to = obj.getString("to");
            memo = obj.getString("memo");
            amount =  obj.getString("amount");
            tokenName =  obj.getString("tokenName");
        } catch (Exception e) {
            //TODO: handle exception
        }
        final Dialog  mShareDialog = new Dialog(this, R.style.dialog_bottom_full);
        mShareDialog.setCanceledOnTouchOutside(true);
        mShareDialog.setCancelable(true);

        Window window = mShareDialog.getWindow();
        window.setGravity(Gravity.BOTTOM);
        window.setWindowAnimations(R.style.popupAnimation);
        View view = View.inflate(this, R.layout.dialog_orderdetail, null);

        final TextView tvTo =  (TextView) view.findViewById(R.id.to_account);
        final TextView tvFrom =  (TextView) view.findViewById(R.id.from_account);
        final TextView tvMemo =  (TextView) view.findViewById(R.id.memo);
        final TextView tvAmount =  (TextView) view.findViewById(R.id.amount);

        tvTo.setText(to);
        tvFrom.setText(from);
        tvMemo.setText(memo);
        tvAmount.setText(amount + " "+tokenName);

        final Button btnConfirm = (Button) view.findViewById(R.id.confirm);
        final TextView btnCancel = (TextView) view.findViewById(R.id.cancel);
        btnConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showEditDialog(methodName,params,callback,mShareDialog);
            }
        });
        btnCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mShareDialog != null && mShareDialog.isShowing()) {
                    mShareDialog.dismiss();
                }
                //兼容EOSBET ，按取消,不返回
                // String resp = "";
                // try {
                //     JSONObject obj = new JSONObject();
                //     obj.put("result", false);
                //     obj.put("data", "{}");

                //     resp = obj.toString();
                // } catch (Exception e) {
                //     resp = "";
                // }
                // final String tmp_resp = resp;
                // new Handler().postDelayed(new Runnable(){  
                //     public void run() { 
                //         EventBus.getDefault().post(new RNCallback(methodName,callback,tmp_resp));
                //     } 
                // }, 100); 
            }
        });

        window.setContentView(view);
        window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT);//设置横向全屏
        
        window.setBackgroundDrawableResource(R.color.white);
        mShareDialog.show();
    }

     //提示订单详情  action
     private void showActions(final String methodName,final String params,final String callback)
     {
         // params 
         String str_params = params;
         String from = "";
         String actions_detail = "";
         String contract_account = "";
         String name = "";
         try {
             JSONObject obj = new JSONObject(str_params);
             //actions 解析
             JSONArray  actions = obj.getJSONArray("actions"); //数组
             //account 解析
             if(!obj.isNull("account"))
             {
                 from = obj.getString("account");   
             }

             for(int i = 0 ;i < actions.length();i++)
             {
                String strtemp = actions.getString(i);
                actions_detail += (" " + strtemp);

                JSONObject action_element = new JSONObject(strtemp);
                contract_account = action_element.getString("account");//合约名称
                name = action_element.getString("name"); //合约方法
                //未传 account,则从actions->authorization
                if(from.isEmpty())
                {
                    JSONArray  array_authorization = action_element.getJSONArray("authorization"); //数组
                    for(int j = 0;j < array_authorization.length();j++)
                    {
                        String authorization_element = array_authorization.getString(i); 
                        JSONObject obj_authorization_element = new JSONObject(authorization_element);
                        if(!obj_authorization_element.isNull("actor"))
                        {
                            String actor = obj_authorization_element.getString("actor");//取actor
                            String permission = "";
                            if(!obj_authorization_element.isNull("permission"))
                            {
                              permission = obj_authorization_element.getString("permission");
                            }

                            if(permission.equals("active") || permission.equals("owner"))
                            {
                                from = actor;
                                obj.put("account", from); // params 放入account
                                break;
                            }
                        }
                    }
                }
            } 
            
            //转存一次输入params，兼容有些游戏，只传actions,不传account
            str_params = obj.toString();
         } catch (Exception error) {
             //TODO: handle exception
         }

        if(actions_detail.isEmpty() || from.isEmpty()){
            Toast.makeText(getApplicationContext(), "输入参数无效", Toast.LENGTH_SHORT).show();
            String resp = "";
            try {
                JSONObject obj = new JSONObject();
                obj.put("result", false);
                obj.put("data", "{}");

                resp = obj.toString();
            } catch (Exception e) {
                resp = "";
            }
            callbakcToWebview(methodName,callback,resp);
            return ;  
         }
         final Dialog  mShareDialog = new Dialog(this, R.style.dialog_bottom_full);
         mShareDialog.setCanceledOnTouchOutside(true);
         mShareDialog.setCancelable(true);
 
         Window window = mShareDialog.getWindow();
         window.setGravity(Gravity.BOTTOM);
         window.setWindowAnimations(R.style.popupAnimation);
         View view = View.inflate(this, R.layout.dialog_order_actions, null);
 
         final TextView tvFrom =  (TextView) view.findViewById(R.id.from_account);
         final TextView tvMemo =  (TextView) view.findViewById(R.id.memo);
         final TextView tvMemoTitle =  (TextView) view.findViewById(R.id.memo_title);

         final LinearLayout ll_actionsdetail = (LinearLayout) view.findViewById(R.id.ll_actionsdetail);
         final TextView tv_actionsdetail = (TextView) view.findViewById(R.id.tv_actionsdetail);
         
         tvFrom.setText(from);
         tvMemo.setText(contract_account + " -> " + name);
 
         final Button btnConfirm = (Button) view.findViewById(R.id.confirm);
         final TextView btnCancel = (TextView) view.findViewById(R.id.cancel);
      
          //显示 actions详情
        final String str_memo = actions_detail;
         tvMemoTitle.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(ll_actionsdetail.getVisibility() == View.VISIBLE)
                {
                    ll_actionsdetail.setVisibility(View.GONE);
                }
                else{
                    ll_actionsdetail.setVisibility(View.VISIBLE);
                    tv_actionsdetail.setText(str_memo);
                }
            }
        });

        final String final_params = str_params;
         btnConfirm.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View view) {
                //  if (mShareDialog != null && mShareDialog.isShowing()) {
                //      mShareDialog.dismiss();
                //  }
                 showEditDialog(methodName,final_params,callback,mShareDialog);
             }
         });

         btnCancel.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View v) {
                 if (mShareDialog != null && mShareDialog.isShowing()) {
                     mShareDialog.dismiss();
                 }
                 //兼容EOSBET ，按取消,不返回
                //  String resp = "";
                //  try {
                //      JSONObject obj = new JSONObject();
                //      obj.put("result", false);
                //      obj.put("data", "{}");
 
                //      resp = obj.toString();
                //  } catch (Exception e) {
                //      resp = "";
                //  }
                //  final String tmp_resp = resp;
                //  new Handler().postDelayed(new Runnable(){  
                //      public void run() { 
                //          EventBus.getDefault().post(new RNCallback(methodName,callback,tmp_resp));
                //      } 
                //  }, 100); 
             }
         });
 
         window.setContentView(view);
         window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT);//设置横向全屏
         
         window.setBackgroundDrawableResource(R.color.white);
         mShareDialog.show();
     }

    private void showEditDialog(final String methodName,final String params,final String callback, final Dialog mShareDialog) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);

        View view = View.inflate(this, R.layout.dialog_input_pwd, null);

        EditText  editText = (EditText)view.findViewById(R.id.editPassword);
        InputFilter[] filters = new InputFilter[]{new InputFilter.LengthFilter(18)};
        editText.setFilters(filters);
        editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        Button btnCancel = (Button) view.findViewById(R.id.btnCancel);
        Button btnEnter = (Button) view.findViewById(R.id.btnEnter);
        
        builder.setView(view);
        final AlertDialog alertDialog = builder.create();
        btnCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                alertDialog.dismiss();
            }
        });
        btnEnter.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String input = editText.getText().toString().trim();
                if(input == null || input.length() < 4){
                    Toast.makeText(getApplicationContext(), "密码长度错", Toast.LENGTH_SHORT).show();
                    return ;
                }

                //关闭 订单详情
                if (mShareDialog != null && mShareDialog.isShowing()) {
                    mShareDialog.dismiss();
                }

                alertDialog.dismiss();
                sendEventToRN(methodName,params,input,callback);
            }
        });
        alertDialog.show();
    }

    private void  getDeviceId(final String methodName,final String callback)
    {
        String resp = "";
        try {
            JSONObject obj = new JSONObject();
            obj.put("device_id", device_id);
            resp = obj.toString();
        } catch (Exception e) {
            //TODO: handle exception
            resp = "";
        }
        final String tmp_resp = resp;

        new Handler().post(new Runnable(){  
            public void run() { 
                EventBus.getDefault().post(new RNCallback(methodName,callback,tmp_resp));
            } 
        }); 
    }

    private void invokeQRScanner(String callback){

        invokeQRScanner_callback = callback;  //调用的回调接口

        IntentIntegrator integrator = new IntentIntegrator(DappActivity.this);
        // 设置要扫描的条码类型，ONE_D_CODE_TYPES：一维码，QR_CODE_TYPES-二维码
        integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE_TYPES);
        integrator.setCaptureActivity(ScanActivity.class);
        integrator.setPrompt("请扫描二维码"); //底部的提示文字，设为""可以置空
        integrator.setCameraId(0); //前置或者后置摄像头
        integrator.setBeepEnabled(true); //扫描成功的「哔哔」声，默认开启
        integrator.setBarcodeImageEnabled(true);
        integrator.initiateScan();
    }

    private String  parseQRScanner(String strcoins){
        String resp = "";
        try
        {
            String lowerCointType = "eos";
            String upperCointType = "eos".toUpperCase();
            int length = strcoins.length();
            int index = strcoins.lastIndexOf(lowerCointType + ':'); //"eos:"
            if (index == 0) {
                index += (lowerCointType.length() + 1); //"eos:"
                int point = strcoins.lastIndexOf("?");
                if(point <= index || point >= length)
                {
                    return resp;
                }
                String account = strcoins.substring(index,point);
                if(account.isEmpty()){
                    return resp;
                }
                index = point + 1; //"?"
                int pointamount = strcoins.lastIndexOf("amount=");    
                if(index != pointamount || pointamount >= length){
                    return resp;
                }
                index += 7; //"amount="
                int point2 = strcoins.lastIndexOf("&");    
                if(point2 <= index || point2 >= length){
                    return resp;
                }
                String amount = strcoins.substring(index,point2);
                 // amount 允许为 ""
                // if(amount == undefined || amount == null){
                //     return this._errExit();
                // }
                index = point2 + 1; //"&"
                int pointtoken = strcoins.lastIndexOf("token=");   
                if(index != pointtoken || pointtoken >= length){
                    return resp;
                } 
                index += 6; //"token="
                String symbol = strcoins.substring(index,length);
                if(symbol.isEmpty() || !symbol.equals(upperCointType))  //'EOS'
                {
                    return resp;
                }
                resp = account;                
            } 
        } catch (Exception e) {
            //TODO: handle exception
        }

        return resp;
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
                ClipboardManager cm = (ClipboardManager) DappActivity.this.getSystemService(Context.CLIPBOARD_SERVICE);
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
            }
        });
 
         window.setContentView(view);
         window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT);//设置横向全屏
         
         window.setBackgroundDrawableResource(R.color.white);
         mShareDialog.show();
     }

}
