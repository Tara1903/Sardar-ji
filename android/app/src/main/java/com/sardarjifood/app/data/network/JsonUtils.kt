package com.sardarjifood.app.data.network

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.sardarjifood.app.AppLog

internal fun JsonElement?.asJsonObjectOrEmpty(): JsonObject =
    when {
        this == null || this.isJsonNull -> JsonObject()
        this.isJsonObject -> this.asJsonObject
        else -> JsonObject()
    }

internal fun JsonElement?.asJsonArrayOrEmpty(): JsonArray =
    when {
        this == null || this.isJsonNull -> JsonArray()
        this.isJsonArray -> this.asJsonArray
        else -> JsonArray()
    }

internal fun JsonObject.string(name: String, fallback: String = ""): String =
    get(name).safeString(fallback)

internal fun JsonObject.int(name: String, fallback: Int = 0): Int =
    get(name).safeInt(fallback)

internal fun JsonObject.double(name: String, fallback: Double = 0.0): Double =
    get(name).safeDouble(fallback)

internal fun JsonObject.bool(name: String, fallback: Boolean = false): Boolean =
    get(name).safeBoolean(fallback)

internal fun JsonObject.array(name: String): JsonArray = get(name).asJsonArrayOrEmpty()

internal fun JsonObject.obj(name: String): JsonObject = get(name).asJsonObjectOrEmpty()

internal fun JsonElement?.safeString(fallback: String = ""): String =
    runCatching {
        when {
            this == null || isJsonNull -> fallback
            isJsonPrimitive -> asJsonPrimitive.asString
            else -> fallback
        }
    }.getOrDefault(fallback)

internal fun JsonElement?.safeInt(fallback: Int = 0): Int =
    runCatching {
        when {
            this == null || isJsonNull -> fallback
            !isJsonPrimitive -> fallback
            asJsonPrimitive.isNumber -> asInt
            asJsonPrimitive.isString -> asString.trim().toIntOrNull() ?: fallback
            asJsonPrimitive.isBoolean -> if (asBoolean) 1 else 0
            else -> fallback
        }
    }.getOrDefault(fallback)

internal fun JsonElement?.safeDouble(fallback: Double = 0.0): Double =
    runCatching {
        when {
            this == null || isJsonNull -> fallback
            !isJsonPrimitive -> fallback
            asJsonPrimitive.isNumber -> asDouble
            asJsonPrimitive.isString -> asString.trim().toDoubleOrNull() ?: fallback
            asJsonPrimitive.isBoolean -> if (asBoolean) 1.0 else 0.0
            else -> fallback
        }
    }.getOrDefault(fallback)

internal fun JsonElement?.safeBoolean(fallback: Boolean = false): Boolean =
    runCatching {
        when {
            this == null || isJsonNull -> fallback
            !isJsonPrimitive -> fallback
            asJsonPrimitive.isBoolean -> asBoolean
            asJsonPrimitive.isNumber -> asInt != 0
            asJsonPrimitive.isString -> {
                when (asString.trim().lowercase()) {
                    "true", "1", "yes", "y" -> true
                    "false", "0", "no", "n" -> false
                    else -> fallback
                }
            }
            else -> fallback
        }
    }.getOrDefault(fallback)

internal fun JsonArray.safeStringList(): List<String> =
    mapNotNull { it.safeString().takeIf(String::isNotBlank) }

internal fun parseJsonElement(value: String): JsonElement =
    runCatching { JsonParser.parseString(value) }
        .onFailure { throwable ->
            AppLog.warn("JsonUtils", "Received malformed JSON payload. Falling back to empty object.", throwable)
        }.getOrDefault(JsonObject())
