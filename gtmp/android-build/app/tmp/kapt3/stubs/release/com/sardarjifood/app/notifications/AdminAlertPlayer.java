package com.sardarjifood.app.notifications;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000>\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0010\u0010\u0014\u001a\u00020\u00152\u0006\u0010\u0016\u001a\u00020\u0017H\u0016J\u0010\u0010\u0018\u001a\u00020\u00152\b\b\u0002\u0010\u0019\u001a\u00020\u001aJ\u0006\u0010\u001b\u001a\u00020\u0015R\u0016\u0010\u0005\u001a\n \u0006*\u0004\u0018\u00010\u00030\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u001b\u0010\t\u001a\u00020\n8BX\u0082\u0084\u0002\u00a2\u0006\f\n\u0004\b\r\u0010\u000e\u001a\u0004\b\u000b\u0010\fR\u001b\u0010\u000f\u001a\u00020\u00108BX\u0082\u0084\u0002\u00a2\u0006\f\n\u0004\b\u0013\u0010\u000e\u001a\u0004\b\u0011\u0010\u0012\u00a8\u0006\u001c"}, d2 = {"Lcom/sardarjifood/app/notifications/AdminAlertPlayer;", "Landroid/speech/tts/TextToSpeech$OnInitListener;", "context", "Landroid/content/Context;", "(Landroid/content/Context;)V", "appContext", "kotlin.jvm.PlatformType", "speechReady", "", "textToSpeech", "Landroid/speech/tts/TextToSpeech;", "getTextToSpeech", "()Landroid/speech/tts/TextToSpeech;", "textToSpeech$delegate", "Lkotlin/Lazy;", "toneGenerator", "Landroid/media/ToneGenerator;", "getToneGenerator", "()Landroid/media/ToneGenerator;", "toneGenerator$delegate", "onInit", "", "status", "", "playNewOrderAlert", "announcement", "", "release", "app_release"})
public final class AdminAlertPlayer implements android.speech.tts.TextToSpeech.OnInitListener {
    private final android.content.Context appContext = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlin.Lazy toneGenerator$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlin.Lazy textToSpeech$delegate = null;
    private boolean speechReady = false;
    
    public AdminAlertPlayer(@org.jetbrains.annotations.NotNull()
    android.content.Context context) {
        super();
    }
    
    private final android.media.ToneGenerator getToneGenerator() {
        return null;
    }
    
    private final android.speech.tts.TextToSpeech getTextToSpeech() {
        return null;
    }
    
    @java.lang.Override()
    public void onInit(int status) {
    }
    
    public final void playNewOrderAlert(@org.jetbrains.annotations.NotNull()
    java.lang.String announcement) {
    }
    
    public final void release() {
    }
}