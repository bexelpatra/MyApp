package com.example.myapplication

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class RequestStoragePermissionsUtil(private val context: Context) {

    companion object {
        private const val REQUEST_STORAGE_PERMISSION = 101
    }

    private val storagePermissions = arrayOf(
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    )

    fun checkAndRequestStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                    Uri.parse("package:" + context.applicationContext.packageName))
                context.startActivity(intent)
                //ActivityCompat.requestPermissions(context as Activity, storagePermissions, REQUEST_STORAGE_PERMISSION)
            }
        } else {
            if (!isStoragePermissionGranted()) {
                ActivityCompat.requestPermissions(context as Activity, storagePermissions, REQUEST_STORAGE_PERMISSION)
            }
        }
    }

    fun isStoragePermissionGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Environment.isExternalStorageManager()
        } else {
            storagePermissions.all {
                ContextCompat.checkSelfPermission(
                    context,
                    it
                ) == PackageManager.PERMISSION_GRANTED
            }
        }
    }
}