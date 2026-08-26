package com.sardarjifood.app.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000Z\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0006\n\u0002\u0018\u0002\n\u0002\b\u0004\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0006\u0010\u0018\u001a\u00020\u0019J\u0006\u0010\u001a\u001a\u00020\u0019J\u0006\u0010\u001b\u001a\u00020\u0019J\u000e\u0010\u001c\u001a\u00020\u00192\u0006\u0010\u001d\u001a\u00020\tJ\u000e\u0010\u001e\u001a\u00020\u00192\u0006\u0010\u001f\u001a\u00020 J\u000e\u0010!\u001a\u00020\u00192\u0006\u0010\"\u001a\u00020\rJ\u000e\u0010#\u001a\u00020\u00192\u0006\u0010\"\u001a\u00020\rR\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R \u0010\u000b\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\r\u0012\u0004\u0012\u00020\r0\f0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\"\u0010\u000e\u001a\u0016\u0012\u0012\u0012\u0010\u0012\u0006\u0012\u0004\u0018\u00010\u0010\u0012\u0004\u0012\u00020\u00110\f0\u000fX\u0082\u0004\u00a2\u0006\u0002\n\u0000R$\u0010\u0012\u001a\u0018\u0012\u0014\u0012\u0012\u0012\u0006\u0012\u0004\u0018\u00010\r\u0012\u0006\u0012\u0004\u0018\u00010\r0\f0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u00150\u0014\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0016\u0010\u0017\u00a8\u0006$"}, d2 = {"Lcom/sardarjifood/app/ui/SettingsViewModel;", "Landroidx/lifecycle/AndroidViewModel;", "application", "Landroid/app/Application;", "(Landroid/app/Application;)V", "container", "Lcom/sardarjifood/app/AppContainer;", "logoutBusy", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "profileBusy", "profileDraft", "Lkotlin/Pair;", "", "sessionAndPreferences", "Lkotlinx/coroutines/flow/Flow;", "Lcom/sardarjifood/app/model/AppSession;", "Lcom/sardarjifood/app/model/AppPreferences;", "transientMessage", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "Lcom/sardarjifood/app/ui/SettingsUiState;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "dismissMessages", "", "logout", "saveProfile", "setNotificationsEnabled", "enabled", "setThemeMode", "themeMode", "Lcom/sardarjifood/app/model/ThemeMode;", "updateProfileEmail", "value", "updateProfileName", "app_release"})
public final class SettingsViewModel extends androidx.lifecycle.AndroidViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.AppContainer container = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<kotlin.Pair<java.lang.String, java.lang.String>> profileDraft = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.lang.Boolean> profileBusy = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.lang.Boolean> logoutBusy = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<kotlin.Pair<java.lang.String, java.lang.String>> transientMessage = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.Flow<kotlin.Pair<com.sardarjifood.app.model.AppSession, com.sardarjifood.app.model.AppPreferences>> sessionAndPreferences = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.SettingsUiState> uiState = null;
    
    public SettingsViewModel(@org.jetbrains.annotations.NotNull()
    android.app.Application application) {
        super(null);
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.SettingsUiState> getUiState() {
        return null;
    }
    
    public final void updateProfileName(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void updateProfileEmail(@org.jetbrains.annotations.NotNull()
    java.lang.String value) {
    }
    
    public final void setThemeMode(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.ThemeMode themeMode) {
    }
    
    public final void setNotificationsEnabled(boolean enabled) {
    }
    
    public final void saveProfile() {
    }
    
    public final void logout() {
    }
    
    public final void dismissMessages() {
    }
}