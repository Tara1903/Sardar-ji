package com.sardarjifood.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.lifecycleScope
import com.razorpay.Checkout
import com.razorpay.PaymentData
import com.razorpay.PaymentResultWithDataListener
import com.sardarjifood.app.model.Address
import com.sardarjifood.app.ui.AppStateViewModel
import com.sardarjifood.app.ui.MainViewModel
import com.sardarjifood.app.ui.NativeFoodApp
import com.sardarjifood.app.ui.theme.SardarJiTheme
import kotlinx.coroutines.launch
import org.json.JSONObject

data class PendingPaymentContext(
    val address: Address,
    val note: String,
    val couponCode: String,
    val distanceKm: Double? = null,
)

class MainActivity : ComponentActivity(), PaymentResultWithDataListener {
    private val appStateViewModel: AppStateViewModel by viewModels()
    private val viewModel: MainViewModel by viewModels()
    private var pendingPaymentContext: PendingPaymentContext? = null

    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        splashScreen.setKeepOnScreenCondition { viewModel.uiState.value.booting }
        requestNotificationPermissionIfNeeded()

        setContent {
            val appState = appStateViewModel.uiState.collectAsStateWithLifecycle()
            SardarJiTheme(themeMode = appState.value.preferences.themeMode) {
                NativeFoodApp(
                    appStateViewModel = appStateViewModel,
                    viewModel = viewModel,
                    initialDeepLink = intent?.dataString ?: intent?.getStringExtra("deep_link_path"),
                    onLaunchRazorpay = { checkoutPayload, paymentContext ->
                        pendingPaymentContext = paymentContext
                        launchRazorpayCheckout(checkoutPayload)
                    },
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    override fun onPaymentSuccess(razorpayPaymentId: String?, paymentData: PaymentData?) {
        val paymentId = razorpayPaymentId ?: paymentData?.paymentId
        val orderId = paymentData?.orderId
        val signature = paymentData?.signature
        val pending = pendingPaymentContext

        if (paymentId.isNullOrBlank() || orderId.isNullOrBlank() || signature.isNullOrBlank() || pending == null) {
            viewModel.showError("Payment finished, but the confirmation details were incomplete.")
            pendingPaymentContext = null
            return
        }

        lifecycleScope.launch {
            runCatching {
                viewModel.verifyRazorpayPayment(
                    paymentId = paymentId,
                    orderId = orderId,
                    signature = signature,
                    address = pending.address,
                    note = pending.note,
                    couponCode = pending.couponCode,
                    distanceKm = pending.distanceKm,
                )
            }.onSuccess { result ->
                viewModel.completeRazorpayOrder(result)
            }.onFailure { error ->
                viewModel.showError(error.message ?: "Payment succeeded, but the order verification failed.")
            }
            pendingPaymentContext = null
        }
    }

    override fun onPaymentError(code: Int, response: String?, paymentData: PaymentData?) {
        viewModel.showError(response ?: "Payment was cancelled or failed. Code: $code")
        pendingPaymentContext = null
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            return
        }
        notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    private fun launchRazorpayCheckout(checkoutPayload: com.sardarjifood.app.data.repository.RazorpayCheckoutPayload) {
        val options =
            JSONObject().apply {
                put("name", checkoutPayload.businessName)
                put("description", checkoutPayload.businessDescription)
                put("theme.color", checkoutPayload.themeColor)
                put("currency", checkoutPayload.currency)
                put("amount", checkoutPayload.amount)
                put("order_id", checkoutPayload.orderId)
                put(
                    "prefill",
                    JSONObject().apply {
                        put("name", checkoutPayload.prefillName)
                        put("email", checkoutPayload.prefillEmail)
                        put("contact", checkoutPayload.prefillContact)
                    },
                )
            }

        Checkout().apply {
            setKeyID(checkoutPayload.keyId)
            open(this@MainActivity, options)
        }
    }
}
