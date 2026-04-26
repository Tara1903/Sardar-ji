package com.sardarjifood.app.notifications

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.speech.tts.TextToSpeech
import com.sardarjifood.app.AppLog
import java.util.Locale

class AdminAlertPlayer(context: Context) : TextToSpeech.OnInitListener {
    private val appContext = context.applicationContext
    private val toneGenerator by lazy { ToneGenerator(AudioManager.STREAM_NOTIFICATION, 90) }
    private val textToSpeech by lazy { TextToSpeech(appContext, this) }
    private var speechReady = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            runCatching {
                textToSpeech.language = Locale("en", "IN")
                textToSpeech.setSpeechRate(1f)
                speechReady = true
            }.onFailure {
                speechReady = false
                AppLog.warn("AdminAlertPlayer", "Text-to-speech init failed.", it)
            }
        } else {
            speechReady = false
        }
    }

    fun playNewOrderAlert(announcement: String = "New order received") {
        runCatching {
            toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP2, 180)
        }.onFailure {
            AppLog.warn("AdminAlertPlayer", "Unable to play admin beep alert.", it)
        }

        if (!speechReady) {
            runCatching { textToSpeech }
                .onFailure { AppLog.warn("AdminAlertPlayer", "Unable to prepare text-to-speech.", it) }
            return
        }

        runCatching {
            textToSpeech.stop()
            textToSpeech.speak(announcement, TextToSpeech.QUEUE_FLUSH, null, "sjfc-admin-alert")
        }.onFailure {
            AppLog.warn("AdminAlertPlayer", "Unable to speak admin alert.", it)
        }
    }

    fun release() {
        runCatching { toneGenerator.release() }
        runCatching {
            textToSpeech.stop()
            textToSpeech.shutdown()
        }
    }
}
