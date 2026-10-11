package com.dailybalance.tracker;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Telephony;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.dailybalance.tracker.BuildConfig;
import androidx.core.app.NotificationCompat;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class TransactionNotificationListener extends NotificationListenerService {
    private static final String TAG = "TxNotificationListener";
    private static final String CHANNEL_ID = "daily_balance_tx_alerts";
    private static final int NOTIFICATION_ID = 9001;

    // Known Indian Bank & UPI App Packages + Default Messaging Packages
    private static final Set<String> ALLOWED_PACKAGES = new HashSet<>(Arrays.asList(
            "net.one97.paytm",                        // Paytm
            "com.google.android.apps.nbu.paisa.user", // Google Pay (GPay India)
            "com.phonepe.app",                        // PhonePe
            "com.sbi.lotusintouch",                   // SBI Yono
            "com.hdfcbank.payzapp",                   // HDFC PayZapp
            "com.snapwork.hdfc",                      // HDFC MobileBanking
            "com.csam.icici.bank.imobile",            // ICICI iMobile
            "com.axis.mobile",                        // Axis Mobile
            "com.google.android.apps.messaging",      // Google Messages
            "com.android.mms",                        // Stock Android SMS
            "com.vivo.permissionmanager"             // Vivo System SMS
    ));

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.w(TAG, "listener connected");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.w(TAG, "listener disconnected");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            requestRebind(new android.content.ComponentName(this, TransactionNotificationListener.class));
        }
    }

    private static final java.util.regex.Pattern CURRENCY_PATTERN = java.util.regex.Pattern.compile(
            "(?<![a-z])(?:rs\\.?|inr)\\s*\\d[\\d,]*(?:\\.\\d+)?|₹\\s*\\d[\\d,]*(?:\\.\\d+)?",
            java.util.regex.Pattern.CASE_INSENSITIVE
    );

    private static final java.util.regex.Pattern KEYWORD_PATTERN = java.util.regex.Pattern.compile(
            "\\b(debited|credited|sent|received|paid|withdrawn)\\b",
            java.util.regex.Pattern.CASE_INSENSITIVE
    );

    private static final java.util.regex.Pattern EXCLUSION_PATTERN = java.util.regex.Pattern.compile(
            "\\b(otp|verification\\s*code|bill\\s+due|due\\s+on|due\\s+date|failed|declined)\\b",
            java.util.regex.Pattern.CASE_INSENSITIVE
    );

    public static boolean isTransactionNotification(String title, String body, boolean isDefaultSms) {
        String titleStr = title == null ? "" : title;
        String bodyStr = body == null ? "" : body;

        // If package is default SMS, examine BODY only to prevent contact names contributing keywords/digits
        // For other allowlisted packages (Bank/UPI apps), examine title + body combined
        String targetText = isDefaultSms ? bodyStr : (titleStr + " " + bodyStr).trim();

        if (targetText.isEmpty()) {
            return false;
        }

        // 1. Negative exclusion check
        if (EXCLUSION_PATTERN.matcher(targetText).find()) {
            return false;
        }

        // 2. Currency pattern check
        if (!CURRENCY_PATTERN.matcher(targetText).find()) {
            return false;
        }

        // 3. Whole-word transaction keyword check
        if (!KEYWORD_PATTERN.matcher(targetText).find()) {
            return false;
        }

        return true;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();

        // 0. Explicit self-exclusion guard: never process or log our own notifications
        if (getPackageName().equals(packageName)) {
            return;
        }

        Log.w(TAG, "Notification Received -> Pkg: [" + packageName + "]");

        // 1. Resolve system default SMS package dynamically
        String defaultSmsPkg = Telephony.Sms.getDefaultSmsPackage(getApplicationContext());
        boolean isDefaultSms = defaultSmsPkg != null && defaultSmsPkg.equalsIgnoreCase(packageName);

        // 2. Check allowlist (Default SMS app OR known UPI/Bank app)
        boolean isAllowlisted = isDefaultSms || ALLOWED_PACKAGES.contains(packageName);

        if (BuildConfig.DEBUG) {
            Log.d(TAG, "Incoming Notification -> Pkg: [" + packageName + "] | DefaultSMS: [" + defaultSmsPkg + "] | Allowed: " + isAllowlisted);
        }

        if (!isAllowlisted) {
            return;
        }

        Notification notification = sbn.getNotification();
        if (notification == null) return;

        Bundle extras = notification.extras;
        String title = "";
        String text = "";

        if (extras != null) {
            CharSequence titleCS = extras.getCharSequence("android.title");
            if (titleCS != null && titleCS.length() > 0) {
                title = titleCS.toString();
            }

            CharSequence textCS = extras.getCharSequence("android.text");
            if (textCS == null || textCS.length() == 0) {
                textCS = extras.getCharSequence("android.bigText");
            }
            if (textCS == null || textCS.length() == 0) {
                textCS = extras.getCharSequence("android.subText");
            }
            if (textCS != null) {
                text = textCS.toString();
            }
        }

        String fullMessage = (title + " " + text).trim();
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "Allowlisted Package Match -> Pkg: [" + packageName + "]");
        }

        if (!isTransactionNotification(title, text, isDefaultSms)) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "Notification content ignored (not a financial transaction) for Pkg: [" + packageName + "]");
            }
            return;
        }

        // 3. Trigger High-Priority Local Notification UX
        showTransactionAlertNotification(fullMessage);

        // 4. Send intent to MainActivity directly
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("raw_sms", fullMessage);
        startActivity(intent);
    }

    private void showTransactionAlertNotification(String messageText) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Transaction Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alerts when a UPI/Bank transaction is detected");
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("raw_sms", messageText);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("New Transaction Detected")
                .setContentText("Tap to log: " + messageText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText("Tap to log transaction:\n" + messageText))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        manager.notify(NOTIFICATION_ID, builder.build());
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // No-op
    }
}
