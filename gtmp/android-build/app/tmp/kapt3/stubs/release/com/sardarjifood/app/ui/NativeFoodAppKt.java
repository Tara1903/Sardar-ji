package com.sardarjifood.app.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000l\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0018\u0002\n\u0002\b\u0002\u001a&\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u00052\f\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0003\u001az\u0010\b\u001a\u00020\u00012\u0006\u0010\t\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\f2\u0006\u0010\u0002\u001a\u00020\u00032\u0006\u0010\r\u001a\u00020\n2\f\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00010\u00072\u0012\u0010\u000f\u001a\u000e\u0012\u0004\u0012\u00020\u0011\u0012\u0004\u0012\u00020\u00010\u00102\u0012\u0010\u0012\u001a\u000e\u0012\u0004\u0012\u00020\u0013\u0012\u0004\u0012\u00020\u00010\u00102\f\u0010\u0014\u001a\b\u0012\u0004\u0012\u00020\u00010\u00072\f\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0003\u001a&\u0010\u0015\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0016\u001a\u00020\u00172\f\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0003\u001a>\u0010\u0018\u001a\u00020\u00012\u0006\u0010\u0019\u001a\u00020\u001a2\u0006\u0010\u0002\u001a\u00020\u00032\n\b\u0002\u0010\u001b\u001a\u0004\u0018\u00010\u00132\u0018\u0010\u001c\u001a\u0014\u0012\u0004\u0012\u00020\u001e\u0012\u0004\u0012\u00020\u001f\u0012\u0004\u0012\u00020\u00010\u001dH\u0007\u001a\u0018\u0010 \u001a\u00020\u00012\u0006\u0010!\u001a\u00020\"2\u0006\u0010#\u001a\u00020\u0013H\u0002\u001a\u0018\u0010$\u001a\u00020\u00012\u0006\u0010!\u001a\u00020\"2\u0006\u0010#\u001a\u00020\u0013H\u0002\u001a\u0010\u0010%\u001a\u00020\u00132\u0006\u0010&\u001a\u00020\u0013H\u0002\u001a8\u0010\'\u001a\u00020\u00012\u0006\u0010(\u001a\u00020\u00132\u0006\u0010)\u001a\u00020*2\u0006\u0010!\u001a\u00020\"2\u0006\u0010+\u001a\u00020\f2\u0006\u0010\u0004\u001a\u00020\u00052\u0006\u0010\u0016\u001a\u00020\u0017H\u0002\u00a8\u0006,"}, d2 = {"AdminShell", "", "viewModel", "Lcom/sardarjifood/app/ui/MainViewModel;", "adminViewModel", "Lcom/sardarjifood/app/ui/AdminViewModel;", "onOpenSettings", "Lkotlin/Function0;", "CustomerShell", "initialTab", "", "shellViewModel", "Lcom/sardarjifood/app/ui/CustomerShellViewModel;", "cartCount", "onShowAuth", "onOpenProduct", "Lkotlin/Function1;", "Lcom/sardarjifood/app/model/Product;", "onOpenOrder", "", "onCheckout", "DeliveryShell", "deliveryViewModel", "Lcom/sardarjifood/app/ui/DeliveryViewModel;", "NativeFoodApp", "appStateViewModel", "Lcom/sardarjifood/app/ui/AppStateViewModel;", "deepLinkPath", "onLaunchRazorpay", "Lkotlin/Function2;", "Lcom/sardarjifood/app/data/repository/RazorpayCheckoutPayload;", "Lcom/sardarjifood/app/PendingPaymentContext;", "navigateRoot", "navController", "Landroidx/navigation/NavHostController;", "route", "navigateSingleTop", "normalizeAppDeepLink", "value", "openAppDeepLink", "deepLink", "currentRole", "Lcom/sardarjifood/app/model/AppRole;", "customerShellViewModel", "app_release"})
public final class NativeFoodAppKt {
    
    @androidx.compose.runtime.Composable()
    public static final void NativeFoodApp(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.ui.AppStateViewModel appStateViewModel, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.ui.MainViewModel viewModel, @org.jetbrains.annotations.Nullable()
    java.lang.String deepLinkPath, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function2<? super com.sardarjifood.app.data.repository.RazorpayCheckoutPayload, ? super com.sardarjifood.app.PendingPaymentContext, kotlin.Unit> onLaunchRazorpay) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void CustomerShell(int initialTab, com.sardarjifood.app.ui.CustomerShellViewModel shellViewModel, com.sardarjifood.app.ui.MainViewModel viewModel, int cartCount, kotlin.jvm.functions.Function0<kotlin.Unit> onShowAuth, kotlin.jvm.functions.Function1<? super com.sardarjifood.app.model.Product, kotlin.Unit> onOpenProduct, kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onOpenOrder, kotlin.jvm.functions.Function0<kotlin.Unit> onCheckout, kotlin.jvm.functions.Function0<kotlin.Unit> onOpenSettings) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void AdminShell(com.sardarjifood.app.ui.MainViewModel viewModel, com.sardarjifood.app.ui.AdminViewModel adminViewModel, kotlin.jvm.functions.Function0<kotlin.Unit> onOpenSettings) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void DeliveryShell(com.sardarjifood.app.ui.MainViewModel viewModel, com.sardarjifood.app.ui.DeliveryViewModel deliveryViewModel, kotlin.jvm.functions.Function0<kotlin.Unit> onOpenSettings) {
    }
    
    private static final void openAppDeepLink(java.lang.String deepLink, com.sardarjifood.app.model.AppRole currentRole, androidx.navigation.NavHostController navController, com.sardarjifood.app.ui.CustomerShellViewModel customerShellViewModel, com.sardarjifood.app.ui.AdminViewModel adminViewModel, com.sardarjifood.app.ui.DeliveryViewModel deliveryViewModel) {
    }
    
    private static final void navigateRoot(androidx.navigation.NavHostController navController, java.lang.String route) {
    }
    
    private static final void navigateSingleTop(androidx.navigation.NavHostController navController, java.lang.String route) {
    }
    
    private static final java.lang.String normalizeAppDeepLink(java.lang.String value) {
        return null;
    }
}