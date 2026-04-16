package com.sardarjifood.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sardarjifood.app.SardarJiApplication
import com.sardarjifood.app.model.AppPreferences
import com.sardarjifood.app.model.AppSession
import com.sardarjifood.app.model.ThemeMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class SettingsUiState(
    val session: AppSession? = null,
    val preferences: AppPreferences = AppPreferences(),
    val profileName: String = "",
    val profileEmail: String = "",
    val isSavingProfile: Boolean = false,
    val isLoggingOut: Boolean = false,
    val errorMessage: String? = null,
    val noticeMessage: String? = null,
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container
    private val profileDraft = MutableStateFlow(Pair("", ""))
    private val profileBusy = MutableStateFlow(false)
    private val logoutBusy = MutableStateFlow(false)
    private val transientMessage = MutableStateFlow<Pair<String?, String?>>(null to null)
    private val sessionAndPreferences =
        combine(
            container.authRepository.sessionFlow,
            container.preferencesStore.preferences,
        ) { session, preferences -> session to preferences }

    val uiState: StateFlow<SettingsUiState> =
        combine(
            sessionAndPreferences,
            profileDraft,
            profileBusy,
            logoutBusy,
            transientMessage,
        ) { sessionPreferences, draft, savingProfile, loggingOut, message ->
            val session = sessionPreferences.first
            val preferences = sessionPreferences.second
            val effectiveName = draft.first.ifBlank { session?.user?.name.orEmpty() }
            val effectiveEmail = draft.second.ifBlank { session?.user?.email.orEmpty() }
            SettingsUiState(
                session = session,
                preferences = preferences,
                profileName = effectiveName,
                profileEmail = effectiveEmail,
                isSavingProfile = savingProfile,
                isLoggingOut = loggingOut,
                errorMessage = message.first,
                noticeMessage = message.second,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = SettingsUiState(),
        )

    fun updateProfileName(value: String) {
        profileDraft.value = value to profileDraft.value.second
    }

    fun updateProfileEmail(value: String) {
        profileDraft.value = profileDraft.value.first to value
    }

    fun setThemeMode(themeMode: ThemeMode) {
        viewModelScope.launch {
            container.preferencesStore.saveThemeMode(themeMode)
        }
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            container.preferencesStore.setNotificationsEnabled(enabled)
        }
    }

    fun saveProfile() {
        val session = uiState.value.session ?: return
        val name = profileDraft.value.first.ifBlank { session.user.name }
        val email = profileDraft.value.second.ifBlank { session.user.email }

        viewModelScope.launch {
            profileBusy.value = true
            transientMessage.value = null to null
            runCatching { container.authRepository.updateProfile(name = name, email = email) }
                .onSuccess { updated ->
                    profileDraft.value = updated.name to updated.email
                    transientMessage.value = null to "Profile updated. Email changes may need verification."
                }.onFailure { error ->
                    transientMessage.value = (error.message ?: "Unable to save your profile right now.") to null
                }
            profileBusy.value = false
        }
    }

    fun logout() {
        viewModelScope.launch {
            logoutBusy.value = true
            runCatching { container.authRepository.signOut() }
                .onSuccess {
                    transientMessage.value = null to "Signed out"
                }.onFailure { error ->
                    transientMessage.value = (error.message ?: "Unable to sign out right now.") to null
                }
            logoutBusy.value = false
        }
    }

    fun dismissMessages() {
        transientMessage.value = null to null
    }
}
