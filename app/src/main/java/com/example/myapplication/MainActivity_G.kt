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

class MainActivity_G : AppCompatActivity() {

    //  stream을 열어두고 작성한다.
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
        setContentView(R.layout.gps_main)
//        checkStoragePermissions()

        val webView: WebView = findViewById(R.id.webview)

        webView.settings.javaScriptEnabled = true
        webView.settings.builtInZoomControls = true
        webView.settings.displayZoomControls = false
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.settings.setSupportZoom(true)

        // 앱이 꺼지기 전까지는 stream을 열어두고 한줄씩 추가를 해보자
        webView.addJavascriptInterface(WebAppInterface(this,FileIO()), "Android")
        // Load the HTML file from the assets folder
        webView.loadUrl("file:///android_asset/location.html")

//        myBtn = findViewById(R.id.locationText2)
        val locationText: TextView = findViewById(R.id.locationText)
        val locationText2: TextView = findViewById(R.id.locationText2)

        val textinput: TextInputEditText = findViewById(R.id.textinput)


        val locationButton: Button = findViewById(R.id.locationButton)

        val ttest1Button: Button = findViewById(R.id.ttest1)
        val ttest2Button: Button = findViewById(R.id.ttest2)
        val ttest3Button: Button = findViewById(R.id.ttest3)
        val ttest4Button: Button = findViewById(R.id.ttest4)


        val ttest2text: TextView = findViewById(R.id.ttest2text)
        val ttest3text: TextView = findViewById(R.id.ttest3text)
        val ttest4text: TextView = findViewById(R.id.ttest4text)

        locationButton.setOnClickListener {
            getLocation(locationText)
        }

        var count = 1;
        ttest1Button.setOnClickListener {
            sendDataToWebView(webView,textinput.text.toString())
            locationText2.text = count.toString();
        }
        ttest2Button.setOnClickListener {
            var file :File = Environment.getExternalStorageDirectory()

            ttest2text.text = file.toString()
            ttest3text.text = textinput.text.toString()
        }
        var dirFile = Environment.getDataDirectory()
        var dir = dirFile.absolutePath

        ttest3Button.setOnClickListener {
            fileIO.writeFileToExternalStorage("my.txt",textinput.text.toString())
        }

        ttest4Button.setOnClickListener {
//            ttest4text.text = read(dir+"/"+"my.txt")

            val root = Environment.getExternalStorageDirectory()
            var intermediate = File(root,"tempFile")
            if(!intermediate.exists()){
                intermediate.mkdirs();
            }
            var mym = File(intermediate,"gogo.txt")
            var os = FileOutputStream(mym)
            os.write("123".toByteArray())
            os.close()
            ttest3text.text = mym.absolutePath
            ttest4text.text = fileIO.readFileFromExternalStorage("tempFile/gogo.txt")
        }
    }
    fun sendDataToWebView(webView :WebView, data: String) {
        webView.evaluateJavascript("javascript:receiveDataFromAndroid('$data')", null)
    }

    @SuppressLint("MissingPermission")
    private fun getLocation(textView: TextView) {
        val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)
        fusedLocationProviderClient.lastLocation
            .addOnSuccessListener { success: Location? ->
                success?.let { location ->
                    val testLocal = Location("testPoint")
                    testLocal.apply {
                        latitude = 35.0
                        longitude = 120.0
                    }
//                    textView.text = "${location.distanceTo(testLocal)}M"
//                    var now = getAddress(location.latitude,location.longitude);
                    textView.text = "${location.latitude} ${location.longitude}"
                }
            }
            .addOnFailureListener { fail ->
                textView.text = fail.localizedMessage
            }
    }

    private fun getAddress(lat: Double, lng: Double): List<Address>? {
        lateinit var address: List<Address>

        return try {
            val geocoder = Geocoder(this, Locale.KOREA)
            address = geocoder.getFromLocation(lat, lng, 1) as List<Address>
            address
        } catch (e: IOException) {
            Toast.makeText(this, "주소를 가져 올 수 없습니다", Toast.LENGTH_SHORT).show()
            null
        }
    }
}