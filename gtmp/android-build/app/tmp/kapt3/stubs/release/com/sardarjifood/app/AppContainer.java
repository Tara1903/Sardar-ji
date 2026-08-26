package com.sardarjifood.app;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0082\u0001\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004R\u0011\u0010\u0005\u001a\u00020\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0007\u0010\bR\u0011\u0010\t\u001a\u00020\n\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000b\u0010\fR\u0011\u0010\r\u001a\u00020\u000e\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000f\u0010\u0010R\u0011\u0010\u0011\u001a\u00020\u0012\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0013\u0010\u0014R\u000e\u0010\u0015\u001a\u00020\u0016X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0011\u0010\u0017\u001a\u00020\u0018\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0019\u0010\u001aR\u0011\u0010\u001b\u001a\u00020\u001c\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001d\u0010\u001eR\u0011\u0010\u001f\u001a\u00020 \u00a2\u0006\b\n\u0000\u001a\u0004\b!\u0010\"R\u000e\u0010#\u001a\u00020$X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0011\u0010%\u001a\u00020&\u00a2\u0006\b\n\u0000\u001a\u0004\b\'\u0010(R\u0011\u0010)\u001a\u00020*\u00a2\u0006\b\n\u0000\u001a\u0004\b+\u0010,R\u0011\u0010-\u001a\u00020.\u00a2\u0006\b\n\u0000\u001a\u0004\b/\u00100R\u0011\u00101\u001a\u000202\u00a2\u0006\b\n\u0000\u001a\u0004\b3\u00104R\u000e\u00105\u001a\u000206X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u00107\u001a\u000208X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u00069"}, d2 = {"Lcom/sardarjifood/app/AppContainer;", "", "context", "Landroid/content/Context;", "(Landroid/content/Context;)V", "adminRepository", "Lcom/sardarjifood/app/data/repository/AdminRepository;", "getAdminRepository", "()Lcom/sardarjifood/app/data/repository/AdminRepository;", "authRepository", "Lcom/sardarjifood/app/data/repository/AuthRepository;", "getAuthRepository", "()Lcom/sardarjifood/app/data/repository/AuthRepository;", "cartRepository", "Lcom/sardarjifood/app/data/repository/CartRepository;", "getCartRepository", "()Lcom/sardarjifood/app/data/repository/CartRepository;", "catalogRepository", "Lcom/sardarjifood/app/data/repository/CatalogRepository;", "getCatalogRepository", "()Lcom/sardarjifood/app/data/repository/CatalogRepository;", "database", "Lcom/sardarjifood/app/data/local/AppDatabase;", "deliveryRepository", "Lcom/sardarjifood/app/data/repository/DeliveryRepository;", "getDeliveryRepository", "()Lcom/sardarjifood/app/data/repository/DeliveryRepository;", "gson", "Lcom/google/gson/Gson;", "getGson", "()Lcom/google/gson/Gson;", "networkMonitor", "Lcom/sardarjifood/app/data/network/NetworkMonitor;", "getNetworkMonitor", "()Lcom/sardarjifood/app/data/network/NetworkMonitor;", "okHttpClient", "Lokhttp3/OkHttpClient;", "ordersRepository", "Lcom/sardarjifood/app/data/repository/OrdersRepository;", "getOrdersRepository", "()Lcom/sardarjifood/app/data/repository/OrdersRepository;", "preferencesStore", "Lcom/sardarjifood/app/data/local/AppPreferencesStore;", "getPreferencesStore", "()Lcom/sardarjifood/app/data/local/AppPreferencesStore;", "profileRepository", "Lcom/sardarjifood/app/data/repository/ProfileRepository;", "getProfileRepository", "()Lcom/sardarjifood/app/data/repository/ProfileRepository;", "sessionStore", "Lcom/sardarjifood/app/data/local/SessionStore;", "getSessionStore", "()Lcom/sardarjifood/app/data/local/SessionStore;", "siteHttpClient", "Lcom/sardarjifood/app/data/network/SiteHttpClient;", "supabaseHttpClient", "Lcom/sardarjifood/app/data/network/SupabaseHttpClient;", "app_release"})
public final class AppContainer {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final okhttp3.OkHttpClient okHttpClient = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDatabase database = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.SessionStore sessionStore = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppPreferencesStore preferencesStore = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.NetworkMonitor networkMonitor = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SiteHttpClient siteHttpClient = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.AuthRepository authRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.CatalogRepository catalogRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.CartRepository cartRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.OrdersRepository ordersRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.ProfileRepository profileRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.AdminRepository adminRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.repository.DeliveryRepository deliveryRepository = null;
    
    public AppContainer(@org.jetbrains.annotations.NotNull()
    android.content.Context context) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.google.gson.Gson getGson() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.local.SessionStore getSessionStore() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.local.AppPreferencesStore getPreferencesStore() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.network.NetworkMonitor getNetworkMonitor() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.AuthRepository getAuthRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.CatalogRepository getCatalogRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.CartRepository getCartRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.OrdersRepository getOrdersRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.ProfileRepository getProfileRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.AdminRepository getAdminRepository() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.data.repository.DeliveryRepository getDeliveryRepository() {
        return null;
    }
}