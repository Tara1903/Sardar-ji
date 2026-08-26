package com.sardarjifood.app.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\"\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\bf\u0018\u00002\u00020\u0001J\u001e\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\b\b\u0002\u0010\u0005\u001a\u00020\u0006H\u00a6@\u00a2\u0006\u0002\u0010\u0007J\u001a\u0010\b\u001a\u0004\u0018\u00010\t2\b\b\u0002\u0010\u0005\u001a\u00020\u0006H\u00a6@\u00a2\u0006\u0002\u0010\u0007\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\n\u00c0\u0006\u0001"}, d2 = {"Lcom/sardarjifood/app/data/repository/ProfileRepository;", "", "getRewardCoupons", "", "Lcom/sardarjifood/app/model/RewardCoupon;", "forceRefresh", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getSubscription", "Lcom/sardarjifood/app/model/Subscription;", "app_release"})
public abstract interface ProfileRepository {
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getSubscription(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.sardarjifood.app.model.Subscription> $completion);
    
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getRewardCoupons(boolean forceRefresh, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.sardarjifood.app.model.RewardCoupon>> $completion);
}