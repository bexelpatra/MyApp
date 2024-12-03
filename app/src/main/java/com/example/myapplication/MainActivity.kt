package com.example.myapplication

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

class MainActivity : AppCompatActivity() {

    val fileIO = FileIO()
    private lateinit var webView: WebView
    private var backPressedTime: Long = 0

    //    private lateinit var myBtn :Button;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
//        checkStoragePermissions()
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(this))
        }
        webView = findViewById(R.id.webview)

        webView.settings.javaScriptEnabled = true
        webView.settings.builtInZoomControls = true
        webView.settings.displayZoomControls = false
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.settings.setSupportZoom(true)

        webView.settings.allowFileAccessFromFileURLs = true
        webView.settings.allowUniversalAccessFromFileURLs = true
        webView.settings.allowFileAccessFromFileURLs = true
        webView.settings.allowFileAccess= true

        webView.addJavascriptInterface(WebAppInterface(this,fileIO), "Android")
        // Load the HTML file from the assets folder
        webView.webViewClient = WebViewClient()
        webView.loadUrl("file:///android_asset/main.html")
//        webView.loadUrl("http://192.168.0.211:9080/location.html")
//        println("${fileIO.toString()} ${fileIO.hashCode()}")

        onBackPressedDispatcher.addCallback(this, onBackPressedCallback)
    }


    // 뒤로가기 버튼 눌렀을때 실행되는 콜백메소드
    private val onBackPressedCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                if (System.currentTimeMillis() - backPressedTime >= 2000) {
                    backPressedTime = System.currentTimeMillis()
                    Toast.makeText(this@MainActivity, "뒤로 버튼을 한번 더 누르면 앱을 종료합니다.", Toast.LENGTH_SHORT).show()
                } else if (System.currentTimeMillis() - backPressedTime < 2000) {
                    finish()
                }
            }
        }
    }
}