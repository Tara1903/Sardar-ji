package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000.\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0005\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\t\n\u0002\u0010\u0002\n\u0002\b\u0002\u001a\u0010\u0010\u0006\u001a\u00020\u00072\u0006\u0010\b\u001a\u00020\tH\u0002\u001a8\u0010\n\u001a\u0004\u0018\u0001H\u000b\"\u0006\b\u0000\u0010\u000b\u0018\u00012\u0006\u0010\f\u001a\u00020\r2\u0006\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00012\u0006\u0010\u0011\u001a\u00020\u0001H\u0082H\u00a2\u0006\u0002\u0010\u0012\u001a&\u0010\u0013\u001a\u0004\u0018\u0001H\u000b\"\u0006\b\u0000\u0010\u000b\u0018\u0001*\u00020\r2\b\u0010\u0014\u001a\u0004\u0018\u00010\u0001H\u0082\b\u00a2\u0006\u0002\u0010\u0015\u001a\u001c\u0010\u0016\u001a\u0004\u0018\u00010\u0001*\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u0001H\u0082@\u00a2\u0006\u0002\u0010\u0017\u001a\"\u0010\u0018\u001a\u00020\u0019*\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00012\u0006\u0010\u0014\u001a\u00020\u0001H\u0082@\u00a2\u0006\u0002\u0010\u001a\"\u000e\u0010\u0000\u001a\u00020\u0001X\u0082T\u00a2\u0006\u0002\n\u0000\"\u000e\u0010\u0002\u001a\u00020\u0001X\u0082T\u00a2\u0006\u0002\n\u0000\"\u000e\u0010\u0003\u001a\u00020\u0001X\u0082T\u00a2\u0006\u0002\n\u0000\"\u000e\u0010\u0004\u001a\u00020\u0001X\u0082T\u00a2\u0006\u0002\n\u0000\"\u000e\u0010\u0005\u001a\u00020\u0001X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001b"}, d2 = {"SNAPSHOT_CATALOG", "", "SNAPSHOT_COUPONS", "SNAPSHOT_ORDERS", "SNAPSHOT_SUBSCRIPTION", "SNAPSHOT_USERS", "monthlySubscriptionProduct", "", "product", "Lcom/sardarjifood/app/model/Product;", "readSnapshotOrDiscard", "T", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "key", "label", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "fromJsonOrNull", "json", "(Lcom/google/gson/Gson;Ljava/lang/String;)Ljava/lang/Object;", "readSnapshot", "(Lcom/sardarjifood/app/data/local/AppDao;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "writeSnapshot", "", "(Lcom/sardarjifood/app/data/local/AppDao;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeRepositoriesKt {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String SNAPSHOT_CATALOG = "catalog";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String SNAPSHOT_ORDERS = "orders";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String SNAPSHOT_SUBSCRIPTION = "subscription";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String SNAPSHOT_COUPONS = "coupons";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String SNAPSHOT_USERS = "users";
    
    private static final java.lang.Object readSnapshot(com.sardarjifood.app.data.local.AppDao $this$readSnapshot, java.lang.String key, kotlin.coroutines.Continuation<? super java.lang.String> $completion) {
        return null;
    }
    
    private static final java.lang.Object writeSnapshot(com.sardarjifood.app.data.local.AppDao $this$writeSnapshot, java.lang.String key, java.lang.String json, kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    private static final boolean monthlySubscriptionProduct(com.sardarjifood.app.model.Product product) {
        return false;
    }
}