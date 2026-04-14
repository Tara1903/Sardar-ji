package com.sardarjifood.app.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.sardarjifood.app.MainActivity
import com.sardarjifood.app.PendingPaymentContext
import com.sardarjifood.app.data.repository.RazorpayCheckoutPayload
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.Product

private data class AppTab(val label: String, val icon: ImageVector)

@Composable
fun NativeFoodApp(
    viewModel: MainViewModel,
    initialDeepLink: String? = null,
    onLaunchRazorpay: (RazorpayCheckoutPayload, PendingPaymentContext) -> Unit,
) {
    val navController = rememberNavController()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val cartLines by viewModel.cartLines.collectAsStateWithLifecycle()
    val snackbars = remember { SnackbarHostState() }

    LaunchedEffect(state.errorMessage, state.noticeMessage) {
        val message = state.errorMessage ?: state.noticeMessage
        if (!message.isNullOrBlank()) {
            snackbars.showSnackbar(message)
            viewModel.dismissMessages()
        }
    }

    LaunchedEffect(state.session?.user?.role, initialDeepLink) {
        val roleRoute =
            when (state.session?.user?.role ?: AppRole.CUSTOMER) {
                AppRole.ADMIN -> "admin"
                AppRole.DELIVERY -> "delivery"
                AppRole.CUSTOMER -> "customer"
            }
        if (navController.currentDestination == null) {
            navController.navigate(roleRoute) {
                popUpTo(0)
            }
        }

        initialDeepLink?.let { deepLink ->
            when {
                deepLink.contains("/cart") -> navController.navigate("customer?tab=3")
                deepLink.contains("/track/") || deepLink.contains("/orders") -> navController.navigate("customer?tab=2")
                deepLink.contains("/menu") -> navController.navigate("customer?tab=1")
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbars) },
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
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
                        viewModel = viewModel,
                        cartCount = cartLines.sumOf { it.quantity },
                        onShowAuth = { navController.navigate("auth") },
                        onOpenProduct = { product -> navController.navigate("product/${product.id}") },
                        onCheckout = { navController.navigate("checkout") },
                    )
                }
                composable("admin") {
                    AdminShell(viewModel = viewModel)
                }
                composable("delivery") {
                    DeliveryShell(viewModel = viewModel)
                }
                composable("auth") {
                    AuthScreen(
                        viewModel = viewModel,
                        onDone = {
                            val destination =
                                when (viewModel.currentRole) {
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
                composable(
                    route = "product/{id}",
                    arguments = listOf(navArgument("id") { type = NavType.StringType }),
                ) { backStackEntry ->
                    val product = state.products.firstOrNull { it.id == backStackEntry.arguments?.getString("id") }
                    ProductDetailRoute(
                        product = product,
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() },
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
            }
        }
    }
}

@Composable
private fun CustomerShell(
    initialTab: Int,
    viewModel: MainViewModel,
    cartCount: Int,
    onShowAuth: () -> Unit,
    onOpenProduct: (Product) -> Unit,
    onCheckout: () -> Unit,
) {
    var selectedTab by rememberSaveable { mutableIntStateOf(initialTab.coerceIn(0, 4)) }
    val tabs =
        listOf(
            AppTab("Home", Icons.Outlined.Home),
            AppTab("Browse", Icons.Outlined.RestaurantMenu),
            AppTab("Orders", Icons.Outlined.ListAlt),
            AppTab("Cart", Icons.Outlined.ShoppingCart),
            AppTab("Profile", Icons.Outlined.Person),
        )

    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = {
                            if (index == 3 && cartCount > 0) {
                                BadgedBox(
                                    badge = { Badge { Text(cartCount.toString()) } },
                                ) {
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
            label = "customer-tab",
            modifier = Modifier.padding(padding),
        ) { tabIndex ->
            when (tabIndex) {
                0 -> CustomerHomeScreen(viewModel = viewModel, onOpenProduct = onOpenProduct, onBrowseAll = { selectedTab = 1 })
                1 -> BrowseScreen(viewModel = viewModel, onOpenProduct = onOpenProduct)
                2 -> OrdersScreen(viewModel = viewModel, onShowAuth = onShowAuth)
                3 -> CartScreen(viewModel = viewModel, onShowAuth = onShowAuth, onCheckout = onCheckout)
                else -> ProfileScreen(viewModel = viewModel, onShowAuth = onShowAuth)
            }
        }
    }
}

@Composable
private fun AdminShell(viewModel: MainViewModel) {
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    val tabs =
        listOf(
            AppTab("Overview", Icons.Outlined.Home),
            AppTab("Orders", Icons.Outlined.ShoppingBag),
            AppTab("Kitchen", Icons.Outlined.RestaurantMenu),
            AppTab("Catalog", Icons.Outlined.Inventory2),
            AppTab("Store", Icons.Outlined.Settings),
        )

    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
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
                1 -> AdminOrdersScreen(viewModel)
                2 -> KitchenQueueScreen(viewModel)
                3 -> CatalogOperationsScreen(viewModel)
                else -> StoreSettingsScreen(viewModel)
            }
        }
    }
}

@Composable
private fun DeliveryShell(viewModel: MainViewModel) {
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    val tabs =
        listOf(
            AppTab("Active", Icons.Outlined.LocalShipping),
            AppTab("Pickup", Icons.Outlined.Storefront),
            AppTab("On route", Icons.Outlined.RestaurantMenu),
            AppTab("Done", Icons.Outlined.ListAlt),
        )

    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            DeliveryScreen(viewModel = viewModel, segment = selectedTab)
        }
    }
}
