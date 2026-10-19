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
            "\\b(otp|verification\\s*code|bill\\s+due|due\\s+on|due\\s+date|failed|declined|recharge|validity|talktime|data\\s+pack|plan\\s+expires)\\b",
            java.util.regex.Pattern.CASE_INSENSITIVE
    );

    // Alphanumeric sender ID regex: e.g. "VM-BANKX" (2 letters, hyphen, 3-10 alphanumeric) or 3-11 all-caps chars with no spaces
    private static final java.util.regex.Pattern SENDER_ID_PATTERN = java.util.regex.Pattern.compile(
            "^[A-Z]{2}-[A-Z0-9]{3,10}$|^[A-Z0-9]{3,11}$"
    );

    public static boolean isTransactionNotification(String title, String body, boolean isDefaultSms) {
        return isTransactionNotification(title, body, isDefaultSms, BuildConfig.DEBUG);
    }

    public static boolean isTransactionNotification(String title, String body, boolean isDefaultSms, boolean isDebug) {
        String titleStr = title == null ? "" : title.trim();
        String bodyStr = body == null ? "" : body.trim();

        // If package is default SMS:
        if (isDefaultSms) {
            // In release mode (!isDebug), require a bank-style alphanumeric sender ID in title
            if (!isDebug) {
                if (!SENDER_ID_PATTERN.matcher(titleStr).matches()) {
                    return false;
                }
            }
        }

        // Target text: body only for default SMS, title + body for bank/UPI apps
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

    public static String buildAlertSummary(String fullMessage) {
        if (fullMessage == null || fullMessage.isEmpty()) {
            return "Possible transaction. Tap to review";
        }

        java.util.regex.Matcher currMatcher = CURRENCY_PATTERN.matcher(fullMessage);
        java.util.regex.Matcher keyMatcher = KEYWORD_PATTERN.matcher(fullMessage);

        if (currMatcher.find() && keyMatcher.find()) {
            String rawAmount = currMatcher.group().trim();
            // Normalize currency prefix to ₹ for display
            String normalizedAmount = rawAmount.replaceAll("(?i)^(?:rs\\.?|inr)\\s*", "₹").trim();
            if (!normalizedAmount.startsWith("₹")) {
                normalizedAmount = "₹" + normalizedAmount;
            }
            String action = keyMatcher.group().toLowerCase();
            return normalizedAmount + " " + action + ". Tap to review";
        }

        return "Possible transaction. Tap to review";
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

        String summaryText = buildAlertSummary(messageText);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("New Transaction Detected")
                .setContentText(summaryText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(summaryText))
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
