package com.sardarjifood.app.model

enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM,
}

data class AppPreferences(
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val notificationsEnabled: Boolean = true,
    val favoriteProductIds: Set<String> = emptySet(),
    val lastCustomerTab: Int = 0,
    val lastDeliverySegment: Int = 0,
)
