package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000*\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0004\n\u0002\u0010\u000e\n\u0002\b\u0005\bf\u0018\u00002\u00020\u0001J\u000e\u0010\b\u001a\u00020\tH\u00a6@\u00a2\u0006\u0002\u0010\nJ\u0014\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\u00050\u0004H\u00a6@\u00a2\u0006\u0002\u0010\nJ\u0016\u0010\f\u001a\u00020\t2\u0006\u0010\r\u001a\u00020\u000eH\u00a6@\u00a2\u0006\u0002\u0010\u000fJ\u0016\u0010\u0010\u001a\u00020\t2\u0006\u0010\u0011\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0012R\u001e\u0010\u0002\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00050\u00040\u0003X\u00a6\u0004\u00a2\u0006\u0006\u001a\u0004\b\u0006\u0010\u0007\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\u0013\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/repository/CartRepository;", "", "cartLines", "Lkotlinx/coroutines/flow/Flow;", "", "Lcom/sardarjifood/app/model/CartLine;", "getCartLines", "()Lkotlinx/coroutines/flow/Flow;", "clear", "", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCurrentCart", "removeLine", "lineId", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "upsertLine", "line", "(Lcom/sardarjifood/app/model/CartLine;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public abstract interface CartRepository {
    
    @org.jetbrains.annotations.NotNull()
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.sardarjifood.app.model.CartLine>> getCartLines();
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getCurrentCart(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.CartLine>> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object upsertLine(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.CartLine line, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object removeLine(@org.jetbrains.annotations.NotNull()
    java.lang.String lineId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object clear(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}