package com.sardarjifood.app.data.repository

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.reflect.TypeToken
import com.sardarjifood.app.data.mapCategories
import com.sardarjifood.app.data.mapOrders
import com.sardarjifood.app.data.mapProducts
import com.sardarjifood.app.data.toEntity
import com.sardarjifood.app.data.toModel
import com.sardarjifood.app.data.network.AppHttpException
import com.sardarjifood.app.data.network.SiteHttpClient
import com.sardarjifood.app.data.network.SupabaseHttpClient
import com.sardarjifood.app.data.network.asJsonArrayOrEmpty
import com.sardarjifood.app.data.network.asJsonObjectOrEmpty
import com.sardarjifood.app.data.network.int
import com.sardarjifood.app.data.network.string
import com.sardarjifood.app.data.toOrder
import com.sardarjifood.app.data.toProduct
import com.sardarjifood.app.data.toRewardCoupon
import com.sardarjifood.app.data.toSettings
import com.sardarjifood.app.data.toSubscription
import com.sardarjifood.app.data.toUserProfile
import com.sardarjifood.app.data.local.AppDao
import com.sardarjifood.app.data.local.SessionStore
import com.sardarjifood.app.data.local.SnapshotEntity
import com.sardarjifood.app.model.Address
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.AppSession
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.model.RewardCoupon
import com.sardarjifood.app.model.StoreSettings
import com.sardarjifood.app.model.Subscription
import com.sardarjifood.app.model.UserProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private const val SNAPSHOT_CATALOG = "catalog"
private const val SNAPSHOT_ORDERS = "orders"
private const val SNAPSHOT_SUBSCRIPTION = "subscription"
private const val SNAPSHOT_COUPONS = "coupons"
private const val SNAPSHOT_USERS = "users"

private class SessionRequiredException : Exception("Authentication required.")

private inline fun <reified T> Gson.fromJsonOrNull(json: String?): T? =
    runCatching { fromJson<T>(json, object : TypeToken<T>() {}.type) }.getOrNull()

private suspend fun AppDao.readSnapshot(key: String): String? = getSnapshot(key)?.json

private suspend fun AppDao.writeSnapshot(key: String, json: String) {
    upsertSnapshot(SnapshotEntity(key = key, json = json, updatedAt = System.currentTimeMillis()))
}

private fun monthlySubscriptionProduct(product: Product): Boolean {
    val slug = product.slug.trim().lowercase()
    val name = product.name.trim().lowercase()
    return slug == "monthly-plan" || name in setOf("monthly plan", "monthly thali", "monthly thali plan")
}

