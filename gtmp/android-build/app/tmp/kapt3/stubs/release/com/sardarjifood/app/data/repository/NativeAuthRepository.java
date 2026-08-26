package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000d\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0010\u0002\n\u0002\b\u0005\n\u0002\u0010 \n\u0002\u0010$\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u000e\u0018\u00002\u00020\u0001B%\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u00a2\u0006\u0002\u0010\nJ\u0012\u0010\u0012\u001a\u0004\u0018\u00010\rH\u0080@\u00a2\u0006\u0004\b\u0013\u0010\u0014J\u0016\u0010\u0015\u001a\u00020\r2\u0006\u0010\u0016\u001a\u00020\u0017H\u0082@\u00a2\u0006\u0002\u0010\u0018J\u001e\u0010\u0019\u001a\u00020\u001a2\u0006\u0010\u0016\u001a\u00020\u00172\u0006\u0010\u001b\u001a\u00020\u0017H\u0082@\u00a2\u0006\u0002\u0010\u001cJ\u0016\u0010\u001d\u001a\u00020\r2\u0006\u0010\u001e\u001a\u00020\rH\u0082@\u00a2\u0006\u0002\u0010\u001fJ\u0010\u0010 \u001a\u0004\u0018\u00010\u001aH\u0096@\u00a2\u0006\u0002\u0010\u0014J\u0016\u0010!\u001a\u00020\"2\u0006\u0010\u0016\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u0018J\u0016\u0010#\u001a\u00020\"2\u0006\u0010\u0016\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u0018J\u0016\u0010$\u001a\u00020\"2\u0006\u0010%\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u0018J\u0010\u0010&\u001a\u0004\u0018\u00010\rH\u0096@\u00a2\u0006\u0002\u0010\u0014J>\u0010\'\u001a\u0016\u0012\u0012\u0012\u0010\u0012\u0004\u0012\u00020\u0017\u0012\u0006\u0012\u0004\u0018\u00010*0)0(2\f\u0010+\u001a\b\u0012\u0004\u0012\u00020,0(2\u0006\u0010-\u001a\u00020\u001a2\n\b\u0002\u0010.\u001a\u0004\u0018\u00010\u0017H\u0002J\u001e\u0010/\u001a\u00020\r2\u0006\u0010%\u001a\u00020\u00172\u0006\u00100\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u001cJ\u000e\u00101\u001a\u00020\"H\u0096@\u00a2\u0006\u0002\u0010\u0014J6\u00102\u001a\u00020\r2\u0006\u00103\u001a\u00020\u00172\u0006\u0010%\u001a\u00020\u00172\u0006\u00104\u001a\u00020\u00172\u0006\u00100\u001a\u00020\u00172\u0006\u00105\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u00106J\u001c\u00107\u001a\u00020\u001a2\f\u0010+\u001a\b\u0012\u0004\u0012\u00020,0(H\u0096@\u00a2\u0006\u0002\u00108J\u001e\u00109\u001a\u00020\u001a2\u0006\u00103\u001a\u00020\u00172\u0006\u0010%\u001a\u00020\u0017H\u0096@\u00a2\u0006\u0002\u0010\u001cR\u0016\u0010\u000b\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\r0\fX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001c\u0010\u000e\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\r0\u000fX\u0096\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u0011R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006:"}, d2 = {"Lcom/sardarjifood/app/data/repository/NativeAuthRepository;", "Lcom/sardarjifood/app/data/repository/AuthRepository;", "gson", "Lcom/google/gson/Gson;", "dao", "Lcom/sardarjifood/app/data/local/AppDao;", "sessionStore", "Lcom/sardarjifood/app/data/local/SessionStore;", "supabaseHttpClient", "Lcom/sardarjifood/app/data/network/SupabaseHttpClient;", "(Lcom/google/gson/Gson;Lcom/sardarjifood/app/data/local/AppDao;Lcom/sardarjifood/app/data/local/SessionStore;Lcom/sardarjifood/app/data/network/SupabaseHttpClient;)V", "_sessionFlow", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/sardarjifood/app/model/AppSession;", "sessionFlow", "Lkotlinx/coroutines/flow/Flow;", "getSessionFlow", "()Lkotlinx/coroutines/flow/Flow;", "currentSession", "currentSession$app_release", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "fetchSession", "token", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "fetchUserProfile", "Lcom/sardarjifood/app/model/UserProfile;", "userId", "(Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "persistSession", "session", "(Lcom/sardarjifood/app/model/AppSession;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "refreshProfile", "registerNativePushToken", "", "removeNativePushToken", "requestPasswordReset", "email", "restoreSession", "serializeAddressesPayload", "", "", "", "addresses", "Lcom/sardarjifood/app/model/Address;", "user", "nativePushToken", "signIn", "password", "signOut", "signUp", "name", "phoneNumber", "referralCode", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateAddresses", "(Ljava/util/List;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateProfile", "app_release"})
public final class NativeAuthRepository implements com.sardarjifood.app.data.repository.AuthRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.AppDao dao = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.local.SessionStore sessionStore = null;
    @org.jetbrains.annotations.NotNull()
    private final com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.sardarjifood.app.model.AppSession> _sessionFlow = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.Flow<com.sardarjifood.app.model.AppSession> sessionFlow = null;
    
    public NativeAuthRepository(@org.jetbrains.annotations.NotNull()
    com.google.gson.Gson gson, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.AppDao dao, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.local.SessionStore sessionStore, @org.jetbrains.annotations.NotNull()
    com.sardarjifood.app.data.network.SupabaseHttpClient supabaseHttpClient) {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public kotlinx.coroutines.flow.Flow<com.sardarjifood.app.model.AppSession> getSessionFlow() {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object restoreSession(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object signIn(@org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    java.lang.String password, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object signUp(@org.jetbrains.annotations.NotNull()
    java.lang.String name, @org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String password, @org.jetbrains.annotations.NotNull()
    java.lang.String referralCode, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object signOut(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object requestPasswordReset(@org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object refreshProfile(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateProfile(@org.jetbrains.annotations.NotNull()
    java.lang.String name, @org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object updateAddresses(@org.jetbrains.annotations.NotNull()
    java.util.List<com.sardarjifood.app.model.Address> addresses, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object registerNativePushToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.Nullable()
    public java.lang.Object removeNativePushToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object currentSession$app_release(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    private final java.lang.Object fetchSession(java.lang.String token, kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    private final java.lang.Object fetchUserProfile(java.lang.String token, java.lang.String userId, kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion) {
        return null;
    }
    
    private final java.lang.Object persistSession(com.sardarjifood.app.model.AppSession session, kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion) {
        return null;
    }
    
    private final java.util.List<java.util.Map<java.lang.String, java.lang.Object>> serializeAddressesPayload(java.util.List<com.sardarjifood.app.model.Address> addresses, com.sardarjifood.app.model.UserProfile user, java.lang.String nativePushToken) {
        return null;
    }
}