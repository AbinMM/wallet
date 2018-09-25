package com.eostoken.sdk;

import android.webkit.JsPromptResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ProgressBar;
import android.view.View;

/**
 * @author lizhangqu
 * @since 2016-02-27 22:08
 */
public class JSBridgeWebChromeClient extends WebChromeClient {

    private ProgressBar mProgressBar;

    public JSBridgeWebChromeClient(ProgressBar mProgressBar) {
        this.mProgressBar = mProgressBar;
    }

    @Override
    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
        result.confirm(JSBridge.callJava(view, message));
        return true;
    }
    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        super.onProgressChanged(view, newProgress);
        if(mProgressBar != null)
        {
            if (newProgress == 100) {
                    mProgressBar.setVisibility(View.GONE);
            }else{
                    mProgressBar.setVisibility(View.VISIBLE);
                    mProgressBar.setProgress(newProgress);
            }
        }
    }
}