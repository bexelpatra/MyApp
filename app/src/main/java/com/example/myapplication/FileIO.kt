package com.example.myapplication

import android.os.Environment
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class FileIO {

    val externalStorageDir = Environment.getExternalStorageDirectory()
//    var traceStream : FileOutputStream ?= null
//    var logStream : FileOutputStream ?= null
//
//    fun openStream(type:Int) :FileOutputStream?{
//        var resultStream :FileOutputStream?=null
//        if(type ==0){
//            resultStream = traceStream.let { traceStream }?: FileOutputStream("")
//        }
//        return resultStream
//    }

    fun writeFileToExternalStorage(fileName: String, content: String) {
        if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
            // Get the external storage directory
            var time = fileName.split("-")[0]
            val fileDir = File(externalStorageDir, time)

            if(!fileDir.exists()){
                fileDir.mkdirs()
            }
            var file = File(fileDir,fileName)

            val fileContent = readFileFromExternalStorage(file.absolutePath)



            try {
                val fileOutputStream = FileOutputStream(file)
                val writer  = fileOutputStream.writer()
                if(fileContent != null){
                    writer.write(fileContent)
                }
                writer.write(content)
                writer.close()
                println("File written to external storage: ${file.absolutePath}")
            } catch (e: IOException) {
                e.printStackTrace()
                println("Error writing file: ${e.message}")
            }
        } else {
            println("External storage not available or writable.")
        }
    }
    fun readFileFromExternalStorage(fileName: String): String? {
        val file = File(fileName)

        if (file.exists()) {
            try {
                val fileInputStream = FileInputStream(file)
                val content = fileInputStream.readBytes().toString(Charsets.UTF_8)
                fileInputStream.close()
                println("File read successfully: $content")
                return content
            } catch (e: IOException) {
                e.printStackTrace()
                println("Error reading file: ${e.message}")
            }
        } else {
            println("File does not exist.")
        }
        return null
    }
}