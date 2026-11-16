package com.khatwa.app;

import android.Manifest;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/** يقرأ عدّاد الخطوات التراكمي للهاتف (TYPE_STEP_COUNTER) مرة عند الطلب. لا خدمة خلفية ولا موقع. */
@CapacitorPlugin(
    name = "StepCounter",
    permissions = { @Permission(alias = "activity", strings = { Manifest.permission.ACTIVITY_RECOGNITION }) }
)
public class StepCounterPlugin extends Plugin {

    private Sensor sensor() {
        SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        return sm == null ? null : sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject o = new JSObject();
        o.put("available", sensor() != null);
        call.resolve(o);
    }

    @PluginMethod
    public void read(final PluginCall call) {
        final SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        final Sensor s = sensor();
        if (sm == null || s == null) {
            call.reject("unavailable");
            return;
        }
        if (getPermissionState("activity") != com.getcapacitor.PermissionState.GRANTED) {
            call.reject("permission");
            return;
        }
        final Handler h = new Handler(Looper.getMainLooper());
        final boolean[] done = { false };
        final SensorEventListener[] ref = new SensorEventListener[1];
        ref[0] = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent e) {
                if (done[0]) return;
                done[0] = true;
                sm.unregisterListener(ref[0]);
                JSObject o = new JSObject();
                o.put("steps", (double) e.values[0]);
                long now = System.currentTimeMillis();
                o.put("at", now);
                o.put("bootAt", now - SystemClock.elapsedRealtime());
                call.resolve(o);
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {}
        };
        sm.registerListener(ref[0], s, SensorManager.SENSOR_DELAY_NORMAL);
        h.postDelayed(
            new Runnable() {
                @Override
                public void run() {
                    if (done[0]) return;
                    done[0] = true;
                    sm.unregisterListener(ref[0]);
                    call.reject("timeout");
                }
            },
            4000
        );
    }
}
