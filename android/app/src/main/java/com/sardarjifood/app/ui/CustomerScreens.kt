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
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.outlined.AccessTime
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.DeliveryDining
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.LocationOn
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
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.material3.Surface
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sardarjifood.app.data.computePricing
import com.sardarjifood.app.model.CartLine
import com.sardarjifood.app.model.DeliveryRules
import com.sardarjifood.app.model.Order
import com.sardarjifood.app.model.Product
import kotlin.math.roundToInt

private val quickChips =
    listOf("Veg Only", "Thali", "Breakfast", "Lunch", "Dinner", "Combos", "Bestseller", "Today's Special")

private enum class BrowseSortMode {
    RECOMMENDED,
    PRICE_LOW_TO_HIGH,
    PRICE_HIGH_TO_LOW,
}

private enum class TrackStepState {
    COMPLETED,
    ACTIVE,
    UPCOMING,
}

private data class TrackStep(
    val title: String,
    val detail: String,
    val state: TrackStepState,
)

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
    val adaptiveState = rememberAdaptiveState()
    val pullRefreshState =
        rememberPullRefreshState(
            refreshing = state.loadingCatalog,
            onRefresh = { viewModel.refreshCatalog(forceRefresh = true) },
        )
    var selectedProduct by remember { mutableStateOf<Product?>(null) }

    val favoriteProducts =
        remember(state.products, favoriteProductIds) {
            state.products.filter { favoriteProductIds.contains(it.id) }.take(8)
        }
    val bestSellers =
        remember(state.products) {
            state.products.filter { it.badge.contains("best", true) || it.price >= 149 }.take(8)
        }
    val specials =
        remember(state.products) {
            state.products.filter { it.badge.contains("special", true) || it.badge.contains("new", true) }.ifEmpty { state.products.take(8) }
        }
    val categoryNames =
        remember(state.categories, state.products) {
            state.categories.map { it.name }.filter { it.isNotBlank() }
                .ifEmpty { state.products.map { it.category }.filter { it.isNotBlank() }.distinct() }
        }

    Box(
        modifier =
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors =
                            listOf(
                                MaterialTheme.colorScheme.background,
                                MaterialTheme.colorScheme.surface,
                                MaterialTheme.colorScheme.background,
                            ),
                    ),
                ).pullRefresh(pullRefreshState),
    ) {
        if (state.loadingCatalog && state.products.isEmpty()) {
            CenteredContentFrame(modifier = Modifier.fillMaxSize(), adaptiveState = adaptiveState) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(adaptiveState.horizontalPadding),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    item { SkeletonCard(height = 260) }
                    item { SkeletonCard(height = 120) }
                    item { SkeletonList(itemCount = 3, itemHeight = 196) }
                }
            }
        } else {
            CenteredContentFrame(modifier = Modifier.fillMaxSize(), adaptiveState = adaptiveState) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 18.dp, bottom = 120.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp),
                ) {
                    item {
                        HomeHeroCard(
                            settings = state.settings,
                            onBrowseAll = onBrowseAll,
                        )
                    }
                    item {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(quickChips) { label ->
                                AssistChip(
                                    onClick = onBrowseAll,
                                    label = { Text(label) },
                                    leadingIcon = { Icon(Icons.Outlined.LocalOffer, contentDescription = null) },
                                    colors =
                                        AssistChipDefaults.assistChipColors(
                                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                            labelColor = MaterialTheme.colorScheme.onSurface,
                                        ),
                                )
                            }
                        }
                    }
                    item {
                        CategoryGrid(
                            categoryNames = categoryNames,
                            onBrowseAll = onBrowseAll,
                        )
                    }
                    if (favoriteProducts.isNotEmpty()) {
                        item {
                            ProductRailSection(
                                title = "Saved for you",
                                subtitle = "Favorites you can add again in one tap",
                                products = favoriteProducts,
                                favoriteProductIds = favoriteProductIds,
                                onToggleFavorite = onToggleFavorite,
                                onOpenProduct = onOpenProduct,
                                onAddTapped = { product ->
                                    if (product.addonGroups.isEmpty()) {
                                        viewModel.addProductToCart(product)
                                    } else {
                                        selectedProduct = product
                                    }
                                },
                            )
                        }
                    }
                    item {
                        ProductRailSection(
                            title = "Trending now",
                            subtitle = "The meals customers are reaching for first",
                            products = bestSellers,
                            favoriteProductIds = favoriteProductIds,
                            onToggleFavorite = onToggleFavorite,
                            onOpenProduct = onOpenProduct,
                            onAddTapped = { product ->
                                if (product.addonGroups.isEmpty()) {
                                    viewModel.addProductToCart(product)
                                } else {
                                    selectedProduct = product
                                }
                            },
                        )
                    }
                    item {
                        ProductRailSection(
                            title = "Fresh picks",
                            subtitle = "New and special dishes worth opening",
                            products = specials,
                            favoriteProductIds = favoriteProductIds,
                            onToggleFavorite = onToggleFavorite,
                            onOpenProduct = onOpenProduct,
                            onAddTapped = { product ->
                                if (product.addonGroups.isEmpty()) {
                                    viewModel.addProductToCart(product)
                                } else {
                                    selectedProduct = product
                                }
                            },
                        )
                    }
                    item { TrustStrip(points = state.settings.trustPoints) }
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

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun BrowseScreen(
    viewModel: MainViewModel,
    favoriteProductIds: Set<String>,
    onToggleFavorite: (String) -> Unit,
    onOpenProduct: (Product) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adaptiveState = rememberAdaptiveState()
    var search by rememberSaveable { mutableStateOf("") }
    var activeCategory by rememberSaveable { mutableStateOf("All") }
    var sortMode by rememberSaveable { mutableStateOf(BrowseSortMode.RECOMMENDED) }
    var showSortSheet by rememberSaveable { mutableStateOf(false) }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val pullRefreshState =
        rememberPullRefreshState(
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

    Box(
        modifier =
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors =
                            listOf(
                                MaterialTheme.colorScheme.background,
                                MaterialTheme.colorScheme.surface,
                            ),
                    ),
                ).pullRefresh(pullRefreshState),
    ) {
        CenteredContentFrame(modifier = Modifier.fillMaxSize(), adaptiveState = adaptiveState) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 18.dp, bottom = 120.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    BrowseHero(search = search, onSearchChange = { search = it }, onOpenSort = { showSortSheet = true }, itemCount = filteredProducts.size, sortMode = sortMode)
                }
                item {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        item { SelectionChip(label = "All", selected = activeCategory == "All") { activeCategory = "All" } }
                        items(state.categories) { category ->
                            SelectionChip(
                                label = category.name,
                                selected = activeCategory.equals(category.name, true) || activeCategory.equals(category.slug, true),
                            ) {
                                activeCategory = category.name
                            }
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
                    items(filteredProducts, key = { it.id }) { product ->
                        MenuFeatureCard(
                            product = product,
                            isFavorite = favoriteProductIds.contains(product.id),
                            onToggleFavorite = { onToggleFavorite(product.id) },
                            onOpenProduct = { onOpenProduct(product) },
                            onAddTapped = {
                                if (product.addonGroups.isEmpty()) {
                                    viewModel.addProductToCart(product)
                                } else {
                                    selectedProduct = product
                                }
                            },
                        )
                    }
                }
            }
        }

        PullRefreshIndicator(refreshing = state.loadingCatalog, state = pullRefreshState, modifier = Modifier.align(Alignment.TopCenter))
    }

    if (showSortSheet) {
        ModalBottomSheet(onDismissRequest = { showSortSheet = false }) {
            Column(
                modifier =
                    Modifier
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
fun OrdersScreen(
    viewModel: MainViewModel,
    onShowAuth: () -> Unit,
    onOpenOrder: (String) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adaptiveState = rememberAdaptiveState()
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

    CenteredContentFrame(
        modifier =
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors =
                            listOf(
                                MaterialTheme.colorScheme.background,
                                MaterialTheme.colorScheme.surface,
                            ),
                    ),
                ),
        adaptiveState = adaptiveState,
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 18.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader(
                        title = "Orders",
                        subtitle = "Live tracking up front, reorder history right behind it",
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SelectionChip(label = "Active", selected = !showHistory) { showHistory = false }
                        SelectionChip(label = "History", selected = showHistory) { showHistory = true }
                    }
                }
            }

            if (!showHistory && activeOrders.isNotEmpty()) {
                item {
                    LiveTrackingPreviewCard(order = activeOrders.first(), onOpenOrder = { onOpenOrder(activeOrders.first().id) })
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
                val displayOrders = if (!showHistory && activeOrders.isNotEmpty()) orders.drop(1) else orders
                items(displayOrders, key = { it.id }) { order ->
                    OrderCard(
                        order = order,
                        onOpenOrder = { onOpenOrder(order.id) },
                        onReorder = { viewModel.reorder(order) },
                    )
                }
            }
        }
    }
}

