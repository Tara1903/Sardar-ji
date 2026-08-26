package com.sardarjifood.app;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000d\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\u0018\u00002\u00020\u00012\u00020\u0002B\u0005\u00a2\u0006\u0002\u0010\u0003J\u0010\u0010\u0016\u001a\u00020\u00172\u0006\u0010\u0018\u001a\u00020\u0019H\u0002J\u0012\u0010\u001a\u001a\u00020\u00172\b\u0010\u001b\u001a\u0004\u0018\u00010\u001cH\u0014J\u0010\u0010\u001d\u001a\u00020\u00172\u0006\u0010\u001e\u001a\u00020\u001fH\u0014J$\u0010 \u001a\u00020\u00172\u0006\u0010!\u001a\u00020\"2\b\u0010#\u001a\u0004\u0018\u00010\f2\b\u0010$\u001a\u0004\u0018\u00010%H\u0016J\u001c\u0010&\u001a\u00020\u00172\b\u0010\'\u001a\u0004\u0018\u00010\f2\b\u0010$\u001a\u0004\u0018\u00010%H\u0016J\b\u0010(\u001a\u00020\u0017H\u0014J\b\u0010)\u001a\u00020\u0017H\u0014J\b\u0010*\u001a\u00020\u0017H\u0002J\u0014\u0010+\u001a\u0004\u0018\u00010\f2\b\u0010\u001e\u001a\u0004\u0018\u00010\u001fH\u0002R\u001b\u0010\u0004\u001a\u00020\u00058BX\u0082\u0084\u0002\u00a2\u0006\f\n\u0004\b\b\u0010\t\u001a\u0004\b\u0006\u0010\u0007R\u0016\u0010\n\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\f0\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\r\u001a\b\u0012\u0004\u0012\u00020\f0\u000eX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u000f\u001a\u0004\u0018\u00010\u0010X\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u001b\u0010\u0011\u001a\u00020\u00128BX\u0082\u0084\u0002\u00a2\u0006\f\n\u0004\b\u0015\u0010\t\u001a\u0004\b\u0013\u0010\u0014\u00a8\u0006,"}, d2 = {"Lcom/sardarjifood/app/MainActivity;", "Landroidx/activity/ComponentActivity;", "Lcom/razorpay/PaymentResultWithDataListener;", "()V", "appStateViewModel", "Lcom/sardarjifood/app/ui/AppStateViewModel;", "getAppStateViewModel", "()Lcom/sardarjifood/app/ui/AppStateViewModel;", "appStateViewModel$delegate", "Lkotlin/Lazy;", "deepLinkState", "Landroidx/compose/runtime/MutableState;", "", "notificationPermissionLauncher", "Landroidx/activity/result/ActivityResultLauncher;", "pendingPaymentContext", "Lcom/sardarjifood/app/PendingPaymentContext;", "viewModel", "Lcom/sardarjifood/app/ui/MainViewModel;", "getViewModel", "()Lcom/sardarjifood/app/ui/MainViewModel;", "viewModel$delegate", "launchRazorpayCheckout", "", "checkoutPayload", "Lcom/sardarjifood/app/data/repository/RazorpayCheckoutPayload;", "onCreate", "savedInstanceState", "Landroid/os/Bundle;", "onNewIntent", "intent", "Landroid/content/Intent;", "onPaymentError", "code", "", "response", "paymentData", "Lcom/razorpay/PaymentData;", "onPaymentSuccess", "razorpayPaymentId", "onStart", "onStop", "requestNotificationPermissionIfNeeded", "resolveIncomingDeepLink", "app_release"})
public final class MainActivity extends androidx.activity.ComponentActivity implements com.razorpay.PaymentResultWithDataListener {
    @org.jetbrains.annotations.NotNull()
    private final kotlin.Lazy appStateViewModel$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlin.Lazy viewModel$delegate = null;
    @org.jetbrains.annotations.Nullable()
    private com.sardarjifood.app.PendingPaymentContext pendingPaymentContext;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState<java.lang.String> deepLinkState = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.activity.result.ActivityResultLauncher<java.lang.String> notificationPermissionLauncher = null;
    
    public MainActivity() {
        super(0);
    }
    
    private final com.sardarjifood.app.ui.AppStateViewModel getAppStateViewModel() {
        return null;
    }
    
    private final com.sardarjifood.app.ui.MainViewModel getViewModel() {
        return null;
    }
    
    @java.lang.Override()
    protected void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @java.lang.Override()
    protected void onNewIntent(@org.jetbrains.annotations.NotNull()
    android.content.Intent intent) {
    }
    
    @java.lang.Override()
    protected void onStart() {
    }
    
    @java.lang.Override()
    protected void onStop() {
    }
    
    @java.lang.Override()
    public void onPaymentSuccess(@org.jetbrains.annotations.Nullable()
    java.lang.String razorpayPaymentId, @org.jetbrains.annotations.Nullable()
    com.razorpay.PaymentData paymentData) {
    }
    
    @java.lang.Override()
    public void onPaymentError(int code, @org.jetbrains.annotations.Nullable()
    java.lang.String response, @org.jetbrains.annotations.Nullable()
    com.razorpay.PaymentData paymentData) {
    }
    
    private final void requestNotificationPermissionIfNeeded() {
    }
    
    private final java.lang.String resolveIncomingDeepLink(android.content.Intent intent) {
        return null;
    }
    
    private final void launchRazorpayCheckout(com.sardarjifood.app.data.repository.RazorpayCheckoutPayload checkoutPayload) {
    }
}