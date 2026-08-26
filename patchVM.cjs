const fs = require('fs');
const path = 'android/app/src/main/java/com/sardarjifood/app/ui/MainViewModel.kt';
let content = fs.readFileSync(path, 'utf8');

const target = 'suspend fun createRazorpayDraft(';
const replacement = `suspend fun createStarPayDraft(address: Address, note: String = "", couponCode: String = "", distanceKm: Double? = null): StarPayCheckoutPayload {
        val session = _uiState.value.session ?: throw IllegalStateException("Not logged in.")
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
                "address" to address,
                "note" to note,
                "couponCode" to couponCode,
                "pricing" to mapOf(
                    "itemTotal" to pricing.itemTotal,
                    "deliveryFee" to pricing.deliveryFee,
                    "platformFee" to pricing.platformFee,
                    "taxes" to pricing.taxes,
                    "discount" to pricing.discount,
                    "total" to pricing.total,
                ),
                "customerPhone" to session.user.phoneNumber,
                "customerName" to session.user.name,
            )

        val draft =
            PaymentDraft(
                customerName = session.user.name,
                phoneNumber = session.user.phoneNumber,
                payload = payload,
            )

        return container.ordersRepository.createStarPayOrder(draft)
    }

    suspend fun createRazorpayDraft(`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content, 'utf8');