class NativeAuthRepository(
    private val gson: Gson,
    private val dao: AppDao,
    private val sessionStore: SessionStore,
    private val supabaseHttpClient: SupabaseHttpClient,
) : AuthRepository {
    private val _sessionFlow = MutableStateFlow<AppSession?>(null)
    override val sessionFlow: Flow<AppSession?> = _sessionFlow.asStateFlow()

    override suspend fun restoreSession(): AppSession? {
        val token = sessionStore.tokenFlow.firstOrNull().orEmpty()
        if (token.isBlank()) {
            _sessionFlow.value = null
            return null
        }

        return runCatching { fetchSession(token) }.getOrElse {
            sessionStore.clear()
            _sessionFlow.value = null
            null
        }
    }

    override suspend fun signIn(email: String, password: String): AppSession {
        val response =
            supabaseHttpClient.request(
                path = "auth/v1/token?grant_type=password",
                method = "POST",
                body = mapOf("email" to email.trim().lowercase(), "password" to password),
            ).asJsonObjectOrEmpty()
        val token = response.string("access_token")
        if (token.isBlank()) {
            throw AppHttpException("Invalid email or password.", 400)
        }
        return persistSession(fetchSession(token))
    }

    override suspend fun signUp(
        name: String,
        email: String,
        phoneNumber: String,
        password: String,
        referralCode: String,
    ): AppSession {
        val response =
            supabaseHttpClient.request(
                path = "auth/v1/signup",
                method = "POST",
                body = mapOf(
                    "email" to email.trim().lowercase(),
                    "password" to password,
                    "data" to mapOf(
                        "name" to name.trim(),
                        "phoneNumber" to phoneNumber.trim(),
                        "role" to "customer",
                    ),
                ),
            ).asJsonObjectOrEmpty()
        val token = response.string("access_token")
        val session = if (token.isNotBlank()) fetchSession(token) else signIn(email, password)

        if (referralCode.isNotBlank()) {
            runCatching {
                supabaseHttpClient.request(
                    path = "rest/v1/rpc/apply_referral_code",
                    method = "POST",
                    token = session.accessToken,
                    body = mapOf("p_referral_code" to referralCode.trim()),
                )
            }
        }

        return persistSession(session)
    }

    override suspend fun signOut() {
        sessionStore.clear()
        _sessionFlow.value = null
    }

    override suspend fun refreshProfile(): UserProfile? {
        val session = currentSession() ?: return null
        return fetchUserProfile(session.accessToken, session.user.id).also { profile ->
            _sessionFlow.value = session.copy(user = profile)
        }
    }

    override suspend fun updateAddresses(addresses: List<Address>): UserProfile {
        val session = currentSession() ?: throw SessionRequiredException()
        val payload = serializeAddressesPayload(addresses, session.user)
        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/users?id=eq.${session.user.id}&select=*",
                method = "PATCH",
                token = session.accessToken,
                body = mapOf("addresses" to payload),
                preferRepresentation = true,
            ).asJsonArrayOrEmpty()
        val updatedUser = rows.firstOrNull()?.asJsonObjectOrEmpty()?.toUserProfile() ?: session.user
        _sessionFlow.value = session.copy(user = updatedUser)
        return updatedUser
    }

    override suspend fun registerNativePushToken(token: String) {
        if (token.isBlank()) return
        val session = currentSession() ?: return
        val existing = session.user.nativePushTokens.any { it.token == token }
        if (existing) return

        val payload = serializeAddressesPayload(
            addresses = session.user.addresses,
            user = session.user,
            nativePushToken = token,
        )

        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/users?id=eq.${session.user.id}&select=*",
                method = "PATCH",
                token = session.accessToken,
                body = mapOf("addresses" to payload),
                preferRepresentation = true,
            ).asJsonArrayOrEmpty()
        val updatedUser = rows.firstOrNull()?.asJsonObjectOrEmpty()?.toUserProfile() ?: session.user
        _sessionFlow.value = session.copy(user = updatedUser)
    }

    internal suspend fun currentSession(): AppSession? = _sessionFlow.value ?: restoreSession()

    private suspend fun fetchSession(token: String): AppSession {
        val authUser = supabaseHttpClient.request("auth/v1/user", token = token).asJsonObjectOrEmpty()
        val userId = authUser.string("id")
        val user = fetchUserProfile(token, userId)
        return AppSession(accessToken = token, user = user)
    }

    private suspend fun fetchUserProfile(token: String, userId: String): UserProfile {
        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/users?id=eq.$userId&select=*",
                token = token,
            ).asJsonArrayOrEmpty()
        val profile = rows.firstOrNull()?.asJsonObjectOrEmpty()?.toUserProfile()
        return profile ?: throw AppHttpException("Unable to load the user profile.", 500)
    }

    private suspend fun persistSession(session: AppSession): AppSession {
        sessionStore.saveToken(session.accessToken)
        _sessionFlow.value = session
        return session
    }

    private fun serializeAddressesPayload(
        addresses: List<Address>,
        user: UserProfile,
        nativePushToken: String? = null,
    ): List<Map<String, Any?>> {
        val pushTokens =
            (user.nativePushTokens + listOfNotNull(nativePushToken?.let {
                com.sardarjifood.app.model.NativePushToken(token = it)
            })).distinctBy { it.token }

        val addressEntries = addresses.map { address ->
            mapOf(
                "id" to address.id,
                "name" to address.name,
                "phoneNumber" to address.phoneNumber,
                "fullAddress" to address.fullAddress,
                "landmark" to address.landmark,
                "pincode" to address.pincode,
            )
        }

        val subscriptionEntry =
            mapOf(
                "id" to "__subscription_meta__",
                "_type" to "subscription-meta",
                "payload" to mapOf(
                    "pausedUntil" to user.subscriptionMeta.pausedUntil,
                    "skipDates" to user.subscriptionMeta.skipDates,
                    "holidayDates" to user.subscriptionMeta.holidayDates,
                ),
            )

        val tokenEntries = pushTokens.mapIndexed { index, entry ->
            mapOf(
                "id" to "__native_push_token__$index",
                "_type" to "native-push-token",
                "payload" to mapOf(
                    "token" to entry.token,
                    "platform" to entry.platform,
                    "provider" to entry.provider,
                    "createdAt" to entry.createdAt,
                    "updatedAt" to entry.updatedAt,
                ),
            )
        }

        return addressEntries + subscriptionEntry + tokenEntries
    }
}

