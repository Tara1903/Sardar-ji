package com.sardarjifood.app.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sardarjifood.app.AppLog
import com.sardarjifood.app.SardarJiApplication

class AppSyncWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        AppLog.info("AppSyncWorker", "Background sync started.")
        val container = (applicationContext as SardarJiApplication).container

        return runCatching {
            runCatching { container.catalogRepository.getCatalog(forceRefresh = true) }
                .onFailure { AppLog.warn("AppSyncWorker", "Catalog sync failed.", it) }
            container.authRepository.restoreSession()?.let {
                runCatching { container.ordersRepository.getOrders(forceRefresh = true) }
                    .onFailure { AppLog.warn("AppSyncWorker", "Orders sync failed.", it) }
                runCatching { container.profileRepository.getSubscription(forceRefresh = true) }
                    .onFailure { AppLog.warn("AppSyncWorker", "Subscription sync failed.", it) }
                runCatching { container.profileRepository.getRewardCoupons(forceRefresh = true) }
                    .onFailure { AppLog.warn("AppSyncWorker", "Coupon sync failed.", it) }
            }
        }.fold(
            onSuccess = {
                AppLog.info("AppSyncWorker", "Background sync finished.")
                Result.success()
            },
            onFailure = {
                AppLog.warn("AppSyncWorker", "Background sync failed before completion.", it)
                Result.retry()
            },
        )
    }
}