@Composable
fun OrderDetailRoute(
    orderId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onShowAuth: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adaptiveState = rememberAdaptiveState()
    val order = state.orders.firstOrNull { it.id == orderId }

    LaunchedEffect(orderId, state.session?.user?.id) {
        if (state.session != null && order == null) {
            viewModel.refreshAuthenticatedData(forceRefresh = true)
        }
    }

    if (state.session == null) {
        EmptyAuthGate(
            title = "Open your order timeline",
            body = "Sign in to track order updates, delivery progress, and reorder this meal anytime.",
            cta = "Sign in",
            onShowAuth = onShowAuth,
        )
        return
    }

    if (order == null && state.loadingOrders) {
        AppScaffold(
            title = "Order details",
            subtitle = "Loading your latest timeline",
            topActions = { TextButton(onClick = onBack) { Text("Back") } },
        ) { padding ->
            Box(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                SkeletonList(itemCount = 4, itemHeight = 120)
            }
        }
        return
    }

    if (order == null) {
        AppScaffold(
            title = "Order details",
            subtitle = "We could not find this order",
            topActions = { TextButton(onClick = onBack) { Text("Back") } },
        ) { padding ->
            Box(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                EmptyStateCard(
                    title = "Order not available",
                    body = "This order may be archived or still syncing. Pull to refresh from Orders and try again.",
                    actionLabel = "Back",
                    onAction = onBack,
                )
            }
        }
        return
    }

    val steps = remember(order) { buildTrackSteps(order) }
    val progress = remember(order.status) { orderProgress(order.status) }

    AppScaffold(
        title = order.orderNumber,
        subtitle = "Track order",
        topActions = { TextButton(onClick = onBack) { Text("Back") } },
    ) { padding ->
        CenteredContentFrame(
            modifier =
                Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(MaterialTheme.colorScheme.background),
            adaptiveState = adaptiveState,
        ) {
            if (adaptiveState.isMediumUp) {
                Row(
                    modifier = Modifier.fillMaxSize().padding(horizontal = adaptiveState.horizontalPadding, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(adaptiveState.paneSpacing),
                ) {
                    LazyColumn(
                        modifier = Modifier.weight(1.15f).fillMaxHeight(),
                        contentPadding = PaddingValues(bottom = 32.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        item {
                            TrackingHeroCard(
                                order = order,
                                rules = state.settings.deliveryRules,
                                progress = progress,
                            )
                        }
                        item { DeliveryPartnerCard(order = order) }
                        item { TrackingTimelineCard(steps = steps) }
                    }

                    LazyColumn(
                        modifier = Modifier.weight(0.85f).fillMaxHeight(),
                        contentPadding = PaddingValues(bottom = 32.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        item { OrderSummaryCard(order = order) }
                        item {
                            PrimaryActionButton(
                                text = "Reorder this meal",
                                onClick = { viewModel.reorder(order) },
                                modifier = Modifier.fillMaxWidth(),
                                leadingIcon = Icons.Outlined.Refresh,
                            )
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 16.dp, bottom = 120.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    item {
                        TrackingHeroCard(
                            order = order,
                            rules = state.settings.deliveryRules,
                            progress = progress,
                        )
                    }
                    item {
                        DeliveryPartnerCard(order = order)
                    }
                    item {
                        TrackingTimelineCard(steps = steps)
                    }
                    item {
                        OrderSummaryCard(order = order)
                    }
                    item {
                        PrimaryActionButton(
                            text = "Reorder this meal",
                            onClick = { viewModel.reorder(order) },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Outlined.Refresh,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(
    viewModel: MainViewModel,
    onShowAuth: () -> Unit,
    onCheckout: () -> Unit,
    onBrowseMenu: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adaptiveState = rememberAdaptiveState()
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
            actionLabel = if (state.session == null) "Sign in" else "Browse menu",
            onAction = if (state.session == null) onShowAuth else onBrowseMenu,
            modifier = Modifier.padding(20.dp),
        )
        return
    }

    val address = state.session?.user?.addresses?.firstOrNull()
    val checkoutAction = if (state.session == null) onShowAuth else onCheckout
    val checkoutLabel =
        when {
            pricing.notDeliverable -> "Delivery unavailable"
            state.session == null -> "Sign in to checkout"
            else -> "Continue"
        }

    CenteredContentFrame(
        modifier =
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors =
                            listOf(
                                MaterialTheme.colorScheme.background,
                                MaterialTheme.colorScheme.surface,
                            ),
                    ),
                ),
        adaptiveState = adaptiveState,
    ) {
        if (adaptiveState.isMediumUp) {
            Row(
                modifier = Modifier.fillMaxSize().padding(horizontal = adaptiveState.horizontalPadding, vertical = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(adaptiveState.paneSpacing),
            ) {
                LazyColumn(
                    modifier = Modifier.weight(1.15f).fillMaxHeight(),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        SectionHeader(title = "My cart", subtitle = "${cartLines.sumOf { it.quantity }} items ready for checkout")
                    }
                    item {
                        AddressPreviewCard(
                            addressLine = address?.fullAddress.orEmpty(),
                            landmark = listOfNotNull(address?.landmark?.takeIf { it.isNotBlank() }, address?.pincode?.takeIf { it.isNotBlank() }).joinToString(" • "),
                            etaMinutes = state.settings.deliveryRules.estimatedDeliveryMinutes,
                        )
                    }
                    if (pricing.offerMessage.isNotBlank()) {
                        item {
                            StatusBanner(title = pricing.deliveryMessage, detail = pricing.offerMessage, tone = if (pricing.notDeliverable) StatusChipTone.Error else StatusChipTone.Success)
                        }
                    }
                    items(cartLines, key = { it.lineId }) { line ->
                        CartLineCard(
                            line = line,
                            onDecrease = { viewModel.updateCartQuantity(line, line.quantity - 1) },
                            onIncrease = { viewModel.updateCartQuantity(line, line.quantity + 1) },
                            onRemove = { viewModel.removeCartLine(line.lineId) },
                        )
                    }
                }

                Column(
                    modifier = Modifier.weight(0.85f),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    BillDetailsCard(pricing = pricing)
                    ElevatedCard(
                        shape = MaterialTheme.shapes.extraLarge,
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(18.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            Text("Ready to place", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                            Text(formatCurrency(pricing.total), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
                            PrimaryActionButton(
                                text = checkoutLabel,
                                onClick = checkoutAction,
                                loading = state.processingCheckout,
                                enabled = !pricing.notDeliverable,
                                modifier = Modifier.fillMaxWidth(),
                            )
                        }
                    }
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxSize()) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 18.dp, bottom = 250.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        SectionHeader(title = "My cart", subtitle = "${cartLines.sumOf { it.quantity }} items ready for checkout")
                    }
                    item {
                        AddressPreviewCard(
                            addressLine = address?.fullAddress.orEmpty(),
                            landmark = listOfNotNull(address?.landmark?.takeIf { it.isNotBlank() }, address?.pincode?.takeIf { it.isNotBlank() }).joinToString(" • "),
                            etaMinutes = state.settings.deliveryRules.estimatedDeliveryMinutes,
                        )
                    }
                    if (pricing.offerMessage.isNotBlank()) {
                        item {
                            StatusBanner(title = pricing.deliveryMessage, detail = pricing.offerMessage, tone = if (pricing.notDeliverable) StatusChipTone.Error else StatusChipTone.Success)
                        }
                    }
                    items(cartLines, key = { it.lineId }) { line ->
                        CartLineCard(
                            line = line,
                            onDecrease = { viewModel.updateCartQuantity(line, line.quantity - 1) },
                            onIncrease = { viewModel.updateCartQuantity(line, line.quantity + 1) },
                            onRemove = { viewModel.removeCartLine(line.lineId) },
                        )
                    }
                    item {
                        BillDetailsCard(pricing = pricing)
                    }
                }

                ElevatedCard(
                    modifier =
                        Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(adaptiveState.horizontalPadding),
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(18.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Total", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(formatCurrency(pricing.total), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                        }
                        PrimaryActionButton(
                            text = checkoutLabel,
                            onClick = checkoutAction,
                            loading = state.processingCheckout,
                            enabled = !pricing.notDeliverable,
                            modifier = Modifier.width(176.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(viewModel: MainViewModel, onShowAuth: () -> Unit, onOpenSettings: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adaptiveState = rememberAdaptiveState()
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

    CenteredContentFrame(
        modifier =
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors =
                            listOf(
                                MaterialTheme.colorScheme.background,
                                MaterialTheme.colorScheme.surface,
                            ),
                    ),
                ),
        adaptiveState = adaptiveState,
    ) {
        if (adaptiveState.isMediumUp) {
            Row(
                modifier = Modifier.fillMaxSize().padding(horizontal = adaptiveState.horizontalPadding, vertical = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(adaptiveState.paneSpacing),
            ) {
                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    item {
                        ProfileHeroCard(
                            name = session.user.name,
                            email = session.user.email,
                            phone = session.user.phoneNumber,
                            rewardsCount = state.rewardCoupons.count { it.status == "active" },
                            planLabel = state.subscription?.planName ?: "No active plan",
                        )
                    }
                    item {
                        state.subscription?.let { subscription ->
                            ElevatedCard(
                                colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                                shape = MaterialTheme.shapes.extraLarge,
                            ) {
                                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Membership", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSecondaryContainer)
                                    Text(subscription.planName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSecondaryContainer)
                                    Text("${subscription.daysLeft} days left", color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.82f))
                                }
                            }
                        } ?: InfoCard(title = "Monthly plan", body = "No active subscription right now. Start one whenever you want a steady meal routine.")
                    }
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
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
                            SettingsListItem(
                                title = "My orders",
                                supportingText = "Active and delivered meals in one place",
                                leadingIcon = Icons.AutoMirrored.Outlined.ReceiptLong,
                            )
                        }
                    }
                }

                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                    contentPadding = PaddingValues(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    item {
                        ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
                            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text("Saved addresses", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                if (session.user.addresses.isEmpty()) {
                                    Text("No saved address yet. Add one during checkout and it will appear here.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                } else {
                                    session.user.addresses.forEach { address ->
                                        Surface(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.42f), shape = MaterialTheme.shapes.large) {
                                            Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Text(address.fullAddress, fontWeight = FontWeight.Medium)
                                                val supporting = listOf(address.landmark, address.pincode).filter { it.isNotBlank() }.joinToString(" • ")
                                                if (supporting.isNotBlank()) {
                                                    Text(supporting, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = adaptiveState.horizontalPadding, end = adaptiveState.horizontalPadding, top = 18.dp, bottom = 120.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                item {
                    ProfileHeroCard(
                        name = session.user.name,
                        email = session.user.email,
                        phone = session.user.phoneNumber,
                        rewardsCount = state.rewardCoupons.count { it.status == "active" },
                        planLabel = state.subscription?.planName ?: "No active plan",
                    )
                }
                item {
                    state.subscription?.let { subscription ->
                        ElevatedCard(
                            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                            shape = MaterialTheme.shapes.extraLarge,
                        ) {
                            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Membership", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSecondaryContainer)
                                Text(subscription.planName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSecondaryContainer)
                                Text("${subscription.daysLeft} days left", color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.82f))
                            }
                        }
                    } ?: InfoCard(title = "Monthly plan", body = "No active subscription right now. Start one whenever you want a steady meal routine.")
                }
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
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
                        SettingsListItem(
                            title = "My orders",
                            supportingText = "Active and delivered meals in one place",
                            leadingIcon = Icons.AutoMirrored.Outlined.ReceiptLong,
                        )
                    }
                }
                item {
                    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
                        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Saved addresses", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            if (session.user.addresses.isEmpty()) {
                                Text("No saved address yet. Add one during checkout and it will appear here.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            } else {
                                session.user.addresses.forEach { address ->
                                    Surface(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.42f), shape = MaterialTheme.shapes.large) {
                                        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text(address.fullAddress, fontWeight = FontWeight.Medium)
                                            val supporting = listOf(address.landmark, address.pincode).filter { it.isNotBlank() }.joinToString(" • ")
                                            if (supporting.isNotBlank()) {
                                                Text(supporting, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HomeHeroCard(
    settings: com.sardarjifood.app.model.StoreSettings,
    onBrowseAll: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
            Box(modifier = Modifier.fillMaxWidth().height(280.dp)) {
                AsyncFoodImage(
                    image = settings.hero.backgroundImage,
                    contentDescription = settings.hero.headline,
                    modifier = Modifier.fillMaxSize(),
                )
                Box(
                    modifier =
                        Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors =
                                        listOf(
                                            Color.Transparent,
                                            Color(0xB3121314),
                                            Color(0xED121314),
                                        ),
                                ),
                            ),
                )
                Column(
                    modifier = Modifier.align(Alignment.BottomStart).padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    StatusChip(label = settings.tagline.ifBlank { "Fresh & fast" }, tone = StatusChipTone.Warning)
                    Text(settings.hero.headline, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold, color = Color.White)
                    Text(settings.hero.subtext, style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.86f))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        PrimaryActionButton(text = settings.hero.primaryCta.ifBlank { "Order now" }, onClick = onBrowseAll, modifier = Modifier.weight(1f))
                        OutlinedButton(
                            onClick = onBrowseAll,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                        ) {
                            Text(settings.hero.secondaryCta.ifBlank { "View menu" })
                        }
                    }
                }
            }
        }
        Surface(
            modifier = Modifier.fillMaxWidth().clickable(onClick = onBrowseAll),
            shape = MaterialTheme.shapes.extraLarge,
            color = MaterialTheme.colorScheme.surface,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), shape = CircleShape) {
                        Icon(Icons.Outlined.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(11.dp).size(18.dp))
                    }
                    Column {
                        Text("Search dishes, ingredients, combos...", fontWeight = FontWeight.SemiBold)
                        Text("Browse quickly from the full menu", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                    }
                }
                Icon(Icons.Outlined.RestaurantMenu, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickMetricCard(title = "35 min", subtitle = "Avg delivery", modifier = Modifier.weight(1f))
            QuickMetricCard(title = "4.8", subtitle = "Top rated", modifier = Modifier.weight(1f))
            QuickMetricCard(title = "Fresh", subtitle = "Daily made", modifier = Modifier.weight(1f))
        }
    }
}

@Composable
private fun BrowseHero(
    search: String,
    onSearchChange: (String) -> Unit,
    onOpenSort: () -> Unit,
    itemCount: Int,
    sortMode: BrowseSortMode,
) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            SectionHeader(
                title = "Browse menu",
                subtitle = "Search, filter, and add without friction",
                actionLabel = "Sort",
                onAction = onOpenSort,
            )
            OutlinedTextField(
                value = search,
                onValueChange = onSearchChange,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                placeholder = { Text("Search Paneer, Thali, Combo...") },
                singleLine = true,
                shape = MaterialTheme.shapes.extraLarge,
                colors = TextFieldDefaults.colors(),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                StatusChip(label = "$itemCount dishes")
                StatusChip(label = sortModeLabel(sortMode), tone = StatusChipTone.Warning)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CategoryGrid(categoryNames: List<String>, onBrowseAll: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(title = "Quick categories", subtitle = "Jump straight to what you feel like eating", actionLabel = "View all", onAction = onBrowseAll)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            categoryNames.take(8).forEach { name ->
                Surface(
                    modifier = Modifier.width(154.dp).clickable(onClick = onBrowseAll),
                    shape = MaterialTheme.shapes.large,
                    color = MaterialTheme.colorScheme.surface,
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), shape = CircleShape) {
                            Icon(Icons.Outlined.RestaurantMenu, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(9.dp).size(16.dp))
                        }
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
            items(products, key = { it.id }) { product ->
                Box(modifier = Modifier.width(242.dp)) {
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
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeader(title = "Why people trust us", subtitle = "Small details that make ordering feel easier")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                visiblePoints.forEach { point ->
                    StatusChip(label = point, tone = StatusChipTone.Success)
                }
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
    ElevatedCard(onClick = onOpenProduct, shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(14.dp).animateContentSize(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Box {
                SquareFoodImage(image = product.image, modifier = Modifier.height(190.dp))
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
                        tint = if (isFavorite) MaterialTheme.colorScheme.primary else Color.White,
                    )
                }
            }
            Text(product.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.titleMedium)
            Text(
                product.description.ifBlank { product.category },
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold, style = MaterialTheme.typography.titleLarge)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Star, contentDescription = null, modifier = Modifier.size(15.dp), tint = MaterialTheme.colorScheme.tertiary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(product.badge.ifBlank { if (product.isVeg) "Pure veg" else "Chef special" }, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                    }
                }
                PrimaryAddButton(onClick = {
                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    onAddTapped()
                })
            }
        }
    }
}

@Composable
private fun MenuFeatureCard(
    product: Product,
    isFavorite: Boolean,
    onToggleFavorite: () -> Unit,
    onOpenProduct: () -> Unit,
    onAddTapped: () -> Unit,
) {
    ElevatedCard(onClick = onOpenProduct, shape = MaterialTheme.shapes.extraLarge) {
        Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
            Box(modifier = Modifier.fillMaxWidth().height(220.dp)) {
                AsyncFoodImage(image = product.image, contentDescription = product.name, modifier = Modifier.fillMaxSize())
                Box(
                    modifier =
                        Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors =
                                        listOf(
                                            Color.Transparent,
                                            Color(0xC0121314),
                                        ),
                                ),
                            ),
                )
                Row(
                    modifier = Modifier.align(Alignment.TopStart).padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    if (product.badge.isNotBlank()) {
                        StatusChip(label = product.badge.replaceFirstChar { it.uppercase() }, tone = StatusChipTone.Warning)
                    }
                }
                IconButton(onClick = onToggleFavorite, modifier = Modifier.align(Alignment.TopEnd).padding(6.dp)) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Outlined.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isFavorite) MaterialTheme.colorScheme.primaryContainer else Color.White,
                    )
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(product.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(product.description.ifBlank { product.category }, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(formatCurrency(product.price), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                        StatusChip(label = if (product.isVeg) "Veg" else "Special", tone = if (product.isVeg) StatusChipTone.Success else StatusChipTone.Warning)
                    }
                }
                PrimaryActionButton(text = "Add", onClick = onAddTapped, modifier = Modifier.width(104.dp))
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: Order,
    onOpenOrder: () -> Unit,
    onReorder: () -> Unit,
) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(order.orderNumber, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    StatusChip(label = formatStatusLabel(order.status), tone = statusTone(order.status))
                }
                Text(formatCurrency(order.total), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
            }
            Text(
                "${order.items.sumOf { it.quantity }} items • ${order.address.fullAddress.ifBlank { "Address from checkout" }}",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (order.status.lowercase() !in setOf("delivered", "cancelled")) {
                DeliveryProgressBar(progress = orderProgress(order.status))
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onOpenOrder, modifier = Modifier.weight(1f)) {
                    Text(if (order.status.lowercase() == "delivered") "Open summary" else "Track order")
                }
                OutlinedButton(onClick = onReorder, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Outlined.Refresh, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reorder")
                }
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
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(modifier = Modifier.width(92.dp)) {
                SquareFoodImage(image = line.image)
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(line.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    StatusChip(label = if (line.isVeg) "Veg" else "Chef", tone = if (line.isVeg) StatusChipTone.Success else StatusChipTone.Warning)
                }
                if (line.addonSummary.isNotBlank()) {
                    Text(line.addonSummary, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(formatCurrency(line.price * line.quantity), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleMedium)
                    AnimatedQuantityStepper(quantity = line.quantity, onDecrease = onDecrease, onIncrease = onIncrease)
                }
                TextButton(onClick = onRemove, modifier = Modifier.align(Alignment.End)) {
                    Text("Remove", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
private fun LiveTrackingPreviewCard(order: Order, onOpenOrder: () -> Unit) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Box(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(
                            colors =
                                listOf(
                                    MaterialTheme.colorScheme.surface,
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.68f),
                                ),
                        ),
                    ).padding(18.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Live order", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                        Text(order.orderNumber, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                        Text(order.items.joinToString(limit = 2, truncated = " + more") { it.name }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    StatusChip(label = estimateLabel(order, DeliveryRules()), tone = StatusChipTone.Warning)
                }
                DeliveryProgressBar(progress = orderProgress(order.status))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.DeliveryDining, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Text(progressNarrative(order), color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                }
                PrimaryActionButton(text = "Open tracking", onClick = onOpenOrder, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun TrackingHeroCard(order: Order, rules: DeliveryRules, progress: Float) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Box(modifier = Modifier.fillMaxWidth().height(300.dp)) {
            Box(
                modifier =
                    Modifier
                        .fillMaxSize()
                        .background(
                            Brush.linearGradient(
                                colors =
                                    listOf(
                                        Color(0xFF1E2124),
                                        Color(0xFF111315),
                                    ),
                            ),
                        ),
            )
            Box(
                modifier =
                    Modifier
                        .align(Alignment.Center)
                        .size(72.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.DeliveryDining, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer, modifier = Modifier.size(34.dp))
            }
            Box(
                modifier =
                    Modifier
                        .align(Alignment.BottomStart)
                        .padding(20.dp),
            ) {
                Surface(color = Color.White.copy(alpha = 0.1f), shape = MaterialTheme.shapes.extraLarge) {
                    Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(estimateLabel(order, rules), color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                        Text(progressNarrative(order), color = Color.White.copy(alpha = 0.8f))
                    }
                }
            }
            Icon(
                Icons.Outlined.Home,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.align(Alignment.BottomStart).padding(start = 30.dp, bottom = 92.dp).size(22.dp),
            )
            DeliveryProgressBar(
                progress = progress,
                modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(horizontal = 20.dp, vertical = 18.dp),
                container = Color.White.copy(alpha = 0.16f),
                fill = MaterialTheme.colorScheme.primaryContainer,
            )
        }
    }
}

@Composable
private fun DeliveryPartnerCard(order: Order) {
    val partnerName = order.assignedDeliveryBoyName.ifBlank { "Delivery partner" }
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(18.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                InitialsAvatar(name = partnerName, modifier = Modifier.size(56.dp))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(partnerName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(if (order.assignedDeliveryBoyName.isBlank()) "Assignment in progress" else "Ready to help with this delivery", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SmallActionCircle(icon = Icons.Outlined.ChatBubbleOutline)
                SmallActionCircle(icon = Icons.Outlined.Call)
            }
        }
    }
}

@Composable
private fun TrackingTimelineCard(steps: List<TrackStep>) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            SectionHeader(title = "Order progress", subtitle = "Clear status updates from kitchen to doorstep")
            steps.forEach { step ->
                TrackingStepRow(step = step)
            }
        }
    }
}

@Composable
private fun OrderSummaryCard(order: Order) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeader(title = "Order summary", subtitle = "Everything packed into this delivery")
            StatusChip(label = formatStatusLabel(order.status), tone = statusTone(order.status))
            SummaryRow(label = "Items", value = order.items.sumOf { it.quantity }.toString())
            SummaryRow(label = "Delivery address", value = order.address.fullAddress.ifBlank { "Address from checkout" })
            SummaryRow(label = "Total", value = formatCurrency(order.total), highlight = true)
            order.items.forEach { item ->
                Surface(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.42f), shape = MaterialTheme.shapes.large) {
                    Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("${item.quantity}x ${item.name}", fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                            Text(formatCurrency(item.price * item.quantity), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }
                        if (item.addonSummary.isNotBlank()) {
                            Text(item.addonSummary, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AddressPreviewCard(addressLine: String, landmark: String, etaMinutes: Int) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(18.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), shape = CircleShape) {
                Icon(Icons.Outlined.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(10.dp).size(20.dp))
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Deliver to", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text(if (addressLine.isBlank()) "Add your address during checkout" else addressLine, fontWeight = FontWeight.Bold)
                if (landmark.isNotBlank()) {
                    Text(landmark, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Text("$etaMinutes-${etaMinutes + 10} mins", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun StatusBanner(title: String, detail: String, tone: StatusChipTone) {
    ElevatedCard(
        shape = MaterialTheme.shapes.extraLarge,
        colors =
            CardDefaults.elevatedCardColors(
                containerColor =
                    when (tone) {
                        StatusChipTone.Success -> MaterialTheme.colorScheme.secondaryContainer
                        StatusChipTone.Warning -> MaterialTheme.colorScheme.tertiaryContainer
                        StatusChipTone.Error -> MaterialTheme.colorScheme.errorContainer
                        StatusChipTone.Neutral -> MaterialTheme.colorScheme.surface
                    },
            ),
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(detail)
        }
    }
}

@Composable
private fun BillDetailsCard(pricing: com.sardarjifood.app.model.CartPricing) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            SectionHeader(title = "Bill details", subtitle = "Transparent totals before you place the order")
            SummaryRow("Item total", formatCurrency(pricing.subtotal))
            SummaryRow(pricing.deliveryFeeLabel, if (pricing.deliveryFee == 0) "FREE" else formatCurrency(pricing.deliveryFee))
            if (pricing.discount > 0) {
                SummaryRow("Savings", "-${formatCurrency(pricing.discount)}")
            }
            SummaryRow("Total", formatCurrency(pricing.total), highlight = true)
        }
    }
}

@Composable
private fun ProfileHeroCard(
    name: String,
    email: String,
    phone: String,
    rewardsCount: Int,
    planLabel: String,
) {
    ElevatedCard(shape = MaterialTheme.shapes.extraLarge) {
        Column(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            InitialsAvatar(name = name, modifier = Modifier.size(88.dp))
            Text(name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
            Text(email, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
            Text(phone.ifBlank { "Phone number not added yet" }, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                QuickMetricCard(title = rewardsCount.toString(), subtitle = "Coupons", modifier = Modifier.weight(1f))
                QuickMetricCard(title = if (planLabel == "No active plan") "Basic" else "Active", subtitle = planLabel, modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun QuickMetricCard(title: String, subtitle: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun SmallActionCircle(icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.55f)) {
        IconButton(onClick = { }) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun PrimaryAddButton(onClick: () -> Unit) {
    Surface(
        modifier = Modifier.clickable(onClick = onClick),
        shape = CircleShape,
        color = MaterialTheme.colorScheme.primaryContainer,
    ) {
        Box(modifier = Modifier.size(42.dp), contentAlignment = Alignment.Center) {
            Icon(Icons.Outlined.Add, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
        }
    }
}

@Composable
private fun DeliveryProgressBar(
    progress: Float,
    modifier: Modifier = Modifier,
    container: Color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
    fill: Color = MaterialTheme.colorScheme.primary,
) {
    Box(
        modifier =
            modifier
                .fillMaxWidth()
                .height(8.dp)
                .background(container, MaterialTheme.shapes.extraLarge),
    ) {
        Box(
            modifier =
                Modifier
                    .fillMaxWidth(progress.coerceIn(0.08f, 1f))
                    .height(8.dp)
                    .background(fill, MaterialTheme.shapes.extraLarge),
        )
    }
}

@Composable
private fun TrackingStepRow(step: TrackStep) {
    val accent =
        when (step.state) {
            TrackStepState.COMPLETED -> MaterialTheme.colorScheme.primary
            TrackStepState.ACTIVE -> MaterialTheme.colorScheme.primaryContainer
            TrackStepState.UPCOMING -> MaterialTheme.colorScheme.outline
        }

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
        Box(
            modifier =
                Modifier
                    .padding(top = 4.dp)
                    .size(18.dp)
                    .background(accent, CircleShape),
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
            Text(step.title, fontWeight = FontWeight.Bold, color = if (step.state == TrackStepState.UPCOMING) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface)
            Text(step.detail, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun buildTrackSteps(order: Order): List<TrackStep> {
    val index = statusIndex(order.status)
    val labels =
        listOf(
            "Order confirmed" to (order.createdAt.ifBlank { "We received your request" }),
            "Kitchen preparing" to "Your meal is being packed fresh",
            "Out for delivery" to if (order.assignedDeliveryBoyName.isBlank()) "A rider will be assigned shortly" else "${order.assignedDeliveryBoyName} is heading your way",
            "Delivered" to if (order.deliveredAt.isBlank()) "Final handoff pending" else order.deliveredAt,
        )

    return labels.mapIndexed { stepIndex, (title, detail) ->
        TrackStep(
            title = title,
            detail = detail,
            state =
                when {
                    order.status.lowercase() == "cancelled" && stepIndex == index.coerceAtLeast(0) -> TrackStepState.ACTIVE
                    stepIndex < index -> TrackStepState.COMPLETED
                    stepIndex == index -> TrackStepState.ACTIVE
                    else -> TrackStepState.UPCOMING
                },
        )
    }
}

private fun statusIndex(status: String): Int =
    when (status.lowercase()) {
        "pending", "confirmed", "accepted", "placed" -> 0
        "preparing", "processing", "cooking", "ready" -> 1
        "out_for_delivery", "assigned", "picked_up", "on_the_way" -> 2
        "delivered" -> 3
        "cancelled" -> 1
        else -> 0
    }

private fun orderProgress(status: String): Float =
    when (status.lowercase()) {
        "pending", "confirmed", "accepted", "placed" -> 0.22f
        "preparing", "processing", "cooking", "ready" -> 0.48f
        "out_for_delivery", "assigned", "picked_up", "on_the_way" -> 0.78f
        "delivered" -> 1f
        "cancelled" -> 0.2f
        else -> 0.18f
    }

private fun formatStatusLabel(status: String): String =
    status.replace('_', ' ').replaceFirstChar { it.uppercase() }

private fun statusTone(status: String): StatusChipTone =
    when (status.lowercase()) {
        "delivered" -> StatusChipTone.Success
        "cancelled" -> StatusChipTone.Error
        else -> StatusChipTone.Warning
    }

private fun progressNarrative(order: Order): String =
    when (order.status.lowercase()) {
        "pending", "confirmed", "accepted", "placed" -> "Your order has been confirmed and queued for prep."
        "preparing", "processing", "cooking", "ready" -> "The kitchen is preparing your meal right now."
        "out_for_delivery", "assigned", "picked_up", "on_the_way" -> "Your food is on the way and getting close."
        "delivered" -> "Your order has been delivered."
        "cancelled" -> "This order was cancelled."
        else -> "We’re updating your order status."
    }

private fun estimateLabel(order: Order, rules: DeliveryRules): String =
    when (order.status.lowercase()) {
        "delivered" -> "Delivered"
        "cancelled" -> "Cancelled"
        else -> {
            val value = order.estimatedDeliveryAt.ifBlank { "${rules.estimatedDeliveryMinutes} mins" }
            if (value.contains("min", true)) value else "ETA $value"
        }
    }

private fun sortModeLabel(sortMode: BrowseSortMode): String =
    when (sortMode) {
        BrowseSortMode.RECOMMENDED -> "Recommended"
        BrowseSortMode.PRICE_LOW_TO_HIGH -> "Price: low to high"
        BrowseSortMode.PRICE_HIGH_TO_LOW -> "Price: high to low"
    }
