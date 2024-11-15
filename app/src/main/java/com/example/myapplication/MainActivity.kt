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
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
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
    override fun onStart() {
        super.onStart()
        val reqUtil =RequestPermissionsUtil(this);
        reqUtil.requestLocation() // 위치 권한 요청
        reqUtil.requestManageExternalStoragePermission()
    }
    //    private lateinit var myBtn :Button;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
//        checkStoragePermissions()

        val webView: WebView = findViewById(R.id.webview)

        webView.settings.javaScriptEnabled = true
        webView.settings.builtInZoomControls = true
        webView.settings.displayZoomControls = false
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.settings.setSupportZoom(true)

        webView.addJavascriptInterface(WebAppInterface(this,fileIO), "Android")
        // Load the HTML file from the assets folder
        webView.loadUrl("file:///android_asset/location.html")
        println("${fileIO.toString()} ${fileIO.hashCode()}")
    }

}