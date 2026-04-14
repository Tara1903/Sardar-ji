package com.sardarjifood.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun AdminOverviewScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val newOrders = state.orders.count { it.status.lowercase() in setOf("pending", "confirmed") }
    val kitchen = state.orders.count { it.status.lowercase() == "preparing" }
    val outForDelivery = state.orders.count { it.status.lowercase() == "out_for_delivery" || it.status.lowercase() == "nearby" }
    val pausedProducts = state.products.count { !it.isAvailable }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Text("Operations overview", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard("New orders", newOrders.toString(), Modifier.weight(1f))
                MetricCard("Kitchen", kitchen.toString(), Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard("On route", outForDelivery.toString(), Modifier.weight(1f))
                MetricCard("Paused items", pausedProducts.toString(), Modifier.weight(1f))
            }
        }
        item {
            InfoCard(
                title = "Task-first admin shell",
                body = "This native app view keeps orders, kitchen actions, catalog toggles, and storefront edits one tap away.",
            )
        }
    }
}

@Composable
fun AdminOrdersScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Order control", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
        items(state.orders) { order ->
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text(order.orderNumber, fontWeight = FontWeight.Bold)
                            Text(order.customerName, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(formatCurrency(order.total), fontWeight = FontWeight.Bold)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("confirmed", "preparing", "nearby", "delivered").forEach { status ->
                            FilterChip(
                                selected = order.status.equals(status, true),
                                onClick = { viewModel.updateOrderStatus(order.id, status) },
                                label = { Text(status.replaceFirstChar { it.uppercase() }) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun KitchenQueueScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val kitchenOrders = state.orders.filter { it.status.lowercase() in setOf("confirmed", "preparing") }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { Text("Kitchen queue", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
        items(kitchenOrders) { order ->
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(order.orderNumber, fontWeight = FontWeight.Bold)
                    Text("${order.items.sumOf { it.quantity }} items • ${order.customerName}")
                    Button(onClick = {
                        viewModel.updateOrderStatus(order.id, if (order.status.equals("confirmed", true)) "preparing" else "nearby")
                    }) {
                        Text(if (order.status.equals("confirmed", true)) "Start preparing" else "Ready for dispatch")
                    }
                }
            }
        }
    }
}

@Composable
fun CatalogOperationsScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { Text("Catalog controls", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
        items(state.products) { product ->
            ElevatedCard {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(product.name, fontWeight = FontWeight.Bold)
                        Text("${product.category} • ${formatCurrency(product.price)}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    FilterChip(
                        selected = product.isAvailable,
                        onClick = { viewModel.toggleProductAvailability(product, !product.isAvailable) },
                        label = { Text(if (product.isAvailable) "Live" else "Paused") },
                    )
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

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { Text("Storefront settings", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
        item { OutlinedTextField(value = businessName, onValueChange = { businessName = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Business name") }) }
        item { OutlinedTextField(value = tagline, onValueChange = { tagline = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Tagline") }) }
        item { OutlinedTextField(value = phone, onValueChange = { phone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Phone number") }) }
        item { OutlinedTextField(value = whatsapp, onValueChange = { whatsapp = it }, modifier = Modifier.fillMaxWidth(), label = { Text("WhatsApp number") }) }
        item { OutlinedTextField(value = timings, onValueChange = { timings = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Timings") }) }
        item {
            Button(onClick = { viewModel.updateStorefront(businessName, tagline, phone, whatsapp, timings) }, modifier = Modifier.fillMaxWidth()) {
                Text("Save store settings")
            }
        }
    }
}

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

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { Text("Delivery workflow", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
        items(orders) { order ->
            ElevatedCard {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(order.orderNumber, fontWeight = FontWeight.Bold)
                    Text(order.address.fullAddress.ifBlank { "Address not available" }, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = {
                            val uri = Uri.parse("tel:${order.customerPhone}")
                            context.startActivity(Intent(Intent.ACTION_DIAL, uri))
                        }) { Text("Call") }
                        Button(onClick = {
                            val uri = Uri.parse("https://wa.me/91${order.customerPhone.filter(Char::isDigit)}")
                            context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                        }) { Text("WhatsApp") }
                        Button(onClick = {
                            val geo = Uri.parse("geo:0,0?q=${Uri.encode(order.address.fullAddress)}")
                            context.startActivity(Intent(Intent.ACTION_VIEW, geo))
                        }) { Text("Map") }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (!order.status.equals("nearby", true) && !order.status.equals("delivered", true)) {
                            Button(onClick = { viewModel.updateOrderStatus(order.id, "nearby") }) { Text("Start route") }
                        }
                        if (!order.status.equals("delivered", true)) {
                            Button(onClick = { viewModel.updateOrderStatus(order.id, "delivered") }) { Text("Delivered") }
                        }
                    }
                }
            }
        }
        if (orders.isEmpty()) {
            item {
                InfoCard(
                    title = "No tasks in this queue",
                    body = "Pickup, on-route, and delivered orders will appear here as soon as they are assigned.",
                )
            }
        }
    }
}

@Composable
private fun MetricCard(title: String, value: String, modifier: Modifier = Modifier) {
    ElevatedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
            Text(title, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
