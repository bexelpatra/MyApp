package com.example.myapplication

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.location.LocationRequest
import android.os.Build
import android.webkit.JavascriptInterface
import android.widget.Toast
//import com.chaquo.python.Python
import com.google.android.gms.location.LocationServices
import org.json.JSONObject
import java.io.File
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class WebAppInterface(private val context:Context, io :FileIO) {
    val fileIo = io
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun send(data: String) :String {
        // Handle data received from JavaScript
        println("Data from WebView: $data")
        return "good"
    }
    @JavascriptInterface
    fun reqSearch(data: String) :String {
        // Handle data received from JavaScript
        var json = JSONObject(data)
        println(json)
        var searchTerm = json.getString("searchTerm").ifEmpty { "9" }

    ///storage/emulated/0/TimeAndPlace/2024/2024-11-18-1-.txt
        var allFiles = ArrayList<File>()
        fileIo.findAllFiles(fileIo.rootDir,allFiles)
        var fileNames = allFiles
            .map { file: File ->file.name.substring(file.name.lastIndexOf("/") + 1)}
            .filter { name: String -> name.startsWith(searchTerm) }

        var result = fileNames.joinToString(prefix = "[", postfix = "]", separator = ",", transform = {"\"$it\""})


        return result
    }

    @JavascriptInterface
    fun save(data: String ) :String {
        // Handle data received from JavaScript
        println("Data from WebView: $data")
        var location = getLocationSynchronously()

        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")
        var type = origin.getString("type")

        dataObject.put("lat",location.get("lat"))
        dataObject.put("lon",location.get("lon"))

        saveLocation(origin)

        return origin.toString()
    }
    //{"data":{"option":"4","time":"2024-11-08  14:54:49"},"type":0}"
    fun saveLocation(origin:JSONObject){
        var dataObject = origin.getJSONObject("data")
        var type = origin.getString("type")
        var timeString = dataObject.getString("time").split(" ")
        var time = timeString[0]
        var fileName = "${time}-${type}-.txt"
        fileIo.writeFileCrypto(fileName,dataObject)
    }

    // {"data":{"time":"2024-11-08","type":0}}"
    @JavascriptInterface
    fun readFile(time:String,type :String):String?{
        var year = time.split("-")[0]
        var fileName = "${fileIo.rootDir.absolutePath}/${year}/${time}-${type}-.txt"
        val fileContent = fileIo.readFileCrypto("${time}-${type}")?.takeIf { it.isNotEmpty() }?.dropLast(1) ?: ""

        return "[${fileContent}]"
    }
    // {"data":{"time":"2024-11-08","type":0}}"
    @JavascriptInterface
    fun updateFile(data:String):String?{
        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")
        var type = origin.getString("type")

        var timeString = dataObject.getString("time").split(" ")
        var time = timeString[0]
        fileIo.updateFileContent("${time}-${type}",dataObject)


        return ""
    }
    @JavascriptInterface
    fun updateTitle(data:String):String?{
        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")

        var ymdt = dataObject.getString("ymdt")
        var year = ymdt.split("-")[0]

        var newFileName = dataObject.getString("newFileName")
        var fileName = "${ymdt}${newFileName}.txt"

        fileIo.updateFileTitle("${ymdt}",fileName)


        return ""
    }

    @JavascriptInterface
    fun getCurrentLocation():String {
        var map = getLocationSynchronously()
        return  JSONObject.wrap(map).toString()
    }
    @JavascriptInterface
    fun getPython():String {
//        val python = Python.getInstance()
//        val pythonModule = python.getModule("my_script")
//        val result3 = pythonModule.callAttr("greet", "Android")
//        print(result3)
//        return result3.toString()
        return "1"
    }

    // 아직 이해가 안 가는 소스다...
    // 추후에 코루틴과 함께 더욱 공부해봐야쓰겄다
    @SuppressLint("MissingPermission")
    fun getLocationSynchronously(): Map<String,String> {
        val latch = CountDownLatch(1)
        var result = HashMap<String,String>()
        val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
        result.putAll(mapOf("lat" to "0","lon" to "0"))

//        fusedLocationProviderClient.lastLocation
//            .addOnSuccessListener { location ->
//                result.putAll(location?.let {
//                    mapOf("lat" to "${it.latitude}","lon" to "${it.longitude}")
//                } ?: mapOf("code" to "fail"))
//
//                latch.countDown() // Release the latch once location is received
//            }
//            .addOnFailureListener {
//                result.put("code", "fail")
//                latch.countDown()
//            }
        fusedLocationProviderClient.getCurrentLocation(
            LocationRequest.QUALITY_HIGH_ACCURACY,
            null // No need for a CancellationToken if not canceling the request
        ).addOnSuccessListener { location ->
            result.putAll(location?.let {
                mapOf("lat" to "${it.latitude}","lon" to "${it.longitude}")
            } ?: mapOf("code" to "fail"))

            latch.countDown() // Release the latch once location is received
        }.addOnFailureListener { exception ->
            result.put("code", "fail")
            latch.countDown()
        }
        // Wait for location response or timeout after 10 seconds
        latch.await(10, TimeUnit.SECONDS)
        return result
    }

    @JavascriptInterface
    fun isServiceRunning(): Boolean {
        val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager

        for (service in manager.getRunningServices(Integer.MAX_VALUE)) {
            if (LocationService::class.java.name == service.service.className) {
                return true
            }
        }
        return false
    }

    @JavascriptInterface
    fun stopForegroundService() {
        val intent = Intent(context, LocationService::class.java)
        intent.action = ".LocationService"
        context.stopService(intent)
    }

    @JavascriptInterface
    fun startForegroundService() {
        val intent = Intent(context, LocationService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
    }
}
