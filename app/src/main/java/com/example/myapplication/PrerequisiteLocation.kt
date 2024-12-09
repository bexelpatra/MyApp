package com.example.myapplication

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class PrerequisiteLocation : AppCompatActivity() {

    private lateinit var requestLocationPermissionsUtil: RequestLocationPermissionsUtil

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
        requestLocationPermissionsUtil = RequestLocationPermissionsUtil(this)
        requestLocationPermissionsUtil.checkLocationPermission()
    }

    fun showPermissionDeniedMessage(permissionType: String) {
        Toast.makeText(
            this,
            "${permissionType} 권한이 필요합니다",
            Toast.LENGTH_LONG
        ).show()
        finish()
    }

    fun proceedToMainActivity() {
        startActivity(Intent(this, PrerequisiteNotification::class.java))
        finish()
    }
}
