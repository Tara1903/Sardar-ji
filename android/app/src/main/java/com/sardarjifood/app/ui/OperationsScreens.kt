package com.sardarjifood.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.DeliveryDining
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

private val adminOrderStatuses = listOf("confirmed", "preparing", "nearby", "delivered")

@Composable
fun AdminOverviewScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val newOrders = state.orders.count { it.status.lowercase() in setOf("pending", "confirmed") }
    val kitchen = state.orders.count { it.status.lowercase() == "preparing" }
    val outForDelivery =
        state.orders.count {
            it.status.lowercase() == "out_for_delivery" || it.status.lowercase() == "nearby"
        }
    val pausedProducts = state.products.count { !it.isAvailable }

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Admin command",
                    title = "Run orders, kitchen, and storefront from one premium shell.",
                    body =
                        "The highest-signal queues stay visible first so the team can move quickly without hunting through generic controls.",
                )
            }
            item {
                OpsMetricRow(
                    first = Triple("New orders", newOrders.toString(), StatusChipTone.Warning),
                    second = Triple("Kitchen", kitchen.toString(), StatusChipTone.Warning),
                )
            }
            item {
                OpsMetricRow(
                    first = Triple("On route", outForDelivery.toString(), StatusChipTone.Success),
                    second = Triple("Paused items", pausedProducts.toString(), StatusChipTone.Error),
                )
            }
            item {
                ElevatedCard(
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = MaterialTheme.shapes.extraLarge,
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        SectionHeader(
                            title = "Immediate focus lanes",
                            subtitle = "A cleaner executive view for what blocks customers first.",
                        )
                        OpsPriorityRow(
                            label = "Order confirmation",
                            supporting = "Move new baskets into prep before kitchen load piles up.",
                            tone = StatusChipTone.Warning,
                        )
                        OpsPriorityRow(
                            label = "Kitchen dispatch",
                            supporting = "Push prepared orders into handoff without losing delivery context.",
                            tone = StatusChipTone.Success,
                        )
                        OpsPriorityRow(
                            label = "Catalog health",
                            supporting = "Paused items and low-confidence surfaces stay visible here.",
                            tone = StatusChipTone.Neutral,
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AdminOrdersScreen(viewModel: MainViewModel, adminViewModel: AdminViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adminState by adminViewModel.uiState.collectAsStateWithLifecycle()
    val filteredOrders =
        state.orders.filter { order ->
            when (adminState.ordersFilter) {
                "active" -> order.status.lowercase() !in setOf("delivered", "cancelled")
                "completed" -> order.status.lowercase() in setOf("delivered", "cancelled")
                else -> true
            }
        }

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Order control",
                    title = "High-signal order management without admin clutter.",
                    body = "Review status, totals, and the next best action from one denser queue.",
                )
            }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SelectionChip(label = "All", selected = adminState.ordersFilter == "all") {
                        adminViewModel.setOrdersFilter("all")
                    }
                    SelectionChip(label = "Active", selected = adminState.ordersFilter == "active") {
                        adminViewModel.setOrdersFilter("active")
                    }
                    SelectionChip(label = "Completed", selected = adminState.ordersFilter == "completed") {
                        adminViewModel.setOrdersFilter("completed")
                    }
                }
            }
            if (filteredOrders.isEmpty()) {
                item {
                    EmptyStateCard(
                        title = "No orders in this view",
                        body = "As orders move through the workflow, they will show up in the matching lane here.",
                    )
                }
            } else {
                items(filteredOrders, key = { it.id }) { order ->
                    OpsOrderCard(
                        orderNumber = order.orderNumber,
                        customerName = order.customerName,
                        supporting = "${order.items.sumOf { it.quantity }} items",
                        total = formatCurrency(order.total),
                        status = order.status,
                    ) {
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            adminOrderStatuses.forEach { statusName: String ->
                                SelectionChip(
                                    label = statusName.replaceFirstChar { it.uppercase() },
                                    selected = order.status.equals(statusName, true),
                                ) {
                                    viewModel.updateOrderStatus(order.id, statusName)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun KitchenQueueScreen(viewModel: MainViewModel, adminViewModel: AdminViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val adminState by adminViewModel.uiState.collectAsStateWithLifecycle()
    val kitchenOrders =
        state.orders.filter {
            when (adminState.kitchenFilter) {
                "confirmed" -> it.status.equals("confirmed", true)
                "preparing" -> it.status.equals("preparing", true)
                else -> it.status.lowercase() in setOf("confirmed", "preparing")
            }
        }

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Kitchen queue",
                    title = "Prep states that read clearly under pressure.",
                    body = "Confirmed and preparing orders stay separated so the next kitchen action is obvious.",
                )
            }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SelectionChip(label = "All", selected = adminState.kitchenFilter == "all") {
                        adminViewModel.setKitchenFilter("all")
                    }
                    SelectionChip(label = "Confirmed", selected = adminState.kitchenFilter == "confirmed") {
                        adminViewModel.setKitchenFilter("confirmed")
                    }
                    SelectionChip(label = "Preparing", selected = adminState.kitchenFilter == "preparing") {
                        adminViewModel.setKitchenFilter("preparing")
                    }
                }
            }
            if (kitchenOrders.isEmpty()) {
                item {
                    EmptyStateCard(
                        title = "Kitchen queue is clear",
                        body = "Confirmed and preparing orders will appear here as soon as they need attention.",
                    )
                }
            } else {
                items(kitchenOrders, key = { it.id }) { order ->
                    OpsOrderCard(
                        orderNumber = order.orderNumber,
                        customerName = order.customerName,
                        supporting = "${order.items.sumOf { it.quantity }} items waiting in this lane",
                        total = if (order.status.equals("confirmed", true)) "Confirmed" else "Preparing",
                        status = order.status,
                    ) {
                        PrimaryActionButton(
                            text =
                                if (order.status.equals("confirmed", true)) {
                                    "Start preparing"
                                } else {
                                    "Ready for dispatch"
                                },
                            onClick = {
                                viewModel.updateOrderStatus(
                                    order.id,
                                    if (order.status.equals("confirmed", true)) "preparing" else "nearby",
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon =
                                if (order.status.equals("confirmed", true)) {
                                    Icons.Outlined.Restaurant
                                } else {
                                    Icons.Outlined.DeliveryDining
                                },
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CatalogOperationsScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Catalog control",
                    title = "Keep the menu live, restrained, and easy to maintain.",
                    body = "Availability controls stay close to the item so pausing or restoring dishes is fast.",
                )
            }
            items(state.products, key = { it.id }) { product ->
                ElevatedCard(
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    Row(
                        modifier =
                            Modifier
                                .fillMaxWidth()
                                .padding(18.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.72f),
                            shape = MaterialTheme.shapes.large,
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.18f)),
                        ) {
                            Box(
                                modifier =
                                    Modifier
                                        .padding(horizontal = 14.dp, vertical = 12.dp),
                            ) {
                                androidx.compose.material3.Icon(
                                    imageVector = Icons.Outlined.Inventory2,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                )
                            }
                        }
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(product.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(
                                "${product.category} • ${formatCurrency(product.price)}",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            StatusChip(
                                label = if (product.isAvailable) "Live on storefront" else "Paused from storefront",
                                tone = if (product.isAvailable) StatusChipTone.Success else StatusChipTone.Error,
                            )
                        }
                        OutlinedButton(
                            onClick = { viewModel.toggleProductAvailability(product, !product.isAvailable) },
                            shape = MaterialTheme.shapes.large,
                        ) {
                            Text(if (product.isAvailable) "Pause" else "Restore")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StoreSettingsScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var businessName by rememberSaveable { mutableStateOf(state.settings.businessName) }
    var tagline by rememberSaveable { mutableStateOf(state.settings.tagline) }
    var phone by rememberSaveable { mutableStateOf(state.settings.phoneNumber) }
    var whatsapp by rememberSaveable { mutableStateOf(state.settings.whatsappNumber) }
    var timings by rememberSaveable { mutableStateOf(state.settings.timings) }

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Store settings",
                    title = "Brand and support details that shape the premium customer shell.",
                    body = "Keep the public-facing business profile, support channels, and storefront timing consistent everywhere.",
                )
            }
            item {
                ElevatedCard(
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        OutlinedTextField(
                            value = businessName,
                            onValueChange = { businessName = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Business name") },
                        )
                        OutlinedTextField(
                            value = tagline,
                            onValueChange = { tagline = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Tagline") },
                        )
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Phone number") },
                        )
                        OutlinedTextField(
                            value = whatsapp,
                            onValueChange = { whatsapp = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("WhatsApp number") },
                        )
                        OutlinedTextField(
                            value = timings,
                            onValueChange = { timings = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Timings") },
                        )
                        PrimaryActionButton(
                            text = "Save storefront settings",
                            onClick = { viewModel.updateStorefront(businessName, tagline, phone, whatsapp, timings) },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Outlined.Storefront,
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DeliveryScreen(viewModel: MainViewModel, segment: Int) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val orders =
        state.orders.filter { order ->
            when (segment) {
                0 -> order.status.lowercase() in setOf("confirmed", "preparing", "nearby", "out_for_delivery")
                1 -> order.status.lowercase() in setOf("confirmed", "preparing")
                2 -> order.status.lowercase() in setOf("nearby", "out_for_delivery")
                else -> order.status.lowercase() == "delivered"
            }
        }

    CenteredContentFrame {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OpsHeroCard(
                    eyebrow = "Delivery command",
                    title = "Route, contact, and confirmation in one cleaner workflow.",
                    body = "Pickup, on-route, and delivered states stay separated so field actions remain fast on the move.",
                )
            }
            if (orders.isEmpty()) {
                item {
                    EmptyStateCard(
                        title = "No tasks in this queue",
                        body = "Assigned pickup, route, and completed orders will surface here automatically.",
                    )
                }
            } else {
                items(orders, key = { it.id }) { order ->
                    ElevatedCard(
                        shape = MaterialTheme.shapes.extraLarge,
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                    ) {
                        Column(
                            modifier = Modifier.padding(18.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top,
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(order.orderNumber, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                    Text(order.customerName, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                OpsStatusBadge(order.status)
                            }
                            Text(
                                order.address.fullAddress.ifBlank { "Address not available" },
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                OpsCompactMeta(label = "Total", value = formatCurrency(order.total))
                                OpsCompactMeta(label = "Payment", value = order.paymentMethod)
                            }
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        val uri = Uri.parse("tel:${order.customerPhone}")
                                        context.startActivity(Intent(Intent.ACTION_DIAL, uri))
                                    },
                                ) {
                                    androidx.compose.material3.Icon(Icons.Outlined.Call, contentDescription = null)
                                    Text(" Call")
                                }
                                OutlinedButton(
                                    onClick = {
                                        val uri = Uri.parse("https://wa.me/91${order.customerPhone.filter(Char::isDigit)}")
                                        context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                                    },
                                ) {
                                    androidx.compose.material3.Icon(Icons.Outlined.ChatBubbleOutline, contentDescription = null)
                                    Text(" WhatsApp")
                                }
                                OutlinedButton(
                                    onClick = {
                                        val geo = Uri.parse("geo:0,0?q=${Uri.encode(order.address.fullAddress)}")
                                        context.startActivity(Intent(Intent.ACTION_VIEW, geo))
                                    },
                                ) {
                                    androidx.compose.material3.Icon(Icons.Outlined.Map, contentDescription = null)
                                    Text(" Map")
                                }
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                if (!order.status.equals("nearby", true) && !order.status.equals("delivered", true)) {
                                    PrimaryActionButton(
                                        text = "Start route",
                                        onClick = { viewModel.updateOrderStatus(order.id, "nearby") },
                                        modifier = Modifier.weight(1f),
                                        leadingIcon = Icons.Outlined.DeliveryDining,
                                    )
                                }
                                if (!order.status.equals("delivered", true)) {
                                    PrimaryActionButton(
                                        text = "Delivered",
                                        onClick = { viewModel.updateOrderStatus(order.id, "delivered") },
                                        modifier = Modifier.weight(1f),
                                        leadingIcon = Icons.Outlined.Schedule,
                                    )
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
private fun OpsHeroCard(
    eyebrow: String,
    title: String,
    body: String,
) {
    ElevatedCard(
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.elevatedCardColors(containerColor = Color.Transparent),
    ) {
        Box(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .background(
                        brush =
                            Brush.linearGradient(
                                colors =
                                    listOf(
                                        MaterialTheme.colorScheme.surface,
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.82f),
                                    ),
                            ),
                    ),
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                StatusChip(label = eyebrow, tone = StatusChipTone.Neutral)
                Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                Text(body, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun OpsMetricRow(
    first: Triple<String, String, StatusChipTone>,
    second: Triple<String, String, StatusChipTone>,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        OpsMetricCard(title = first.first, value = first.second, tone = first.third, modifier = Modifier.weight(1f))
        OpsMetricCard(title = second.first, value = second.second, tone = second.third, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun OpsMetricCard(
    title: String,
    value: String,
    tone: StatusChipTone,
    modifier: Modifier = Modifier,
) {
    ElevatedCard(
        modifier = modifier,
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            StatusChip(label = title, tone = tone)
            Text(value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
private fun OpsPriorityRow(
    label: String,
    supporting: String,
    tone: StatusChipTone,
) {
    Surface(
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.58f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.18f)),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            StatusChip(label = label, tone = tone)
            Text(
                supporting,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun OpsOrderCard(
    orderNumber: String,
    customerName: String,
    supporting: String,
    total: String,
    status: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    ElevatedCard(
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            content = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top,
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(orderNumber, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(customerName, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        OpsStatusBadge(status)
                        Text(total, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    }
                }
                Text(supporting, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                content()
            },
        )
    }
}

@Composable
private fun OpsCompactMeta(label: String, value: String) {
    Surface(
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.58f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.16f)),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun OpsStatusBadge(status: String) {
    val tone =
        when {
            status.equals("delivered", true) -> StatusChipTone.Success
            status.equals("preparing", true) -> StatusChipTone.Warning
            status.equals("nearby", true) || status.equals("out_for_delivery", true) -> StatusChipTone.Success
            status.equals("cancelled", true) -> StatusChipTone.Error
            else -> StatusChipTone.Neutral
        }

    StatusChip(
        label = status.replace("_", " ").replaceFirstChar { it.uppercase() },
        tone = tone,
    )
}
