package com.sardarjifood.app.data.local

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.sardarjifood.app.AppLog
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.sessionDataStore by preferencesDataStore(
    name = "sjfc_native_session",
    corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
)

class SessionStore(private val context: Context) {
    private val tokenKey = stringPreferencesKey("access_token")
    private val _recoveryEvents = MutableSharedFlow<String>(extraBufferCapacity = 2)
    val recoveryEvents = _recoveryEvents.asSharedFlow()

    val tokenFlow: Flow<String?> =
        context.sessionDataStore.data
            .catch { throwable ->
                if (throwable is CancellationException) throw throwable
                AppLog.warn("SessionStore", "Session datastore read failed. Resetting local session state.", throwable)
                recoverStore("Your saved sign-in data was repaired. Please sign in again if needed.")
                emit(emptyPreferences())
            }
            .map { preferences -> preferences[tokenKey] }

    suspend fun saveToken(token: String) {
        editSafely("saveToken") { preferences ->
            preferences[tokenKey] = token
        }
    }

    suspend fun clear() {
        editSafely("clear") { preferences ->
            preferences.remove(tokenKey)
        }
    }

    private suspend fun editSafely(actionName: String, block: (MutablePreferences) -> Unit) {
        runCatching {
            context.sessionDataStore.edit(block)
        }.onFailure { throwable ->
            if (throwable is CancellationException) throw throwable
            AppLog.warn("SessionStore", "Session datastore write failed during $actionName. Resetting local session state.", throwable)
            recoverStore("Your saved sign-in data was repaired. Please sign in again if needed.")
        }
    }

    private suspend fun recoverStore(message: String) {
        runCatching {
            context.sessionDataStore.edit { preferences -> preferences.clear() }
        }.onFailure { throwable ->
            if (throwable is CancellationException) throw throwable
            AppLog.error("SessionStore", "Unable to fully clear the damaged session datastore.", throwable)
        }
        _recoveryEvents.tryEmit(message)
    }
}
