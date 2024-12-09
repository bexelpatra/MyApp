package com.example.myapplication

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class PrerequisiteNotification : AppCompatActivity() {

    private lateinit var requestNotificationPermissionsUtil: RequestNotificationPermissionsUtil

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
        requestNotificationPermissionsUtil = RequestNotificationPermissionsUtil(this)
        requestNotificationPermissionsUtil.checkNotificationPermission()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            103 -> {
                proceedToMainActivity()
            }
        }
    }

    fun proceedToMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
