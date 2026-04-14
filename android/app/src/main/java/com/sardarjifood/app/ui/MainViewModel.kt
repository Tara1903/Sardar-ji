package com.sardarjifood.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.messaging.FirebaseMessaging
import com.sardarjifood.app.SardarJiApplication
import com.sardarjifood.app.data.buildCartLine
import com.sardarjifood.app.data.computePricing
import com.sardarjifood.app.data.createInitialAddonSelection
import com.sardarjifood.app.data.repository.CatalogBundle
import com.sardarjifood.app.data.repository.PaymentDraft
import com.sardarjifood.app.data.repository.PaymentVerificationResult
import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload
import com.sardarjifood.app.model.Address
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.AppSession
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.CartPricing
import com.sardarjifood.app.model.Category
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.model.RewardCoupon
import com.sardarjifood.app.model.StoreSettings
import com.sardarjifood.app.model.Subscription
import com.sardarjifood.app.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class NativeUiState(
    val booting: Boolean = true,
    val session: AppSession? = null,
    val settings: StoreSettings = StoreSettings(),
    val categories: List<Category> = emptyList(),
    val products: List<Product> = emptyList(),
    val orders: List<Order> = emptyList(),
    val subscription: Subscription? = null,
    val rewardCoupons: List<RewardCoupon> = emptyList(),
    val loadingCatalog: Boolean = false,
    val loadingOrders: Boolean = false,
    val processingCheckout: Boolean = false,
    val errorMessage: String? = null,
    val noticeMessage: String? = null,
    val lastPlacedOrder: Order? = null,
)

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container
    private val _uiState = MutableStateFlow(NativeUiState())
    val uiState: StateFlow<NativeUiState> = _uiState.asStateFlow()

    val cartLines: StateFlow<List<CartLine>> =
        container.cartRepository.cartLines.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    init {
        bootstrap()
    }

    val currentRole: AppRole
        get() = uiState.value.session?.user?.role ?: AppRole.CUSTOMER

    fun bootstrap(forceRefresh: Boolean = false) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(booting = true, loadingCatalog = true, errorMessage = null)

            val restoredSession = container.authRepository.restoreSession()
            runCatching { container.catalogRepository.getCatalog(forceRefresh = forceRefresh) }
                .onSuccess { catalog ->
                    _uiState.value =
                        _uiState.value.copy(
                            session = restoredSession,
                            settings = catalog.settings,
                            categories = catalog.categories,
                            products = catalog.products,
                            loadingCatalog = false,
                            booting = false,
                        )
                }
                .onFailure { error ->
                    _uiState.value =
                        _uiState.value.copy(
                            session = restoredSession,
                            loadingCatalog = false,
                            booting = false,
                            errorMessage = error.message ?: "Unable to load the catalog.",
                        )
                }

            if (restoredSession != null) {
                refreshAuthenticatedData(forceRefresh = forceRefresh)
                registerPushToken()
            }
        }
    }

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(booting = true, errorMessage = null)
            runCatching { container.authRepository.signIn(email, password) }
                .onSuccess { session ->
                    _uiState.value = _uiState.value.copy(session = session, booting = false)
                    refreshAuthenticatedData(forceRefresh = true)
                    registerPushToken()
                }
                .onFailure { error ->
                    _uiState.value =
                        _uiState.value.copy(
                            booting = false,
                            errorMessage = error.message ?: "Unable to sign you in.",
                        )
                }
        }
    }

    fun signUp(name: String, email: String, phoneNumber: String, password: String, referralCode: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(booting = true, errorMessage = null)
            runCatching { container.authRepository.signUp(name, email, phoneNumber, password, referralCode) }
                .onSuccess { session ->
                    _uiState.value = _uiState.value.copy(session = session, booting = false)
                    refreshAuthenticatedData(forceRefresh = true)
                    registerPushToken()
                }
                .onFailure { error ->
                    _uiState.value =
                        _uiState.value.copy(
                            booting = false,
                            errorMessage = error.message ?: "Unable to create the account.",
                        )
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            container.authRepository.signOut()
            _uiState.value =
                _uiState.value.copy(
                    session = null,
                    orders = emptyList(),
                    rewardCoupons = emptyList(),
                    subscription = null,
                    noticeMessage = "Signed out",
                )
        }
    }

    fun refreshCatalog(forceRefresh: Boolean = true) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loadingCatalog = true, errorMessage = null)
            runCatching { container.catalogRepository.getCatalog(forceRefresh) }
                .onSuccess { catalog ->
                    _uiState.value =
                        _uiState.value.copy(
                            settings = catalog.settings,
                            categories = catalog.categories,
                            products = catalog.products,
                            loadingCatalog = false,
                        )
                }
                .onFailure { error ->
                    _uiState.value =
                        _uiState.value.copy(
                            loadingCatalog = false,
                            errorMessage = error.message ?: "Unable to refresh the catalog.",
                        )
                }
        }
    }

    fun refreshAuthenticatedData(forceRefresh: Boolean = true) {
        val session = uiState.value.session ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loadingOrders = true, errorMessage = null)
            val ordersResult = runCatching { container.ordersRepository.getOrders(forceRefresh) }
            val profileResult = runCatching { container.authRepository.refreshProfile() }
            val subscriptionResult = runCatching { container.profileRepository.getSubscription(forceRefresh) }
            val couponResult = runCatching { container.profileRepository.getRewardCoupons(forceRefresh) }

            _uiState.value =
                _uiState.value.copy(
                    session = profileResult.getOrNull()?.let { session.copy(user = it) } ?: session,
                    orders = ordersResult.getOrDefault(emptyList()),
                    subscription = subscriptionResult.getOrNull(),
                    rewardCoupons = couponResult.getOrDefault(emptyList()),
                    loadingOrders = false,
                    errorMessage =
                        listOfNotNull(
                            ordersResult.exceptionOrNull()?.message,
                            profileResult.exceptionOrNull()?.message,
                        ).firstOrNull(),
                )
        }
    }

    fun addProductToCart(product: Product, quantity: Int = 1, selection: Map<String, List<String>>? = null) {
        viewModelScope.launch {
            val resolvedSelection = selection ?: createInitialAddonSelection(product.addonGroups)
            val line = buildCartLine(product, quantity, resolvedSelection)
            container.cartRepository.upsertLine(line)
            _uiState.value = _uiState.value.copy(noticeMessage = "${product.name} added to cart")
        }
    }

    fun updateCartQuantity(line: CartLine, quantity: Int) {
        viewModelScope.launch {
            if (quantity <= 0) {
                container.cartRepository.removeLine(line.lineId)
            } else {
                container.cartRepository.upsertLine(line.copy(quantity = quantity))
            }
        }
    }

    fun removeCartLine(lineId: String) {
        viewModelScope.launch {
            container.cartRepository.removeLine(lineId)
        }
    }

    suspend fun currentCartPricing(distanceKm: Double? = null): CartPricing =
        computePricing(
            items = container.cartRepository.getCurrentCart(),
            rules = uiState.value.settings.deliveryRules,
            discount = uiState.value.rewardCoupons.firstOrNull { it.status == "active" }?.amount ?: 0,
            distanceKm = distanceKm,
        )

    fun placeCashOrder(
        address: Address,
        note: String = "",
        couponCode: String = "",
        distanceKm: Double? = null,
    ) {
        viewModelScope.launch {
            val cart = container.cartRepository.getCurrentCart()
            if (cart.isEmpty()) {
                _uiState.value = _uiState.value.copy(errorMessage = "Your cart is empty.")
                return@launch
            }

            _uiState.value = _uiState.value.copy(processingCheckout = true, errorMessage = null)
            val pricing = currentCartPricing(distanceKm)
            runCatching {
                container.ordersRepository.placeCodOrder(
                    items = cart,
                    address = address,
                    note = note,
                    couponCode = couponCode,
                    pricing = mapOf(
                        "subtotal" to pricing.subtotal,
                        "deliveryFee" to pricing.deliveryFee,
                        "handlingFee" to pricing.handlingFee,
                        "discount" to pricing.discount,
                        "total" to pricing.total,
                        "distanceKm" to pricing.distanceKm,
                    ),
                )
            }.onSuccess { order ->
                container.cartRepository.clear()
                _uiState.value =
                    _uiState.value.copy(
                        processingCheckout = false,
                        lastPlacedOrder = order,
                        noticeMessage = "${order.orderNumber} placed successfully",
                    )
                refreshAuthenticatedData(forceRefresh = true)
            }.onFailure { error ->
                _uiState.value =
                    _uiState.value.copy(
                        processingCheckout = false,
                        errorMessage = error.message ?: "Unable to place your order.",
                    )
            }
        }
    }

    suspend fun createRazorpayDraft(address: Address, note: String = "", couponCode: String = "", distanceKm: Double? = null): RazorpayCheckoutPayload {
        val cart = container.cartRepository.getCurrentCart()
        val pricing = currentCartPricing(distanceKm)
        val payload =
            mapOf(
                "items" to cart.map { item ->
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
                "address" to mapOf(
                    "id" to address.id,
                    "name" to address.name,
                    "phoneNumber" to address.phoneNumber,
                    "fullAddress" to address.fullAddress,
                    "landmark" to address.landmark,
                    "pincode" to address.pincode,
                ),
                "couponCode" to couponCode,
                "pricing" to mapOf("distanceKm" to pricing.distanceKm),
                "note" to note,
            )
        return container.ordersRepository.createRazorpayOrder(
            PaymentDraft(
                customerName = address.name.ifBlank { uiState.value.session?.user?.name.orEmpty() },
                phoneNumber = address.phoneNumber.ifBlank { uiState.value.session?.user?.phoneNumber.orEmpty() },
                payload = payload,
                logoUrl = "",
            ),
        )
    }

    fun completeRazorpayOrder(result: PaymentVerificationResult) {
        viewModelScope.launch {
            if (result.fulfilledOrder != null) {
                container.cartRepository.clear()
                _uiState.value =
                    _uiState.value.copy(
                        lastPlacedOrder = result.fulfilledOrder,
                        noticeMessage = "${result.fulfilledOrder.orderNumber} confirmed",
                    )
                refreshAuthenticatedData(forceRefresh = true)
            }
        }
    }

    suspend fun verifyRazorpayPayment(
        paymentId: String,
        orderId: String,
        signature: String,
        address: Address,
        note: String,
        couponCode: String,
        distanceKm: Double? = null,
    ): PaymentVerificationResult {
        val cart = container.cartRepository.getCurrentCart()
        val pricing = currentCartPricing(distanceKm)
        return container.ordersRepository.verifyRazorpayPayment(
            paymentId = paymentId,
            orderId = orderId,
            signature = signature,
            payload = mapOf(
                "items" to cart.map { item ->
                    mapOf(
                        "id" to item.id,
                        "lineId" to item.lineId,
                        "quantity" to item.quantity,
                        "price" to item.price,
                        "basePrice" to item.basePrice,
                        "name" to item.name,
                    )
                },
                "address" to mapOf(
                    "id" to address.id,
                    "name" to address.name,
                    "phoneNumber" to address.phoneNumber,
                    "fullAddress" to address.fullAddress,
                    "landmark" to address.landmark,
                    "pincode" to address.pincode,
                ),
                "couponCode" to couponCode,
                "pricing" to mapOf("distanceKm" to pricing.distanceKm),
                "note" to note,
            ),
        )
    }

    fun updateOrderStatus(orderId: String, status: String, assignedDeliveryBoyId: String? = null, assignedDeliveryBoyName: String? = null) {
        viewModelScope.launch {
            runCatching {
                container.ordersRepository.updateOrderStatus(orderId, status, assignedDeliveryBoyId, assignedDeliveryBoyName)
            }.onSuccess {
                refreshAuthenticatedData(forceRefresh = true)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(errorMessage = error.message ?: "Unable to update the order.")
            }
        }
    }

    fun updateDeliveryLocation(orderId: String, latitude: Double, longitude: Double) {
        viewModelScope.launch {
            runCatching { container.ordersRepository.updateDeliveryLocation(orderId, latitude, longitude) }
        }
    }

    fun toggleProductAvailability(product: Product, isAvailable: Boolean) {
        viewModelScope.launch {
            runCatching { container.adminRepository.updateProductAvailability(product.id, isAvailable) }
                .onSuccess { updated ->
                    _uiState.value =
                        _uiState.value.copy(
                            products = uiState.value.products.map { if (it.id == updated.id) updated else it },
                            noticeMessage = "${updated.name} updated",
                        )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(errorMessage = error.message ?: "Unable to update the product.")
                }
        }
    }

    fun updateStorefront(businessName: String, tagline: String, phoneNumber: String, whatsappNumber: String, timings: String) {
        viewModelScope.launch {
            runCatching {
                container.adminRepository.updateStorefrontTheme(businessName, tagline, phoneNumber, whatsappNumber, timings)
            }.onSuccess { settings ->
                _uiState.value = _uiState.value.copy(settings = settings, noticeMessage = "Store settings updated")
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(errorMessage = error.message ?: "Unable to update store settings.")
            }
        }
    }

    fun dismissMessages() {
        _uiState.value = _uiState.value.copy(errorMessage = null, noticeMessage = null)
    }

    fun showError(message: String) {
        _uiState.value = _uiState.value.copy(errorMessage = message)
    }

    private fun registerPushToken() {
        viewModelScope.launch {
            runCatching { FirebaseMessaging.getInstance().token.await() }
                .onSuccess { token ->
                    runCatching { container.authRepository.registerNativePushToken(token) }
                }
        }
    }
}