class NativeCatalogRepository(
    private val gson: Gson,
    private val dao: AppDao,
    private val supabaseHttpClient: SupabaseHttpClient,
) : CatalogRepository {
    override suspend fun getCatalog(forceRefresh: Boolean): CatalogBundle {
        if (!forceRefresh) {
            gson.fromJsonOrNull<CatalogBundle>(dao.readSnapshot(SNAPSHOT_CATALOG))?.let { return it }
        }

        return try {
            val settingsJson =
                supabaseHttpClient.request("rest/v1/app_settings?id=eq.1&select=*&limit=1").asJsonArrayOrEmpty()
                    .firstOrNull()?.asJsonObjectOrEmpty() ?: JsonObject()
            val settings = settingsJson.toSettings()
            val categories =
                supabaseHttpClient.request("rest/v1/categories?select=*&order=sort_order.asc").asJsonArrayOrEmpty()
                    .mapCategories()
            val products =
                supabaseHttpClient.request("rest/v1/products?select=*,categories(name,slug)&order=created_at.desc")
                    .asJsonArrayOrEmpty()
                    .mapProducts(settings.productAddonGroups)
                    .filterNot(::monthlySubscriptionProduct)

            CatalogBundle(settings = settings, categories = categories, products = products).also { bundle ->
                dao.writeSnapshot(SNAPSHOT_CATALOG, gson.toJson(bundle))
            }
        } catch (error: Exception) {
            gson.fromJsonOrNull<CatalogBundle>(dao.readSnapshot(SNAPSHOT_CATALOG))
                ?: throw error
        }
    }
}

class NativeCartRepository(
    private val gson: Gson,
    private val dao: AppDao,
) : CartRepository {
    override val cartLines: Flow<List<CartLine>> =
        dao.observeCartLines().map { rows ->
            rows.map { it.toModel(gson) }
        }

    override suspend fun getCurrentCart(): List<CartLine> = dao.getCartLines().map { it.toModel(gson) }

    override suspend fun upsertLine(line: CartLine) {
        dao.upsertCartLine(line.toEntity(gson))
    }

    override suspend fun removeLine(lineId: String) {
        dao.removeCartLine(lineId)
    }

    override suspend fun clear() {
        dao.clearCart()
    }
}

