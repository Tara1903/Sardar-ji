package com.sardarjifood.app.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.RestaurantMenu
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.sardarjifood.app.data.computePricing
import com.sardarjifood.app.model.Product
import java.text.NumberFormat
import java.util.Locale

private val currencyFormatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))

internal fun formatCurrency(amount: Int): String = currencyFormatter.format(amount)

private val quickChips =
    listOf("Veg Only", "Thali", "Breakfast", "Lunch", "Dinner", "Combos", "Bestseller", "Today's Special")

@OptIn(ExperimentalMaterialApi::class, ExperimentalFoundationApi::class, ExperimentalLayoutApi::class)
@Composable
fun CustomerHomeScreen(
    viewModel: MainViewModel,
    onOpenProduct: (Product) -> Unit,
    onBrowseAll: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.loadingCatalog,
        onRefresh = { viewModel.refreshCatalog(forceRefresh = true) },
    )
    var selectedProduct by remember { mutableStateOf<Product?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pullRefresh(pullRefreshState),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Sardar Ji Food Corner", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    AppSearchStrip(onBrowseAll = onBrowseAll)
                    PromoCarousel(
                        headline = state.settings.hero.headline,
                        subtext = state.settings.hero.subtext,
                        offerText = state.settings.hero.offerText,
                        backgroundImage = state.settings.hero.backgroundImage,
                    )
                }
            }

            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(quickChips) { label ->
                        AssistChip(
                            onClick = onBrowseAll,
                            label = { Text(label) },
                            colors = AssistChipDefaults.assistChipColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        )
                    }
                }
            }

            item {
                CategoryGrid(products = state.products, onBrowseAll = onBrowseAll)
            }

            item {
                ProductRailSection(
                    title = "Best sellers",
                    subtitle = "Customers add these first",
                    products = state.products.filter { it.badge.contains("best", true) || it.price >= 149 }.take(8),
                    onOpenProduct = onOpenProduct,
                    onAddTapped = { product ->
                        if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                    },
                )
            }

            item {
                ProductRailSection(
                    title = "Today's specials",
                    subtitle = "Fresh recommendations for right now",
                    products = state.products.filter { it.badge.contains("special", true) || it.badge.contains("new", true) }.ifEmpty { state.products.take(8) },
                    onOpenProduct = onOpenProduct,
                    onAddTapped = { product ->
                        if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                    },
                )
            }

            item {
                ProductRailSection(
                    title = "Budget meals",
                    subtitle = "Quick picks under ₹149",
                    products = state.products.filter { it.price <= 149 }.take(8),
                    onOpenProduct = onOpenProduct,
                    onAddTapped = { product ->
                        if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                    },
                )
            }

            item {
                TrustStrip(points = state.settings.trustPoints)
            }
        }

        PullRefreshIndicator(
            refreshing = state.loadingCatalog,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter),
        )
    }

    selectedProduct?.let { product ->
        AddonBottomSheet(
            product = product,
            onDismiss = { selectedProduct = null },
            onAddConfigured = { selection, quantity ->
                viewModel.addProductToCart(product, quantity, selection)
                selectedProduct = null
            },
        )
    }
}

