const fs = require('fs');

// 1. NativeFoodApp.kt
let p = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
let c = fs.readFileSync(p, 'utf8');
// Fix string interpolation
c = c.replace(/onLaunchStarPay = \{ payload ->[\s\n]*navController\.navigate\("starpay_checkout\?url=\\?\$\{[^}]+\}"\)[\s\n]*\},/g, 
`onLaunchStarPay = { payload -> 
                                val encoded = java.net.URLEncoder.encode(payload.checkoutUrl, "UTF-8")
                                navController.navigate("starpay_checkout?url=$encoded")
                            },`);
// Remove onLaunchStarPay from CustomerShell
c = c.replace(/onCheckout = \{ navController\.navigate\("checkout"\) \},[\s\n]*onLaunchStarPay = \{ payload ->[\s\S]*?navController\.navigate\("starpay_checkout\?url=\\$encoded"\)[\s\n]*\},/, 
`onCheckout = { navController.navigate("checkout") },`);
fs.writeFileSync(p, c, 'utf8');

// 2. MainViewModel.kt
p = 'android/app/src/main/java/com/sardarjifood/app/ui/MainViewModel.kt';
c = fs.readFileSync(p, 'utf8');
c = c.replace(/suspend fun createStarPayDraft\([\s\S]*?return container\.ordersRepository\.createStarPayOrder\(draft\)\n    \}/, 
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
    }`);
fs.writeFileSync(p, c, 'utf8');

// 3. NativeRepositories.kt
p = 'android/app/src/main/java/com/sardarjifood/app/data/repository/NativeRepositories.kt';
c = fs.readFileSync(p, 'utf8');
c = c.replace(/override suspend fun createStarPayOrder\([\s\S]*?override suspend fun createRazorpayOrder/m,
`override suspend fun createStarPayOrder(draft: PaymentDraft): StarPayCheckoutPayload {
        val token = requireSession().accessToken
        val response =
            siteHttpClient.request(
                path = "api/starpay/create-order",
                method = "POST",
                token = token,
                body = mapOf(
                    "purpose" to draft.purpose,
                    "payload" to draft.payload,
                    "customerName" to draft.customerName,
                    "phoneNumber" to draft.phoneNumber
                ),
            ).asJsonObjectOrEmpty()
        return StarPayCheckoutPayload(
            checkoutUrl = response.string("checkoutUrl"),
            orderId = response.string("orderId"),
            amount = response.get("amount")?.takeIf { !it.isJsonNull }?.asInt ?: 0,
            purpose = response.string("purpose")
        )
    }

    override suspend fun createRazorpayOrder`);
fs.writeFileSync(p, c, 'utf8');