class NativeOrdersRepository(
    private val gson: Gson,
    private val dao: AppDao,
    private val authRepository: AuthRepository,
    private val supabaseHttpClient: SupabaseHttpClient,
    private val siteHttpClient: SiteHttpClient,
) : OrdersRepository {
    override suspend fun getOrders(forceRefresh: Boolean): List<Order> {
        if (!forceRefresh) {
            gson.fromJsonOrNull<List<Order>>(dao.readSnapshot(SNAPSHOT_ORDERS))?.let { return it }
        }

        val token = requireSession().accessToken
        return try {
            supabaseHttpClient.request("rest/v1/orders?select=*&order=created_at.desc", token = token)
                .asJsonArrayOrEmpty()
                .mapOrders()
                .also { orders -> dao.writeSnapshot(SNAPSHOT_ORDERS, gson.toJson(orders)) }
        } catch (error: Exception) {
            gson.fromJsonOrNull<List<Order>>(dao.readSnapshot(SNAPSHOT_ORDERS)) ?: throw error
        }
    }

    override suspend fun getOrder(id: String): Order {
        val token = requireSession().accessToken
        val rows =
            supabaseHttpClient.request(
                "rest/v1/orders?id=eq.$id&select=*&limit=1",
                token = token,
            ).asJsonArrayOrEmpty()
        return rows.firstOrNull()?.asJsonObjectOrEmpty()?.toOrder()
            ?: throw AppHttpException("Unable to load the order.", 404)
    }

    override suspend fun placeCodOrder(
        items: List<CartLine>,
        address: Address,
        note: String,
        couponCode: String,
        pricing: Map<String, Any?>,
    ): Order {
        val session = requireSession()
        val payload =
            mapOf(
                "p_user_id" to session.user.id,
                "p_address" to mapOf(
                    "id" to address.id,
                    "name" to address.name,
                    "phoneNumber" to address.phoneNumber,
                    "fullAddress" to address.fullAddress,
                    "landmark" to address.landmark,
                    "pincode" to address.pincode,
                ),
                "p_payment_method" to "COD",
                "p_items" to items.map { item ->
                    mapOf(
                        "id" to item.id,
                        "lineId" to item.lineId,
                        "quantity" to item.quantity,
                        "price" to item.price,
                        "basePrice" to item.basePrice,
                        "name" to item.name,
                        "isFreebie" to item.isFreebie,
                        "isAddonLine" to item.isAddonLine,
                        "parentLineId" to item.parentLineId,
                        "parentProductId" to item.parentProductId,
                        "groupId" to item.groupId,
                        "groupTitle" to item.groupTitle,
                        "addonSummary" to item.addonSummary,
                    )
                },
                "p_note" to note,
                "p_coupon_code" to couponCode.ifBlank { null },
                "p_distance_km" to pricing["distanceKm"],
            )

        val response =
            supabaseHttpClient.request(
                path = "rest/v1/rpc/place_order",
                method = "POST",
                token = session.accessToken,
                body = payload,
            ).asJsonObjectOrEmpty()

        return getOrder(response.string("id"))
    }

    override suspend fun createRazorpayOrder(draft: PaymentDraft): RazorpayCheckoutPayload {
        val token = requireSession().accessToken
        val response =
            siteHttpClient.request(
                path = "api/razorpay/create-order",
                method = "POST",
                token = token,
                body = mapOf(
                    "purpose" to draft.purpose,
                    "payload" to draft.payload,
                    "customerName" to draft.customerName,
                    "phoneNumber" to draft.phoneNumber,
                    "logoUrl" to draft.logoUrl,
                ),
            ).asJsonObjectOrEmpty()
        val order = response.asJsonObjectOrEmpty().get("order").asJsonObjectOrEmpty()
        val business = response.asJsonObjectOrEmpty().get("business").asJsonObjectOrEmpty()
        val prefill = response.asJsonObjectOrEmpty().get("prefill").asJsonObjectOrEmpty()
        return RazorpayCheckoutPayload(
            keyId = response.string("keyId"),
            orderId = order.string("id"),
            amount = order.int("amount"),
            currency = order.string("currency", "INR"),
            businessName = business.string("name", "Sardar Ji Food Corner"),
            businessDescription = business.string("description"),
            themeColor = business.string("themeColor", "#17743a"),
            prefillName = prefill.string("name"),
            prefillEmail = prefill.string("email"),
            prefillContact = prefill.string("contact"),
        )
    }

    override suspend fun verifyRazorpayPayment(
        paymentId: String,
        orderId: String,
        signature: String,
        payload: Map<String, Any?>,
    ): PaymentVerificationResult {
        val token = requireSession().accessToken
        val response =
            siteHttpClient.request(
                path = "api/razorpay/verify-payment",
                method = "POST",
                token = token,
                body = mapOf(
                    "purpose" to "food-order",
                    "razorpayPaymentId" to paymentId,
                    "razorpayOrderId" to orderId,
                    "razorpaySignature" to signature,
                    "payload" to payload,
                ),
            ).asJsonObjectOrEmpty()

        return PaymentVerificationResult(
            paymentId = response.string("paymentId"),
            orderId = response.string("orderId"),
            status = response.string("status"),
            fulfilledOrder = response.get("order")?.takeIf { !it.isJsonNull }?.asJsonObjectOrEmpty()?.toOrder(),
        )
    }

    override suspend fun updateOrderStatus(
        id: String,
        status: String,
        assignedDeliveryBoyId: String?,
        assignedDeliveryBoyName: String?,
    ): Order {
        val token = requireSession().accessToken
        val body = buildMap {
            put("status", status)
            assignedDeliveryBoyId?.let { put("assigned_delivery_boy_id", it) }
            assignedDeliveryBoyName?.let { put("assigned_delivery_boy_name", it) }
        }

        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/orders?id=eq.$id&select=*",
                method = "PATCH",
                token = token,
                body = body,
                preferRepresentation = true,
            ).asJsonArrayOrEmpty()
        return rows.firstOrNull()?.asJsonObjectOrEmpty()?.toOrder()
            ?: throw AppHttpException("Unable to update the order status.", 500)
    }

    override suspend fun updateDeliveryLocation(orderId: String, latitude: Double, longitude: Double): Order {
        val session = requireSession()
        supabaseHttpClient.request(
            path = "rest/v1/rpc/track_delivery",
            method = "POST",
            token = session.accessToken,
            body = mapOf(
                "p_order_id" to orderId,
                "p_delivery_user_id" to session.user.id,
                "p_latitude" to latitude,
                "p_longitude" to longitude,
                "p_eta_minutes" to null,
                "p_status_note" to "",
            ),
        )
        return getOrder(orderId)
    }

    private suspend fun requireSession(): AppSession =
        authRepository.restoreSession()
            ?: throw SessionRequiredException()
}

