package com.sardarjifood.app.data.local

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.sardarjifood.app.AppLog
import com.sardarjifood.app.model.AppPreferences
import com.sardarjifood.app.model.ThemeMode
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map

private val Context.appPreferencesDataStore by preferencesDataStore(
    name = "sjfc_native_preferences",
    corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
)

class AppPreferencesStore(private val context: Context) {
    private val themeModeKey = stringPreferencesKey("theme_mode")
    private val notificationsEnabledKey = booleanPreferencesKey("notifications_enabled")
    private val favoriteProductIdsKey = stringSetPreferencesKey("favorite_product_ids")
    private val lastCustomerTabKey = intPreferencesKey("last_customer_tab")
    private val lastDeliverySegmentKey = intPreferencesKey("last_delivery_segment")
    private val _recoveryEvents = MutableSharedFlow<String>(extraBufferCapacity = 2)
    val recoveryEvents = _recoveryEvents.asSharedFlow()

    val preferences: Flow<AppPreferences> =
        context.appPreferencesDataStore.data
            .catch { throwable ->
                if (throwable is CancellationException) throw throwable
                AppLog.warn("PreferencesStore", "App preferences read failed. Resetting to defaults.", throwable)
                recoverStore("App settings were repaired and reset to safe defaults.")
                emit(emptyPreferences())
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
        editSafely("saveThemeMode") { prefs ->
            prefs[themeModeKey] = themeMode.name
        }
    }

    suspend fun setNotificationsEnabled(enabled: Boolean) {
        editSafely("setNotificationsEnabled") { prefs ->
            prefs[notificationsEnabledKey] = enabled
        }
    }

    suspend fun toggleFavoriteProduct(productId: String) {
        if (productId.isBlank()) return
        editSafely("toggleFavoriteProduct") { prefs ->
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
        editSafely("saveLastCustomerTab") { prefs ->
            prefs[lastCustomerTabKey] = index.coerceIn(0, 4)
        }
    }

    suspend fun saveLastDeliverySegment(index: Int) {
        editSafely("saveLastDeliverySegment") { prefs ->
            prefs[lastDeliverySegmentKey] = index.coerceIn(0, 3)
        }
    }

    private fun parseThemeMode(value: String): ThemeMode =
        runCatching { ThemeMode.valueOf(value) }.getOrDefault(ThemeMode.SYSTEM)

    private suspend fun editSafely(actionName: String, block: (MutablePreferences) -> Unit) {
        runCatching {
            context.appPreferencesDataStore.edit(block)
        }.onFailure { throwable ->
            if (throwable is CancellationException) throw throwable
            AppLog.warn("PreferencesStore", "Preferences write failed during $actionName. Resetting to defaults.", throwable)
            recoverStore("App settings were repaired and reset to safe defaults.")
        }
    }

    private suspend fun recoverStore(message: String) {
        runCatching {
            context.appPreferencesDataStore.edit { preferences -> preferences.clear() }
        }.onFailure { throwable ->
            if (throwable is CancellationException) throw throwable
            AppLog.error("PreferencesStore", "Unable to fully clear the damaged preferences datastore.", throwable)
        }
        _recoveryEvents.tryEmit(message)
    }
}
