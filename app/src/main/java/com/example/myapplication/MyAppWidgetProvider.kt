package com.example.myapplication

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Timer
import java.util.TimerTask

class MyAppWidgetProvider : AppWidgetProvider() {
    companion object {
        private var handler: Handler? = null
        private var runnable: Runnable? = null
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
            "save_location" -> handleSaveLocation(context, appWidgetManager, remoteViews, "1")
            "start_location" -> {
                println("start_location!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                remoteViews.setViewVisibility(R.id.startButton, View.GONE)
                remoteViews.setViewVisibility(R.id.stopButton, View.VISIBLE)

                appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

                handler = Handler(Looper.getMainLooper())
                runnable = object : Runnable {
                    override fun run() {
                        handleSaveLocation(context, appWidgetManager, remoteViews, "0")
                        handler?.postDelayed(this, 5000)
                    }
                }
                handler?.post(runnable!!)
            }
            "stop_location" -> {
                println("stop_location!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                remoteViews.setViewVisibility(R.id.startButton, View.VISIBLE)
                remoteViews.setViewVisibility(R.id.stopButton, View.GONE)

                appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

                handler?.removeCallbacks(runnable!!)
                handler = null
                runnable = null
            }
        }
    }

    private fun handleSaveLocation(context: Context, appWidgetManager: AppWidgetManager, remoteViews: RemoteViews, type: String) {
        remoteViews.setViewVisibility(R.id.progressBar, View.VISIBLE)
        remoteViews.setViewVisibility(R.id.saveButton, View.INVISIBLE)
        appWidgetManager.updateAppWidget(
            ComponentName(context, MyAppWidgetProvider::class.java),
            remoteViews
        )

        Thread {
            val webAppInterface = WebAppInterface(context, FileIO())
            val jsonData = JSONObject().apply {
                put("data", JSONObject().apply {
                    put("time", SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()))
                    if(type == "1") {
                        put("memo", "홈 위젯 저장")
                    }
                })
                put("type", type)
            }
            val returnValue = webAppInterface.save(jsonData.toString())
            println("Home widget returnValue : $returnValue")

            remoteViews.setViewVisibility(R.id.progressBar, View.GONE)
            remoteViews.setViewVisibility(R.id.saveButton, View.VISIBLE)
            appWidgetManager.updateAppWidget(
                ComponentName(context, MyAppWidgetProvider::class.java),
                remoteViews
            )
        }.start()
    }
}