package com.example.myapplication

import org.json.JSONObject
import org.junit.Test

import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        println("gogogo")
        var json = JSONObject("[{\"lat\":37.5653,\"lon\":126.9755,\"memo\":\"123123123\",\"option\":\"1\"},{\"lat\":37.5643,\"lon\":126.9765,\"memo\":\"123123123\",\"option\":\"2\"}]")

        assertEquals(4, 2 + 2)
    }
}