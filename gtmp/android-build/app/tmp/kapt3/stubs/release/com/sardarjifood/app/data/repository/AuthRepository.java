package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00008\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0010\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0003\bf\u0018\u00002\u00020\u0001J\u0010\u0010\u0007\u001a\u0004\u0018\u00010\bH\u00a6@\u00a2\u0006\u0002\u0010\tJ\u0016\u0010\n\u001a\u00020\u000b2\u0006\u0010\f\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u000eJ\u0016\u0010\u000f\u001a\u00020\u000b2\u0006\u0010\f\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u000eJ\u0016\u0010\u0010\u001a\u00020\u000b2\u0006\u0010\u0011\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u000eJ\u0010\u0010\u0012\u001a\u0004\u0018\u00010\u0004H\u00a6@\u00a2\u0006\u0002\u0010\tJ\u001e\u0010\u0013\u001a\u00020\u00042\u0006\u0010\u0011\u001a\u00020\r2\u0006\u0010\u0014\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u0015J\u000e\u0010\u0016\u001a\u00020\u000bH\u00a6@\u00a2\u0006\u0002\u0010\tJ8\u0010\u0017\u001a\u00020\u00042\u0006\u0010\u0018\u001a\u00020\r2\u0006\u0010\u0011\u001a\u00020\r2\u0006\u0010\u0019\u001a\u00020\r2\u0006\u0010\u0014\u001a\u00020\r2\b\b\u0002\u0010\u001a\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u001bJ\u001c\u0010\u001c\u001a\u00020\b2\f\u0010\u001d\u001a\b\u0012\u0004\u0012\u00020\u001f0\u001eH\u00a6@\u00a2\u0006\u0002\u0010 J\u001e\u0010!\u001a\u00020\b2\u0006\u0010\u0018\u001a\u00020\r2\u0006\u0010\u0011\u001a\u00020\rH\u00a6@\u00a2\u0006\u0002\u0010\u0015R\u001a\u0010\u0002\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\u00040\u0003X\u00a6\u0004\u00a2\u0006\u0006\u001a\u0004\b\u0005\u0010\u0006\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\"\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/repository/AuthRepository;", "", "sessionFlow", "Lkotlinx/coroutines/flow/Flow;", "Lcom/sardarjifood/app/model/AppSession;", "getSessionFlow", "()Lkotlinx/coroutines/flow/Flow;", "refreshProfile", "Lcom/sardarjifood/app/model/UserProfile;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "registerNativePushToken", "", "token", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "removeNativePushToken", "requestPasswordReset", "email", "restoreSession", "signIn", "password", "(Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "signOut", "signUp", "name", "phoneNumber", "referralCode", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateAddresses", "addresses", "", "Lcom/sardarjifood/app/model/Address;", "(Ljava/util/List;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateProfile", "app_release"})
public abstract interface AuthRepository {
    
    @org.jetbrains.annotations.NotNull()
    public abstract kotlinx.coroutines.flow.Flow<com.sardarjifood.app.model.AppSession> getSessionFlow();
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object restoreSession(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object signIn(@org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    java.lang.String password, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object signUp(@org.jetbrains.annotations.NotNull()
    java.lang.String name, @org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String password, @org.jetbrains.annotations.NotNull()
    java.lang.String referralCode, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.AppSession> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object signOut(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object requestPasswordReset(@org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object refreshProfile(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateProfile(@org.jetbrains.annotations.NotNull()
    java.lang.String name, @org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateAddresses(@org.jetbrains.annotations.NotNull()
    java.util.List<com.sardarjifood.app.model.Address> addresses, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.UserProfile> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object registerNativePushToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object removeNativePushToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}