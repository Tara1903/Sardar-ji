package com.sardarjifood.app.data

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.sardarjifood.app.data.local.CartLineEntity
import com.sardarjifood.app.model.AddonGroup
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.CartPricing
import com.sardarjifood.app.model.DeliveryRules
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.model.SelectedAddon
import kotlin.math.max
import kotlin.math.roundToInt

fun createInitialAddonSelection(groups: List<AddonGroup>): Map<String, List<String>> =
    groups.associate { group ->
        val defaults = group.options.filter { it.defaultSelected }.map { it.id }
        group.id to if (group.selectionType == "single") defaults.take(1) else defaults.take(group.maxSelections)
    }

fun sanitizeAddonSelection(
    selection: Map<String, List<String>>,
    groups: List<AddonGroup>,
): Map<String, List<String>> =
    groups.associate { group ->
        val chosen = (selection[group.id] ?: emptyList()).filter { selected ->
            group.options.any { it.id == selected }
        }
        group.id to if (group.selectionType == "single") chosen.take(1) else chosen.take(group.maxSelections)
    }

fun isAddonSelectionComplete(
    groups: List<AddonGroup>,
    selection: Map<String, List<String>>,
): Boolean =
    groups.all { group ->
        val selectedCount = (selection[group.id] ?: emptyList()).size
        val requiredCount = if (group.selectionType == "single") {
            if (group.required) 1 else 0
        } else {
            group.minSelections
        }
        selectedCount >= requiredCount
    }

fun selectedAddons(
    groups: List<AddonGroup>,
    selection: Map<String, List<String>>,
): List<SelectedAddon> =
    groups.flatMap { group ->
        (selection[group.id] ?: emptyList()).mapNotNull { optionId ->
            group.options.firstOrNull { it.id == optionId }?.let { option ->
                SelectedAddon(
                    id = option.id,
                    name = option.name,
                    price = option.price,
                    productId = option.productId,
                    groupId = group.id,
                    groupTitle = group.title,
                )
            }
        }
    }

fun configuredLineId(productId: String, addons: List<SelectedAddon>): String {
    val suffix = addons
        .sortedBy { "${it.groupId}:${it.id}" }
        .joinToString("|") { "${it.groupId}:${it.id}" }
    return if (suffix.isBlank()) productId else "$productId::$suffix"
}

fun buildCartLine(
    product: Product,
    quantity: Int,
    selection: Map<String, List<String>>,
): CartLine {
    val cleanedSelection = sanitizeAddonSelection(selection, product.addonGroups)
    val addons = selectedAddons(product.addonGroups, cleanedSelection)
    val addonTotal = addons.sumOf { it.price }
    val unitPrice = product.price + addonTotal

    return CartLine(
        lineId = configuredLineId(product.id, addons),
        id = product.id,
        name = product.name,
        image = product.image,
        description = product.description,
        category = product.category,
        basePrice = product.price,
        addonTotal = addonTotal,
        price = unitPrice,
        quantity = quantity.coerceAtLeast(1),
        badge = product.badge,
        isVeg = product.isVeg,
        isAvailable = product.isAvailable,
        addons = addons,
        addonSummary = addons.joinToString(", ") { it.name },
    )
}

fun computePricing(
    items: List<CartLine>,
    rules: DeliveryRules,
    discount: Int = 0,
    distanceKm: Double? = null,
): CartPricing {
    val baseItems = items.filterNot { it.isFreebie }
    val subtotal = baseItems.sumOf { it.price * it.quantity }
    val baseDeliveryFee =
        max(
            rules.minDelivery,
            if (distanceKm == null) rules.minDelivery else (distanceKm * rules.perKmRate).roundToInt(),
        )
    val notDeliverable = distanceKm != null && distanceKm > rules.maxDistance
    val threshold1Unlocked = subtotal >= rules.freeThreshold1
    val threshold2Unlocked = subtotal >= rules.freeThreshold2

    var deliveryFee = baseDeliveryFee
    var deliveryDiscount = 0
    var deliveryMessage = "Standard ${rules.deliveryFeeLabel.lowercase()} applied."
    var offerMessage = "Add ₹${max(0, rules.freeThreshold1 - subtotal)} more to unlock free delivery"

    if (notDeliverable) {
        deliveryMessage = "We currently deliver within ${rules.maxDistance} km of the store."
        offerMessage = "Currently not deliverable beyond ${rules.maxDistance} km"
    } else if (threshold2Unlocked) {
        deliveryDiscount = baseDeliveryFee
        deliveryFee = 0
        deliveryMessage = "Free delivery unlocked with complimentary mango juice."
        offerMessage = "Special offer unlocked."
    } else if (threshold1Unlocked) {
        if (distanceKm != null && distanceKm <= rules.freeDistanceLimit) {
            deliveryDiscount = baseDeliveryFee
            deliveryFee = 0
            deliveryMessage = "Free delivery unlocked."
        } else {
            deliveryFee = (baseDeliveryFee / 2.0).roundToInt()
            deliveryDiscount = baseDeliveryFee - deliveryFee
            deliveryMessage = "50% off delivery applied."
        }
        offerMessage = "Add ₹${max(0, rules.freeThreshold2 - subtotal)} more to unlock free delivery + mango juice"
    }

    return CartPricing(
        subtotal = subtotal,
        baseDeliveryFee = baseDeliveryFee,
        deliveryFee = deliveryFee,
        handlingFee = 0,
        deliveryDiscount = deliveryDiscount,
        discount = discount,
        total = max(0, subtotal + deliveryFee - discount),
        distanceKm = distanceKm?.let { ((it * 10).roundToInt() / 10.0) },
        notDeliverable = notDeliverable,
        threshold1Unlocked = threshold1Unlocked,
        threshold2Unlocked = threshold2Unlocked,
        freebieUnlocked = threshold2Unlocked && !notDeliverable,
        deliveryFeeLabel = rules.deliveryFeeLabel,
        deliveryMessage = deliveryMessage,
        offerMessage = offerMessage,
    )
}

fun CartLine.toEntity(gson: Gson): CartLineEntity =
    CartLineEntity(
        lineId = lineId,
        productId = id,
        name = name,
        image = image,
        description = description,
        category = category,
        basePrice = basePrice,
        addonTotal = addonTotal,
        price = price,
        quantity = quantity,
        badge = badge,
        isVeg = isVeg,
        isAvailable = isAvailable,
        isFreebie = isFreebie,
        isAddonLine = isAddonLine,
        parentLineId = parentLineId,
        parentProductId = parentProductId,
        groupId = groupId,
        groupTitle = groupTitle,
        addonSummary = addonSummary,
        addonsJson = gson.toJson(addons),
    )

fun CartLineEntity.toModel(gson: Gson): CartLine {
    val addonType = object : TypeToken<List<SelectedAddon>>() {}.type
    val addons: List<SelectedAddon> =
        runCatching<List<SelectedAddon>> { gson.fromJson(addonsJson, addonType) }.getOrDefault(emptyList())

    return CartLine(
        lineId = lineId,
        id = productId,
        name = name,
        image = image,
        description = description,
        category = category,
        basePrice = basePrice,
        addonTotal = addonTotal,
        price = price,
        quantity = quantity,
        badge = badge,
        isVeg = isVeg,
        isAvailable = isAvailable,
        isFreebie = isFreebie,
        isAddonLine = isAddonLine,
        parentLineId = parentLineId,
        parentProductId = parentProductId,
        groupId = groupId,
        groupTitle = groupTitle,
        addons = addons,
        addonSummary = addonSummary,
    )
}
