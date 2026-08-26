package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000`\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010 \n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010$\n\u0002\b\u0004\n\u0002\u0010\u0006\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0005\bf\u0018\u00002\u00020\u0001J\u0016\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u0007\u001a\u00020\b2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\t\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\fH\u00a6@\u00a2\u0006\u0002\u0010\rJ\u001e\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\n0\u000f2\b\b\u0002\u0010\u0010\u001a\u00020\u0011H\u00a6@\u00a2\u0006\u0002\u0010\u0012JJ\u0010\u0013\u001a\u00020\n2\f\u0010\u0014\u001a\b\u0012\u0004\u0012\u00020\u00150\u000f2\u0006\u0010\u0016\u001a\u00020\u00172\u0006\u0010\u0018\u001a\u00020\f2\u0006\u0010\u0019\u001a\u00020\f2\u0014\u0010\u001a\u001a\u0010\u0012\u0004\u0012\u00020\f\u0012\u0006\u0012\u0004\u0018\u00010\u00010\u001bH\u00a6@\u00a2\u0006\u0002\u0010\u001cJ&\u0010\u001d\u001a\u00020\n2\u0006\u0010\u001e\u001a\u00020\f2\u0006\u0010\u001f\u001a\u00020 2\u0006\u0010!\u001a\u00020 H\u00a6@\u00a2\u0006\u0002\u0010\"J6\u0010#\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\f2\u0006\u0010$\u001a\u00020\f2\n\b\u0002\u0010%\u001a\u0004\u0018\u00010\f2\n\b\u0002\u0010&\u001a\u0004\u0018\u00010\fH\u00a6@\u00a2\u0006\u0002\u0010\'J<\u0010(\u001a\u00020)2\u0006\u0010*\u001a\u00020\f2\u0006\u0010\u001e\u001a\u00020\f2\u0006\u0010+\u001a\u00020\f2\u0014\u0010,\u001a\u0010\u0012\u0004\u0012\u00020\f\u0012\u0006\u0012\u0004\u0018\u00010\u00010\u001bH\u00a6@\u00a2\u0006\u0002\u0010-\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006.\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/repository/OrdersRepository;", "", "createRazorpayOrder", "Lcom/sardarjifood/app/data/repository/RazorpayCheckoutPayload;", "draft", "Lcom/sardarjifood/app/data/repository/PaymentDraft;", "(Lcom/sardarjifood/app/data/repository/PaymentDraft;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "createStarPayOrder", "Lcom/sardarjifood/app/data/repository/StarPayCheckoutPayload;", "getOrder", "Lcom/sardarjifood/app/model/Order;", "id", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getOrders", "", "forceRefresh", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "placeCodOrder", "items", "Lcom/sardarjifood/app/model/CartLine;", "address", "Lcom/sardarjifood/app/model/Address;", "note", "couponCode", "pricing", "", "(Ljava/util/List;Lcom/sardarjifood/app/model/Address;Ljava/lang/String;Ljava/lang/String;Ljava/util/Map;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateDeliveryLocation", "orderId", "latitude", "", "longitude", "(Ljava/lang/String;DDLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateOrderStatus", "status", "assignedDeliveryBoyId", "assignedDeliveryBoyName", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "verifyRazorpayPayment", "Lcom/sardarjifood/app/data/repository/PaymentVerificationResult;", "paymentId", "signature", "payload", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/util/Map;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public abstract interface OrdersRepository {
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getOrders(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.Order>> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getOrder(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object placeCodOrder(@org.jetbrains.annotations.NotNull()
    java.util.List<com.sardarjifood.app.model.CartLine> items, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.Address address, @org.jetbrains.annotations.NotNull()
    java.lang.String note, @org.jetbrains.annotations.NotNull()
    java.lang.String couponCode, @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, ? extends java.lang.Object> pricing, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object createStarPayOrder(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.PaymentDraft draft, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.StarPayCheckoutPayload> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object createRazorpayOrder(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.PaymentDraft draft, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.RazorpayCheckoutPayload> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object verifyRazorpayPayment(@org.jetbrains.annotations.NotNull()
    java.lang.String paymentId, @org.jetbrains.annotations.NotNull()
    java.lang.String orderId, @org.jetbrains.annotations.NotNull()
    java.lang.String signature, @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, ? extends java.lang.Object> payload, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.PaymentVerificationResult> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateOrderStatus(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String assignedDeliveryBoyId, @org.jetbrains.annotations.Nullable()
    java.lang.String assignedDeliveryBoyName, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateDeliveryLocation(@org.jetbrains.annotations.NotNull()
    java.lang.String orderId, double latitude, double longitude, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Order> $completion);
}