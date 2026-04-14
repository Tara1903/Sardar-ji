package com.sardarjifood.app.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sardarjifood.app.SardarJiApplication

class AppSyncWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val container = (applicationContext as SardarJiApplication).container

        return runCatching {
            container.catalogRepository.getCatalog(forceRefresh = true)
            container.authRepository.restoreSession()?.let {
                container.ordersRepository.getOrders(forceRefresh = true)
                container.profileRepository.getSubscription(forceRefresh = true)
                container.profileRepository.getRewardCoupons(forceRefresh = true)
            }
        }.fold(
            onSuccess = { Result.success() },
            onFailure = { Result.retry() },
        )
    }
}
