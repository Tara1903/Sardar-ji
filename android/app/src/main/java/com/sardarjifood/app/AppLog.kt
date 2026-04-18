package com.sardarjifood.app

import android.util.Log

object AppLog {
    private const val TAG_PREFIX = "SJFC"

    fun info(scope: String, message: String) {
        Log.i("$TAG_PREFIX-$scope", message)
    }

    fun warn(scope: String, message: String, throwable: Throwable? = null) {
        if (throwable == null) {
            Log.w("$TAG_PREFIX-$scope", message)
        } else {
            Log.w("$TAG_PREFIX-$scope", message, throwable)
        }
    }

    fun error(scope: String, message: String, throwable: Throwable? = null) {
        if (throwable == null) {
            Log.e("$TAG_PREFIX-$scope", message)
        } else {
            Log.e("$TAG_PREFIX-$scope", message, throwable)
        }
    }
}
