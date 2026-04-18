package com.sardarjifood.app

import android.app.Application
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.google.firebase.messaging.FirebaseMessaging
import com.razorpay.Checkout
import com.sardarjifood.app.worker.AppSyncWorker
import java.util.concurrent.TimeUnit

class SardarJiApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        AppLog.info("Application", "Application onCreate started.")
        container = AppContainer(this)
        runCatching { Checkout.preload(this) }
            .onFailure { AppLog.warn("Application", "Razorpay preload failed during app start.", it) }
        runCatching { FirebaseMessaging.getInstance().isAutoInitEnabled = true }
            .onFailure { AppLog.warn("Application", "FCM auto-init could not be enabled.", it) }
        scheduleSync()
    }

    private fun scheduleSync() {
        runCatching {
            val request =
                PeriodicWorkRequestBuilder<AppSyncWorker>(2, TimeUnit.HOURS)
                    .setConstraints(
                        Constraints.Builder()
                            .setRequiredNetworkType(NetworkType.CONNECTED)
                            .build(),
                    )
                    .build()

            WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                "sjfc-native-sync",
                ExistingPeriodicWorkPolicy.UPDATE,
                request,
            )
            AppLog.info("Application", "Periodic app sync scheduled.")
        }.onFailure { throwable ->
            AppLog.error("Application", "Failed to schedule periodic app sync.", throwable)
        }
    }
}
