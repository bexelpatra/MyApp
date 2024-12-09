package com.example.myapplication

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class RequestLocationPermissionsUtil(private val activity: AppCompatActivity) {
    companion object {
        private const val REQUEST_LOCATION_PERMISSION = 102
    }

    private val locationPermissions = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    )

    private val locationPermissionRequest =
        activity.registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            when {
                permissions.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false) -> {
                    // 권한 승인됨
                    (activity as? PrerequisiteLocation)?.proceedToMainActivity()
                }
                else -> {
                    // 권한 거부됨
                    (activity as? PrerequisiteLocation)?.showPermissionDeniedMessage("위치")
                }
            }
        }

    fun checkLocationPermission() {
        when {
            hasLocationPermissions() -> (activity as? PrerequisiteLocation)?.proceedToMainActivity()
            else -> requestLocationPermissions()
        }
    }

    private fun hasLocationPermissions(): Boolean {
        return locationPermissions.all {
            ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestLocationPermissions() {
        locationPermissionRequest.launch(locationPermissions)
    }
}