package com.sardarjifood.app.data

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.sardarjifood.app.data.network.array
import com.sardarjifood.app.data.network.asJsonArrayOrEmpty
import com.sardarjifood.app.data.network.asJsonObjectOrEmpty
import com.sardarjifood.app.data.network.bool
import com.sardarjifood.app.data.network.double
import com.sardarjifood.app.data.network.int
import com.sardarjifood.app.data.network.obj
import com.sardarjifood.app.data.network.safeString
import com.sardarjifood.app.data.network.safeStringList
import com.sardarjifood.app.data.network.string
import com.sardarjifood.app.model.AddonGroup
import com.sardarjifood.app.model.AddonOption
import com.sardarjifood.app.model.Address
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.Category
import com.sardarjifood.app.model.DeliveryRules
import com.sardarjifood.app.model.HeroBanner
import com.sardarjifood.app.model.NativePushToken
import com.sardarjifood.app.model.OfferCard
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.OrderTracking
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.model.RewardCoupon
import com.sardarjifood.app.model.SelectedAddon
import com.sardarjifood.app.model.StoreSettings
import com.sardarjifood.app.model.Subscription
import com.sardarjifood.app.model.SubscriptionMeta
import com.sardarjifood.app.model.TrackingEvent
import com.sardarjifood.app.model.TrackingLocation
import com.sardarjifood.app.model.UserProfile

private const val META_SUBSCRIPTION = "subscription-meta"
private const val META_NATIVE_PUSH = "native-push-token"

fun JsonObject.toCategory(): Category =
    Category(
        id = string("id"),
        name = string("name"),
        slug = string("slug"),
        description = string("description"),
    )

fun JsonObject.toAddonGroup(): AddonGroup =
    AddonGroup(
        id = string("id"),
        title = string("title").ifBlank { string("name") },
        selectionType = string("selectionType").ifBlank { "single" },
        required = bool("required"),
        minSelections = int("minSelections"),
        maxSelections = int("maxSelections", 1).coerceAtLeast(1),
        options = array("options").mapNotNull { option ->
            option.asJsonObjectOrEmpty().let {
                val name = it.string("name")
                if (name.isBlank()) null else AddonOption(
                    id = it.string("id").ifBlank { name.lowercase().replace(" ", "-") },
                    name = name,
                    price = it.int("price"),
                    productId = it.string("productId"),
                    defaultSelected = it.bool("defaultSelected"),
                )
            }
        },
    )

fun mapProductAddonGroups(jsonObject: JsonObject): Map<String, List<AddonGroup>> =
    jsonObject.entrySet().associate { (key, value) ->
        key to value.asJsonArrayOrEmpty().map { it.asJsonObjectOrEmpty().toAddonGroup() }
    }

fun JsonObject.toProduct(addonMap: Map<String, List<AddonGroup>> = emptyMap()): Product {
    val categoryObject = obj("categories")
    val productId = string("id")
    val slug = string("slug")
    val name = string("name")
    val addonGroups =
        addonMap[productId]
            ?: addonMap[slug]
            ?: addonMap[name]
            ?: array("addon_groups").map { it.asJsonObjectOrEmpty().toAddonGroup() }

    return Product(
        id = productId,
        name = name,
        slug = slug,
        price = int("price"),
        description = string("description"),
        category = categoryObject.string("name").ifBlank { string("category") },
        categorySlug = categoryObject.string("slug"),
        image = string("image_url").ifBlank { string("image") },
        badge = string("badge"),
        isAvailable = !has("is_available") || bool("is_available", true),
        isVeg = !has("is_veg") || bool("is_veg", true),
        addonGroups = addonGroups,
    )
}

