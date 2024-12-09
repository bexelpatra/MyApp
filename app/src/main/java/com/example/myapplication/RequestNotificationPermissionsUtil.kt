package com.example.myapplication

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class RequestNotificationPermissionsUtil(private val activity: AppCompatActivity) {

    companion object {
        private const val REQUEST_NOTIFICATION_PERMISSION = 103
    }

    private val notificationPermissions = arrayOf(
        Manifest.permission.POST_NOTIFICATIONS
    )

    private val notificationPermissionRequest: ActivityResultLauncher<Array<String>> =
        activity.registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            when {
                permissions.getOrDefault(Manifest.permission.POST_NOTIFICATIONS, false) -> {
                    // 권한 승인됨
                    (activity as? PrerequisiteNotification)?.proceedToMainActivity()
                }
                else -> {
                    // 권한 거부됨
                    (activity as? PrerequisiteNotification)?.proceedToMainActivity()
                }
            }
        }

    fun checkNotificationPermission() {
        when {
            hasNotificationPermissions() -> (activity as? PrerequisiteNotification)?.proceedToMainActivity()
            else -> requestNotificationPermissions()
        }
    }

    private fun hasNotificationPermissions(): Boolean {
        return notificationPermissions.all {
            ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestNotificationPermissions() {
        notificationPermissionRequest.launch(notificationPermissions)
    }
}