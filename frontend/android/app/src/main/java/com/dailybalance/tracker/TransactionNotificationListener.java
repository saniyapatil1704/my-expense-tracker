package com.dailybalance.tracker;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

public class TransactionNotificationListener extends NotificationListenerService {
    private static final String TAG = "TxNotificationListener";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        Notification notification = sbn.getNotification();

        if (notification == null) return;

        Bundle extras = notification.extras;
        String title = extras != null ? extras.getString(Notification.EXTRA_TITLE, "") : "";
        CharSequence textChar = extras != null ? extras.getCharSequence(Notification.EXTRA_TEXT) : "";
        String text = textChar != null ? textChar.toString() : "";

        Log.d(TAG, "Notification Received -> Package: [" + packageName + "] | Title: [" + title + "] | Text: [" + text + "]");
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // No-op for now
    }
}
