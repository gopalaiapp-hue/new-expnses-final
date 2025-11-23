package com.kharchapal.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean doubleBackToExitPressedOnce = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onBackPressed() {
        // Get the bridge's web view
        WebView webView = getBridge().getWebView();
        
        // If web view can go back in history, navigate back
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            // At root of navigation, require double tap to exit
            if (doubleBackToExitPressedOnce) {
                super.onBackPressed();
                return;
            }
            
            this.doubleBackToExitPressedOnce = true;
            Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();
            
            // Reset the double back flag after 2 seconds
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    doubleBackToExitPressedOnce = false;
                }
            }, 2000);
        }
    }
}
