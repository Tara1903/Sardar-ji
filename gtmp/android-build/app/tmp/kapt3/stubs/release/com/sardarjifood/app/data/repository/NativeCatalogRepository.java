package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\u001d\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u00a2\u0006\u0002\u0010\bJ\u0016\u0010\t\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\fH\u0096@\u00a2\u0006\u0002\u0010\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u000e"}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeCatalogRepository;", "Lcom/sardarjifood/app/data/repository/CatalogRepository;", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "supabaseHttpClient", "Lcom/sardarjifood/app/data/network/SupabaseHttpClient;", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;Lcom/sardarjifood/app/data/network/SupabaseHttpClient;)V", "getCatalog", "Lcom/sardarjifood/app/data/repository/CatalogBundle;", "forceRefresh", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeCatalogRepository implements com.sardarjifood.app.data.repository.CatalogRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDao dao = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient = null;
    
    public NativeCatalogRepository(@org.jetbrains.annotations.NotNull()
    com.google.gson.Gson gson, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.AppDao dao, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getCatalog(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.data.repository.CatalogBundle> $completion) {
        return null;
    }
}