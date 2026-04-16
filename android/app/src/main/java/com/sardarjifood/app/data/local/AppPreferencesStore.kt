package com.sardarjifood.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.sardarjifood.app.model.AppPreferences
import com.sardarjifood.app.model.ThemeMode
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.appPreferencesDataStore by preferencesDataStore(name = "sjfc_native_preferences")

class AppPreferencesStore(private val context: Context) {
    private val themeModeKey = stringPreferencesKey("theme_mode")
    private val notificationsEnabledKey = booleanPreferencesKey("notifications_enabled")
    private val favoriteProductIdsKey = stringSetPreferencesKey("favorite_product_ids")
    private val lastCustomerTabKey = intPreferencesKey("last_customer_tab")
    private val lastDeliverySegmentKey = intPreferencesKey("last_delivery_segment")

    val preferences: Flow<AppPreferences> =
        context.appPreferencesDataStore.data
            .catch { throwable ->
                if (throwable is IOException) {
                    emit(emptyPreferences())
                } else {
                    throw throwable
                }
            }.map { prefs ->
                AppPreferences(
                    themeMode = prefs[themeModeKey]?.let(::parseThemeMode) ?: ThemeMode.SYSTEM,
                    notificationsEnabled = prefs[notificationsEnabledKey] ?: true,
                    favoriteProductIds = prefs[favoriteProductIdsKey] ?: emptySet(),
                    lastCustomerTab = prefs[lastCustomerTabKey] ?: 0,
                    lastDeliverySegment = prefs[lastDeliverySegmentKey] ?: 0,
                )
            }

    suspend fun saveThemeMode(themeMode: ThemeMode) {
        context.appPreferencesDataStore.edit { prefs ->
            prefs[themeModeKey] = themeMode.name
        }
    }

    suspend fun setNotificationsEnabled(enabled: Boolean) {
        context.appPreferencesDataStore.edit { prefs ->
            prefs[notificationsEnabledKey] = enabled
        }
    }

    suspend fun toggleFavoriteProduct(productId: String) {
        if (productId.isBlank()) return
        context.appPreferencesDataStore.edit { prefs ->
            val current = prefs[favoriteProductIdsKey] ?: emptySet()
            prefs[favoriteProductIdsKey] =
                if (current.contains(productId)) {
                    current - productId
                } else {
                    current + productId
                }
        }
    }

    suspend fun saveLastCustomerTab(index: Int) {
        context.appPreferencesDataStore.edit { prefs ->
            prefs[lastCustomerTabKey] = index.coerceIn(0, 4)
        }
    }

    suspend fun saveLastDeliverySegment(index: Int) {
        context.appPreferencesDataStore.edit { prefs ->
            prefs[lastDeliverySegmentKey] = index.coerceIn(0, 3)
        }
    }

    private fun parseThemeMode(value: String): ThemeMode =
        runCatching { ThemeMode.valueOf(value) }.getOrDefault(ThemeMode.SYSTEM)
}
