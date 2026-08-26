const fs = require('fs');

let path = 'android/app/src/main/java/com/sardarjifood/app/ui/CustomerDetailScreens.kt';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/onLaunchRazorpay: \(RazorpayCheckoutPayload\) -> Unit,/, 'onLaunchStarPay: (StarPayCheckoutPayload) -> Unit,\n    onLaunchRazorpay: (RazorpayCheckoutPayload) -> Unit,');
content = content.replace(/onLaunchRazorpay = onLaunchRazorpay,/, 'onLaunchStarPay = onLaunchStarPay,\n        onLaunchRazorpay = onLaunchRazorpay,');
content = content.replace(/import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload/, 'import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload\nimport com.sardarjifood.app.data.repository.StarPayCheckoutPayload');

let callPatch = `val draft = viewModel.createStarPayDraft(
                                address = address,
                                note = note,
                                couponCode = couponCode,
                                distanceKm = distanceKm
                            )
                            onLaunchStarPay(draft)`;
                            
content = content.replace(/val draft = viewModel\.createRazorpayDraft\([\s\S]*?onLaunchRazorpay\(draft\)/, callPatch);
fs.writeFileSync(path, content, 'utf8');

path = 'android/app/src/main/java/com/sardarjifood/app/ui/NativeFoodApp.kt';
content = fs.readFileSync(path, 'utf8');

content = content.replace(/import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload/, 'import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload\nimport com.sardarjifood.app.data.repository.StarPayCheckoutPayload');

content = content.replace(/onLaunchRazorpay = \{ payload ->/, `onLaunchStarPay = { payload -> 
                            val encoded = java.net.URLEncoder.encode(payload.checkoutUrl, "UTF-8")
                            navController.navigate("starpay_checkout?url=$encoded")
                        },
                        onLaunchRazorpay = { payload ->`);

let navGraphPatch = `composable(
            route = "starpay_checkout?url={url}",
            arguments = listOf(navArgument("url") { type = NavType.StringType })
        ) { backStackEntry ->
            val checkoutUrl = backStackEntry.arguments?.getString("url") ?: return@composable
            AndroidView(
                factory = { context ->
                    android.webkit.WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        webViewClient = object : android.webkit.WebViewClient() {
                            override fun shouldOverrideUrlLoading(view: android.webkit.WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                                val currentUrl = request?.url?.toString() ?: return false
                                if (currentUrl.contains("sjfc://")) {
                                    navController.popBackStack("checkout", false)
                                    return true
                                }
                                if (currentUrl.startsWith("upi://")) {
                                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(currentUrl))
                                    context.startActivity(intent)
                                    return true
                                }
                                return false
                            }
                        }
                        loadUrl(checkoutUrl)
                    }
                },
                update = { it.loadUrl(checkoutUrl) }
            )
        }

        composable("payment_status")`;
        
content = content.replace(/composable\("payment_status"\)/, navGraphPatch);
fs.writeFileSync(path, content, 'utf8');
