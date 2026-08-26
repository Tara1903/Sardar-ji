package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0094\u0001\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010 \n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010$\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0002\b\u0006\n\u0002\u0010\u0006\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0005\u0018\u00002\u00020\u0001B-\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u0012\u0006\u0010\n\u001a\u00020\u000b\u00a2\u0006\u0002\u0010\fJ\u0016\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u0010H\u0096@\u00a2\u0006\u0002\u0010\u0011J\u0016\u0010\u0012\u001a\u00020\u00132\u0006\u0010\u000f\u001a\u00020\u0010H\u0096@\u00a2\u0006\u0002\u0010\u0011J\u0016\u0010\u0014\u001a\u00020\u00152\u0006\u0010\u0016\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u0018J\u001c\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\u00150\u001a2\u0006\u0010\u001b\u001a\u00020\u001cH\u0096@\u00a2\u0006\u0002\u0010\u001dJJ\u0010\u001e\u001a\u00020\u00152\f\u0010\u001f\u001a\b\u0012\u0004\u0012\u00020 0\u001a2\u0006\u0010!\u001a\u00020\"2\u0006\u0010#\u001a\u00020\u00172\u0006\u0010$\u001a\u00020\u00172\u0014\u0010%\u001a\u0010\u0012\u0004\u0012\u00020\u0017\u0012\u0006\u0012\u0004\u0018\u00010\'0&H\u0096@\u00a2\u0006\u0002\u0010(J\u000e\u0010)\u001a\u00020*H\u0082@\u00a2\u0006\u0002\u0010+J\u001e\u0010,\u001a\u00020-2\u0006\u0010.\u001a\u00020\u00172\u0006\u0010/\u001a\u00020\u0015H\u0082@\u00a2\u0006\u0002\u00100J&\u00101\u001a\u00020\u00152\u0006\u00102\u001a\u00020\u00172\u0006\u00103\u001a\u0002042\u0006\u00105\u001a\u000204H\u0096@\u00a2\u0006\u0002\u00106J2\u00107\u001a\u00020\u00152\u0006\u0010\u0016\u001a\u00020\u00172\u0006\u00108\u001a\u00020\u00172\b\u00109\u001a\u0004\u0018\u00010\u00172\b\u0010:\u001a\u0004\u0018\u00010\u0017H\u0096@\u00a2\u0006\u0002\u0010;J<\u0010<\u001a\u00020=2\u0006\u0010>\u001a\u00020\u00172\u0006\u00102\u001a\u00020\u00172\u0006\u0010?\u001a\u00020\u00172\u0014\u0010@\u001a\u0010\u0012\u0004\u0012\u00020\u0017\u0012\u0006\u0012\u0004\u0018\u00010\'0&H\u0096@\u00a2\u0006\u0002\u0010AR\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006B"}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeOrdersRepository;", "Lcom/sardarjifood/app/data/repository/OrdersRepository;", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "authRepository", "Lcom/sardarjifood/app/data/repository/AuthRepository;", "supabaseHttpClient", "Lcom/sardarjifood/app/data/network/SupabaseHttpClient;", "siteHttpClient", "Lcom/sardarjifood/app/data/network/SiteHttpClient;", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;Lcom/sardarjifood/app/data/repository/AuthRepository;Lcom/sardarjifood/app/data/network/SupabaseHttpClient;Lcom/sardarjifood/app/data/network/SiteHttpClient;)V", "createRazorpayOrder", "Lcom/sardarjifood/app/data/repository/RazorpayCheckoutPayload;", "draft", "Lcom/sardarjifood/app/data/repository/PaymentDraft;", "(Lcom/sardarjifood/app/data/repository/PaymentDraft;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "createStarPayOrder", "Lcom/sardarjifood/app/data/repository/StarPayCheckoutPayload;", "getOrder", "Lcom/sardarjifood/app/model/Order;", "id", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getOrders", "", "forceRefresh", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "placeCodOrder", "items", "Lcom/sardarjifood/app/model/CartLine;", "address", "Lcom/sardarjifood/app/model/Address;", "note", "couponCode", "pricing", "", "", "(Ljava/util/List;Lcom/sardarjifood/app/model/Address;Ljava/lang/String;Ljava/lang/String;Ljava/util/Map;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "requireSession", "Lcom/sardarjifood/app/model/AppSession;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "sendOrderStatusNotification", "", "token", "order", "(Ljava/lang/String;Lcom/sardarjifood/app/model/Order;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateDeliveryLocation", "orderId", "latitude", "", "longitude", "(Ljava/lang/String;DDLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateOrderStatus", "status", "assignedDeliveryBoyId", "assignedDeliveryBoyName", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "verifyRazorpayPayment", "Lcom/sardarjifood/app/data/repository/PaymentVerificationResult;", "paymentId", "signature", "payload", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/util/Map;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeOrdersRepository implements com.sardarjifood.app.data.repository.OrdersRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDao dao = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.AuthRepository authRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SiteHttpClient siteHttpClient = null;
    
    public NativeOrdersRepository(@org.jetbrains.annotations.NotNull()
    com.google.gson.Gson gson, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.AppDao dao, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.AuthRepository authRepository, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.network.SiteHttpClient siteHttpClient) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getOrders(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.Order>> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getOrder(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object placeCodOrder(@org.jetbrains.annotations.NotNull()
    java.util.List<com.sardarjifood.app.model.CartLine> items, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.Address address, @org.jetbrains.annotations.NotNull()
    java.lang.String note, @org.jetbrains.annotations.NotNull()
    java.lang.String couponCode, @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, ? extends java.lang.Object> pricing, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object createStarPayOrder(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.PaymentDraft draft, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.StarPayCheckoutPayload> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object createRazorpayOrder(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.PaymentDraft draft, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.RazorpayCheckoutPayload> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object verifyRazorpayPayment(@org.jetbrains.annotations.NotNull()
    java.lang.String paymentId, @org.jetbrains.annotations.NotNull()
    java.lang.String orderId, @org.jetbrains.annotations.NotNull()
    java.lang.String signature, @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, ? extends java.lang.Object> payload, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.PaymentVerificationResult> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateOrderStatus(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String assignedDeliveryBoyId, @org.jetbrains.annotations.Nullable()
    java.lang.String assignedDeliveryBoyName, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateDeliveryLocation(@org.jetbrains.annotations.NotNull()
    java.lang.String orderId, double latitude, double longitude, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion) {
        return null;
    }
    
    private final java.lang.Object requireSession(kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    private final java.lang.Object sendOrderStatusNotification(java.lang.String token, com.sardarjifood.app.model.Order order, kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
}