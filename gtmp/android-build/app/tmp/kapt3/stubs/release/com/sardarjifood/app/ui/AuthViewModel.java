package com.sardarjifood.app.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000H\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0010\u000b\n\u0002\b\n\n\u0002\u0010$\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0006\u0010\u000e\u001a\u00020\u000fJ\u0012\u0010\u0010\u001a\u00020\u00112\b\u0010\u0012\u001a\u0004\u0018\u00010\u0011H\u0002J\u0006\u0010\u0013\u001a\u00020\u000fJ\u000e\u0010\u0014\u001a\u00020\u000f2\u0006\u0010\u0015\u001a\u00020\u0016J\u0006\u0010\u0017\u001a\u00020\u000fJ\u0006\u0010\u0018\u001a\u00020\u000fJ\u0006\u0010\u0019\u001a\u00020\u000fJ\u000e\u0010\u001a\u001a\u00020\u000f2\u0006\u0010\u001b\u001a\u00020\u0011J\u000e\u0010\u001c\u001a\u00020\u000f2\u0006\u0010\u001b\u001a\u00020\u0011J\u000e\u0010\u001d\u001a\u00020\u000f2\u0006\u0010\u001b\u001a\u00020\u0011J\u000e\u0010\u001e\u001a\u00020\u000f2\u0006\u0010\u001b\u001a\u00020\u0011J\u000e\u0010\u001f\u001a\u00020\u000f2\u0006\u0010\u001b\u001a\u00020\u0011J\u001c\u0010 \u001a\u000e\u0012\u0004\u0012\u00020\u0011\u0012\u0004\u0012\u00020\u00110!2\u0006\u0010\"\u001a\u00020\u0007H\u0002R\u0014\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00070\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\u00070\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\r\u00a8\u0006#"}, d2 = {"Lcom/sardarjifood/app/ui/AuthViewModel;", "Landroidx/lifecycle/AndroidViewModel;", "application", "Landroid/app/Application;", "(Landroid/app/Application;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/sardarjifood/app/ui/AuthUiState;", "container", "Lcom/sardarjifood/app/AppContainer;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "dismissMessages", "", "mapAuthError", "", "message", "requestPasswordReset", "setRegisterMode", "enabled", "", "submit", "toggleForgotPassword", "togglePasswordVisibility", "updateEmail", "value", "updateName", "updatePassword", "updatePhoneNumber", "updateReferralCode", "validate", "", "state", "app_release"})
public final class AuthViewModel extends androidx.lifecycle.AndroidViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.AppContainer container = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.sardarjifood.app.ui.AuthUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.AuthUiState> uiState = null;
    
    public AuthViewModel(@org.jetbrains.annotations.NotNull()
    android.app.Application application) {
        super(null);
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.AuthUiState> getUiState() {
        return null;
    }
    
    public final void setRegisterMode(boolean enabled) {
    }
    
    public final void updateName(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void updateEmail(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void updatePhoneNumber(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void updatePassword(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void updateReferralCode(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void togglePasswordVisibility() {
    }
    
    public final void toggleForgotPassword() {
    }
    
    public final void dismissMessages() {
    }
    
    public final void submit() {
    }
    
    public final void requestPasswordReset() {
    }
    
    private final java.util.Map<java.lang.String, java.lang.String> validate(com.sardarjifood.app.ui.AuthUiState state) {
        return null;
    }
    
    private final java.lang.String mapAuthError(java.lang.String message) {
        return null;
    }
}