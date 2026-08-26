package com.sardarjifood.app.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000`\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010$\n\u0002\u0010\u000e\n\u0002\u0010 \n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\"\n\u0002\b\u0002\u001aJ\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\f\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052*\u0010\u0006\u001a&\u0012\u0016\u0012\u0014\u0012\u0004\u0012\u00020\t\u0012\n\u0012\b\u0012\u0004\u0012\u00020\t0\n0\b\u0012\u0004\u0012\u00020\u000b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a(\u0010\f\u001a\u00020\u00012\u0006\u0010\r\u001a\u00020\u000e2\b\u0010\u000f\u001a\u0004\u0018\u00010\u00102\f\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00010\u0005H\u0007\u001aZ\u0010\u0012\u001a\u00020\u00012\u0006\u0010\u0013\u001a\u00020\u00142\f\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\f\u0010\u0016\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\u0012\u0010\u0017\u001a\u000e\u0012\u0004\u0012\u00020\u0019\u0012\u0004\u0012\u00020\u00010\u00182\u0018\u0010\u001a\u001a\u0014\u0012\u0004\u0012\u00020\u001b\u0012\u0004\u0012\u00020\u001c\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001aN\u0010\u001d\u001a\u00020\u00012\b\u0010\u0002\u001a\u0004\u0018\u00010\u00032\u0006\u0010\u0013\u001a\u00020\u00142\f\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\u000e\b\u0002\u0010\u001e\u001a\b\u0012\u0004\u0012\u00020\t0\u001f2\u0014\b\u0002\u0010 \u001a\u000e\u0012\u0004\u0012\u00020\t\u0012\u0004\u0012\u00020\u00010\u0018H\u0007\u00a8\u0006!"}, d2 = {"AddonBottomSheet", "", "product", "Lcom/sardarjifood/app/model/Product;", "onDismiss", "Lkotlin/Function0;", "onAddConfigured", "Lkotlin/Function2;", "", "", "", "", "AuthScreen", "authViewModel", "Lcom/sardarjifood/app/ui/AuthViewModel;", "session", "Lcom/sardarjifood/app/model/AppSession;", "onDone", "CheckoutRoute", "viewModel", "Lcom/sardarjifood/app/ui/MainViewModel;", "onBack", "onOrderPlaced", "onLaunchStarPay", "Lkotlin/Function1;", "Lcom/sardarjifood/app/data/repository/StarPayCheckoutPayload;", "onLaunchRazorpay", "Lcom/sardarjifood/app/data/repository/RazorpayCheckoutPayload;", "Lcom/sardarjifood/app/PendingPaymentContext;", "ProductDetailRoute", "favoriteProductIds", "", "onToggleFavorite", "app_release"})
public final class CustomerDetailScreensKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void AddonBottomSheet(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.Product product, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onDismiss, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function2<? super java.util.Map<java.lang.String, ? extends java.util.List<java.lang.String>>, ? super java.lang.Integer, kotlin.Unit> onAddConfigured) {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void AuthScreen(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.ui.AuthViewModel authViewModel, @org.jetbrains.annotations.Nullable()
    com.sardarjifood.app.model.AppSession session, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onDone) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void ProductDetailRoute(@org.jetbrains.annotations.Nullable()
    com.sardarjifood.app.model.Product product, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.ui.MainViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBack, @org.jetbrains.annotations.NotNull()
    java.util.Set<java.lang.String> favoriteProductIds, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onToggleFavorite) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void CheckoutRoute(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.ui.MainViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBack, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onOrderPlaced, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super com.sardarjifood.app.data.repository.StarPayCheckoutPayload, kotlin.Unit> onLaunchStarPay, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function2<? super com.sardarjifood.app.data.repository.RazorpayCheckoutPayload, ? super com.sardarjifood.app.PendingPaymentContext, kotlin.Unit> onLaunchRazorpay) {
    }
}