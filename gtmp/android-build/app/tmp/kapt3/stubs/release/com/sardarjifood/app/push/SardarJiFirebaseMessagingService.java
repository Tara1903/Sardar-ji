package com.sardarjifood.app.push;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000<\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\b\n\u0002\b\u0005\u0018\u0000 \u00172\u00020\u0001:\u0001\u0017B\u0005\u00a2\u0006\u0002\u0010\u0002J\u0012\u0010\u0005\u001a\u0004\u0018\u00010\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0002J\b\u0010\t\u001a\u00020\nH\u0002J\u0010\u0010\u000b\u001a\u00020\f2\u0006\u0010\u0007\u001a\u00020\bH\u0002J\u0010\u0010\r\u001a\u00020\n2\u0006\u0010\u000e\u001a\u00020\u000fH\u0016J\u0010\u0010\u0010\u001a\u00020\n2\u0006\u0010\u0011\u001a\u00020\bH\u0016J\u0017\u0010\u0012\u001a\u0004\u0018\u00010\u00132\u0006\u0010\u0007\u001a\u00020\bH\u0002\u00a2\u0006\u0002\u0010\u0014J\u0012\u0010\u0015\u001a\u00020\b2\b\u0010\u0016\u001a\u0004\u0018\u00010\bH\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0018"}, d2 = {"Lcom/sardarjifood/app/push/SardarJiFirebaseMessagingService;", "Lcom/google/firebase/messaging/FirebaseMessagingService;", "()V", "serviceScope", "Lkotlinx/coroutines/CoroutineScope;", "buildProgressStyle", "Landroidx/core/app/NotificationCompat$ProgressStyle;", "status", "", "createChannel", "", "isTerminalOrderStatus", "", "onMessageReceived", "message", "Lcom/google/firebase/messaging/RemoteMessage;", "onNewToken", "token", "progressForStatus", "", "(Ljava/lang/String;)Ljava/lang/Integer;", "sanitizeTargetUrl", "value", "Companion", "app_release"})
public final class SardarJiFirebaseMessagingService extends com.google.firebase.messaging.FirebaseMessagingService {
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.CoroutineScope serviceScope = null;
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CHANNEL_ID = "sjfc_orders";
    @org.jetbrains.annotations.NotNull()
    public static final com.sardarjifood.app.push.SardarJiFirebaseMessagingService.Companion Companion = null;
    
    public SardarJiFirebaseMessagingService() {
        super();
    }
    
    @java.lang.Override()
    public void onNewToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token) {
    }
    
    @java.lang.Override()
    public void onMessageReceived(@org.jetbrains.annotations.NotNull()
    com.google.firebase.messaging.RemoteMessage message) {
    }
    
    private final void createChannel() {
    }
    
    private final androidx.core.app.NotificationCompat.ProgressStyle buildProgressStyle(java.lang.String status) {
        return null;
    }
    
    private final java.lang.Integer progressForStatus(java.lang.String status) {
        return null;
    }
    
    private final boolean isTerminalOrderStatus(java.lang.String status) {
        return false;
    }
    
    private final java.lang.String sanitizeTargetUrl(java.lang.String value) {
        return null;
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0086T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0005"}, d2 = {"Lcom/sardarjifood/app/push/SardarJiFirebaseMessagingService$Companion;", "", "()V", "CHANNEL_ID", "", "app_release"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}