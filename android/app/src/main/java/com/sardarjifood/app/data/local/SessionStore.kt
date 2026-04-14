package com.sardarjifood.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.sessionDataStore by preferencesDataStore(name = "sjfc_native_session")

class SessionStore(private val context: Context) {
    private val tokenKey = stringPreferencesKey("access_token")

    val tokenFlow: Flow<String?> =
        context.sessionDataStore.data
            .catch { throwable ->
                if (throwable is IOException) {
                    emit(emptyPreferences())
                } else {
                    throw throwable
                }
            }
            .map { preferences -> preferences[tokenKey] }

    suspend fun saveToken(token: String) {
        context.sessionDataStore.edit { preferences ->
            preferences[tokenKey] = token
        }
    }

    suspend fun clear() {
        context.sessionDataStore.edit { preferences ->
            preferences.remove(tokenKey)
        }
    }
}
