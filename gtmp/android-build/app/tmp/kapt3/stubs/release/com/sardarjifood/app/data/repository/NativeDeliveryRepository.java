package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000*\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\u0015\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u001c\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\b2\u0006\u0010\n\u001a\u00020\u000bH\u0096@\u00a2\u0006\u0002\u0010\fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\r"}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeDeliveryRepository;", "Lcom/sardarjifood/app/data/repository/DeliveryRepository;", "authRepository", "Lcom/sardarjifood/app/data/repository/AuthRepository;", "ordersRepository", "Lcom/sardarjifood/app/data/repository/OrdersRepository;", "(Lcom/sardarjifood/app/data/repository/AuthRepository;Lcom/sardarjifood/app/data/repository/OrdersRepository;)V", "getActiveAssignments", "", "Lcom/sardarjifood/app/model/Order;", "forceRefresh", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeDeliveryRepository implements com.sardarjifood.app.data.repository.DeliveryRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.AuthRepository authRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.OrdersRepository ordersRepository = null;
    
    public NativeDeliveryRepository(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.AuthRepository authRepository, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.OrdersRepository ordersRepository) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getActiveAssignments(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.Order>> $completion) {
        return null;
    }
}