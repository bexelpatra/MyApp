package com.example.myapplication

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date

class LocationService : Service() {
    private var handler: Handler? = null
    private var runnable: Runnable? = null
    private lateinit var wakeLock: PowerManager.WakeLock

    companion object {
        const val CHANNEL_ID = "LocationServiceChannel"
        const val NOTIFICATION_ID = 1
    }

    override fun onCreate() {
        super.onCreate()
        acquireWakeLock()
        updateWidgets()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        handler = Handler(Looper.getMainLooper())
        runnable = object : Runnable {
            override fun run() {
                saveLocation()
                handler?.postDelayed(this, 180000)
            }
        }
        handler?.post(runnable!!)

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        saveLocation()
        updateWidgets()
        if (wakeLock.isHeld) {
            wakeLock.release()
        }
        handler?.removeCallbacks(runnable!!)
        handler = null
        runnable = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "Location Service Channel", NotificationManager.IMPORTANCE_DEFAULT)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("위치 저장 실행 중")
            .setContentText("위치 정보를 저장하고 있습니다.")
            .setSmallIcon(R.drawable.notification_p)
            .setContentIntent(pendingIntent)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()
    }

    private fun saveLocation() {
        Thread {
            val webAppInterface = WebAppInterface(this, FileIO())
            val jsonData = JSONObject().apply {
                put("data", JSONObject().apply {
                    put("time", SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()))
                })
                put("type", "0")
            }
            webAppInterface.save(jsonData.toString())
        }.start()
    }

    private fun checkLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION ) == PackageManager.PERMISSION_GRANTED
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "LocationService::WakeLock")
        wakeLock.acquire()
    }

    private fun updateWidgets() {
        val appWidgetManager = AppWidgetManager.getInstance(this)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(ComponentName(this, MyAppWidgetProvider::class.java))

        appWidgetIds.forEach { widgetId ->
            MyAppWidgetProvider.updateWidget(this, appWidgetManager, widgetId)
        }
    }
}