fun JsonObject.toSettings(): StoreSettings {
    val deliveryObject = obj("delivery_rules")
    val storefront = deliveryObject.obj("storefront")
    val heroObject = storefront.obj("hero")

    return StoreSettings(
        businessName = string("business_name").ifBlank { "Sardar Ji Food Corner" },
        tagline = string("tagline").ifBlank { "Swad Bhi, Budget Bhi" },
        whatsappNumber = string("whatsapp_number"),
        phoneNumber = string("phone_number"),
        timings = string("timings"),
        mapsEmbedUrl = string("maps_embed_url"),
        trustPoints = array("trust_points").safeStringList(),
        deliveryRules = DeliveryRules(
            perKmRate = deliveryObject.int("perKmRate", 10),
            minDelivery = deliveryObject.int("minDelivery", 20),
            maxDistance = deliveryObject.int("maxDistance", 10),
            freeThreshold1 = deliveryObject.int("freeThreshold1", 299),
            freeDistanceLimit = deliveryObject.int("freeDistanceLimit", 5),
            freeThreshold2 = deliveryObject.int("freeThreshold2", 499),
            estimatedDeliveryMinutes = deliveryObject.int("estimatedDeliveryMinutes", 35),
            deliveryFeeLabel = deliveryObject.string("deliveryFeeLabel", "Delivery fee"),
            freeItemSlug = deliveryObject.string("freeItemSlug", "mango-juice"),
            freeItemName = deliveryObject.string("freeItemName", "Mango Juice"),
            freeItemDescription = deliveryObject.string("freeItemDescription", "Complimentary mango juice"),
        ),
        hero = HeroBanner(
            headline = heroObject.string("headline", "Hot, Fresh & Delicious"),
            subtext = heroObject.string("subtext", "Pure veg meals and plans delivered fast."),
            offerText = heroObject.string("offerText", "₹299 = free delivery • ₹499 = free delivery + free mango juice"),
            backgroundImage = heroObject.string("backgroundImage"),
            primaryCta = heroObject.string("primaryCta", "Order now"),
            secondaryCta = heroObject.string("secondaryCta", "View menu"),
        ),
        offers = storefront.obj("offers").entrySet().map { (key, value) ->
            OfferCard(
                title = key.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() },
                description = value.safeString(),
            )
        }.filter { it.description.isNotBlank() }.take(4),
        productAddonGroups = mapProductAddonGroups(storefront.obj("productAddonGroups")),
    )
}

fun JsonObject.toUserProfile(): UserProfile {
    val addressesJson = array("addresses")
    val addresses = mutableListOf<Address>()
    var subscriptionMeta = SubscriptionMeta()
    val nativePushTokens = mutableListOf<NativePushToken>()

    addressesJson.forEach { entry ->
        val json = entry.asJsonObjectOrEmpty()
        when (json.string("_type")) {
            META_SUBSCRIPTION -> {
                val payload = json.obj("payload")
                subscriptionMeta = SubscriptionMeta(
                    pausedUntil = payload.string("pausedUntil"),
                    skipDates = payload.array("skipDates").safeStringList(),
                    holidayDates = payload.array("holidayDates").safeStringList(),
                )
            }

            META_NATIVE_PUSH -> {
                val payload = json.obj("payload")
                nativePushTokens += NativePushToken(
                    token = payload.string("token"),
                    platform = payload.string("platform", "android"),
                    provider = payload.string("provider", "fcm"),
                    createdAt = payload.string("createdAt"),
                    updatedAt = payload.string("updatedAt"),
                )
            }

            else -> {
                if (json.string("fullAddress").isNotBlank() || json.string("phoneNumber").isNotBlank()) {
                    addresses += Address(
                        id = json.string("id"),
                        name = json.string("name"),
                        phoneNumber = json.string("phoneNumber"),
                        fullAddress = json.string("fullAddress"),
                        landmark = json.string("landmark"),
                        pincode = json.string("pincode"),
                    )
                }
            }
        }
    }

    return UserProfile(
        id = string("id"),
        name = string("name"),
        email = string("email"),
        phoneNumber = string("phone_number"),
        role = when (string("role").lowercase()) {
            "admin" -> AppRole.ADMIN
            "delivery" -> AppRole.DELIVERY
            else -> AppRole.CUSTOMER
        },
        referralCode = string("referral_code"),
        referralApplied = string("referral_applied"),
        successfulReferrals = array("successful_referrals").safeStringList(),
        addresses = addresses,
        subscriptionMeta = subscriptionMeta,
        nativePushTokens = nativePushTokens.filter { it.token.isNotBlank() },
        avatarUrl = string("avatar_url"),
    )
}

