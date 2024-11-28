package com.example.myapplication

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date

class MyAppWidgetProvider : AppWidgetProvider() {
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

        appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "save_location") {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val remoteViews = RemoteViews(context.packageName, R.layout.widget_layout)

            // 로딩 표시 시작
            remoteViews.setViewVisibility(R.id.progressBar, View.VISIBLE)
            remoteViews.setViewVisibility(R.id.saveButton, View.INVISIBLE)
            appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)

            // 비동기로 저장 작업 실행
            Thread {
                val webAppInterface = WebAppInterface(context, FileIO())
                val jsonData = JSONObject().apply {
                    put("data", JSONObject().apply {
                        put("time", SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()))
                        put("memo", "홈 위젯 저장")
                    })
                    put("type", 1)
                }
                val returnValue = webAppInterface.save(jsonData.toString())

                // 작업 완료 후 로딩 표시 제거
                remoteViews.setViewVisibility(R.id.progressBar, View.GONE)
                remoteViews.setViewVisibility(R.id.saveButton, View.VISIBLE)
                appWidgetManager.updateAppWidget(ComponentName(context, MyAppWidgetProvider::class.java), remoteViews)
            }.start()
        }
    }
}