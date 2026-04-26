package com.sardarjifood.app.notifications

import com.sardarjifood.app.model.AppRole
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

data class AppNotificationEvent(
    val role: AppRole,
    val type: String,
    val title: String,
    val message: String,
    val deepLink: String,
    val notificationKey: String,
    val orderId: String = "",
    val orderNumber: String = "",
    val status: String = "",
    val announcement: String = "",
)

object AppNotificationCenter {
    private const val DUPLICATE_WINDOW_MS = 18_000L
    private val foregroundState = MutableStateFlow(false)
    private val eventsFlow = MutableSharedFlow<AppNotificationEvent>(extraBufferCapacity = 32)
    private val recentEvents = linkedMapOf<String, Long>()
    private val lock = Any()

    val isForeground = foregroundState.asStateFlow()
    val events = eventsFlow.asSharedFlow()

    fun setForeground(value: Boolean) {
        foregroundState.value = value
    }

    fun emit(event: AppNotificationEvent): Boolean {
        val eventKey = canonicalEventKey(event)

        synchronized(lock) {
            val now = System.currentTimeMillis()
            val iterator = recentEvents.entries.iterator()

            while (iterator.hasNext()) {
                val entry = iterator.next()
                if (now - entry.value > DUPLICATE_WINDOW_MS) {
                    iterator.remove()
                }
            }

            if (recentEvents.containsKey(eventKey)) {
                return false
            }

            recentEvents[eventKey] = now
        }

        eventsFlow.tryEmit(event.copy(notificationKey = eventKey))
        return true
    }

    fun createCustomerOrderStatusEvent(
        orderId: String,
        orderNumber: String,
        status: String,
        rawNotificationKey: String = "",
    ): AppNotificationEvent? {
        val normalizedStatus = normalizeStatus(status)
        val message =
            when (normalizedStatus) {
                "Preparing" -> "Your order is being prepared."
                "Out for Delivery" -> "Your order is nearby."
                "Delivered" -> "Your order has been delivered."
                else -> ""
            }

        if (message.isBlank()) {
            return null
        }

        return AppNotificationEvent(
            role = AppRole.CUSTOMER,
            type = "order_status",
            title = if (normalizedStatus == "Delivered") "Order delivered" else "Order update",
            message = message,
            deepLink = if (orderId.isNotBlank()) "/track/$orderId" else "/orders",
            notificationKey = rawNotificationKey,
            orderId = orderId,
            orderNumber = orderNumber,
            status = normalizedStatus,
        )
    }

    fun createAdminNewOrderEvent(
        orderId: String,
        orderNumber: String,
        customerName: String,
        rawNotificationKey: String = "",
    ): AppNotificationEvent =
        AppNotificationEvent(
            role = AppRole.ADMIN,
            type = "admin_new_order",
            title = "New order received",
            message = "${customerName.ifBlank { "A customer" }} placed ${orderNumber.ifBlank { "a new order" }}.",
            deepLink = "/admin/orders",
            notificationKey = rawNotificationKey,
            orderId = orderId,
            orderNumber = orderNumber,
            announcement = "New order received",
        )

    private fun normalizeStatus(status: String): String {
        val rawStatus = status.trim()
        if (rawStatus.isBlank()) return ""
        val key = rawStatus.lowercase().replace("-", "_").replace(" ", "_")

        return when (key) {
            "preparing", "ready" -> "Preparing"
            "nearby", "out_for_delivery" -> "Out for Delivery"
            "delivered" -> "Delivered"
            else -> rawStatus
        }
    }

    private fun canonicalEventKey(event: AppNotificationEvent): String {
        val providedKey = event.notificationKey.trim()
        if (providedKey.isNotBlank()) {
            val parts = providedKey.split(':')
            if (parts.size >= 3 && parts.first() == "order_status") {
                return parts.take(3).joinToString(":")
            }
            if (parts.size >= 2 && parts.first() == "admin_new_order") {
                return parts.take(2).joinToString(":")
            }
            return providedKey
        }

        return buildString {
            append(event.type.ifBlank { "generic" })
            append(':')
            append(event.orderId.ifBlank { event.orderNumber.ifBlank { event.title } })
            if (event.status.isNotBlank()) {
                append(':')
                append(event.status)
            }
        }
    }
}