class NativeProfileRepository(
    private val gson: Gson,
    private val dao: AppDao,
    private val authRepository: AuthRepository,
    private val supabaseHttpClient: SupabaseHttpClient,
) : ProfileRepository {
    override suspend fun getSubscription(forceRefresh: Boolean): Subscription? {
        if (!forceRefresh) {
            gson.fromJsonOrNull<Subscription>(dao.readSnapshot(SNAPSHOT_SUBSCRIPTION))?.let { return it }
        }
        val session = requireSession()
        return try {
            supabaseHttpClient.request(
                path = "rest/v1/rpc/get_my_subscription",
                method = "POST",
                token = session.accessToken,
                body = mapOf("p_user_id" to session.user.id),
            ).asJsonObjectOrEmpty()
                .takeIf { it.entrySet().isNotEmpty() }
                ?.toSubscription()
                ?.also { dao.writeSnapshot(SNAPSHOT_SUBSCRIPTION, gson.toJson(it)) }
        } catch (error: Exception) {
            gson.fromJsonOrNull<Subscription>(dao.readSnapshot(SNAPSHOT_SUBSCRIPTION))
        }
    }

    override suspend fun getRewardCoupons(forceRefresh: Boolean): List<RewardCoupon> {
        if (!forceRefresh) {
            gson.fromJsonOrNull<List<RewardCoupon>>(dao.readSnapshot(SNAPSHOT_COUPONS))?.let { return it }
        }
        val session = requireSession()
        return try {
            val coupons =
                supabaseHttpClient.request(
                    path = "rest/v1/reward_coupons?user_id=eq.${session.user.id}&select=*&order=created_at.desc",
                    token = session.accessToken,
                ).asJsonArrayOrEmpty()
                    .map { it.asJsonObjectOrEmpty().toRewardCoupon() }
            dao.writeSnapshot(SNAPSHOT_COUPONS, gson.toJson(coupons))
            coupons
        } catch (error: Exception) {
            gson.fromJsonOrNull<List<RewardCoupon>>(dao.readSnapshot(SNAPSHOT_COUPONS)) ?: emptyList()
        }
    }

    private suspend fun requireSession(): AppSession =
        authRepository.restoreSession()
            ?: throw SessionRequiredException()
}

