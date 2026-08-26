package com.sardarjifood.app.model;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000(\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\b\n\u0002\b\u0007\n\u0002\u0010\u0006\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0004\n\u0002\u0010\u000e\n\u0002\b-\b\u0086\b\u0018\u00002\u00020\u0001B\u009d\u0001\u0012\b\b\u0002\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0004\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0005\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0006\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0007\u001a\u00020\u0003\u0012\b\b\u0002\u0010\b\u001a\u00020\u0003\u0012\b\b\u0002\u0010\t\u001a\u00020\u0003\u0012\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u000b\u0012\b\b\u0002\u0010\f\u001a\u00020\r\u0012\b\b\u0002\u0010\u000e\u001a\u00020\r\u0012\b\b\u0002\u0010\u000f\u001a\u00020\r\u0012\b\b\u0002\u0010\u0010\u001a\u00020\r\u0012\b\b\u0002\u0010\u0011\u001a\u00020\u0012\u0012\b\b\u0002\u0010\u0013\u001a\u00020\u0012\u0012\b\b\u0002\u0010\u0014\u001a\u00020\u0012\u00a2\u0006\u0002\u0010\u0015J\t\u0010*\u001a\u00020\u0003H\u00c6\u0003J\t\u0010+\u001a\u00020\rH\u00c6\u0003J\t\u0010,\u001a\u00020\rH\u00c6\u0003J\t\u0010-\u001a\u00020\rH\u00c6\u0003J\t\u0010.\u001a\u00020\u0012H\u00c6\u0003J\t\u0010/\u001a\u00020\u0012H\u00c6\u0003J\t\u00100\u001a\u00020\u0012H\u00c6\u0003J\t\u00101\u001a\u00020\u0003H\u00c6\u0003J\t\u00102\u001a\u00020\u0003H\u00c6\u0003J\t\u00103\u001a\u00020\u0003H\u00c6\u0003J\t\u00104\u001a\u00020\u0003H\u00c6\u0003J\t\u00105\u001a\u00020\u0003H\u00c6\u0003J\t\u00106\u001a\u00020\u0003H\u00c6\u0003J\u0010\u00107\u001a\u0004\u0018\u00010\u000bH\u00c6\u0003\u00a2\u0006\u0002\u0010\u001fJ\t\u00108\u001a\u00020\rH\u00c6\u0003J\u00a6\u0001\u00109\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00032\b\b\u0002\u0010\u0005\u001a\u00020\u00032\b\b\u0002\u0010\u0006\u001a\u00020\u00032\b\b\u0002\u0010\u0007\u001a\u00020\u00032\b\b\u0002\u0010\b\u001a\u00020\u00032\b\b\u0002\u0010\t\u001a\u00020\u00032\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u000b2\b\b\u0002\u0010\f\u001a\u00020\r2\b\b\u0002\u0010\u000e\u001a\u00020\r2\b\b\u0002\u0010\u000f\u001a\u00020\r2\b\b\u0002\u0010\u0010\u001a\u00020\r2\b\b\u0002\u0010\u0011\u001a\u00020\u00122\b\b\u0002\u0010\u0013\u001a\u00020\u00122\b\b\u0002\u0010\u0014\u001a\u00020\u0012H\u00c6\u0001\u00a2\u0006\u0002\u0010:J\u0013\u0010;\u001a\u00020\r2\b\u0010<\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010=\u001a\u00020\u0003H\u00d6\u0001J\t\u0010>\u001a\u00020\u0012H\u00d6\u0001R\u0011\u0010\u0004\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0016\u0010\u0017R\u0011\u0010\u0007\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0018\u0010\u0017R\u0011\u0010\u0005\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0019\u0010\u0017R\u0011\u0010\u0011\u001a\u00020\u0012\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001a\u0010\u001bR\u0011\u0010\u0013\u001a\u00020\u0012\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001c\u0010\u001bR\u0011\u0010\b\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001d\u0010\u0017R\u0015\u0010\n\u001a\u0004\u0018\u00010\u000b\u00a2\u0006\n\n\u0002\u0010 \u001a\u0004\b\u001e\u0010\u001fR\u0011\u0010\u0010\u001a\u00020\r\u00a2\u0006\b\n\u0000\u001a\u0004\b!\u0010\"R\u0011\u0010\u0006\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b#\u0010\u0017R\u0011\u0010\f\u001a\u00020\r\u00a2\u0006\b\n\u0000\u001a\u0004\b$\u0010\"R\u0011\u0010\u0014\u001a\u00020\u0012\u00a2\u0006\b\n\u0000\u001a\u0004\b%\u0010\u001bR\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b&\u0010\u0017R\u0011\u0010\u000e\u001a\u00020\r\u00a2\u0006\b\n\u0000\u001a\u0004\b\'\u0010\"R\u0011\u0010\u000f\u001a\u00020\r\u00a2\u0006\b\n\u0000\u001a\u0004\b(\u0010\"R\u0011\u0010\t\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b)\u0010\u0017\u00a8\u0006?"}, d2 = {"Lcom/sardarjifood/app/model/CartPricing;", "", "subtotal", "", "baseDeliveryFee", "deliveryFee", "handlingFee", "deliveryDiscount", "discount", "total", "distanceKm", "", "notDeliverable", "", "threshold1Unlocked", "threshold2Unlocked", "freebieUnlocked", "deliveryFeeLabel", "", "deliveryMessage", "offerMessage", "(IIIIIIILjava/lang/Double;ZZZZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", "getBaseDeliveryFee", "()I", "getDeliveryDiscount", "getDeliveryFee", "getDeliveryFeeLabel", "()Ljava/lang/String;", "getDeliveryMessage", "getDiscount", "getDistanceKm", "()Ljava/lang/Double;", "Ljava/lang/Double;", "getFreebieUnlocked", "()Z", "getHandlingFee", "getNotDeliverable", "getOfferMessage", "getSubtotal", "getThreshold1Unlocked", "getThreshold2Unlocked", "getTotal", "component1", "component10", "component11", "component12", "component13", "component14", "component15", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "(IIIIIIILjava/lang/Double;ZZZZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)Lcom/sardarjifood/app/model/CartPricing;", "equals", "other", "hashCode", "toString", "app_release"})
public final class CartPricing {
    private final int subtotal = 0;
    private final int baseDeliveryFee = 0;
    private final int deliveryFee = 0;
    private final int handlingFee = 0;
    private final int deliveryDiscount = 0;
    private final int discount = 0;
    private final int total = 0;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Double distanceKm = null;
    private final boolean notDeliverable = false;
    private final boolean threshold1Unlocked = false;
    private final boolean threshold2Unlocked = false;
    private final boolean freebieUnlocked = false;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String deliveryFeeLabel = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String deliveryMessage = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String offerMessage = null;
    
