package com.sardarjifood.app.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004R\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0011\u0010\u0007\u001a\u00020\b8F\u00a2\u0006\u0006\u001a\u0004\b\t\u0010\nR\u0017\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\r0\f\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000f\u00a8\u0006\u0010"}, d2 = {"Lcom/sardarjifood/app/ui/AppStateViewModel;", "Landroidx/lifecycle/AndroidViewModel;", "application", "Landroid/app/Application;", "(Landroid/app/Application;)V", "container", "Lcom/sardarjifood/app/AppContainer;", "currentRole", "Lcom/sardarjifood/app/model/AppRole;", "getCurrentRole", "()Lcom/sardarjifood/app/model/AppRole;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "Lcom/sardarjifood/app/ui/AppStateUiState;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "app_release"})
public final class AppStateViewModel extends androidx.lifecycle.AndroidViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.AppContainer container = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.AppStateUiState> uiState = null;
    
    public AppStateViewModel(@org.jetbrains.annotations.NotNull()
    android.app.Application application) {
        super(null);
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.sardarjifood.app.ui.AppStateUiState> getUiState() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.model.AppRole getCurrentRole() {
        return null;
    }
}