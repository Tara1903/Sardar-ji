const fs = require('fs');
let p = 'android/app/src/main/java/com/sardarjifood/app/ui/MainViewModel.kt';
let c = fs.readFileSync(p, 'utf8');

let startIndex = c.indexOf('suspend fun createStarPayDraft(address: Address, note: String = "", couponCode: String = "", distanceKm: Double? = null): StarPayCheckoutPayload {');
let endIndex = c.indexOf('suspend fun createRazorpayDraft(');
c = c.substring(0, startIndex) +
`suspend fun createStarPayDraft(address: Address, note: String = "", couponCode: String = "", distanceKm: Double? = null): StarPayCheckoutPayload {
        val session = _uiState.value.session ?: throw IllegalStateException("Not logged in.")
        val cart = container.cartRepository.getCurrentCart()
        val pricing = currentCartPricing(distanceKm)
        val payload = mapOf(
            "items" to cart.map { item ->
                mapOf(
                    "id" to item.id, "lineId" to item.lineId, "quantity" to item.quantity,
                    "price" to item.price, "basePrice" to item.basePrice, "name" to item.name,
                    "isFreebie" to item.isFreebie, "isAddonLine" to item.isAddonLine,
                    "parentLineId" to item.parentLineId, "parentProductId" to item.parentProductId,
                    "groupId" to item.groupId, "groupTitle" to item.groupTitle,
                    "addonSummary" to item.addonSummary
                )
            },
            "address" to address, "note" to note, "couponCode" to couponCode,
            "pricing" to mapOf(
                "itemTotal" to pricing.itemTotal, "deliveryFee" to pricing.deliveryFee,
                "platformFee" to pricing.platformFee, "taxes" to pricing.taxes,
                "discount" to pricing.discount, "total" to pricing.total
            ),
            "customerPhone" to session.user.phoneNumber, "customerName" to session.user.name
        )

        val draft = PaymentDraft(
            customerName = session.user.name,
            phoneNumber = session.user.phoneNumber,
            payload = payload
        )
        return container.ordersRepository.createStarPayOrder(draft)
    }

    ` + c.substring(endIndex);
fs.writeFileSync(p, c, 'utf8');

p = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
c = fs.readFileSync(p, 'utf8');
startIndex = c.indexOf('onCheckout = { navController.navigate("checkout") },');
endIndex = c.indexOf('onOpenSettings = { navController.navigate("settings") },');
c = c.substring(0, startIndex) +
`onCheckout = { navController.navigate("checkout") },
                            ` + c.substring(endIndex);
// Also fix interpolation
c = c.replaceAll(`navController.navigate("starpay_checkout?url=\${java.net.URLEncoder.encode(payload.checkoutUrl, \\"UTF-8\\")}")`,
`val encoded = java.net.URLEncoder.encode(payload.checkoutUrl, "UTF-8")\n                                navController.navigate("starpay_checkout?url=$encoded")`);
fs.writeFileSync(p, c, 'utf8');
