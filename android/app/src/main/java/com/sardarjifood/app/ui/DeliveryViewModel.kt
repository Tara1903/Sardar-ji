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

data class DeliveryUiState(
    val selectedSegment: Int = 0,
)

class DeliveryViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container

    val uiState: StateFlow<DeliveryUiState> =
        container.preferencesStore.preferences
            .map { preferences -> DeliveryUiState(selectedSegment = preferences.lastDeliverySegment) }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = DeliveryUiState(),
            )

    fun selectSegment(index: Int) {
        viewModelScope.launch {
            container.preferencesStore.saveLastDeliverySegment(index)
        }
    }
}