@OptIn(ExperimentalMaterialApi::class, ExperimentalLayoutApi::class)
@Composable
fun BrowseScreen(
    viewModel: MainViewModel,
    onOpenProduct: (Product) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var search by rememberSaveable { mutableStateOf("") }
    var activeCategory by rememberSaveable { mutableStateOf("All") }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val filteredProducts =
        state.products.filter { product ->
            (activeCategory == "All" || product.category.equals(activeCategory, true) || product.categorySlug.equals(activeCategory, true)) &&
                (search.isBlank() || "${product.name} ${product.description}".contains(search, true))
        }
    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.loadingCatalog,
        onRefresh = { viewModel.refreshCatalog(forceRefresh = true) },
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pullRefresh(pullRefreshState),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Browse menu", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = search,
                        onValueChange = { search = it },
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                        placeholder = { Text("Search Paneer, Thali, Combo...") },
                        singleLine = true,
                        colors = TextFieldDefaults.colors(),
                    )
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        item {
                            FilterChip(selected = activeCategory == "All", onClick = { activeCategory = "All" }, label = { Text("All") })
                        }
                        items(state.categories) { category ->
                            FilterChip(
                                selected = activeCategory.equals(category.name, true) || activeCategory.equals(category.slug, true),
                                onClick = { activeCategory = category.name },
                                label = { Text(category.name) },
                            )
                        }
                    }
                }
            }
            items(filteredProducts.chunked(2)) { rowProducts ->
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    rowProducts.forEach { product ->
                        Box(modifier = Modifier.weight(1f)) {
                            ProductCard(
                                product = product,
                                onOpenProduct = { onOpenProduct(product) },
                                onAddTapped = {
                                    if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                                },
                            )
                        }
                    }
                    if (rowProducts.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        PullRefreshIndicator(
            refreshing = state.loadingCatalog,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter),
        )
    }

    selectedProduct?.let { product ->
        AddonBottomSheet(
            product = product,
            onDismiss = { selectedProduct = null },
            onAddConfigured = { selection, quantity ->
                viewModel.addProductToCart(product, quantity, selection)
                selectedProduct = null
            },
        )
    }
}

