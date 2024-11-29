package com.example.myapplication

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.net.Uri
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import com.google.android.gms.location.LocationServices
import com.google.android.material.textfield.TextInputEditText
import java.io.BufferedReader
import java.io.BufferedWriter
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.FileReader
import java.io.FileWriter
import java.io.IOException
import java.util.*

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