package com.sardarjifood.app.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.RestaurantMenu
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sardarjifood.app.data.computePricing
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.Product

private val quickChips =
    listOf("Veg Only", "Thali", "Breakfast", "Lunch", "Dinner", "Combos", "Bestseller", "Today's Special")

private enum class BrowseSortMode {
    RECOMMENDED,
    PRICE_LOW_TO_HIGH,
    PRICE_HIGH_TO_LOW,
}

@OptIn(ExperimentalMaterialApi::class, ExperimentalFoundationApi::class)
@Composable
fun CustomerHomeScreen(
    viewModel: MainViewModel,
    favoriteProductIds: Set<String>,
    onToggleFavorite: (String) -> Unit,
    onOpenProduct: (Product) -> Unit,
    onBrowseAll: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.loadingCatalog,
        onRefresh = { viewModel.refreshCatalog(forceRefresh = true) },
    )
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val favoriteProducts = remember(state.products, favoriteProductIds) { state.products.filter { favoriteProductIds.contains(it.id) }.take(8) }
    val bestSellers = remember(state.products) { state.products.filter { it.badge.contains("best", true) || it.price >= 149 }.take(8) }
    val subscription = state.subscription
    val specials =
        remember(state.products) {
            state.products.filter { it.badge.contains("special", true) || it.badge.contains("new", true) }.ifEmpty { state.products.take(8) }
        }

    Box(modifier = Modifier.fillMaxSize().pullRefresh(pullRefreshState)) {
        if (state.loadingCatalog && state.products.isEmpty()) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                item { SkeletonCard(height = 220) }
                item { SkeletonCard(height = 92) }
                item { SkeletonList(itemCount = 3, itemHeight = 168) }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp),
            ) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Sardar Ji Food Corner", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        Text("Browse fast, add quickly, and keep your favorite meals one tap away.", color = MaterialTheme.colorScheme.onSurfaceVariant)
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
                                leadingIcon = { Icon(Icons.Outlined.LocalOffer, contentDescription = null) },
                                colors = AssistChipDefaults.assistChipColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            )
                        }
                    }
                }
                item {
                    CategoryGrid(
                        categoryNames = state.categories.map { it.name }.filter { it.isNotBlank() }.ifEmpty { state.products.map { it.category }.filter { it.isNotBlank() }.distinct() },
                        onBrowseAll = onBrowseAll,
                    )
                }
                if (subscription != null) {
                    item {
                        ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Active plan", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text(subscription.planName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                Text("${subscription.daysLeft} days left", color = MaterialTheme.colorScheme.onSecondaryContainer)
                            }
                        }
                    }
                }
                if (favoriteProducts.isNotEmpty()) {
                    item {
                        ProductRailSection(
                            title = "Favorites",
                            subtitle = "Your saved meals",
                            products = favoriteProducts,
                            favoriteProductIds = favoriteProductIds,
                            onToggleFavorite = onToggleFavorite,
                            onOpenProduct = onOpenProduct,
                            onAddTapped = { product ->
                                if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                            },
                        )
                    }
                }
                item {
                    ProductRailSection(
                        title = "Best sellers",
                        subtitle = "Customers add these first",
                        products = bestSellers,
                        favoriteProductIds = favoriteProductIds,
                        onToggleFavorite = onToggleFavorite,
                        onOpenProduct = onOpenProduct,
                        onAddTapped = { product ->
                            if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                        },
                    )
                }
                item {
                    ProductRailSection(
                        title = "Today's specials",
                        subtitle = "Fresh recommendations right now",
                        products = specials,
                        favoriteProductIds = favoriteProductIds,
                        onToggleFavorite = onToggleFavorite,
                        onOpenProduct = onOpenProduct,
                        onAddTapped = { product ->
                            if (product.addonGroups.isEmpty()) viewModel.addProductToCart(product) else selectedProduct = product
                        },
                    )
                }
                item { TrustStrip(points = state.settings.trustPoints) }
            }
        }
        PullRefreshIndicator(refreshing = state.loadingCatalog, state = pullRefreshState, modifier = Modifier.align(Alignment.TopCenter))
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

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun BrowseScreen(
    viewModel: MainViewModel,
    favoriteProductIds: Set<String>,
    onToggleFavorite: (String) -> Unit,
    onOpenProduct: (Product) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var search by rememberSaveable { mutableStateOf("") }
    var activeCategory by rememberSaveable { mutableStateOf("All") }
    var sortMode by rememberSaveable { mutableStateOf(BrowseSortMode.RECOMMENDED) }
    var showSortSheet by rememberSaveable { mutableStateOf(false) }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.loadingCatalog,
        onRefresh = { viewModel.refreshCatalog(forceRefresh = true) },
    )

    val filteredProducts =
        remember(state.products, search, activeCategory, sortMode) {
            state.products
                .filter { product ->
                    (activeCategory == "All" || product.category.equals(activeCategory, true) || product.categorySlug.equals(activeCategory, true)) &&
                        (search.isBlank() || "${product.name} ${product.description} ${product.category}".contains(search, true))
                }.let { products ->
                    when (sortMode) {
                        BrowseSortMode.RECOMMENDED -> products
                        BrowseSortMode.PRICE_LOW_TO_HIGH -> products.sortedBy { it.price }
                        BrowseSortMode.PRICE_HIGH_TO_LOW -> products.sortedByDescending { it.price }
                    }
                }
        }

    Box(modifier = Modifier.fillMaxSize().pullRefresh(pullRefreshState)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader(
                        title = "Browse menu",
                        subtitle = "Search, filter, and add without friction",
                        actionLabel = "Sort",
                        onAction = { showSortSheet = true },
                    )
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
                        item { SelectionChip(label = "All", selected = activeCategory == "All") { activeCategory = "All" } }
                        items(state.categories) { category ->
                            SelectionChip(
                                label = category.name,
                                selected = activeCategory.equals(category.name, true) || activeCategory.equals(category.slug, true),
                            ) { activeCategory = category.name }
                        }
                    }
                    AnimatedVisibility(visible = filteredProducts.isNotEmpty()) {
                        StatusChip(label = "${filteredProducts.size} items • ${sortModeLabel(sortMode)}")
                    }
                }
            }
            if (filteredProducts.isEmpty()) {
                item {
                    EmptyStateCard(
                        title = "No dishes match this search",
                        body = "Try another keyword or switch back to all categories.",
                        actionLabel = "Reset filters",
                        onAction = {
                            search = ""
                            activeCategory = "All"
                            sortMode = BrowseSortMode.RECOMMENDED
                        },
                    )
                }
            } else {
                items(filteredProducts.chunked(2)) { rowProducts ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        rowProducts.forEach { product ->
                            Box(modifier = Modifier.weight(1f)) {
                                ProductCard(
                                    product = product,
                                    isFavorite = favoriteProductIds.contains(product.id),
                                    onToggleFavorite = { onToggleFavorite(product.id) },
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
        }
        PullRefreshIndicator(refreshing = state.loadingCatalog, state = pullRefreshState, modifier = Modifier.align(Alignment.TopCenter))
    }

    if (showSortSheet) {
        ModalBottomSheet(onDismissRequest = { showSortSheet = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text("Sort menu", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                BrowseSortMode.entries.forEach { mode ->
                    SettingsListItem(
                        title = sortModeLabel(mode),
                        supportingText =
                            when (mode) {
                                BrowseSortMode.RECOMMENDED -> "Popular choices first"
                                BrowseSortMode.PRICE_LOW_TO_HIGH -> "Budget-friendly meals on top"
                                BrowseSortMode.PRICE_HIGH_TO_LOW -> "Premium picks first"
                            },
                        leadingIcon = Icons.Outlined.LocalOffer,
                        trailing = {
                            StatusChip(
                                label = if (sortMode == mode) "Active" else "Select",
                                tone = if (sortMode == mode) StatusChipTone.Success else StatusChipTone.Neutral,
                            )
                        },
                        onClick = {
                            sortMode = mode
                            showSortSheet = false
                        },
                    )
                }
            }
        }
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
                SectionHeader(title = "Orders", subtitle = "Live tracking up front, reorder history right behind it")
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SelectionChip(label = "Active", selected = !showHistory) { showHistory = false }
                    SelectionChip(label = "History", selected = showHistory) { showHistory = true }
                }
            }
        }
        if (orders.isEmpty()) {
            item {
                EmptyStateCard(
                    title = if (showHistory) "No past orders yet" else "No active orders",
                    body = if (showHistory) "Delivered meals and reorders will show here after your first order." else "Place an order and its live timeline will appear here.",
                )
            }
        } else {
            items(orders) { order ->
                OrderCard(order = order, onReorder = { viewModel.reorder(order) })
            }
        }
    }
}

