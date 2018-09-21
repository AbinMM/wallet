package com.eostoken.sdk;

import android.os.Bundle;

import android.app.Dialog;
import com.eostoken.R;

import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.widget.TextView;
import android.widget.Toast;

public class ProgressDialog {
    private Dialog progressDialog;
    private Context mContext;
    public ProgressDialog(Context context) {
        progressDialog = new Dialog(context,R.style.progress_dialog);
        progressDialog.setContentView(R.layout.dialog);
        progressDialog.setCancelable(true);
        progressDialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        TextView msg = (TextView) progressDialog.findViewById(R.id.id_tv_loadingmsg);
        msg.setText("操作进行中");

        mContext = context;
    }

    public void showDialog(){
        if(progressDialog != null)
        {
            progressDialog.show();
        }
    }
    public boolean isShowing()
    {
        if(progressDialog != null)
        {
            return progressDialog.isShowing();
        }else{
            return false;
        }
    }

    public void cancelDialog(){
        // progressDialog.cancel();
        progressDialog.dismiss();
    }
}
