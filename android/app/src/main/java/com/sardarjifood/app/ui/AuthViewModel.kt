package com.sardarjifood.app.ui

import android.app.Application
import android.util.Patterns
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sardarjifood.app.SardarJiApplication
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isRegister: Boolean = false,
    val name: String = "",
    val email: String = "",
    val phoneNumber: String = "",
    val password: String = "",
    val referralCode: String = "",
    val passwordVisible: Boolean = false,
    val isSubmitting: Boolean = false,
    val isSendingReset: Boolean = false,
    val showForgotPassword: Boolean = false,
    val fieldErrors: Map<String, String> = emptyMap(),
    val errorMessage: String? = null,
    val noticeMessage: String? = null,
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as SardarJiApplication).container
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun setRegisterMode(enabled: Boolean) {
        _uiState.value =
            _uiState.value.copy(
                isRegister = enabled,
                fieldErrors = emptyMap(),
                errorMessage = null,
                noticeMessage = null,
            )
    }

    fun updateName(value: String) {
        _uiState.value = _uiState.value.copy(name = value, fieldErrors = _uiState.value.fieldErrors - "name")
    }

    fun updateEmail(value: String) {
        _uiState.value = _uiState.value.copy(email = value, fieldErrors = _uiState.value.fieldErrors - "email")
    }

    fun updatePhoneNumber(value: String) {
        _uiState.value = _uiState.value.copy(phoneNumber = value, fieldErrors = _uiState.value.fieldErrors - "phone")
    }

    fun updatePassword(value: String) {
        _uiState.value = _uiState.value.copy(password = value, fieldErrors = _uiState.value.fieldErrors - "password")
    }

    fun updateReferralCode(value: String) {
        _uiState.value = _uiState.value.copy(referralCode = value)
    }

    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(passwordVisible = !_uiState.value.passwordVisible)
    }

    fun toggleForgotPassword() {
        _uiState.value =
            _uiState.value.copy(
                showForgotPassword = !_uiState.value.showForgotPassword,
                errorMessage = null,
                noticeMessage = null,
            )
    }

    fun dismissMessages() {
        _uiState.value = _uiState.value.copy(errorMessage = null, noticeMessage = null)
    }

    fun submit() {
        val current = _uiState.value
        val errors = validate(current)
        if (errors.isNotEmpty()) {
            _uiState.value = current.copy(fieldErrors = errors, errorMessage = null)
            return
        }

        viewModelScope.launch {
            _uiState.value = current.copy(isSubmitting = true, fieldErrors = emptyMap(), errorMessage = null, noticeMessage = null)
            runCatching {
                if (current.isRegister) {
                    container.authRepository.signUp(
                        name = current.name,
                        email = current.email,
                        phoneNumber = current.phoneNumber,
                        password = current.password,
                        referralCode = current.referralCode,
                    )
                } else {
                    container.authRepository.signIn(current.email, current.password)
                }
            }.onSuccess {
                _uiState.value =
                    _uiState.value.copy(
                        isSubmitting = false,
                        password = "",
                        noticeMessage = if (current.isRegister) "Account created. You are all set." else "Signed in successfully.",
                    )
            }.onFailure { error ->
                _uiState.value =
                    _uiState.value.copy(
                        isSubmitting = false,
                        errorMessage = mapAuthError(error.message),
                    )
            }
        }
    }

    fun requestPasswordReset() {
        val email = _uiState.value.email.trim()
        if (email.isBlank()) {
            _uiState.value =
                _uiState.value.copy(
                    fieldErrors = _uiState.value.fieldErrors + ("email" to "Enter your account email first."),
                )
            return
        }
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.value =
                _uiState.value.copy(
                    fieldErrors = _uiState.value.fieldErrors + ("email" to "Use a valid email address."),
                )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSendingReset = true, errorMessage = null, noticeMessage = null)
            runCatching { container.authRepository.requestPasswordReset(email) }
                .onSuccess {
                    _uiState.value =
                        _uiState.value.copy(
                            isSendingReset = false,
                            showForgotPassword = false,
                            noticeMessage = "Password reset link sent. Please check your email.",
                        )
                }.onFailure { error ->
                    _uiState.value =
                        _uiState.value.copy(
                            isSendingReset = false,
                            errorMessage = error.message ?: "Unable to send the reset link right now.",
                        )
                }
        }
    }

    private fun validate(state: AuthUiState): Map<String, String> {
        val errors = linkedMapOf<String, String>()
        if (state.isRegister && state.name.trim().isBlank()) {
            errors["name"] = "Enter your name."
        }
        if (state.isRegister && state.phoneNumber.trim().isBlank()) {
            errors["phone"] = "Enter your phone number."
        }
        if (state.email.trim().isBlank()) {
            errors["email"] = "Enter your email address."
        } else if (!Patterns.EMAIL_ADDRESS.matcher(state.email.trim()).matches()) {
            errors["email"] = "Use a valid email address."
        }
        if (state.password.isBlank()) {
            errors["password"] = "Enter your password."
        } else if (state.password.length < 6) {
            errors["password"] = "Use at least 6 characters."
        }
        return errors
    }

    private fun mapAuthError(message: String?): String =
        when {
            message.isNullOrBlank() -> "We couldn't complete that right now. Please try again."
            message.contains("invalid login", ignoreCase = true) ||
                message.contains("invalid email or password", ignoreCase = true) ||
                message.contains("invalid credentials", ignoreCase = true) -> "The email or password looks incorrect."
            message.contains("network", ignoreCase = true) ||
                message.contains("timeout", ignoreCase = true) -> "Network looks unstable. Please try again."
            message.contains("already registered", ignoreCase = true) ||
                message.contains("already exists", ignoreCase = true) -> "This email already has an account. Try signing in."
            else -> message
        }
}
