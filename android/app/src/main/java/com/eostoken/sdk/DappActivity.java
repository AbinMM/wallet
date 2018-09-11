package com.eostoken.sdk;

import android.os.Bundle;

import android.app.Activity;
import android.app.AlertDialog;
import android.text.InputFilter;
import android.text.InputType;
import android.content.Intent;

import android.telephony.TelephonyManager;

import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactActivity;

import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
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
import android.widget.EditText;
import android.widget.Toast;


import com.eostoken.sdk.JSBridge;
import com.eostoken.sdk.JSBridgeWebChromeClient;
import com.eostoken.sdk.MessageToRN;
import com.eostoken.sdk.RNCallback;
import com.eostoken.sdk.ScanActivity;
import org.json.JSONException;
import org.json.JSONObject;
import de.greenrobot.event.EventBus;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

/**
 * 贴吧通用WebView，支持设置cookie、自定义javascript interface
 * <p/>
 * 文档： 工程根目录/doc/index.html
 *
 * @author zhaoxianlie
 */
public class DappActivity extends Activity {

    private  String mUrl= "";
    private static String device_id = "" ;
    private static WebView mWebView;
    //android调用JS网页的时候会用到
    // private static final Handler mHandler = new Handler();
    private String invokeQRScanner_callback = "";  

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("DappActivity","onCreate()");
        setContentView(com.eostoken.R.layout.activity_main);
        
        Intent intent =  getIntent();
        if(intent != null){
            mUrl = intent.getStringExtra("params");
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
        // mWebView.getSettings().setJavaScriptEnabled(true);//打开js
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
    public void callbakcToWebview(String methodName,String callback,String resp)
     {
        if(!callback.isEmpty() && mWebView != null)
        {
            String str_res = resp;
            String execJs = "javascript:TPJSBrigeClient.startFunction(" + callback + "('" + str_res + "'));";
            // Toast.makeText(getApplicationContext(), methodName +"=" + execJs, Toast.LENGTH_LONG).show();
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
        public void callMessage(String methodName, String params,String callback) 
        {
            if(methodName.isEmpty()){
                return;
            }
            // try {
            //     JSONObject obj = new JSONObject();
            //     obj.put("signdata", "eosbille1234");
            //     obj.put("from", "chengengping");
            //     // obj.put("to", "chengengping");
            //     // obj.put("amount", 0.0010);
            //     // obj.put("tokenName", "EOS");
            //     // obj.put("precision", "4");
            //     // obj.put("contract", "eosio.token");
            //     // obj.put("memo", "test");
            //     // obj.put("publicKey", "EOS6tqnNR3AiUVFdX29rYFy6mEasi7whzVQ5wUTe2kcGgQhmY6gum");
            //     obj.put("publicKey", "EOS8aRN1UaqEw2xE1PtRtuPmkUwVQ13UMWjMaUVoKdJQUwoyQi2WN");
            //     params = "";
            //     params = obj.toString();

            //    methodName = "invokeQRScanner";
               
            // } catch (Exception e) {
            //     //TODO: handle exception
            // }

            switch(methodName){
                case "eosTokenTransfer":
                case "pushEosAction":
                case "eosAuthSign":
                case "sign":
                    if(params.isEmpty() || callback.isEmpty()){
                        return;
                    }
                    //提示订单详情
                    showEditDialog(methodName,params,callback);
                    break;
                
                case "getDeviceId":
                    //取 手机ID 
                    getDeviceId(methodName,callback);
                    break;
                
                case "shareNewsToSNS":
                    //原生页面开启分享
                    break;

                case "invokeQRScanner":
                    //原生页面开启扫码
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
                
        } catch (Exception error) {
            Toast.makeText(getApplicationContext(), "sendEventToRN:" + error.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void showEditDialog(final String methodName,final String params,final String callback) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
    //        builder.setIcon(R.drawable.ic_launcher);
        builder.setTitle("请输入密码");
        final EditText editText = new EditText(this);
        InputFilter[] filters = new InputFilter[]{new InputFilter.LengthFilter(18)};
        editText.setFilters(filters);
        editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        builder.setView(editText);
        builder.setPositiveButton("确定", null);
        builder.setNegativeButton("取消", new DialogInterface.OnClickListener()
        {
            @Override
            public void onClick(DialogInterface dialog, int which)
            {
                dialog.dismiss();
                String resp = "";
                try {
                    JSONObject obj = new JSONObject();
                    obj.put("result", false);

                    JSONObject sub_obj = new JSONObject();
                    sub_obj.put("transactionId", "");
                    obj.put("data", sub_obj.toString());

                    resp = obj.toString();
                } catch (Exception e) {
                    //TODO: handle exception
                    resp = "";
                }
                final String tmp_resp = resp;
                new Handler().postDelayed(new Runnable(){  
                    public void run() { 
                        EventBus.getDefault().post(new RNCallback(methodName,callback,tmp_resp));
                    } 
                }, 100); 
            }
        });
        final AlertDialog alertDialog = builder.create();
        alertDialog.show();
        alertDialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String input = editText.getText().toString().trim();
                if(input == null || input.length() < 4){
                    Toast.makeText(getApplicationContext(), "密码长度错", Toast.LENGTH_SHORT).show();
                    return ;
                }

                alertDialog.dismiss();
                // 待添加 通讯等待提示???
                sendEventToRN(methodName,params,input,callback);
            }
        });
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
                // Toast.makeText(this, "扫描成功，条码值: " + result.getContents(), Toast.LENGTH_LONG).show();
                // resp = parseQRScanner(result.getContents());
                resp = result.getContents();  //TODO 直接返回，不解析
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }

        final String tmp_resp = resp;
        new Handler().post(new Runnable(){  
            public void run() { 
                EventBus.getDefault().post(new RNCallback("invokeQRScanner",invokeQRScanner_callback,tmp_resp));
            } 
        }); 
    }

}
