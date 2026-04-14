package com.sardarjifood.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sardarjifood.app.PendingPaymentContext
import com.sardarjifood.app.data.buildCartLine
import com.sardarjifood.app.data.computePricing
import com.sardarjifood.app.data.createInitialAddonSelection
import com.sardarjifood.app.data.isAddonSelectionComplete
import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload
import com.sardarjifood.app.model.Address
import com.sardarjifood.app.model.Product
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddonBottomSheet(
    product: Product,
    onDismiss: () -> Unit,
    onAddConfigured: (Map<String, List<String>>, Int) -> Unit,
) {
    var quantity by rememberSaveable { mutableStateOf(1) }
    val selection = remember(product.id) { mutableStateMapOf<String, List<String>>().apply { putAll(createInitialAddonSelection(product.addonGroups)) } }
    val cleanedSelection = selection.toMap()
    val previewLine = buildCartLine(product, quantity, cleanedSelection)
    val selectionReady = isAddonSelectionComplete(product.addonGroups, cleanedSelection)

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            SquareFoodImage(image = product.image, modifier = Modifier.width(150.dp))
            Text(product.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)

            product.addonGroups.forEach { group ->
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(group.title, fontWeight = FontWeight.Bold)
                        if (group.required) {
                            Text("Required", color = MaterialTheme.colorScheme.primary)
                        }
                        group.options.forEach { option ->
                            val isSelected = (selection[group.id] ?: emptyList()).contains(option.id)
                            ElevatedCard(
                                onClick = {
                                    val current = selection[group.id] ?: emptyList()
                                    val next =
                                        if (group.selectionType == "multiple") {
                                            if (isSelected) current - option.id else (current + option.id).take(group.maxSelections)
                                        } else {
                                            if (isSelected) emptyList() else listOf(option.id)
                                        }
                                    selection[group.id] = next
                                },
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Column {
                                        Text(option.name, fontWeight = FontWeight.Medium)
                                        if (option.price > 0) {
                                            Text("+${formatCurrency(option.price)}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }
                                    FilterChip(selected = isSelected, onClick = {
                                        val current = selection[group.id] ?: emptyList()
                                        val next =
                                            if (group.selectionType == "multiple") {
                                                if (isSelected) current - option.id else (current + option.id).take(group.maxSelections)
                                            } else {
                                                if (isSelected) emptyList() else listOf(option.id)
                                            }
                                        selection[group.id] = next
                                    }, label = { Text(if (isSelected) "Selected" else "Select") })
                                }
                            }
                        }
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(onClick = { quantity = (quantity - 1).coerceAtLeast(1) }) { Text("-") }
                Text(quantity.toString(), fontWeight = FontWeight.Bold)
                OutlinedButton(onClick = { quantity += 1 }) { Text("+") }
            }
            Button(
                onClick = { onAddConfigured(cleanedSelection, quantity) },
                modifier = Modifier.fillMaxWidth(),
                enabled = selectionReady,
            ) {
                Text("Add to cart • ${formatCurrency(previewLine.price * previewLine.quantity)}")
            }
            Spacer(modifier = Modifier.height(18.dp))
        }
    }
}

