package com.sardarjifood.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors =
    lightColorScheme(
        primary = Color(0xFFF97316),
        secondary = Color(0xFF15803D),
        tertiary = Color(0xFFDC2626),
        background = Color(0xFFFFF7ED),
        surface = Color(0xFFFFFFFF),
        surfaceVariant = Color(0xFFFEEBC8),
        onPrimary = Color.White,
        onSecondary = Color.White,
        onBackground = Color(0xFF1C130E),
        onSurface = Color(0xFF1C130E),
        onSurfaceVariant = Color(0xFF6B4E2E),
    )

private val DarkColors =
    darkColorScheme(
        primary = Color(0xFFFFA15B),
        secondary = Color(0xFF4ADE80),
        tertiary = Color(0xFFF87171),
        background = Color(0xFF100C08),
        surface = Color(0xFF1A120D),
        surfaceVariant = Color(0xFF2A1C14),
        onPrimary = Color(0xFF1C130E),
        onSecondary = Color(0xFF0E1C11),
        onBackground = Color(0xFFFFF7ED),
        onSurface = Color(0xFFFFF7ED),
        onSurfaceVariant = Color(0xFFFED7AA),
    )

@Composable
fun SardarJiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
