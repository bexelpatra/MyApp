package com.example.myapplication

import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import android.util.Base64

class CryptoUtil {

    private val cipher: Cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
    private val secretKey: SecretKey
    private val iv: IvParameterSpec

    init {
        // Key and salt for key derivation (use a secure method for production).
        val salt = "12345678" // Replace with a securely generated salt in production
        val password = "yourSecurePassword"

        // Generate a secret key using PBKDF2 with HMAC-SHA1
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")
        val spec = PBEKeySpec(password.toCharArray(), salt.toByteArray(), 65536, 256)
        val tmp = factory.generateSecret(spec)
        secretKey = SecretKeySpec(tmp.encoded, "AES")

        // Initialize IV (use a secure IV generation method in production)
        iv = IvParameterSpec(ByteArray(16) { 0 }) // Example IV; in production, use a random IV.
    }

    fun encrypt(data: String): String {
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, iv)
        val encryptedBytes = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
//        return java.util.Base64.getEncoder().encodeToString(encryptedBytes)
        return Base64.encodeToString(encryptedBytes, Base64.NO_WRAP) // Use NO_WRAP to avoid line breaks
    }

    fun decrypt(encryptedData: String): String? {
        cipher.init(Cipher.DECRYPT_MODE, secretKey, iv)
        val decodedBytes = Base64.decode(encryptedData, Base64.NO_WRAP)
//        val decodedBytes = java.util.Base64.getDecoder().decode(encryptedData)
        val decryptedBytes = cipher.doFinal(decodedBytes)

        return String(decryptedBytes, Charsets.UTF_8)
    }
}