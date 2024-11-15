package com.example.myapplication

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.webkit.JavascriptInterface
import android.widget.Toast
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import org.json.JSONObject
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
        println("Data from WebView: $data")
        return "good"
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
        fileIo.writeFileToExternalStorage(fileName,"${dataObject.toString()},")
    }
    // {"data":{"time":"2024-11-08","type":0}}"
    @JavascriptInterface
    fun readFile(time:String,type :String):String?{
        var year = time.split("-")[0]
        var fileName = "${fileIo.externalStorageDir.absolutePath}/${year}/${time}-${type}-.txt"
        val fileContent = fileIo.readFileFromExternalStorage(fileName)
        var arr = fileContent?.subSequence(0,fileContent.length-1)

        return "[${arr}]"
    }

    @JavascriptInterface
    fun getCurrentLocation():Map<String,String> {
        return  getLocationSynchronously()
    }
    @SuppressLint("MissingPermission")
    suspend fun getLocation() : () -> Task<Location> {
        val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)

        return {fusedLocationProviderClient.lastLocation
            .addOnSuccessListener { success: Location? ->
                success?.let { location ->
                    "${location.latitude} ${location.longitude}"
                }?:"not found"
            }
            .addOnFailureListener { fail ->
                "fail"
            }}
    }
    // 아직 이해가 안 가는 소스다...
    // 추후에 코루틴과 함께 더욱 공부해봐야쓰겄다
    @SuppressLint("MissingPermission")
    fun getLocationSynchronously(): Map<String,String> {
        val latch = CountDownLatch(1)
        var result = HashMap<String,String>()
        val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
        result.putAll(mapOf("lat" to "0","lon" to "0"))

        fusedLocationProviderClient.lastLocation
            .addOnSuccessListener { location ->
                result.putAll(location?.let {
                    mapOf("lat" to "${it.latitude}","lon" to "${it.longitude}")
                } ?: mapOf("code" to "fail"))

                latch.countDown() // Release the latch once location is received
            }
            .addOnFailureListener {
                result.put("code", "fail")
                latch.countDown()
            }

        // Wait for location response or timeout after 10 seconds
        latch.await(10, TimeUnit.SECONDS)
        return result
    }
}