class NativeAdminRepository(
    private val gson: Gson,
    private val dao: AppDao,
    private val authRepository: AuthRepository,
    private val supabaseHttpClient: SupabaseHttpClient,
) : AdminRepository {
    override suspend fun getUsers(role: String?): List<UserProfile> {
        val session = requireSession()
        val filter = role?.takeIf { it.isNotBlank() }?.let { "&role=eq.$it" }.orEmpty()
        return try {
            supabaseHttpClient.request(
                path = "rest/v1/users?select=*&order=created_at.desc$filter",
                token = session.accessToken,
            ).asJsonArrayOrEmpty()
                .map { it.asJsonObjectOrEmpty().toUserProfile() }
                .also { users -> dao.writeSnapshot(SNAPSHOT_USERS, gson.toJson(users)) }
        } catch (error: Exception) {
            gson.fromJsonOrNull<List<UserProfile>>(dao.readSnapshot(SNAPSHOT_USERS)) ?: emptyList()
        }
    }

    override suspend fun updateProductAvailability(productId: String, isAvailable: Boolean): Product {
        val session = requireSession()
        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/products?id=eq.$productId&select=*,categories(name,slug)",
                method = "PATCH",
                token = session.accessToken,
                body = mapOf("is_available" to isAvailable),
                preferRepresentation = true,
            ).asJsonArrayOrEmpty()
        return rows.firstOrNull()?.asJsonObjectOrEmpty()?.toProduct()
            ?: throw AppHttpException("Unable to update product availability.", 500)
    }

    override suspend fun updateStorefrontTheme(
        businessName: String,
        tagline: String,
        phoneNumber: String,
        whatsappNumber: String,
        timings: String,
    ): StoreSettings {
        val session = requireSession()
        val currentRow =
            supabaseHttpClient.request(
                path = "rest/v1/app_settings?id=eq.1&select=*&limit=1",
                token = session.accessToken,
            ).asJsonArrayOrEmpty().firstOrNull()?.asJsonObjectOrEmpty() ?: JsonObject()
        val deliveryRules = currentRow.get("delivery_rules")?.asJsonObjectOrEmpty() ?: JsonObject()
        val updateBody = mapOf(
            "business_name" to businessName,
            "tagline" to tagline,
            "phone_number" to phoneNumber,
            "whatsapp_number" to whatsappNumber,
            "timings" to timings,
            "delivery_rules" to gson.fromJson(deliveryRules, Map::class.java),
            "maps_embed_url" to currentRow.string("maps_embed_url"),
            "trust_points" to gson.fromJson(currentRow.get("trust_points"), List::class.java),
            "offers" to gson.fromJson(currentRow.get("offers"), List::class.java),
        )
        val rows =
            supabaseHttpClient.request(
                path = "rest/v1/app_settings?id=eq.1&select=*",
                method = "PATCH",
                token = session.accessToken,
                body = updateBody,
                preferRepresentation = true,
            ).asJsonArrayOrEmpty()
        return rows.firstOrNull()?.asJsonObjectOrEmpty()?.toSettings()
            ?: throw AppHttpException("Unable to update store settings.", 500)
    }

    private suspend fun requireSession(): AppSession {
        val session =
            authRepository.restoreSession()
                ?: throw SessionRequiredException()
        if (session.user.role != AppRole.ADMIN) {
            throw AppHttpException("Admin access is required for this action.", 403)
        }
        return session
    }
}

class NativeDeliveryRepository(
    private val authRepository: AuthRepository,
    private val ordersRepository: OrdersRepository,
) : DeliveryRepository {
    override suspend fun getActiveAssignments(forceRefresh: Boolean): List<Order> {
        val session =
            authRepository.restoreSession()
                ?: throw SessionRequiredException()

        val orders = ordersRepository.getOrders(forceRefresh)
        return orders.filter { order ->
            order.status.lowercase() !in setOf("delivered", "cancelled") &&
                (order.assignedDeliveryBoyId.isBlank() || order.assignedDeliveryBoyId == session.user.id)
        }
    }
}
