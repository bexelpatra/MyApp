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
    //{"searchTerm":""}
    @JavascriptInterface
    fun reqSearch(data: String) :String {
        // Handle data received from JavaScript
        var json = JSONObject(data)
        var searchTerm = ""

        if(json.getString("tabFg") == "4"){
            searchTerm = json.getString("searchTerm")
        }else{
            searchTerm = json.getString("searchTerm").ifEmpty { "9" }
        }

        var allFiles = ArrayList<File>()
        fileIo.findAllFiles(fileIo.rootDir,allFiles)
        var fileNames = allFiles
            .map { file: File ->file.name.substring(file.name.lastIndexOf("/") + 1)}
            .filter { name: String -> name.startsWith(searchTerm) }

        var result = fileNames.joinToString(prefix = "[", postfix = "]", separator = ",", transform = {"\"$it\""})


        return result
    }

    //   {"data": {"time":"2024-11-22  23:12:22","lat":"37.5692849","lon":"126.9725051","memo":"","order":"0"}
    //   ,"type":"1"}
    @JavascriptInterface
    fun save(data: String ) :String {
        // Handle data received from JavaScript
        println("Save Data from WebView: $data")

        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")
        var type = origin.getString("type")

        var location = getLocationSynchronously()

        if (type == "0" && location["lat"] == "0" && location["lon"] == "0") {
            var i = 1
            while (i <= 3) {
                TimeUnit.SECONDS.sleep(1)
                location = getLocationSynchronously()
                if (location["lat"] != "0" && location["lon"] != "0") {
                    break
                }
                ++i
            }
        }

        if (location["lat"] != "0" && location["lon"] != "0") {
            dataObject.put("lat", location.get("lat"))
            dataObject.put("lon", location.get("lon"))
            saveLocation(origin)
        }else if(type == "1"){
            showToast("위치 저장 실패")
        }

        return origin.toString()
    }

//    {"time":"2024-11-22  23:12:22","lat":"37.5692849","lon":"126.9725051","memo":"","order":"0"}
    fun saveLocation(origin:JSONObject){
        var dataObject = origin.getJSONObject("data")
        var type = origin.getString("type")
        var timeString = dataObject.getString("time").split(" ")
        var time = timeString[0]
        var fileName = "${time}-${type}-.txt"


        dataObject.put("type", type)
        fileIo.writeFileCrypto(fileName,dataObject)
    }

    // "time":"2024-11-08","type":0"
    @JavascriptInterface
    fun readFile(time:String,type :String):String?{
        var year = time.split("-")[0]
        var fileName = "${fileIo.rootDir.absolutePath}/${year}/${time}-${type}-.txt"
        val fileContent = fileIo.readFileCrypto("${time}-${type}")?.takeIf { it.isNotEmpty() }?.dropLast(1) ?: ""

        return "[${fileContent}]"
    }
    // {"data":{"fileName":"2024-12-05-1-.txt","time":"2024-12-05 11:19:06","lat":"37.5628854","lon":"126.9775813","memo":"수정","order":"0"}
    // ,"type":"1"}
    @JavascriptInterface
    fun updateFile(data:String):String?{
        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")
        var type = dataObject.get("type")

        var timeString = dataObject.getString("time").split(" ")
        var time = timeString[0]
        fileIo.updateFileContent("${time}-${type}",dataObject)


        return ""
    }
    //{"data":{"fileName":"2024-12-05-1-.txt","time":"2024-12-05 13:57:10","lat":37.56312124086043,"lon":126.97767989921182,"memo":"신규저장2","type":"1","order":"0"}
    // ,"type":"1"}
    @JavascriptInterface
    fun deleteFileLine(data:String):String?{
        var origin = JSONObject(data)
        var dataObject = origin.getJSONObject("data")
        var type = dataObject.get("type")

        var timeString = dataObject.getString("time").split(" ")
        var time = timeString[0]
        fileIo.deleteFileContent("${time}-${type}",dataObject)


        return "1.5"
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