    public CartPricing(int subtotal, int baseDeliveryFee, int deliveryFee, int handlingFee, int deliveryDiscount, int discount, int total, @org.jetbrains.annotations.Nullable()
    java.lang.Double distanceKm, boolean notDeliverable, boolean threshold1Unlocked, boolean threshold2Unlocked, boolean freebieUnlocked, @org.jetbrains.annotations.NotNull()
    java.lang.String deliveryFeeLabel, @org.jetbrains.annotations.NotNull()
    java.lang.String deliveryMessage, @org.jetbrains.annotations.NotNull()
    java.lang.String offerMessage) {
        super();
    }
    
    public final int getSubtotal() {
        return 0;
    }
    
    public final int getBaseDeliveryFee() {
        return 0;
    }
    
    public final int getDeliveryFee() {
        return 0;
    }
    
    public final int getHandlingFee() {
        return 0;
    }
    
    public final int getDeliveryDiscount() {
        return 0;
    }
    
    public final int getDiscount() {
        return 0;
    }
    
    public final int getTotal() {
        return 0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getDistanceKm() {
        return null;
    }
    
    public final boolean getNotDeliverable() {
        return false;
    }
    
    public final boolean getThreshold1Unlocked() {
        return false;
    }
    
    public final boolean getThreshold2Unlocked() {
        return false;
    }
    
    public final boolean getFreebieUnlocked() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getDeliveryFeeLabel() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getDeliveryMessage() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getOfferMessage() {
        return null;
    }
    
    public CartPricing() {
        super();
    }
    
    public final int component1() {
        return 0;
    }
    
    public final boolean component10() {
        return false;
    }
    
    public final boolean component11() {
        return false;
    }
    
    public final boolean component12() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component13() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component14() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component15() {
        return null;
    }
    
    public final int component2() {
        return 0;
    }
    
    public final int component3() {
        return 0;
    }
    
    public final int component4() {
        return 0;
    }
    
    public final int component5() {
        return 0;
    }
    
    public final int component6() {
        return 0;
    }
    
    public final int component7() {
        return 0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double component8() {
        return null;
    }
    
    public final boolean component9() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.sardarjifood.app.model.CartPricing copy(int subtotal, int baseDeliveryFee, int deliveryFee, int handlingFee, int deliveryDiscount, int discount, int total, @org.jetbrains.annotations.Nullable()
    java.lang.Double distanceKm, boolean notDeliverable, boolean threshold1Unlocked, boolean threshold2Unlocked, boolean freebieUnlocked, @org.jetbrains.annotations.NotNull()
    java.lang.String deliveryFeeLabel, @org.jetbrains.annotations.NotNull()
    java.lang.String deliveryMessage, @org.jetbrains.annotations.NotNull()
    java.lang.String offerMessage) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}