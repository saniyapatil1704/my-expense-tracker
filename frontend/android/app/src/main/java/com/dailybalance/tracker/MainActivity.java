package com.dailybalance.tracker;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.dailybalance.tracker.BuildConfig;
import com.getcapacitor.BridgeActivity;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int PERMISSION_REQUEST_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NotificationPermissionPlugin.class);
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        rebindNotificationListener();
        handleIncomingIntent(getIntent());
    }

    private void rebindNotificationListener() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                android.content.ComponentName cn = new android.content.ComponentName(this, TransactionNotificationListener.class);
                android.service.notification.NotificationListenerService.requestRebind(cn);
                Log.w(TAG, "Requested rebind for TransactionNotificationListener");
            } catch (Exception e) {
                Log.w(TAG, "Failed to requestRebind: " + e.getMessage());
            }
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        PERMISSION_REQUEST_CODE
                );
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;

        // DEBUG Test Intent Hook
        if (BuildConfig.DEBUG && "com.dailybalance.tracker.TEST_PAYLOAD".equals(intent.getAction())) {
            String testSms = intent.getStringExtra("raw_sms");
            if (testSms != null) {
                dispatchSmsToWebView(testSms);
                return;
            }
        }

        String rawSms = intent.getStringExtra("raw_sms");
        if (rawSms == null || rawSms.isEmpty()) {
            if (intent.getData() != null) {
                rawSms = intent.getData().getQueryParameter("raw_sms");
            }
        }

        if (rawSms != null && !rawSms.isEmpty()) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "Dispatching raw SMS to WebView");
            }
            final String textToDispatch = rawSms;
            dispatchSmsToWebView(textToDispatch);
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        dispatchSmsToWebView(textToDispatch);
                    }
                }, 1000);
            }
        }
    }

    private void dispatchSmsToWebView(String rawSms) {
        // Use JSONObject.quote for safe JavaScript string escaping (handles quotes, backslashes, newlines, U+2028, U+2029)
        String jsonQuotedSms = JSONObject.quote(rawSms);

        final String jsCode = "if (window.parseUPISMS) {" +
                "  var result = window.parseUPISMS(" + jsonQuotedSms + ");" +
                "  if (result) {" +
                "    window.pendingUpiSMS = result;" +
                "    window.dispatchEvent(new CustomEvent('upi_sms_received', { detail: result }));" +
                "  }" +
                "} else {" +
                "  window.pendingUpiSMS = { amount: null, rawSMS: " + jsonQuotedSms + " };" +
                "}";

        bridge.getWebView().post(new Runnable() {
            @Override
            public void run() {
                bridge.getWebView().evaluateJavascript(jsCode, null);
            }
        });
    }
}
