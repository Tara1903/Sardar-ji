package com.sardarjifood.app.data.repository

import com.sardarjifood.app.model.Address
import com.sardarjifood.app.model.AppSession
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.Category
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.model.RewardCoupon
import com.sardarjifood.app.model.StoreSettings
import com.sardarjifood.app.model.Subscription
import com.sardarjifood.app.model.UserProfile
import kotlinx.coroutines.flow.Flow

data class CatalogBundle(
    val settings: StoreSettings,
    val categories: List<Category>,
    val products: List<Product>,
)

data class PaymentDraft(
    val customerName: String,
    val phoneNumber: String,
    val logoUrl: String = "",
    val payload: Map<String, Any?>,
    val purpose: String = "food-order",
)

data class RazorpayCheckoutPayload(
    val keyId: String,
    val orderId: String,
    val amount: Int,
    val currency: String,
    val businessName: String,
    val businessDescription: String,
    val themeColor: String,
    val prefillName: String,
    val prefillEmail: String,
    val prefillContact: String,
)

data class PaymentVerificationResult(
    val paymentId: String,
    val orderId: String,
    val status: String,
    val fulfilledOrder: Order? = null,
)

interface AuthRepository {
    val sessionFlow: Flow<AppSession?>
    suspend fun restoreSession(): AppSession?
    suspend fun signIn(email: String, password: String): AppSession
    suspend fun signUp(
        name: String,
        email: String,
        phoneNumber: String,
        password: String,
        referralCode: String = "",
    ): AppSession
    suspend fun signOut()
    suspend fun refreshProfile(): UserProfile?
    suspend fun updateAddresses(addresses: List<Address>): UserProfile
    suspend fun registerNativePushToken(token: String)
}

interface CatalogRepository {
    suspend fun getCatalog(forceRefresh: Boolean = false): CatalogBundle
}

interface CartRepository {
    val cartLines: Flow<List<CartLine>>
    suspend fun getCurrentCart(): List<CartLine>
    suspend fun upsertLine(line: CartLine)
    suspend fun removeLine(lineId: String)
    suspend fun clear()
}

interface OrdersRepository {
    suspend fun getOrders(forceRefresh: Boolean = false): List<Order>
    suspend fun getOrder(id: String): Order
    suspend fun placeCodOrder(
        items: List<CartLine>,
        address: Address,
        note: String,
        couponCode: String,
        pricing: Map<String, Any?>,
    ): Order
    suspend fun createRazorpayOrder(draft: PaymentDraft): RazorpayCheckoutPayload
    suspend fun verifyRazorpayPayment(
        paymentId: String,
        orderId: String,
        signature: String,
        payload: Map<String, Any?>,
    ): PaymentVerificationResult
    suspend fun updateOrderStatus(
        id: String,
        status: String,
        assignedDeliveryBoyId: String? = null,
        assignedDeliveryBoyName: String? = null,
    ): Order
    suspend fun updateDeliveryLocation(
        orderId: String,
        latitude: Double,
        longitude: Double,
    ): Order
}

interface ProfileRepository {
    suspend fun getSubscription(forceRefresh: Boolean = false): Subscription?
    suspend fun getRewardCoupons(forceRefresh: Boolean = false): List<RewardCoupon>
}

interface AdminRepository {
    suspend fun getUsers(role: String? = null): List<UserProfile>
    suspend fun updateProductAvailability(productId: String, isAvailable: Boolean): Product
    suspend fun updateStorefrontTheme(
        businessName: String,
        tagline: String,
        phoneNumber: String,
        whatsappNumber: String,
        timings: String,
    ): StoreSettings
}

interface DeliveryRepository {
    suspend fun getActiveAssignments(forceRefresh: Boolean = false): List<Order>
}
