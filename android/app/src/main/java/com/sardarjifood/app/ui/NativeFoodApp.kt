package com.sardarjifood.app.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.ListAlt
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.RestaurantMenu
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.sardarjifood.app.PendingPaymentContext
import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.Product
import com.sardarjifood.app.notifications.AdminAlertPlayer

private data class AppTab(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

@Composable
fun NativeFoodApp(
    appStateViewModel: AppStateViewModel,
    viewModel: MainViewModel,
    deepLinkPath: String? = null,
    onLaunchRazorpay: (RazorpayCheckoutPayload, PendingPaymentContext) -> Unit,
) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val appState by appStateViewModel.uiState.collectAsStateWithLifecycle()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val cartLines by viewModel.cartLines.collectAsStateWithLifecycle()
    val authViewModel: AuthViewModel = viewModel()
    val settingsViewModel: SettingsViewModel = viewModel()
    val customerShellViewModel: CustomerShellViewModel = viewModel()
    val deliveryViewModel: DeliveryViewModel = viewModel()
    val adminViewModel: AdminViewModel = viewModel()
    val snackbars = remember { SnackbarHostState() }

    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val settingsState by settingsViewModel.uiState.collectAsStateWithLifecycle()
    val currentRole = appState.session?.user?.role ?: AppRole.CUSTOMER
    val adminAlertPlayer = remember(context) { AdminAlertPlayer(context.applicationContext) }

    DisposableEffect(adminAlertPlayer) {
        onDispose { adminAlertPlayer.release() }
    }

    LaunchedEffect(state.errorMessage, state.noticeMessage, authState.errorMessage, authState.noticeMessage, settingsState.errorMessage, settingsState.noticeMessage) {
        val message =
            state.errorMessage
                ?: state.noticeMessage
                ?: authState.errorMessage
                ?: authState.noticeMessage
                ?: settingsState.errorMessage
                ?: settingsState.noticeMessage
        if (!message.isNullOrBlank()) {
            snackbars.showSnackbar(message)
            viewModel.dismissMessages()
            authViewModel.dismissMessages()
            settingsViewModel.dismissMessages()
        }
    }

    LaunchedEffect(currentRole, appState.session?.user?.id) {
        val roleRoute =
            when (currentRole) {
                AppRole.ADMIN -> "admin"
                AppRole.DELIVERY -> "delivery"
                AppRole.CUSTOMER -> "customer"
            }
        val currentRoute = navController.currentDestination?.route
        if (currentRoute == null) {
            navController.navigate(roleRoute) {
                popUpTo(0)
            }
        } else if (
            (currentRole == AppRole.CUSTOMER && (currentRoute == "admin" || currentRoute == "delivery")) ||
            (currentRole == AppRole.ADMIN && currentRoute == "delivery") ||
            (currentRole == AppRole.DELIVERY && currentRoute == "admin")
        ) {
            navController.navigate(roleRoute) {
                popUpTo(0)
            }
        }

        if (appState.session == null && currentRoute == "settings") {
            navController.navigate("customer") {
                popUpTo(0)
            }
        }
    }

    LaunchedEffect(deepLinkPath, currentRole, appState.session?.user?.id) {
        if (!deepLinkPath.isNullOrBlank()) {
            openAppDeepLink(
                deepLink = deepLinkPath,
                currentRole = currentRole,
                navController = navController,
                customerShellViewModel = customerShellViewModel,
                adminViewModel = adminViewModel,
                deliveryViewModel = deliveryViewModel,
            )
        }
    }

    LaunchedEffect(currentRole, appState.preferences.notificationsEnabled) {
        viewModel.notificationEvents.collect { event ->
            if (event.role != currentRole || !appState.preferences.notificationsEnabled) {
                return@collect
            }

            if (event.role == AppRole.ADMIN) {
                adminAlertPlayer.playNewOrderAlert(event.announcement.ifBlank { event.title })
            }

            val result =
                snackbars.showSnackbar(
                    message = event.message,
                    actionLabel =
                        when (event.role) {
                            AppRole.CUSTOMER -> "Track"
                            AppRole.ADMIN -> "Open"
                            AppRole.DELIVERY -> "View"
                        },
                )

            if (result == SnackbarResult.ActionPerformed) {
                openAppDeepLink(
                    deepLink = event.deepLink,
                    currentRole = currentRole,
                    navController = navController,
                    customerShellViewModel = customerShellViewModel,
                    adminViewModel = adminViewModel,
                    deliveryViewModel = deliveryViewModel,
                )
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbars) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            OfflineNotice(visible = !state.networkAvailable)
            Box(modifier = Modifier.fillMaxSize()) {
                NavHost(
                    navController = navController,
                    startDestination = "customer",
                ) {
                    composable(
                        route = "customer?tab={tab}",
                        arguments = listOf(navArgument("tab") { type = NavType.IntType; defaultValue = 0 }),
                    ) { entry ->
                        CustomerShell(
                            initialTab = entry.arguments?.getInt("tab") ?: 0,
                            shellViewModel = customerShellViewModel,
                            viewModel = viewModel,
                            cartCount = cartLines.sumOf { it.quantity },
                            onShowAuth = { navController.navigate("auth") },
                            onOpenProduct = { product -> navController.navigate("product/${product.id}") },
                            onOpenOrder = { orderId -> navController.navigate("order/$orderId") },
                            onCheckout = { navController.navigate("checkout") },
                            onOpenSettings = { navController.navigate("settings") },
                        )
                    }
                    composable("admin") {
                        AdminShell(
                            viewModel = viewModel,
                            adminViewModel = adminViewModel,
                            onOpenSettings = { navController.navigate("settings") },
                        )
                    }
                    composable("delivery") {
                        DeliveryShell(
                            viewModel = viewModel,
                            deliveryViewModel = deliveryViewModel,
                            onOpenSettings = { navController.navigate("settings") },
                        )
                    }
                    composable("auth") {
                        AuthScreen(
                            authViewModel = authViewModel,
                            session = state.session,
                            onDone = {
                                val destination =
                                    when (currentRole) {
                                        AppRole.ADMIN -> "admin"
                                        AppRole.DELIVERY -> "delivery"
                                        AppRole.CUSTOMER -> "customer"
                                    }
                                navController.navigate(destination) {
                                    popUpTo("auth") { inclusive = true }
                                }
                            },
                        )
                    }
                    composable("settings") {
                        SettingsRoute(
                            settingsViewModel = settingsViewModel,
                            onBack = { navController.popBackStack() },
                        )
                    }
                    composable(
                        route = "product/{id}",
                        arguments = listOf(navArgument("id") { type = NavType.StringType }),
                    ) { backStackEntry ->
                        val product = state.products.firstOrNull { it.id == backStackEntry.arguments?.getString("id") }
                        ProductDetailRoute(
                            product = product,
                            viewModel = viewModel,
                            onBack = { navController.popBackStack() },
                            favoriteProductIds = customerShellViewModel.uiState.value.favoriteProductIds,
                            onToggleFavorite = customerShellViewModel::toggleFavorite,
                        )
                    }
                    composable("checkout") {
                        CheckoutRoute(
                            viewModel = viewModel,
                            onBack = { navController.popBackStack() },
                            onOrderPlaced = { navController.navigate("customer?tab=2") },
                            onLaunchRazorpay = onLaunchRazorpay,
                        )
                    }
                    composable(
                        route = "order/{id}",
                        arguments = listOf(navArgument("id") { type = NavType.StringType }),
                    ) { backStackEntry ->
                        OrderDetailRoute(
                            orderId = backStackEntry.arguments?.getString("id").orEmpty(),
                            viewModel = viewModel,
                            onBack = { navController.popBackStack() },
                            onShowAuth = { navController.navigate("auth") },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CustomerShell(
    initialTab: Int,
    shellViewModel: CustomerShellViewModel,
    viewModel: MainViewModel,
    cartCount: Int,
    onShowAuth: () -> Unit,
    onOpenProduct: (Product) -> Unit,
    onOpenOrder: (String) -> Unit,
    onCheckout: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    val shellState by shellViewModel.uiState.collectAsStateWithLifecycle()
    val selectedTab = shellState.selectedTab
    val tabs =
        listOf(
            AppTab("Home", Icons.Outlined.Home),
            AppTab("Browse", Icons.Outlined.RestaurantMenu),
            AppTab("Orders", Icons.Outlined.ListAlt),
            AppTab("Cart", Icons.Outlined.ShoppingCart),
            AppTab("Profile", Icons.Outlined.Person),
        )

    LaunchedEffect(initialTab) {
        if (initialTab != shellState.selectedTab) {
            shellViewModel.selectTab(initialTab)
        }
    }

    AppScaffold(
        title = tabs[selectedTab].label,
        subtitle =
            when (selectedTab) {
                0 -> "Fresh, fast, and ready to order"
                1 -> "Search, filter, and add quickly"
                2 -> "Track active orders and reorder easily"
                3 -> "Review items and head to checkout"
                else -> "Your account, rewards, and settings"
            },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { shellViewModel.selectTab(index) },
                        icon = {
                            if (index == 3 && cartCount > 0) {
                                BadgedBox(badge = { Badge { Text(cartCount.toString()) } }) {
                                    Icon(tab.icon, contentDescription = tab.label)
                                }
                            } else {
                                Icon(tab.icon, contentDescription = tab.label)
                            }
                        },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        AnimatedContent(
            targetState = selectedTab,
            transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(180)) },
            label = "customer-tab",
            modifier = Modifier.padding(padding),
        ) { tabIndex ->
            when (tabIndex) {
                0 ->
                    CustomerHomeScreen(
                        viewModel = viewModel,
                        favoriteProductIds = shellState.favoriteProductIds,
                        onToggleFavorite = shellViewModel::toggleFavorite,
                        onOpenProduct = onOpenProduct,
                        onBrowseAll = { shellViewModel.selectTab(1) },
                    )
                1 ->
                    BrowseScreen(
                        viewModel = viewModel,
                        favoriteProductIds = shellState.favoriteProductIds,
                        onToggleFavorite = shellViewModel::toggleFavorite,
                        onOpenProduct = onOpenProduct,
                    )
                2 -> OrdersScreen(viewModel = viewModel, onShowAuth = onShowAuth, onOpenOrder = onOpenOrder)
                3 -> CartScreen(viewModel = viewModel, onShowAuth = onShowAuth, onCheckout = onCheckout)
                else -> ProfileScreen(viewModel = viewModel, onShowAuth = onShowAuth, onOpenSettings = onOpenSettings)
            }
        }
    }
}

@Composable
private fun AdminShell(
    viewModel: MainViewModel,
    adminViewModel: AdminViewModel,
    onOpenSettings: () -> Unit,
) {
    val adminState by adminViewModel.uiState.collectAsStateWithLifecycle()
    val selectedTab = adminState.selectedTab
    val tabs =
        listOf(
            AppTab("Overview", Icons.Outlined.Home),
            AppTab("Orders", Icons.Outlined.ShoppingBag),
            AppTab("Kitchen", Icons.Outlined.RestaurantMenu),
            AppTab("Catalog", Icons.Outlined.Inventory2),
            AppTab("Store", Icons.Outlined.Settings),
        )

    AppScaffold(
        title = tabs[selectedTab].label,
        subtitle = "Operations, kitchen flow, and storefront controls",
        topActions = {
            androidx.compose.material3.TextButton(onClick = onOpenSettings) { Text("Settings") }
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { adminViewModel.selectTab(index) },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                0 -> AdminOverviewScreen(viewModel)
                1 -> AdminOrdersScreen(viewModel = viewModel, adminViewModel = adminViewModel)
                2 -> KitchenQueueScreen(viewModel = viewModel, adminViewModel = adminViewModel)
                3 -> CatalogOperationsScreen(viewModel)
                else -> StoreSettingsScreen(viewModel)
            }
        }
    }
}

@Composable
private fun DeliveryShell(
    viewModel: MainViewModel,
    deliveryViewModel: DeliveryViewModel,
    onOpenSettings: () -> Unit,
) {
    val deliveryState by deliveryViewModel.uiState.collectAsStateWithLifecycle()
    val tabs =
        listOf(
            AppTab("Active", Icons.Outlined.LocalShipping),
            AppTab("Pickup", Icons.Outlined.Storefront),
            AppTab("On route", Icons.Outlined.RestaurantMenu),
            AppTab("Done", Icons.Outlined.ListAlt),
        )

    AppScaffold(
        title = tabs[deliveryState.selectedSegment].label,
        subtitle = "Current assignments and route actions",
        topActions = {
            androidx.compose.material3.TextButton(onClick = onOpenSettings) { Text("Settings") }
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = deliveryState.selectedSegment == index,
                        onClick = { deliveryViewModel.selectSegment(index) },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            DeliveryScreen(viewModel = viewModel, segment = deliveryState.selectedSegment)
        }
    }
}

private fun openAppDeepLink(
    deepLink: String,
    currentRole: AppRole,
    navController: NavHostController,
    customerShellViewModel: CustomerShellViewModel,
    adminViewModel: AdminViewModel,
    deliveryViewModel: DeliveryViewModel,
) {
    val normalized = normalizeAppDeepLink(deepLink)

    when {
        normalized.startsWith("/track/") || normalized.startsWith("/order/") -> {
            val orderId = normalized.substringAfterLast('/').trim()
            customerShellViewModel.selectTab(2)
            if (orderId.isNotBlank()) {
                navController.navigate("order/$orderId") {
                    launchSingleTop = true
                }
            } else {
                navController.navigate("customer?tab=2") {
                    launchSingleTop = true
                }
            }
        }
        normalized.startsWith("/cart") -> {
            customerShellViewModel.selectTab(3)
            navController.navigate("customer?tab=3") { launchSingleTop = true }
        }
        normalized.startsWith("/menu") || normalized.startsWith("/browse") -> {
            customerShellViewModel.selectTab(1)
            navController.navigate("customer?tab=1") { launchSingleTop = true }
        }
        normalized.startsWith("/profile") -> {
            customerShellViewModel.selectTab(4)
            navController.navigate("customer?tab=4") { launchSingleTop = true }
        }
        normalized.startsWith("/admin/orders") || normalized.startsWith("/admin") -> {
            adminViewModel.selectTab(1)
            navController.navigate("admin") { launchSingleTop = true }
        }
        normalized.startsWith("/delivery") -> {
            deliveryViewModel.selectSegment(0)
            navController.navigate("delivery") { launchSingleTop = true }
        }
        currentRole == AppRole.ADMIN -> navController.navigate("admin") { launchSingleTop = true }
        currentRole == AppRole.DELIVERY -> navController.navigate("delivery") { launchSingleTop = true }
        else -> navController.navigate("customer") { launchSingleTop = true }
    }
}

private fun normalizeAppDeepLink(value: String): String {
    val candidate = value.trim()
    return when {
        candidate.isBlank() -> "/orders"
        candidate.startsWith("/") -> candidate
        candidate.startsWith("sjfc://") -> "/${candidate.removePrefix("sjfc://").trimStart('/')}"
        candidate.startsWith("https://www.sardarjifoodcorner.shop") ->
            candidate.removePrefix("https://www.sardarjifoodcorner.shop").ifBlank { "/orders" }
        candidate.startsWith("https://sardarjifoodcorner.shop") ->
            candidate.removePrefix("https://sardarjifoodcorner.shop").ifBlank { "/orders" }
        else -> "/$candidate"
    }
}
