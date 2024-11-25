package com.example.myapplication

import android.os.Environment
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

fun main(){
    val file = FileIO()
    var temp = File("/timeandplace/temp.txt")

//    FileIO().copyFileWithModification(temp,"얍",2)
    println(temp.name)
    println(temp.absolutePath)
    var resultFiles = ArrayList<File>()
//    findAllFiles(temp,resultFiles)
    println(resultFiles.size)
//    resultFiles.filter { file -> file.name.startsWith(""); }.map { file-> return mapof("path":file.name) }
    resultFiles = ArrayList<File>()
    var result = resultFiles.joinToString(prefix = "[", postfix = "]", separator = ",")
    println(result)

    var a = Pair("gogo",123)
    println(a)
    println(a.first)
    println(a.second)
//    var c = CryptoUtil()
//    println(c.decrypt("Zz9gW9ZUfKDOnKYKmpyW0DMjxFsiEy3G08aQP2PQTVquhQIBs1orDQJ92xrKnH6ltINVBLY+o/EanZGIiN5C0Z+ULv7qir1fat0jc6ob+PVLeLWKgr/byBiVKIFno9yaZBmQc5sbhr+1Z7Tf0Fsa9Q=="))
    var result2 = ArrayList<File>()
    findAllFiles(File("D:/timeandplace"),result2)
    result2.forEach { file: File ->    println(file.name) }

}
fun findAllFiles(dir: File, fileList :ArrayList<File>) {
    for (file :File in dir.listFiles()){
        if(file.isDirectory) findAllFiles(file,fileList)
        if(file.isFile) {
            fileList.add(file)
        }
    }
    fileList.sortByDescending { it.name }

}
class FileIO {

    private val cryptoUtil = CryptoUtil()

    lateinit var rootDir :File

    init {
        rootDir = File(Environment.getExternalStorageDirectory(),"TimeAndPlace")
//        rootDir = File("d:/","TimeAndPlace")
        if(!rootDir.exists()){
            rootDir.mkdirs()
        }
    }
    @Deprecated("change to writeFileCrypto")
    fun writeFile(fileName: String, content: String) {
        if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
            // Get the external storage directory
            var time = fileName.split("-")[0]
            val fileDir = File(rootDir, time)

            if(!fileDir.exists()){
                fileDir.mkdirs()
            }
            var file = File(fileDir,fileName)

            val fileInfo = readFile(file.absolutePath)
            var fileContent= fileInfo.first
            var fileLine = fileInfo.second

            try {
                val fileOutputStream = FileOutputStream(file)
                val writer  = fileOutputStream.writer()
                if(fileContent != null){
                    writer.write(fileContent)
                }
                writer.write(content)
                writer.write(System.lineSeparator())
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

    fun readFile(fileName: String): Pair<String?,Int> {
//        val file = File(fileName)
//
//        if (file.exists()) {
//            try {
//                val fileInputStream = FileInputStream(file)
//                val content = fileInputStream.readBytes().toString(Charsets.UTF_8)
//                fileInputStream.close()
//                println("File read successfully: $content")
//                return content
//            } catch (e: IOException) {
//                e.printStackTrace()
//                println("Error reading file: ${e.message}")
//            }
//        } else {
//            println("File does not exist.")
//        }
//        return null
        val file = File(fileName)
        var stringBuilder = StringBuilder()
        var lineCount = 0;
        if (file.exists()) {
            try {
                val fileInputStream = FileInputStream(file)
                file.bufferedReader().use { reader ->
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        println(line) // Process each line as needed
                        stringBuilder.append(line?.let {
                            lineCount+=1
                            it
                        })
                    }
                    reader.close()
                }
                return Pair(stringBuilder.toString(),lineCount)
            } catch (e: IOException) {
                e.printStackTrace()
                println("Error reading file: ${e.message}")
            }
        } else {
            println("File does not exist.")
        }
        return Pair(null,lineCount)
    }
    fun writeFileCrypto(fileName: String, content: JSONObject, delimiter:Char) {
        if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
            // Get the external storage directory
            var time = fileName.split("-")[0]
            val fileDir = File(rootDir, time)

            if(!fileDir.exists()){
                fileDir.mkdirs()
            }
            var file = File(fileDir,fileName)

            val fileInfo = readFile(file.absolutePath)
            var fileContent= fileInfo.first
            var fileLine = fileInfo.second
            content.put("order",fileLine)
            var encryptedContent =cryptoUtil.encrypt("${content.toString()}${delimiter}")
            println(encryptedContent)
            try {
                val fileOutputStream = FileOutputStream(file)
                val writer  = fileOutputStream.writer()
                if(fileContent != null){
                    writer.write(fileContent)
                    writer.write(System.lineSeparator())
                }
                writer.write(encryptedContent)
                writer.write(System.lineSeparator())
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
    fun writeFileCrypto(fileName: String, content: JSONObject) {
        writeFileCrypto(fileName,content,',')
    }
    fun readFileCrypto(fileName: String): String? {
        val file = File(fileName)
        var stringBuilder = StringBuilder()
        if (file.exists()) {
            try {
                file.bufferedReader().use { reader ->
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        println(line) // Process each line as needed
                        stringBuilder.append(line?.let { cryptoUtil.decrypt(it) })
                    }
                    reader.close()
                }
                return stringBuilder.toString()
            } catch (e: IOException) {
                e.printStackTrace()
                println("Error reading file: ${e.message}")
            }
        } else {
            println("File does not exist.")
        }
        return null
    }
    // using a line order replace the line with content
    fun updateFileContent(fileName: String,content: JSONObject) {
        if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) { // 파일을 저장 가능한지 확인
            // Get the external storage directory
            var file = File(fileName)
            if(!file.exists()){
                return
            }
            copyFileWithModification(file, "${content.toString()},", content.getInt("order"))
        }
    }

    fun findAllFiles(dir: File, fileList :ArrayList<File>) {
        for (file :File in dir.listFiles()){
            if(file.isDirectory) findAllFiles(file,fileList)
            if(file.isFile) {
                fileList.add(file)
            }
        }
    }

    fun copyFileWithModification(originalFile: File, content: String, order:Int) {

        val newFile = File("${originalFile.parent.toString()}temporary_.txt")

        if (!originalFile.exists()) {
            println("Original file does not exist!")
            return
        }

        try {
            // Step 1: Create BufferedReader and BufferedWriter
            val bufferedReader = originalFile.bufferedReader()
            val bufferedWriter = newFile.bufferedWriter()

            // Step 2: Read each line
            var lineCount = 0;
            bufferedReader.use { reader ->
                bufferedWriter.use { writer ->
                    reader.lineSequence().forEach { line ->
                        var modifiedLine = line
                        if(lineCount == order){
                            modifiedLine = cryptoUtil.encrypt(content)
                        }
                        println(modifiedLine)
                        lineCount+=1
                        writer.write(modifiedLine)
                        writer.write(System.lineSeparator()) // Write the line to the new file
                    }
                }
            }

            // Step 3: Delete the original file
            if (originalFile.delete()) {
                // Step 4: Rename the new file to the original file name
                if (newFile.renameTo(originalFile)) {
                    println("File copy completed and original file replaced.")
                } else {
                    println("Failed to rename the new file to the original name.")
                }
            } else {
                println("Failed to delete the original file.")
            }
        } catch (e: IOException) {
            println("An error occurred: ${e.message}")
        }
    }
}