@Composable
fun OrdersScreen(viewModel: MainViewModel, onShowAuth: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showHistory by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(state.session?.user?.id) {
        if (state.session != null) {
            viewModel.refreshAuthenticatedData(forceRefresh = true)
        }
    }

    if (state.session == null) {
        EmptyAuthGate(
            title = "Track every order in one place",
            body = "Sign in to see active orders, reorder past meals, and jump back into checkout faster.",
            cta = "Sign in",
            onShowAuth = onShowAuth,
        )
        return
    }

    val activeOrders = state.orders.filter { it.status.lowercase() !in setOf("delivered", "cancelled") }
    val historyOrders = state.orders.filter { it.status.lowercase() in setOf("delivered", "cancelled") }
    val orders = if (showHistory) historyOrders else activeOrders

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Orders", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = !showHistory, onClick = { showHistory = false }, label = { Text("Active") })
                    FilterChip(selected = showHistory, onClick = { showHistory = true }, label = { Text("History") })
                }
            }
        }

        if (orders.isEmpty()) {
            item {
                InfoCard(
                    title = if (showHistory) "No past orders yet" else "No active orders",
                    body = if (showHistory) "Your delivered meals and reorders will show here." else "Once you place an order, live status cards will appear here.",
                )
            }
        } else {
            items(orders) { order ->
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column {
                                Text(order.orderNumber, fontWeight = FontWeight.Bold)
                                Text(order.status.replaceFirstChar { it.uppercase() }, color = MaterialTheme.colorScheme.primary)
                            }
                            Text(formatCurrency(order.total), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        }
                        Text("${order.items.sumOf { it.quantity }} items • ${order.customerName}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (order.tracking.timeline.isNotEmpty()) {
                            Text(order.tracking.timeline.last().label, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(viewModel: MainViewModel, onShowAuth: () -> Unit, onCheckout: () -> Unit) {
    val cartLines by viewModel.cartLines.collectAsStateWithLifecycle()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pricing = remember(cartLines, state.settings.deliveryRules, state.rewardCoupons) {
        computePricing(
            items = cartLines,
            rules = state.settings.deliveryRules,
            discount = state.rewardCoupons.firstOrNull { it.status == "active" }?.amount ?: 0,
        )
    }

    if (cartLines.isEmpty()) {
        EmptyAuthGate(
            title = "Your cart is waiting",
            body = "Add a thali, combo, or daily plan and we’ll keep the checkout quick and clean here.",
            cta = "Browse menu",
            onShowAuth = onCheckout,
        )
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 180.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Cart", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
        items(cartLines) { line ->
            ElevatedCard {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        SquareFoodImage(image = line.image, modifier = Modifier.width(92.dp))
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(line.name, fontWeight = FontWeight.Bold)
                            if (line.addonSummary.isNotBlank()) {
                                Text(line.addonSummary, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                            Text(formatCurrency(line.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                        }
                    }
                    QuantityStepper(
                        quantity = line.quantity,
                        onDecrease = { viewModel.updateCartQuantity(line, line.quantity - 1) },
                        onIncrease = { viewModel.updateCartQuantity(line, line.quantity + 1) },
                        onRemove = { viewModel.removeCartLine(line.lineId) },
                    )
                }
            }
        }
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    SummaryRow("Subtotal", formatCurrency(pricing.subtotal))
                    SummaryRow(pricing.deliveryFeeLabel, if (pricing.deliveryFee == 0) "FREE" else formatCurrency(pricing.deliveryFee))
                    if (pricing.discount > 0) {
                        SummaryRow("Coupon", "-${formatCurrency(pricing.discount)}")
                    }
                    Divider()
                    SummaryRow("Total", formatCurrency(pricing.total), highlight = true)
                    Text(pricing.offerMessage, color = MaterialTheme.colorScheme.primary)
                    Button(onClick = {
                        if (state.session == null) onShowAuth() else onCheckout()
                    }, modifier = Modifier.fillMaxWidth()) {
                        Text(if (state.session == null) "Sign in to checkout" else "Continue to checkout")
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(viewModel: MainViewModel, onShowAuth: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val session = state.session

    if (session == null) {
        EmptyAuthGate(
            title = "Make the app yours",
            body = "Save addresses, pause plans, watch order status live, and keep every reorder one tap away.",
            cta = "Sign in",
            onShowAuth = onShowAuth,
        )
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(session.user.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(session.user.email, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(session.user.phoneNumber.ifBlank { "Phone number not added yet" }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        item {
            state.subscription?.let { subscription ->
                InfoCard(
                    title = subscription.planName,
                    body = "${subscription.daysLeft} days left • ${subscription.status.replaceFirstChar { it.uppercase() }}",
                )
            } ?: InfoCard(
                title = "Monthly plan",
                body = "No active subscription right now. Activate one from the app when you need a steady meal routine.",
            )
        }
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Saved addresses", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    if (session.user.addresses.isEmpty()) {
                        Text("No saved address yet. Add one during checkout and it will appear here.")
                    } else {
                        session.user.addresses.forEach { address ->
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text(address.fullAddress, fontWeight = FontWeight.Medium)
                                Text(listOf(address.landmark, address.pincode).filter { it.isNotBlank() }.joinToString(" • "), color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Support & settings", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text("Need help? WhatsApp and phone support stay connected to the same storefront backend.")
                    OutlinedButton(onClick = { viewModel.logout() }, modifier = Modifier.fillMaxWidth()) {
                        Text("Log out")
                    }
                }
            }
        }
    }
}

@Composable
private fun AppSearchStrip(onBrowseAll: () -> Unit) {
    OutlinedButton(
        onClick = onBrowseAll,
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Icon(Icons.Outlined.Search, contentDescription = null)
        Spacer(modifier = Modifier.width(10.dp))
        Text("Search Paneer, Thali, Combos...")
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PromoCarousel(headline: String, subtext: String, offerText: String, backgroundImage: String) {
    val pagerState = rememberPagerState(pageCount = { 3 })
    val slides =
        listOf(
            Triple(headline, subtext, backgroundImage),
            Triple("₹299 unlocks free delivery", "Fast, clean, and clear before you tap checkout.", backgroundImage),
            Triple("Fresh thalis, combos, and plans", offerText, backgroundImage),
        )

    HorizontalPager(state = pagerState) { page ->
        val slide = slides[page]
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = MaterialTheme.shapes.extraLarge,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.45f),
            ) {
                if (slide.third.isNotBlank()) {
                    AsyncImage(
                        model = slide.third,
                        contentDescription = slide.first,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop,
                    )
                }
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xE6100C08)))),
                )
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(slide.first, color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                    Text(slide.second, color = Color.White.copy(alpha = 0.88f))
                }
            }
        }
    }
}

@Composable
@OptIn(ExperimentalLayoutApi::class)
private fun CategoryGrid(products: List<Product>, onBrowseAll: () -> Unit) {
    val categoryNames = products.map { it.category }.filter { it.isNotBlank() }.distinct().take(10)
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Categories", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            TextButton(onClick = onBrowseAll) { Text("View all") }
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            categoryNames.forEach { name ->
                ElevatedCard(modifier = Modifier.width(108.dp).clickable(onClick = onBrowseAll)) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.Start,
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Icon(Icons.Outlined.RestaurantMenu, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Text(name, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductRailSection(
    title: String,
    subtitle: String,
    products: List<Product>,
    onOpenProduct: (Product) -> Unit,
    onAddTapped: (Product) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Column {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(products) { product ->
                Box(modifier = Modifier.width(220.dp)) {
                    ProductCard(product = product, onOpenProduct = { onOpenProduct(product) }, onAddTapped = { onAddTapped(product) })
                }
            }
        }
    }
}

@Composable
fun ProductCard(product: Product, onOpenProduct: () -> Unit, onAddTapped: () -> Unit) {
    ElevatedCard(onClick = onOpenProduct, colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SquareFoodImage(image = product.image)
            Text(product.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(product.description.ifBlank { product.category }, maxLines = 2, overflow = TextOverflow.Ellipsis, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Star, contentDescription = null, modifier = Modifier.size(15.dp), tint = MaterialTheme.colorScheme.tertiary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(product.badge.ifBlank { "Pure veg" }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                IconButton(onClick = onAddTapped) {
                    Icon(Icons.Outlined.Add, contentDescription = "Add ${product.name}")
                }
            }
        }
    }
}

@Composable
fun SquareFoodImage(image: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(MaterialTheme.shapes.large)
            .background(
                Brush.radialGradient(
                    colors = listOf(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.surface),
                ),
            )
            .padding(14.dp),
    ) {
        AsyncImage(model = image, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
    }
}

@Composable
@OptIn(ExperimentalLayoutApi::class)
private fun TrustStrip(points: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Why people trust us", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            points.ifEmpty { listOf("Freshly prepared", "Hygienic packaging", "Pure veg", "On-time delivery") }.take(6).forEach { point ->
                AssistChip(onClick = {}, label = { Text(point) })
            }
        }
    }
}

@Composable
fun EmptyAuthGate(title: String, body: String, cta: String, onShowAuth: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        InfoCard(title = title, body = body, actionLabel = cta, onAction = onShowAuth)
    }
}

@Composable
fun InfoCard(title: String, body: String, actionLabel: String? = null, onAction: (() -> Unit)? = null) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant)
            if (!actionLabel.isNullOrBlank() && onAction != null) {
                Button(onClick = onAction) { Text(actionLabel) }
            }
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String, highlight: Boolean = false) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = if (highlight) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = if (highlight) FontWeight.Bold else FontWeight.Normal)
        Text(value, fontWeight = if (highlight) FontWeight.ExtraBold else FontWeight.SemiBold)
    }
}

@Composable
private fun QuantityStepper(quantity: Int, onDecrease: () -> Unit, onIncrease: () -> Unit, onRemove: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedButton(onClick = onDecrease) { Text("-") }
        Text(quantity.toString(), fontWeight = FontWeight.Bold)
        OutlinedButton(onClick = onIncrease) { Text("+") }
        TextButton(onClick = onRemove) { Text("Remove") }
    }
}