fun JsonObject.toSelectedAddon(): SelectedAddon =
    SelectedAddon(
        id = string("id"),
        name = string("name"),
        price = int("price"),
        productId = string("productId"),
        groupId = string("groupId"),
        groupTitle = string("groupTitle"),
    )

fun JsonObject.toCartLine(): CartLine =
    CartLine(
        lineId = string("lineId").ifBlank { string("id") },
        id = string("id"),
        name = string("name"),
        image = string("image"),
        description = string("description"),
        category = string("category"),
        basePrice = int("basePrice"),
        addonTotal = int("addonTotal"),
        price = int("price"),
        quantity = int("quantity", 1),
        badge = string("badge"),
        isVeg = !has("isVeg") || bool("isVeg", true),
        isAvailable = !has("isAvailable") || bool("isAvailable", true),
        isFreebie = bool("isFreebie"),
        isAddonLine = bool("isAddonLine"),
        parentLineId = string("parentLineId"),
        parentProductId = string("parentProductId"),
        groupId = string("groupId"),
        groupTitle = string("groupTitle"),
        addonSummary = string("addonSummary"),
        addons = array("addons").map { it.asJsonObjectOrEmpty().toSelectedAddon() },
    )

fun JsonObject.toOrder(): Order =
    Order(
        id = string("id"),
        orderNumber = string("order_number").ifBlank { string("orderNumber") },
        userId = string("user_id"),
        customerName = string("customer_name"),
        customerPhone = string("customer_phone"),
        items = array("items").map { it.asJsonObjectOrEmpty().toCartLine() },
        address = obj("address").let {
            Address(
                id = it.string("id"),
                name = it.string("name"),
                phoneNumber = it.string("phoneNumber"),
                fullAddress = it.string("fullAddress"),
                landmark = it.string("landmark"),
                pincode = it.string("pincode"),
            )
        },
        paymentMethod = string("payment_method", "COD"),
        note = string("note"),
        subtotal = int("subtotal"),
        deliveryFee = int("delivery_fee"),
        handlingFee = int("handling_fee"),
        discount = int("discount"),
        total = int("total"),
        status = string("status", "pending"),
        estimatedDeliveryAt = string("estimated_delivery_at"),
        deliveredAt = string("delivered_at"),
        assignedDeliveryBoyId = string("assigned_delivery_boy_id"),
        assignedDeliveryBoyName = string("assigned_delivery_boy_name"),
        tracking = obj("tracking").let { trackingJson ->
            OrderTracking(
                timeline = trackingJson.array("timeline").map { event ->
                    event.asJsonObjectOrEmpty().let {
                        TrackingEvent(
                            status = it.string("status"),
                            label = it.string("label").ifBlank { it.string("status") },
                            timestamp = it.string("timestamp"),
                        )
                    }
                },
                currentLocation = trackingJson.obj("currentLocation").takeIf { current ->
                    current.entrySet().isNotEmpty()
                }?.let { location ->
                    TrackingLocation(
                        lat = location.double("lat"),
                        lng = location.double("lng"),
                    )
                },
            )
        },
        createdAt = string("created_at"),
        updatedAt = string("updated_at"),
    )

fun JsonObject.toSubscription(): Subscription =
    Subscription(
        id = string("id"),
        userId = string("user_id"),
        planName = string("plan_name"),
        startDate = string("start_date"),
        endDate = string("end_date"),
        status = string("status"),
        daysLeft = int("days_left"),
        price = int("price"),
        durationDays = int("duration_days"),
    )

fun JsonObject.toRewardCoupon(): RewardCoupon =
    RewardCoupon(
        id = string("id"),
        code = string("code"),
        amount = int("amount"),
        status = string("status", "active"),
        expiresAt = string("expires_at"),
    )

fun JsonArray.mapProducts(addonMap: Map<String, List<AddonGroup>> = emptyMap()): List<Product> =
    map { it.asJsonObjectOrEmpty().toProduct(addonMap) }

fun JsonArray.mapCategories(): List<Category> = map { it.asJsonObjectOrEmpty().toCategory() }

fun JsonArray.mapOrders(): List<Order> = map { it.asJsonObjectOrEmpty().toOrder() }
