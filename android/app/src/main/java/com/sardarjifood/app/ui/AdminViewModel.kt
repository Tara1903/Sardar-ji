package com.sardarjifood.app.ui

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AdminUiState(
    val ordersFilter: String = "all",
    val kitchenFilter: String = "all",
)

class AdminViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AdminUiState())
    val uiState: StateFlow<AdminUiState> = _uiState.asStateFlow()

    fun setOrdersFilter(filter: String) {
        _uiState.value = _uiState.value.copy(ordersFilter = filter)
    }

    fun setKitchenFilter(filter: String) {
        _uiState.value = _uiState.value.copy(kitchenFilter = filter)
    }
}
