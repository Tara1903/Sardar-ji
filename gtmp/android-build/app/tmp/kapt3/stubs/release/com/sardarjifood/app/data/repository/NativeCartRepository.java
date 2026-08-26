package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00008\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0004\n\u0002\u0010\u000e\n\u0002\b\u0005\u0018\u00002\u00020\u0001B\u0015\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u000e\u0010\r\u001a\u00020\u000eH\u0096@\u00a2\u0006\u0002\u0010\u000fJ\u0014\u0010\u0010\u001a\b\u0012\u0004\u0012\u00020\n0\tH\u0096@\u00a2\u0006\u0002\u0010\u000fJ\u0016\u0010\u0011\u001a\u00020\u000e2\u0006\u0010\u0012\u001a\u00020\u0013H\u0096@\u00a2\u0006\u0002\u0010\u0014J\u0016\u0010\u0015\u001a\u00020\u000e2\u0006\u0010\u0016\u001a\u00020\nH\u0096@\u00a2\u0006\u0002\u0010\u0017R \u0010\u0007\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\t0\bX\u0096\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000b\u0010\fR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0018"}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeCartRepository;", "Lcom/sardarjifood/app/data/repository/CartRepository;", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;)V", "cartLines", "Lkotlinx/coroutines/flow/Flow;", "", "Lcom/sardarjifood/app/model/CartLine;", "getCartLines", "()Lkotlinx/coroutines/flow/Flow;", "clear", "", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCurrentCart", "removeLine", "lineId", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "upsertLine", "line", "(Lcom/sardarjifood/app/model/CartLine;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeCartRepository implements com.sardarjifood.app.data.repository.CartRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDao dao = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.Flow<java.util.List<com.sardarjifood.app.model.CartLine>> cartLines = null;
    
    public NativeCartRepository(@org.jetbrains.annotations.NotNull()
    com.google.gson.Gson gson, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.AppDao dao) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public kotlinx.coroutines.flow.Flow<java.util.List<com.sardarjifood.app.model.CartLine>> getCartLines() {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getCurrentCart(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.CartLine>> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object upsertLine(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.model.CartLine line, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object removeLine(@org.jetbrains.annotations.NotNull()
    java.lang.String lineId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object clear(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
}