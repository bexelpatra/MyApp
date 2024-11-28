package com.example.myapplication

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
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

        // 버튼 클릭 이벤트 설정
        val intent = Intent(context, MyAppWidgetProvider::class.java)
        intent.action = "save_location"
        val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        remoteViews.setOnClickPendingIntent(R.id.saveButton, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "save_location") {
            println("클릭!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

            val webAppInterface = WebAppInterface(context, FileIO())
            val jsonData = JSONObject().apply {
                put("data", JSONObject().apply {
                    put("time", SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()))
                    put("memo", "홈 위젯 저장")
                })
                put("type", 1)
            }
            var returnVlue = webAppInterface.save(jsonData.toString())
            println(returnVlue)
        }
    }
}