@Composable
fun CartScreen(viewModel: MainViewModel, onShowAuth: () -> Unit, onCheckout: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val cartLines by viewModel.cartLines.collectAsStateWithLifecycle()
    val pricing =
        remember(cartLines, state.settings.deliveryRules, state.rewardCoupons) {
            computePricing(
                items = cartLines,
                rules = state.settings.deliveryRules,
                discount = state.rewardCoupons.firstOrNull { it.status == "active" }?.amount ?: 0,
            )
        }

    if (cartLines.isEmpty()) {
        EmptyStateCard(
            title = "Your cart is empty",
            body = "Add a few dishes and the app will keep your totals, delivery fee, and offers updated here.",
            actionLabel = "Sign in or browse",
            onAction = onShowAuth,
            modifier = Modifier.padding(20.dp),
        )
        return
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 18.dp, bottom = 220.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item { SectionHeader(title = "Cart", subtitle = "${cartLines.sumOf { it.quantity }} items ready for checkout") }
            items(cartLines, key = { it.lineId }) { line ->
                CartLineCard(
                    line = line,
                    onDecrease = { viewModel.updateCartQuantity(line, line.quantity - 1) },
                    onIncrease = { viewModel.updateCartQuantity(line, line.quantity + 1) },
                    onRemove = { viewModel.removeCartLine(line.lineId) },
                )
            }
        }

        ElevatedCard(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(16.dp),
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                SummaryRow("Subtotal", formatCurrency(pricing.subtotal))
                SummaryRow(pricing.deliveryFeeLabel, if (pricing.deliveryFee == 0) "FREE" else formatCurrency(pricing.deliveryFee))
                if (pricing.discount > 0) SummaryRow("Savings", "-${formatCurrency(pricing.discount)}")
                SummaryRow("Total", formatCurrency(pricing.total), highlight = true)
                PrimaryActionButton(
                    text = if (state.session == null) "Sign in to checkout" else "Continue to checkout",
                    onClick = if (state.session == null) onShowAuth else onCheckout,
                    loading = state.processingCheckout,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
fun ProfileScreen(viewModel: MainViewModel, onShowAuth: () -> Unit, onOpenSettings: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val session = state.session

    if (session == null) {
        EmptyAuthGate(
            title = "Make the app yours",
            body = "Save addresses, rewards, order history, and settings across your devices.",
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
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(session.user.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(session.user.email, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(session.user.phoneNumber.ifBlank { "Phone number not added yet" }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        item {
            state.subscription?.let { subscription ->
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(subscription.planName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("${subscription.daysLeft} days left", color = MaterialTheme.colorScheme.onSecondaryContainer)
                    }
                }
            } ?: InfoCard(title = "Monthly plan", body = "No active subscription right now. Start one whenever you want a steady meal routine.")
        }
        item {
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    SettingsListItem(
                        title = "Settings",
                        supportingText = "Theme, profile, notifications, and support",
                        leadingIcon = Icons.Outlined.Settings,
                        onClick = onOpenSettings,
                    )
                    SettingsListItem(
                        title = "Rewards",
                        supportingText = "${state.rewardCoupons.count { it.status == "active" }} coupons ready to use",
                        leadingIcon = Icons.Outlined.LocalOffer,
                    )
                }
            }
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
            Triple("Fast ordering, cleaner checkout", "Free delivery unlocks faster than you think.", backgroundImage),
            Triple("Thalis, combos, and plans", offerText, backgroundImage),
        )

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        HorizontalPager(state = pagerState) { page ->
            val slide = slides[page]
            ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
                Box(modifier = Modifier.fillMaxWidth().height(220.dp)) {
                    AsyncFoodImage(image = slide.third, contentDescription = slide.first, modifier = Modifier.fillMaxSize(), contentScale = androidx.compose.ui.layout.ContentScale.Crop)
                    Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xE6100C08)))))
                    Column(
                        modifier = Modifier.align(Alignment.BottomStart).padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(slide.first, color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                        Text(slide.second, color = Color.White.copy(alpha = 0.88f))
                    }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(slides.size) { index ->
                Box(
                    modifier = Modifier
                        .width(if (pagerState.currentPage == index) 24.dp else 10.dp)
                        .height(10.dp)
                        .background(
                            color = if (pagerState.currentPage == index) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            shape = MaterialTheme.shapes.large,
                        ),
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CategoryGrid(categoryNames: List<String>, onBrowseAll: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(title = "Categories", subtitle = "Jump straight to the meal type you want", actionLabel = "View all", onAction = onBrowseAll)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            categoryNames.take(10).forEach { name ->
                ElevatedCard(modifier = Modifier.width(108.dp).clickable(onClick = onBrowseAll)) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
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
    favoriteProductIds: Set<String>,
    onToggleFavorite: (String) -> Unit,
    onOpenProduct: (Product) -> Unit,
    onAddTapped: (Product) -> Unit,
) {
    if (products.isEmpty()) return
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(title = title, subtitle = subtitle)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(products) { product ->
                Box(modifier = Modifier.width(220.dp)) {
                    ProductCard(
                        product = product,
                        isFavorite = favoriteProductIds.contains(product.id),
                        onToggleFavorite = { onToggleFavorite(product.id) },
                        onOpenProduct = { onOpenProduct(product) },
                        onAddTapped = { onAddTapped(product) },
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TrustStrip(points: List<String>) {
    val visiblePoints = points.ifEmpty { listOf("Freshly prepared", "Hygienic packaging", "Pure veg", "On-time delivery") }
    ElevatedCard {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Why people trust us", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                visiblePoints.forEach { point -> StatusChip(label = point, tone = StatusChipTone.Success) }
            }
        }
    }
}

@Composable
private fun ProductCard(
    product: Product,
    isFavorite: Boolean,
    onToggleFavorite: () -> Unit,
    onOpenProduct: () -> Unit,
    onAddTapped: () -> Unit,
) {
    val haptics = LocalHapticFeedback.current
    ElevatedCard(onClick = onOpenProduct) {
        Column(modifier = Modifier.padding(14.dp).animateContentSize(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Box {
                SquareFoodImage(image = product.image)
                IconButton(
                    onClick = {
                        haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        onToggleFavorite()
                    },
                    modifier = Modifier.align(Alignment.TopEnd),
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Outlined.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isFavorite) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            Text(product.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(product.description.ifBlank { product.category }, maxLines = 2, overflow = TextOverflow.Ellipsis, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Star, contentDescription = null, modifier = Modifier.size(15.dp), tint = MaterialTheme.colorScheme.tertiary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(product.badge.ifBlank { "Pure veg" }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                IconButton(
                    onClick = {
                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                        onAddTapped()
                    },
                ) {
                    Icon(Icons.Outlined.Add, contentDescription = "Add ${product.name}")
                }
            }
        }
    }
}

@Composable
private fun OrderCard(order: Order, onReorder: () -> Unit) {
    ElevatedCard {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(order.orderNumber, fontWeight = FontWeight.Bold)
                    StatusChip(
                        label = order.status.replace('_', ' ').replaceFirstChar { it.uppercase() },
                        tone = when (order.status.lowercase()) {
                            "delivered" -> StatusChipTone.Success
                            "cancelled" -> StatusChipTone.Error
                            else -> StatusChipTone.Warning
                        },
                    )
                }
                Text(formatCurrency(order.total), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
            Text("${order.items.sumOf { it.quantity }} items • ${order.address.fullAddress.ifBlank { "Address coming from checkout" }}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedButton(onClick = onReorder, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Outlined.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Reorder")
            }
        }
    }
}

@Composable
private fun CartLineCard(
    line: CartLine,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit,
    onRemove: () -> Unit,
) {
    ElevatedCard {
        Row(modifier = Modifier.fillMaxWidth().padding(14.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(modifier = Modifier.width(92.dp)) {
                SquareFoodImage(image = line.image)
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(line.name, fontWeight = FontWeight.Bold)
                if (line.addonSummary.isNotBlank()) {
                    Text(line.addonSummary, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(formatCurrency(line.price * line.quantity), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    AnimatedQuantityStepper(quantity = line.quantity, onDecrease = onDecrease, onIncrease = onIncrease)
                }
                TextButton(onClick = onRemove, modifier = Modifier.align(Alignment.End)) {
                    Text("Remove")
                }
            }
        }
    }
}

private fun sortModeLabel(sortMode: BrowseSortMode): String =
    when (sortMode) {
        BrowseSortMode.RECOMMENDED -> "Recommended"
        BrowseSortMode.PRICE_LOW_TO_HIGH -> "Price: low to high"
        BrowseSortMode.PRICE_HIGH_TO_LOW -> "Price: high to low"
    }
