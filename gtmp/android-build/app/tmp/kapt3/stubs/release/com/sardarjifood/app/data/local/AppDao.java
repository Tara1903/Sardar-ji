package com.sardarjifood.app.data.local;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\t\bg\u0018\u00002\u00020\u0001J\u000e\u0010\u0002\u001a\u00020\u0003H\u00a7@\u00a2\u0006\u0002\u0010\u0004J\u0016\u0010\u0005\u001a\u00020\u00032\u0006\u0010\u0006\u001a\u00020\u0007H\u00a7@\u00a2\u0006\u0002\u0010\bJ\u0014\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u000b0\nH\u00a7@\u00a2\u0006\u0002\u0010\u0004J\u0018\u0010\f\u001a\u0004\u0018\u00010\r2\u0006\u0010\u0006\u001a\u00020\u0007H\u00a7@\u00a2\u0006\u0002\u0010\bJ\u0014\u0010\u000e\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u000b0\n0\u000fH\'J\u0016\u0010\u0010\u001a\u00020\u00032\u0006\u0010\u0011\u001a\u00020\u0007H\u00a7@\u00a2\u0006\u0002\u0010\bJ\u0016\u0010\u0012\u001a\u00020\u00032\u0006\u0010\u0013\u001a\u00020\u000bH\u00a7@\u00a2\u0006\u0002\u0010\u0014J\u0016\u0010\u0015\u001a\u00020\u00032\u0006\u0010\u0016\u001a\u00020\rH\u00a7@\u00a2\u0006\u0002\u0010\u0017\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\u0018\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/local/AppDao;", "", "clearCart", "", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "deleteSnapshot", "key", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCartLines", "", "Lcom/sardarjifood/app/data/local/CartLineEntity;", "getSnapshot", "Lcom/sardarjifood/app/data/local/SnapshotEntity;", "observeCartLines", "Lkotlinx/coroutines/flow/Flow;", "removeCartLine", "lineId", "upsertCartLine", "line", "(Lcom/sardarjifood/app/data/local/CartLineEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "upsertSnapshot", "snapshot", "(Lcom/sardarjifood/app/data/local/SnapshotEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
@androidx.room.Dao()
public abstract interface AppDao {
    
    @androidx.room.Query(value = "SELECT * FROM snapshots WHERE `key` = :key LIMIT 1")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getSnapshot(@org.jetbrains.annotations.NotNull()
    java.lang.String key, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.local.SnapshotEntity> $completion);
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object upsertSnapshot(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.SnapshotEntity snapshot, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "DELETE FROM snapshots WHERE `key` = :key")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object deleteSnapshot(@org.jetbrains.annotations.NotNull()
    java.lang.String key, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM cart_lines ORDER BY name ASC")
    @org.jetbrains.annotations.NotNull()
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.sardarjifood.app.data.local.CartLineEntity>> observeCartLines();
    
    @androidx.room.Query(value = "SELECT * FROM cart_lines ORDER BY name ASC")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getCartLines(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.data.local.CartLineEntity>> $completion);
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object upsertCartLine(@org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.CartLineEntity line, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "DELETE FROM cart_lines WHERE lineId = :lineId")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object removeCartLine(@org.jetbrains.annotations.NotNull()
    java.lang.String lineId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "DELETE FROM cart_lines")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object clearCart(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}