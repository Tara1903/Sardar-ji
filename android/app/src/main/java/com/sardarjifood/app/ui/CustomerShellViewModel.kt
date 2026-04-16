package com.sardarjifood.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sardarjifood.app.SardarJiApplication
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class CustomerShellUiState(
    val selectedTab: Int = 0,
    val favoriteProductIds: Set<String> = emptySet(),
)

class CustomerShellViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container

    val uiState: StateFlow<CustomerShellUiState> =
        container.preferencesStore.preferences
            .map { preferences ->
                CustomerShellUiState(
                    selectedTab = preferences.lastCustomerTab,
                    favoriteProductIds = preferences.favoriteProductIds,
                )
            }.stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = CustomerShellUiState(),
            )

    fun selectTab(index: Int) {
        viewModelScope.launch {
            container.preferencesStore.saveLastCustomerTab(index)
        }
    }

    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            container.preferencesStore.toggleFavoriteProduct(productId)
        }
    }
}
