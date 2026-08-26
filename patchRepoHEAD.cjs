const fs = require('fs');
const path = 'android/app/src/main/java/com/sardarjifood/app/data/repository/NativeRepositories.kt';
let content = fs.readFileSync(path, 'utf8');

const regex = /override suspend fun createStarPayOrder\([\s\S]*?override suspend fun createRazorpayOrder/m;

const replacement = `override suspend fun createStarPayOrder(draft: PaymentDraft): StarPayCheckoutPayload {
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

    override suspend fun createRazorpayOrder`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
