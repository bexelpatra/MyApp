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
//        webView.loadUrl("http://192.168.0.211:9080/location.html")
//        println("${fileIO.toString()} ${fileIO.hashCode()}")
    }
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        print("")
        if (requestCode == 1) {
            when {
                grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED -> {
                    // Permission granted
                    onPermissionGranted()
                }
                ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.CAMERA) -> {
                    // Permission denied, and user didn't select "Don't ask again"
                    onPermissionDenied()
                }
                else -> {
                    // Permission denied, and "Don't ask again" selected
                    onPermissionDeniedForever()
                }
            }
        }
    }

    private fun onPermissionGranted() {
        Toast.makeText(this, "권한이 승인되었습니다.", Toast.LENGTH_SHORT).show()
        // Proceed with functionality that requires permission
    }

    private fun onPermissionDenied() {
        Toast.makeText(this, "권한이 거절되었습니다.", Toast.LENGTH_LONG).show()
        finish()
        // Inform the user about the need for permission or take alternative action
    }

    private fun onPermissionDeniedForever() {
        Toast.makeText(this, "권한 거절되었습니다. 설정에서 변경해주세요", Toast.LENGTH_LONG).show()
        finish()
        // Guide the user to app settings if needed
    }
}