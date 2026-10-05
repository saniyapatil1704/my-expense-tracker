package com.dailybalance.tracker;

import android.content.Intent;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Set;

@CapacitorPlugin(name = "NotificationPermission")
public class NotificationPermissionPlugin extends Plugin {

    @PluginMethod
    public void isPermissionGranted(PluginCall call) {
        String packageName = getContext().getPackageName();
        Set<String> enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(getContext());
        boolean isGranted = enabledPackages.contains(packageName);

        JSObject ret = new JSObject();
        ret.put("granted", isGranted);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationListenerSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open notification listener settings", e);
        }
    }
}
