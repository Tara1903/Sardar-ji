package com.sardarjifood.app.push

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.sardarjifood.app.AppLog
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.sardarjifood.app.MainActivity
import com.sardarjifood.app.R
import com.sardarjifood.app.SardarJiApplication
import com.sardarjifood.app.notifications.AppNotificationCenter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class SardarJiFirebaseMessagingService : FirebaseMessagingService() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        AppLog.info("PushService", "Received refreshed FCM token.")
        serviceScope.launch {
            runCatching {
                (application as? SardarJiApplication)?.container?.authRepository?.registerNativePushToken(token)
            }.onSuccess {
                AppLog.info("PushService", "Refreshed FCM token saved to the signed-in profile.")
            }.onFailure { throwable ->
                AppLog.warn("PushService", "Refreshed FCM token could not be saved yet.", throwable)
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        runCatching {
            createChannel()

            val title = message.notification?.title ?: message.data["title"] ?: "Sardar Ji Food Corner"
            val body = message.notification?.body ?: message.data["message"] ?: "You have a new update."
            val targetUrl = sanitizeTargetUrl(message.data["url"] ?: message.data["deep_link"])
            val notificationEvent =
                AppNotificationCenter.createCustomerOrderStatusEvent(
                    orderId = message.data["orderId"].orEmpty(),
                    orderNumber = message.data["orderNumber"].orEmpty(),
                    status = message.data["status"].orEmpty(),
                    rawNotificationKey = message.data["notificationKey"].orEmpty(),
                )

            if (AppNotificationCenter.isForeground.value && notificationEvent != null) {
                AppNotificationCenter.emit(notificationEvent.copy(title = title, message = body, deepLink = targetUrl))
                AppLog.info("PushService", "Delivered foreground push through in-app notification center.")
                return
            }

            val intent =
                Intent(this, MainActivity::class.java).apply {
                    putExtra("deep_link_path", targetUrl)
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            val pendingIntent =
                PendingIntent.getActivity(
                    this,
                    targetUrl.hashCode(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) {
                AppLog.warn("PushService", "Notification permission missing; skipping notification display.")
                return
            }

            NotificationManagerCompat.from(this).notify(
                System.currentTimeMillis().toInt(),
                NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                    .setContentIntent(pendingIntent)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .build(),
            )
            AppLog.info("PushService", "Displayed push notification for $targetUrl.")
        }.onFailure { throwable ->
            AppLog.error("PushService", "Failed while handling incoming FCM message.", throwable)
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val notificationManager = getSystemService(NotificationManager::class.java)
        val channel =
            NotificationChannel(
                CHANNEL_ID,
                "Order updates",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Status updates, new orders, and delivery changes."
            }
        notificationManager.createNotificationChannel(channel)
    }

    companion object {
        const val CHANNEL_ID = "sjfc_orders"
    }

    private fun sanitizeTargetUrl(value: String?): String {
        val candidate = value?.trim().orEmpty()
        return when {
            candidate.isBlank() -> "/orders"
            candidate.startsWith("/") -> candidate
            candidate.startsWith("sjfc://") -> candidate.removePrefix("sjfc://").let { "/${it.trimStart('/')}" }
            candidate.startsWith("https://www.sardarjifoodcorner.shop") ->
                candidate.removePrefix("https://www.sardarjifoodcorner.shop").ifBlank { "/orders" }
            candidate.startsWith("https://sardarjifoodcorner.shop") ->
                candidate.removePrefix("https://sardarjifoodcorner.shop").ifBlank { "/orders" }
            else -> "/orders"
        }
    }
}
