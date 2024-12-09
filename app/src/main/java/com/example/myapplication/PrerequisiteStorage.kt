package com.example.myapplication

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class PrerequisiteStorage : AppCompatActivity() {

    private lateinit var requestPermissionsUtil: RequestStoragePermissionsUtil
    private var storagePermissionGranted = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_storage_permission)
    }

    override fun onStart() {
        super.onStart()
        requestPermissionsUtil = RequestStoragePermissionsUtil(this)
        checkPermissions()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            101 -> {
                if (grantResults.isNotEmpty() &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    storagePermissionGranted = true
                    proceedToMainActivity()
                } else {
                    showPermissionDeniedMessage("저장소")
                }
            }
        }
    }

    private fun checkPermissions() {
        if (!requestPermissionsUtil.isStoragePermissionGranted()) {
            requestPermissionsUtil.checkAndRequestStoragePermission()
        } else {
            proceedToMainActivity()
        }
    }

    private fun showPermissionDeniedMessage(permissionType: String) {
        Toast.makeText(
            this,
            "${permissionType} 권한이 필요합니다",
            Toast.LENGTH_LONG
        ).show()
        finish()
    }

    private fun proceedToMainActivity() {
        startActivity(Intent(this, PrerequisiteLocation::class.java))
        finish()
    }
}
