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
        container = AppContainer(this)
        Checkout.preload(this)
        FirebaseMessaging.getInstance().isAutoInitEnabled = true
        scheduleSync()
    }

    private fun scheduleSync() {
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
    }
}
