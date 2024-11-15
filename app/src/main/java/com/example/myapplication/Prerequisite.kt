package com.example.myapplication

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat

class Prerequisite : AppCompatActivity() {
    override fun onStart() {
        super.onStart()
        val reqUtil =RequestPermissionsUtil(this);
        reqUtil.requestLocation() // 위치 권한 요청
        reqUtil.requestManageExternalStoragePermission()
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.prerequisite)
    }
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        print("")
        if (requestCode == 1) {
            when {
                grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED -> {
                    // Permission granted
                    onPermissionGranted()
                }
                ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.CAMERA) -> {
                    // Permission denied, and user didn't select "Don't ask again"
                    onPermissionDenied()
                }
                else -> {
                    // Permission denied, and "Don't ask again" selected
                    onPermissionDeniedForever()
                }
            }
        }
    }

    private fun onPermissionGranted() {
        Toast.makeText(this, "권한이 승인되었습니다.", Toast.LENGTH_SHORT).show()
        // Proceed with functionality that requires permission
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun onPermissionDenied() {
        Toast.makeText(this, "권한이 거절되었습니다.", Toast.LENGTH_LONG).show()
        finish()
        // Inform the user about the need for permission or take alternative action
    }

    private fun onPermissionDeniedForever() {
        Toast.makeText(this, "권한 거절되었습니다. 설정에서 변경해주세요", Toast.LENGTH_LONG).show()
        finish()
        // Guide the user to app settings if needed
    }
}
