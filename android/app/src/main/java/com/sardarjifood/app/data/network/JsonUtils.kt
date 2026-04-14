package com.sardarjifood.app.data.network

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser

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
    get(name)?.takeIf { !it.isJsonNull }?.asString ?: fallback

internal fun JsonObject.int(name: String, fallback: Int = 0): Int =
    get(name)?.takeIf { !it.isJsonNull }?.asInt ?: fallback

internal fun JsonObject.double(name: String, fallback: Double = 0.0): Double =
    get(name)?.takeIf { !it.isJsonNull }?.asDouble ?: fallback

internal fun JsonObject.bool(name: String, fallback: Boolean = false): Boolean =
    get(name)?.takeIf { !it.isJsonNull }?.asBoolean ?: fallback

internal fun JsonObject.array(name: String): JsonArray = get(name).asJsonArrayOrEmpty()

internal fun JsonObject.obj(name: String): JsonObject = get(name).asJsonObjectOrEmpty()

internal fun parseJsonElement(value: String): JsonElement = JsonParser.parseString(value)
