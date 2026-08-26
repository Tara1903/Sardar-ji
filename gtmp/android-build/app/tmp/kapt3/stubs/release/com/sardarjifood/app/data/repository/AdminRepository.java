package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00004\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\bf\u0018\u00002\u00020\u0001J \u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\n\b\u0002\u0010\u0005\u001a\u0004\u0018\u00010\u0006H\u00a6@\u00a2\u0006\u0002\u0010\u0007J\u001e\u0010\b\u001a\u00020\t2\u0006\u0010\n\u001a\u00020\u00062\u0006\u0010\u000b\u001a\u00020\fH\u00a6@\u00a2\u0006\u0002\u0010\rJ6\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00062\u0006\u0010\u0011\u001a\u00020\u00062\u0006\u0010\u0012\u001a\u00020\u00062\u0006\u0010\u0013\u001a\u00020\u00062\u0006\u0010\u0014\u001a\u00020\u0006H\u00a6@\u00a2\u0006\u0002\u0010\u0015\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\u0016\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/repository/AdminRepository;", "", "getUsers", "", "Lcom/sardarjifood/app/model/UserProfile;", "role", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateProductAvailability", "Lcom/sardarjifood/app/model/Product;", "productId", "isAvailable", "", "(Ljava/lang/String;ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateStorefrontTheme", "Lcom/sardarjifood/app/model/StoreSettings;", "businessName", "tagline", "phoneNumber", "whatsappNumber", "timings", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public abstract interface AdminRepository {
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getUsers(@org.jetbrains.annotations.Nullable()
    java.lang.String role, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.UserProfile>> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateProductAvailability(@org.jetbrains.annotations.NotNull()
    java.lang.String productId, boolean isAvailable, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Product> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object updateStorefrontTheme(@org.jetbrains.annotations.NotNull()
    java.lang.String businessName, @org.jetbrains.annotations.NotNull()
    java.lang.String tagline, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String whatsappNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String timings, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.StoreSettings> $completion);
}