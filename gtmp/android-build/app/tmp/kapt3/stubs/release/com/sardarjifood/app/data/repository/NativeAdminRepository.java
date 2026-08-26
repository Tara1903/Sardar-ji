package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000V\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\u0018\u00002\u00020\u0001B%\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u00a2\u0006\u0002\u0010\nJ\u001e\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\r0\f2\b\u0010\u000e\u001a\u0004\u0018\u00010\u000fH\u0096@\u00a2\u0006\u0002\u0010\u0010J\u000e\u0010\u0011\u001a\u00020\u0012H\u0082@\u00a2\u0006\u0002\u0010\u0013J\u001e\u0010\u0014\u001a\u00020\u00152\u0006\u0010\u0016\u001a\u00020\u000f2\u0006\u0010\u0017\u001a\u00020\u0018H\u0096@\u00a2\u0006\u0002\u0010\u0019J6\u0010\u001a\u001a\u00020\u001b2\u0006\u0010\u001c\u001a\u00020\u000f2\u0006\u0010\u001d\u001a\u00020\u000f2\u0006\u0010\u001e\u001a\u00020\u000f2\u0006\u0010\u001f\u001a\u00020\u000f2\u0006\u0010 \u001a\u00020\u000fH\u0096@\u00a2\u0006\u0002\u0010!R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\""}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeAdminRepository;", "Lcom/sardarjifood/app/data/repository/AdminRepository;", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "authRepository", "Lcom/sardarjifood/app/data/repository/AuthRepository;", "supabaseHttpClient", "Lcom/sardarjifood/app/data/network/SupabaseHttpClient;", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;Lcom/sardarjifood/app/data/repository/AuthRepository;Lcom/sardarjifood/app/data/network/SupabaseHttpClient;)V", "getUsers", "", "Lcom/sardarjifood/app/model/UserProfile;", "role", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "requireSession", "Lcom/sardarjifood/app/model/AppSession;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateProductAvailability", "Lcom/sardarjifood/app/model/Product;", "productId", "isAvailable", "", "(Ljava/lang/String;ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateStorefrontTheme", "Lcom/sardarjifood/app/model/StoreSettings;", "businessName", "tagline", "phoneNumber", "whatsappNumber", "timings", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class NativeAdminRepository implements com.sardarjifood.app.data.repository.AdminRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDao dao = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.AuthRepository authRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient = null;
    
    public NativeAdminRepository(@org.jetbrains.annotations.NotNull()
    com.google.gson.Gson gson, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.AppDao dao, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.repository.AuthRepository authRepository, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object getUsers(@org.jetbrains.annotations.Nullable()
    java.lang.String role, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.UserProfile>> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateProductAvailability(@org.jetbrains.annotations.NotNull()
    java.lang.String productId, boolean isAvailable, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Product> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateStorefrontTheme(@org.jetbrains.annotations.NotNull()
    java.lang.String businessName, @org.jetbrains.annotations.NotNull()
    java.lang.String tagline, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String whatsappNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String timings, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.StoreSettings> $completion) {
        return null;
    }
    
    private final java.lang.Object requireSession(kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
}