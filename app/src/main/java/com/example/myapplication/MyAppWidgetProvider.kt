package com.example.myapplication

import android.app.ActivityManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import android.widget.Toast
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date

class MyAppWidgetProvider : AppWidgetProvider() {
    companion object {
        private var handler: Handler? = null
        private var runnable: Runnable? = null

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val remoteViews = RemoteViews(context.packageName, R.layout.widget_layout)
            remoteViews.setViewVisibility(R.id.stopButton, View.INVISIBLE)
            remoteViews.setViewVisibility(R.id.startButton, View.VISIBLE)

            val isRunning = isServiceRunning(context, LocationService::class.java)
            if (isRunning) {
                remoteViews.setViewVisibility(R.id.startButton, View.GONE)
                remoteViews.setViewVisibility(R.id.stopButton, View.VISIBLE)
            } else {
                remoteViews.setViewVisibility(R.id.startButton, View.VISIBLE)
                remoteViews.setViewVisibility(R.id.stopButton, View.GONE)
            }
            appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
        }

        private fun isServiceRunning(context: Context, serviceClass: Class<*>): Boolean {
            val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            for (service in manager.getRunningServices(Integer.MAX_VALUE)) {
                if (serviceClass.name == service.service.className) {
                    return true
                }
            }
            return false
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val remoteViews = RemoteViews(context.packageName, R.layout.widget_layout)

        val intent = Intent(context, MyAppWidgetProvider::class.java)
        intent.action = "save_location"
        val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        remoteViews.setOnClickPendingIntent(R.id.saveButton, pendingIntent)

        // 시작 버튼 설정
        val startIntent = Intent(context, MyAppWidgetProvider::class.java).apply {
            action = "start_location"
        }
        val startPendingIntent = PendingIntent.getBroadcast(context, 1, startIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        remoteViews.setOnClickPendingIntent(R.id.startButton, startPendingIntent)

        // 종료 버튼 설정
        val stopIntent = Intent(context, MyAppWidgetProvider::class.java).apply {
            action = "stop_location"
        }
        val stopPendingIntent = PendingIntent.getBroadcast(context, 2, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        remoteViews.setOnClickPendingIntent(R.id.stopButton, stopPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val remoteViews = RemoteViews(context.packageName, R.layout.widget_layout)

        when (intent.action) {
            "save_location" -> {
                handleSaveLocation(context, appWidgetManager, remoteViews, "1")
            }

            "start_location" -> {
                remoteViews.setViewVisibility(R.id.startButton, View.GONE)
                remoteViews.setViewVisibility(R.id.stopButton, View.VISIBLE)

                appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

                val serviceIntent = Intent(context, LocationService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }

            "stop_location" -> {
                remoteViews.setViewVisibility(R.id.startButton, View.VISIBLE)
                remoteViews.setViewVisibility(R.id.stopButton, View.GONE)

                appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

                context.stopService(Intent(context, LocationService::class.java))
            }
        }
    }

    private fun handleSaveLocation(context: Context, appWidgetManager: AppWidgetManager, remoteViews: RemoteViews, type: String) {
        try {
            if (type == "1") {
                remoteViews.setViewVisibility(R.id.saveProgressBar, View.VISIBLE)
                remoteViews.setViewVisibility(R.id.saveButton, View.INVISIBLE)
            } else {
                remoteViews.setViewVisibility(R.id.stopProgressBar, View.VISIBLE)
                remoteViews.setViewVisibility(R.id.stopButton, View.INVISIBLE)
            }

            appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

            Thread {
                try {
                    val webAppInterface = WebAppInterface(context, FileIO())
                    val jsonData = JSONObject().apply {
                        put("data", JSONObject().apply {
                            put("time", SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()))
                            if (type == "1") {
                                put("memo", "홈 위젯 저장")
                            }
                        })
                        put("type", type)
                    }
                    val returnValue = webAppInterface.save(jsonData.toString())
                } catch (e: Exception) {
                    Handler(Looper.getMainLooper()).post {
                        Toast.makeText(context, "위치 저장 실패", Toast.LENGTH_SHORT).show()
                    }
                    Log.e("WidgetError", "Error saving data : ${e.message}")
                } finally {
                    if (type == "1") {
                        remoteViews.setViewVisibility(R.id.saveProgressBar, View.GONE)
                        remoteViews.setViewVisibility(R.id.saveButton, View.VISIBLE)
                    } else {
                        remoteViews.setViewVisibility(R.id.stopProgressBar, View.GONE)
                        remoteViews.setViewVisibility(R.id.stopButton, View.VISIBLE)
                    }
                    appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)
                }
            }.start()
        } catch (e: Exception) {
            Log.e("WidgetError", "Error in widget update: ${e.message}")
            // Reset UI state in case of error
            if(type == "1") {
                remoteViews.setViewVisibility(R.id.saveProgressBar, View.GONE)
                remoteViews.setViewVisibility(R.id.saveButton, View.VISIBLE)
            } else {
                remoteViews.setViewVisibility(R.id.stopProgressBar, View.GONE)
                remoteViews.setViewVisibility(R.id.stopButton, View.VISIBLE)
            }
            appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

            Handler(Looper.getMainLooper()).post {
                Toast.makeText(context, "위치 저장 실패", Toast.LENGTH_SHORT).show()
            }
        }
    }
}