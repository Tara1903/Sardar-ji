package com.sardarjifood.app.notifications;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000J\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\f\n\u0002\u0010\u0002\n\u0002\b\u0002\b\u00c6\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0016\u001a\u00020\u00152\u0006\u0010\u0017\u001a\u00020\u0007H\u0002J(\u0010\u0018\u001a\u00020\u00072\u0006\u0010\u0019\u001a\u00020\u00152\u0006\u0010\u001a\u001a\u00020\u00152\u0006\u0010\u001b\u001a\u00020\u00152\b\b\u0002\u0010\u001c\u001a\u00020\u0015J*\u0010\u001d\u001a\u0004\u0018\u00010\u00072\u0006\u0010\u0019\u001a\u00020\u00152\u0006\u0010\u001a\u001a\u00020\u00152\u0006\u0010\u001e\u001a\u00020\u00152\b\b\u0002\u0010\u001c\u001a\u00020\u0015J\u000e\u0010\u001f\u001a\u00020\u000e2\u0006\u0010\u0017\u001a\u00020\u0007J\u0010\u0010 \u001a\u00020\u00152\u0006\u0010\u001e\u001a\u00020\u0015H\u0002J\u000e\u0010!\u001a\u00020\"2\u0006\u0010#\u001a\u00020\u000eR\u000e\u0010\u0003\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00070\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b\b\u0010\tR\u0014\u0010\n\u001a\b\u0012\u0004\u0012\u00020\u00070\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000e0\rX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u000f\u001a\b\u0012\u0004\u0012\u00020\u000e0\u0010\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000f\u0010\u0011R\u000e\u0010\u0012\u001a\u00020\u0001X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001a\u0010\u0013\u001a\u000e\u0012\u0004\u0012\u00020\u0015\u0012\u0004\u0012\u00020\u00040\u0014X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006$"}, d2 = {"Lcom/sardarjifood/app/notifications/AppNotificationCenter;", "", "()V", "DUPLICATE_WINDOW_MS", "", "events", "Lkotlinx/coroutines/flow/SharedFlow;", "Lcom/sardarjifood/app/notifications/AppNotificationEvent;", "getEvents", "()Lkotlinx/coroutines/flow/SharedFlow;", "eventsFlow", "Lkotlinx/coroutines/flow/MutableSharedFlow;", "foregroundState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "isForeground", "Lkotlinx/coroutines/flow/StateFlow;", "()Lkotlinx/coroutines/flow/StateFlow;", "lock", "recentEvents", "Ljava/util/LinkedHashMap;", "", "canonicalEventKey", "event", "createAdminNewOrderEvent", "orderId", "orderNumber", "customerName", "rawNotificationKey", "createCustomerOrderStatusEvent", "status", "emit", "normalizeStatus", "setForeground", "", "value", "app_release"})
public final class AppNotificationCenter {
    private static final long DUPLICATE_WINDOW_MS = 18000L;
    @org.jetbrains.annotations.NotNull()
    private static final kotlinx.coroutines.flow.MutableStateFlow<java.lang.Boolean> foregroundState = null;
    @org.jetbrains.annotations.NotNull()
    private static final kotlinx.coroutines.flow.MutableSharedFlow<com.sardarjifood.app.notifications.AppNotificationEvent> eventsFlow = null;
    @org.jetbrains.annotations.NotNull()
    private static final java.util.LinkedHashMap<java.lang.String, java.lang.Long> recentEvents = null;
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.Object lock = null;
    @org.jetbrains.annotations.NotNull()
    private static final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isForeground = null;
    @org.jetbrains.annotations.NotNull()
    private static final kotlinx.coroutines.flow.SharedFlow<com.sardarjifood.app.notifications.AppNotificationEvent> events = null;
    @org.jetbrains.annotations.NotNull()
    public static final com.sardarjifood.app.notifications.AppNotificationCenter INSTANCE = null;
    
    private AppNotificationCenter() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isForeground() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.SharedFlow<com.sardarjifood.app.notifications.AppNotificationEvent> getEvents() {
        return null;
    }
    
    public final void setForeground(boolean value) {
    }
    
    public final boolean emit(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.notifications.AppNotificationEvent event) {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.sardarjifood.app.notifications.AppNotificationEvent createCustomerOrderStatusEvent(@org.jetbrains.annotations.NotNull()
    java.lang.String orderId, @org.jetbrains.annotations.NotNull()
    java.lang.String orderNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String status, @org.jetbrains.annotations.NotNull()
    java.lang.String rawNotificationKey) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.notifications.AppNotificationEvent createAdminNewOrderEvent(@org.jetbrains.annotations.NotNull()
    java.lang.String orderId, @org.jetbrains.annotations.NotNull()
    java.lang.String orderNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String customerName, @org.jetbrains.annotations.NotNull()
    java.lang.String rawNotificationKey) {
        return null;
    }
    
    private final java.lang.String normalizeStatus(java.lang.String status) {
        return null;
    }
    
    private final java.lang.String canonicalEventKey(com.sardarjifood.app.notifications.AppNotificationEvent event) {
        return null;
    }
}