@Composable
fun AuthScreen(viewModel: MainViewModel, onDone: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var isRegister by rememberSaveable { mutableStateOf(false) }
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var referral by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(state.session?.user?.id) {
        if (state.session != null) onDone()
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Text(if (isRegister) "Create your app account" else "Welcome back", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
        }
        if (isRegister) {
            item {
                OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Name") })
            }
            item {
                OutlinedTextField(value = phone, onValueChange = { phone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Phone number") })
            }
        }
        item {
            OutlinedTextField(value = email, onValueChange = { email = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Email") })
        }
        item {
            OutlinedTextField(value = password, onValueChange = { password = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Password") })
        }
        if (isRegister) {
            item {
                OutlinedTextField(value = referral, onValueChange = { referral = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Referral code (optional)") })
            }
        }
        item {
            Button(
                onClick = {
                    if (isRegister) {
                        viewModel.signUp(name, email, phone, password, referral)
                    } else {
                        viewModel.signIn(email, password)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (isRegister) "Create account" else "Sign in")
            }
        }
        item {
            TextButton(onClick = { isRegister = !isRegister }) {
                Text(if (isRegister) "Already have an account? Sign in" else "New here? Create an account")
            }
        }
    }
}

@Composable
fun ProductDetailRoute(product: Product?, viewModel: MainViewModel, onBack: () -> Unit) {
    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            InfoCard(title = "Product not found", body = "This item may have moved or become unavailable.", actionLabel = "Back", onAction = onBack)
        }
        return
    }

    var showAddons by remember { mutableStateOf(false) }

    Scaffold(
        bottomBar = {
            Button(
                onClick = { if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else showAddons = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
            ) {
                Text(if (product.addonGroups.isEmpty()) "Add to cart • ${formatCurrency(product.price)}" else "Customize & add")
            }
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 18.dp + padding.calculateTopPadding(), bottom = 110.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                TextButton(onClick = onBack) { Text("Back") }
            }
            item {
                SquareFoodImage(image = product.image)
            }
            item {
                Text(product.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
            }
            item {
                Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }
            item {
                Text(product.description.ifBlank { "Freshly prepared pure veg meal." }, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (product.addonGroups.isNotEmpty()) {
                item {
                    ElevatedCard {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Available add-ons", fontWeight = FontWeight.Bold)
                            product.addonGroups.forEach { group ->
                                Text("${group.title} • ${if (group.selectionType == "multiple") "Multiple" else "Single"}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddons) {
        AddonBottomSheet(
            product = product,
            onDismiss = { showAddons = false },
            onAddConfigured = { selection, quantity ->
                viewModel.addProductToCart(product, quantity, selection)
                showAddons = false
            },
        )
    }
}

@Composable
fun CheckoutRoute(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onOrderPlaced: () -> Unit,
    onLaunchRazorpay: (RazorpayCheckoutPayload, PendingPaymentContext) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val cartLines by viewModel.cartLines.collectAsStateWithLifecycle()
    val session = state.session
    val scope = rememberCoroutineScope()

    if (session == null) {
        EmptyAuthGate(title = "Sign in before checkout", body = "Your addresses, order history, and live status all sync after login.", cta = "Sign in", onShowAuth = onBack)
        return
    }

    var selectedPayment by rememberSaveable { mutableStateOf("COD") }
    var name by rememberSaveable { mutableStateOf(session.user.addresses.firstOrNull()?.name ?: session.user.name) }
    var phone by rememberSaveable { mutableStateOf(session.user.addresses.firstOrNull()?.phoneNumber ?: session.user.phoneNumber) }
    var fullAddress by rememberSaveable { mutableStateOf(session.user.addresses.firstOrNull()?.fullAddress.orEmpty()) }
    var landmark by rememberSaveable { mutableStateOf(session.user.addresses.firstOrNull()?.landmark.orEmpty()) }
    var pincode by rememberSaveable { mutableStateOf(session.user.addresses.firstOrNull()?.pincode.orEmpty()) }
    var note by rememberSaveable { mutableStateOf("") }

    val pricing = remember(cartLines, state.settings.deliveryRules, state.rewardCoupons) {
        computePricing(
            items = cartLines,
            rules = state.settings.deliveryRules,
            discount = state.rewardCoupons.firstOrNull { it.status == "active" }?.amount ?: 0,
        )
    }

    LaunchedEffect(state.lastPlacedOrder?.id) {
        if (state.lastPlacedOrder != null) {
            onOrderPlaced()
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 18.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item { TextButton(onClick = onBack) { Text("Back") } }
        item { Text("Checkout", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold) }
        item { OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Name") }) }
        item { OutlinedTextField(value = phone, onValueChange = { phone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Phone number") }) }
        item { OutlinedTextField(value = fullAddress, onValueChange = { fullAddress = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Full address") }) }
        item { OutlinedTextField(value = landmark, onValueChange = { landmark = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Landmark") }) }
        item { OutlinedTextField(value = pincode, onValueChange = { pincode = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Pincode") }) }
        item { OutlinedTextField(value = note, onValueChange = { note = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Delivery note (optional)") }) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = selectedPayment == "COD", onClick = { selectedPayment = "COD" }, label = { Text("Cash on delivery") })
                FilterChip(selected = selectedPayment == "ONLINE", onClick = { selectedPayment = "ONLINE" }, label = { Text("Pay online") })
            }
        }
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SummaryRow("Subtotal", formatCurrency(pricing.subtotal))
                    SummaryRow(pricing.deliveryFeeLabel, if (pricing.deliveryFee == 0) "FREE" else formatCurrency(pricing.deliveryFee))
                    if (pricing.discount > 0) SummaryRow("Coupon", "-${formatCurrency(pricing.discount)}")
                    SummaryRow("Total", formatCurrency(pricing.total), highlight = true)
                }
            }
        }
        item {
            Button(
                onClick = {
                    val address = Address(name = name, phoneNumber = phone, fullAddress = fullAddress, landmark = landmark, pincode = pincode)
                    if (selectedPayment == "COD") {
                        viewModel.placeCashOrder(address = address, note = note)
                    } else {
                        scope.launch {
                            runCatching {
                                viewModel.createRazorpayDraft(address = address, note = note)
                            }.onSuccess { checkoutPayload ->
                                onLaunchRazorpay(checkoutPayload, PendingPaymentContext(address = address, note = note, couponCode = ""))
                            }.onFailure { error ->
                                viewModel.showError(error.message ?: "Unable to start online payment.")
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (selectedPayment == "COD") "Place order • ${formatCurrency(pricing.total)}" else "Continue to pay • ${formatCurrency(pricing.total)}")
            }
        }
    }
}
