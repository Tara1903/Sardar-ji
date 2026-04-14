package com.sardarjifood.app.model

import java.util.UUID

enum class AppRole {
    CUSTOMER,
    ADMIN,
    DELIVERY,
}

data class Address(
    val id: String = UUID.randomUUID().toString(),
    val name: String = "",
    val phoneNumber: String = "",
    val fullAddress: String = "",
    val landmark: String = "",
    val pincode: String = "",
)

data class SubscriptionMeta(
    val pausedUntil: String = "",
    val skipDates: List<String> = emptyList(),
    val holidayDates: List<String> = emptyList(),
)

data class NativePushToken(
    val token: String = "",
    val platform: String = "android",
    val provider: String = "fcm",
    val createdAt: String = "",
    val updatedAt: String = "",
)

data class UserProfile(
    val id: String,
    val name: String,
    val email: String,
    val phoneNumber: String = "",
    val role: AppRole = AppRole.CUSTOMER,
    val referralCode: String = "",
    val referralApplied: String = "",
    val successfulReferrals: List<String> = emptyList(),
    val addresses: List<Address> = emptyList(),
    val subscriptionMeta: SubscriptionMeta = SubscriptionMeta(),
    val nativePushTokens: List<NativePushToken> = emptyList(),
    val avatarUrl: String = "",
)

data class AppSession(
    val accessToken: String,
    val user: UserProfile,
)

data class Category(
    val id: String,
    val name: String,
    val slug: String,
    val description: String = "",
)

data class AddonOption(
    val id: String,
    val name: String,
    val price: Int = 0,
    val productId: String = "",
    val defaultSelected: Boolean = false,
)

data class AddonGroup(
    val id: String,
    val title: String,
    val selectionType: String = "single",
    val required: Boolean = false,
    val minSelections: Int = 0,
    val maxSelections: Int = 1,
    val options: List<AddonOption> = emptyList(),
)

data class SelectedAddon(
    val id: String,
    val name: String,
    val price: Int,
    val productId: String = "",
    val groupId: String = "",
    val groupTitle: String = "",
)

data class Product(
    val id: String,
    val name: String,
    val slug: String,
    val price: Int,
    val description: String = "",
    val category: String = "",
    val categorySlug: String = "",
    val image: String = "",
    val badge: String = "",
    val isAvailable: Boolean = true,
    val isVeg: Boolean = true,
    val addonGroups: List<AddonGroup> = emptyList(),
)

data class DeliveryRules(
    val perKmRate: Int = 10,
    val minDelivery: Int = 20,
    val maxDistance: Int = 10,
    val freeThreshold1: Int = 299,
    val freeDistanceLimit: Int = 5,
    val freeThreshold2: Int = 499,
    val estimatedDeliveryMinutes: Int = 35,
    val deliveryFeeLabel: String = "Delivery fee",
    val freeItemSlug: String = "mango-juice",
    val freeItemName: String = "Mango Juice",
    val freeItemDescription: String = "Complimentary mango juice",
)

data class HeroBanner(
    val headline: String = "Hot, Fresh & Delicious",
    val subtext: String = "Pure veg meals and plans delivered fast.",
    val offerText: String = "₹299 = free delivery • ₹499 = free delivery + free mango juice",
    val backgroundImage: String = "",
    val primaryCta: String = "Order now",
    val secondaryCta: String = "View menu",
)

data class OfferCard(
    val title: String,
    val description: String,
)

data class StoreSettings(
    val businessName: String = "Sardar Ji Food Corner",
    val tagline: String = "Swad Bhi, Budget Bhi",
    val whatsappNumber: String = "",
    val phoneNumber: String = "",
    val timings: String = "",
    val mapsEmbedUrl: String = "",
    val trustPoints: List<String> = emptyList(),
    val deliveryRules: DeliveryRules = DeliveryRules(),
    val hero: HeroBanner = HeroBanner(),
    val offers: List<OfferCard> = emptyList(),
    val productAddonGroups: Map<String, List<AddonGroup>> = emptyMap(),
)

data class TrackingEvent(
    val status: String,
    val label: String,
    val timestamp: String,
)

data class TrackingLocation(
    val lat: Double = 0.0,
    val lng: Double = 0.0,
)

data class OrderTracking(
    val timeline: List<TrackingEvent> = emptyList(),
    val currentLocation: TrackingLocation? = null,
)

data class CartLine(
    val lineId: String,
    val id: String,
    val name: String,
    val image: String = "",
    val description: String = "",
    val category: String = "",
    val basePrice: Int = 0,
    val addonTotal: Int = 0,
    val price: Int = 0,
    val quantity: Int = 1,
    val badge: String = "",
    val isVeg: Boolean = true,
    val isAvailable: Boolean = true,
    val isFreebie: Boolean = false,
    val isAddonLine: Boolean = false,
    val parentLineId: String = "",
    val parentProductId: String = "",
    val groupId: String = "",
    val groupTitle: String = "",
    val addons: List<SelectedAddon> = emptyList(),
    val addonSummary: String = "",
)

data class Order(
    val id: String,
    val orderNumber: String,
    val userId: String,
    val customerName: String,
    val customerPhone: String,
    val items: List<CartLine>,
    val address: Address = Address(),
    val paymentMethod: String = "COD",
    val note: String = "",
    val subtotal: Int = 0,
    val deliveryFee: Int = 0,
    val handlingFee: Int = 0,
    val discount: Int = 0,
    val total: Int = 0,
    val status: String = "pending",
    val estimatedDeliveryAt: String = "",
    val deliveredAt: String = "",
    val assignedDeliveryBoyId: String = "",
    val assignedDeliveryBoyName: String = "",
    val tracking: OrderTracking = OrderTracking(),
    val createdAt: String = "",
    val updatedAt: String = "",
)

data class Subscription(
    val id: String,
    val userId: String,
    val planName: String,
    val startDate: String,
    val endDate: String,
    val status: String,
    val daysLeft: Int,
    val price: Int,
    val durationDays: Int,
)

data class RewardCoupon(
    val id: String,
    val code: String,
    val amount: Int,
    val status: String = "active",
    val expiresAt: String = "",
)

data class CartPricing(
    val subtotal: Int = 0,
    val baseDeliveryFee: Int = 0,
    val deliveryFee: Int = 0,
    val handlingFee: Int = 0,
    val deliveryDiscount: Int = 0,
    val discount: Int = 0,
    val total: Int = 0,
    val distanceKm: Double? = null,
    val notDeliverable: Boolean = false,
    val threshold1Unlocked: Boolean = false,
    val threshold2Unlocked: Boolean = false,
    val freebieUnlocked: Boolean = false,
    val deliveryFeeLabel: String = "Delivery fee",
    val deliveryMessage: String = "",
    val offerMessage: String = "",
)

data class QuickChip(
    val id: String,
    val label: String,
    val query: String = "",
)

data class ProductRail(
    val id: String,
    val title: String,
    val subtitle: String,
)
