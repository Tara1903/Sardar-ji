package com.sardarjifood.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.HelpOutline
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sardarjifood.app.model.ThemeMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsRoute(
    settingsViewModel: SettingsViewModel,
    onBack: () -> Unit,
) {
    val state by settingsViewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var showProfileEditor by rememberSaveable { mutableStateOf(false) }
    var showFaq by rememberSaveable { mutableStateOf(false) }

    AppScaffold(
        title = "Settings",
        subtitle = "Theme, profile, alerts, and support",
        topActions = {
            TextButton(onClick = onBack) { Text("Done") }
        },
    ) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 110.dp + padding.calculateBottomPadding()),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = state.session?.user?.name ?: "Guest",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = state.session?.user?.email ?: "Sign in to personalize your app",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            item {
                SettingsSection(
                    title = "Appearance",
                    subtitle = "Switch instantly between light, dark, and system theme",
                ) {
                    ThemeMode.entries.forEach { mode ->
                        SettingsListItem(
                            title = when (mode) {
                                ThemeMode.LIGHT -> "Light mode"
                                ThemeMode.DARK -> "Dark mode"
                                ThemeMode.SYSTEM -> "System default"
                            },
                            supportingText = when (mode) {
                                ThemeMode.LIGHT -> "Bright, warm, and easy to scan"
                                ThemeMode.DARK -> "Dimmer surfaces for low-light use"
                                ThemeMode.SYSTEM -> "Match your phone automatically"
                            },
                            leadingIcon = Icons.Outlined.Palette,
                            trailing = {
                                StatusChip(
                                    label = if (state.preferences.themeMode == mode) "Active" else "Available",
                                    tone = if (state.preferences.themeMode == mode) StatusChipTone.Success else StatusChipTone.Neutral,
                                )
                            },
                            onClick = { settingsViewModel.setThemeMode(mode) },
                        )
                    }
                }
            }

            item {
                SettingsSection(
                    title = "Profile",
                    subtitle = "Keep your ordering identity and receipts up to date",
                ) {
                    SettingsListItem(
                        title = "Edit profile",
                        supportingText = "Update your name and email",
                        leadingIcon = Icons.Outlined.PersonOutline,
                        onClick = { showProfileEditor = true },
                    )
                }
            }

            item {
                SettingsSection(
                    title = "Notifications",
                    subtitle = "Control app-level alerts and prompts",
                ) {
                    SettingsToggleItem(
                        title = "Order notifications",
                        supportingText = "Keep customer and delivery updates visible in the app",
                        leadingIcon = Icons.Outlined.Notifications,
                        checked = state.preferences.notificationsEnabled,
                        onCheckedChange = settingsViewModel::setNotificationsEnabled,
                    )
                }
            }

            item {
                SettingsSection(
                    title = "Help & support",
                    subtitle = "Get answers quickly or contact the team",
                ) {
                    SettingsListItem(
                        title = "FAQ",
                        supportingText = "Ordering, delivery, and account help",
                        leadingIcon = Icons.Outlined.HelpOutline,
                        onClick = { showFaq = true },
                    )
                    SettingsListItem(
                        title = "Contact support",
                        supportingText = "Send an email to the support team",
                        leadingIcon = Icons.Outlined.Email,
                        onClick = {
                            val intent =
                                Intent(
                                    Intent.ACTION_SENDTO,
                                    Uri.parse("mailto:support@sardarjifoodcorner.shop?subject=Sardar Ji Food Corner Support"),
                                )
                            context.startActivity(intent)
                        },
                    )
                }
            }

            item {
                SettingsSection(
                    title = "Account",
                    subtitle = "Manage your login safely",
                ) {
                    SettingsListItem(
                        title = "Log out",
                        supportingText = "End your session on this device",
                        leadingIcon = Icons.Outlined.Logout,
                        onClick = settingsViewModel::logout,
                    )
                    SettingsListItem(
                        title = "Delete account",
                        supportingText = "Coming soon. Contact support if you need help right now.",
                        leadingIcon = Icons.Outlined.DeleteOutline,
                    )
                }
            }
        }
    }

    if (showProfileEditor) {
        ModalBottomSheet(onDismissRequest = { showProfileEditor = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Text("Edit profile", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = state.profileName,
                    onValueChange = settingsViewModel::updateProfileName,
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Name") },
                    singleLine = true,
                )
                OutlinedTextField(
                    value = state.profileEmail,
                    onValueChange = settingsViewModel::updateProfileEmail,
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    singleLine = true,
                )
                PrimaryActionButton(
                    text = "Save profile",
                    onClick = {
                        settingsViewModel.saveProfile()
                        showProfileEditor = false
                    },
                    loading = state.isSavingProfile,
                    modifier = Modifier.fillMaxWidth(),
                )
                TextButton(onClick = { showProfileEditor = false }, modifier = Modifier.fillMaxWidth()) {
                    Text("Cancel")
                }
            }
        }
    }

    if (showFaq) {
        AlertDialog(
            onDismissRequest = { showFaq = false },
            title = { Text("FAQ") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    FaqAnswer("How fast is delivery?", "Most live orders are dispatched within the delivery window shown at checkout.")
                    FaqAnswer("Can I edit my address later?", "Yes. Saved addresses update from checkout and profile screens.")
                    FaqAnswer("How do online payments work?", "Razorpay handles the payment step and the app confirms the order after verification.")
                }
            },
            confirmButton = {
                TextButton(onClick = { showFaq = false }) { Text("Close") }
            },
        )
    }
}

@Composable
private fun SettingsSection(
    title: String,
    subtitle: String,
    content: @Composable () -> Unit,
) {
    ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            content()
        }
    }
}

@Composable
private fun FaqAnswer(question: String, answer: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(question, fontWeight = FontWeight.SemiBold)
        Text(answer, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
