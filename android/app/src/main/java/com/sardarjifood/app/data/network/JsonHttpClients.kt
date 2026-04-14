package com.sardarjifood.app.data.network

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.sardarjifood.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class AppHttpException(message: String, val statusCode: Int) : Exception(message)

class SupabaseHttpClient(
    private val okHttpClient: OkHttpClient,
    private val gson: Gson,
) {
    suspend fun request(
        path: String,
        method: String = "GET",
        token: String? = null,
        body: Any? = null,
        preferRepresentation: Boolean = false,
        extraHeaders: Map<String, String> = emptyMap(),
    ): JsonElement = withContext(Dispatchers.IO) {
        val requestBuilder = Request.Builder()
            .url("${BuildConfig.SUPABASE_URL.trimEnd('/')}/$path")
            .header("apikey", BuildConfig.SUPABASE_ANON_KEY)
            .header("Authorization", "Bearer ${token ?: BuildConfig.SUPABASE_ANON_KEY}")

        if (preferRepresentation) {
            requestBuilder.header("Prefer", "return=representation")
        }

        extraHeaders.forEach { (key, value) ->
            requestBuilder.header(key, value)
        }

        val requestBody =
            if (body != null) {
                gson.toJson(body).toRequestBody("application/json".toMediaType())
            } else {
                null
            }

        when (method.uppercase()) {
            "POST" -> requestBuilder.post(requestBody ?: "{}".toRequestBody("application/json".toMediaType()))
            "PATCH" -> requestBuilder.patch(requestBody ?: "{}".toRequestBody("application/json".toMediaType()))
            "PUT" -> requestBuilder.put(requestBody ?: "{}".toRequestBody("application/json".toMediaType()))
            "DELETE" -> if (requestBody != null) requestBuilder.delete(requestBody) else requestBuilder.delete()
            else -> requestBuilder.get()
        }

        okHttpClient.newCall(requestBuilder.build()).execute().use { response ->
            val rawBody = response.body?.string().orEmpty()
            val json = if (rawBody.isBlank()) JsonObject() else parseJsonElement(rawBody)

            if (!response.isSuccessful) {
                val message =
                    json.asJsonObjectOrEmpty().string("message")
                        .ifBlank { json.asJsonObjectOrEmpty().string("error_description") }
                        .ifBlank { json.asJsonObjectOrEmpty().string("msg") }
                        .ifBlank { "Request failed with ${response.code}" }
                throw AppHttpException(message, response.code)
            }

            json
        }
    }
}

class SiteHttpClient(
    private val okHttpClient: OkHttpClient,
    private val gson: Gson,
) {
    suspend fun request(
        path: String,
        method: String = "GET",
        token: String? = null,
        body: Any? = null,
    ): JsonElement = withContext(Dispatchers.IO) {
        val requestBuilder = Request.Builder()
            .url("${BuildConfig.APP_BASE_URL.trimEnd('/')}/${path.trimStart('/')}")
            .header("Accept", "application/json")

        if (!token.isNullOrBlank()) {
            requestBuilder.header("Authorization", "Bearer $token")
        }

        val requestBody =
            if (body != null) {
                gson.toJson(body).toRequestBody("application/json".toMediaType())
            } else {
                null
            }

        when (method.uppercase()) {
            "POST" -> requestBuilder.post(requestBody ?: "{}".toRequestBody("application/json".toMediaType()))
            else -> requestBuilder.get()
        }

        okHttpClient.newCall(requestBuilder.build()).execute().use { response ->
            val rawBody = response.body?.string().orEmpty()
            val json = if (rawBody.isBlank()) JsonObject() else parseJsonElement(rawBody)

            if (!response.isSuccessful) {
                val message =
                    json.asJsonObjectOrEmpty().string("message").ifBlank { "Request failed with ${response.code}" }
                throw AppHttpException(message, response.code)
            }

            json
        }
    }
}

fun createSharedHttpClient(): OkHttpClient =
    OkHttpClient.Builder()
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .writeTimeout(25, TimeUnit.SECONDS)
        .build()
