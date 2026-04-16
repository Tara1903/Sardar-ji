package com.sardarjifood.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sardarjifood.app.SardarJiApplication
import com.sardarjifood.app.model.AppPreferences
import com.sardarjifood.app.model.AppRole
import com.sardarjifood.app.model.AppSession
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

data class AppStateUiState(
    val session: AppSession? = null,
    val preferences: AppPreferences = AppPreferences(),
    val networkAvailable: Boolean = true,
)

class AppStateViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container

    val uiState: StateFlow<AppStateUiState> =
        combine(
            container.authRepository.sessionFlow,
            container.preferencesStore.preferences,
            container.networkMonitor.isOnline,
        ) { session, preferences, networkAvailable ->
            AppStateUiState(
                session = session,
                preferences = preferences,
                networkAvailable = networkAvailable,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = AppStateUiState(),
        )

    val currentRole: AppRole
        get() = uiState.value.session?.user?.role ?: AppRole.CUSTOMER
}
