package com.sardarjifood.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.sardarjifood.app.model.ThemeMode

private val LightColors =
    lightColorScheme(
        primary = Color(0xFFCA8A3C),
        onPrimary = Color(0xFFFFFFFF),
        primaryContainer = Color(0xFFF3E0C2),
        onPrimaryContainer = Color(0xFF38250A),
        secondary = Color(0xFF5D6A62),
        onSecondary = Color(0xFFFFFFFF),
        secondaryContainer = Color(0xFFE4EBE5),
        onSecondaryContainer = Color(0xFF1B261F),
        tertiary = Color(0xFFB88C4E),
        onTertiary = Color(0xFFFFFFFF),
        tertiaryContainer = Color(0xFFF1E1C4),
        onTertiaryContainer = Color(0xFF463215),
        error = Color(0xFFB76556),
        onError = Color(0xFFFFFFFF),
        errorContainer = Color(0xFFF5DDD8),
        onErrorContainer = Color(0xFF4C1F17),
        background = Color(0xFFF6F1EA),
        onBackground = Color(0xFF17181D),
        surface = Color(0xFFFFFAF4),
        onSurface = Color(0xFF17181D),
        surfaceVariant = Color(0xFFF0E6D8),
        onSurfaceVariant = Color(0xFF666861),
        outline = Color(0xFFD9CEC0),
        outlineVariant = Color(0xFFE7DDD1),
        surfaceTint = Color(0xFFCA8A3C),
    )

private val DarkColors =
    darkColorScheme(
        primary = Color(0xFFD8A45E),
        onPrimary = Color(0xFF2E1E07),
        primaryContainer = Color(0xFF4B3416),
        onPrimaryContainer = Color(0xFFF8EAD4),
        secondary = Color(0xFF85938B),
        onSecondary = Color(0xFF132019),
        secondaryContainer = Color(0xFF263129),
        onSecondaryContainer = Color(0xFFD8E4DA),
        tertiary = Color(0xFFC89D61),
        onTertiary = Color(0xFF35230A),
        tertiaryContainer = Color(0xFF4B3518),
        onTertiaryContainer = Color(0xFFF6E4C5),
        error = Color(0xFFC98375),
        onError = Color(0xFF431A13),
        errorContainer = Color(0xFF5A261E),
        onErrorContainer = Color(0xFFF6D8D2),
        background = Color(0xFF101217),
        onBackground = Color(0xFFF4EFE8),
        surface = Color(0xFF171A20),
        onSurface = Color(0xFFF4EFE8),
        surfaceVariant = Color(0xFF242831),
        onSurfaceVariant = Color(0xFFB5ADA2),
        outline = Color(0xFF4A4E56),
        outlineVariant = Color(0xFF31353D),
        surfaceTint = Color(0xFFD8A45E),
    )

@Composable
fun SardarJiTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit,
) {
    val darkTheme =
        when (themeMode) {
            ThemeMode.LIGHT -> false
            ThemeMode.DARK -> true
            ThemeMode.SYSTEM -> isSystemInDarkTheme()
        }

    val colorScheme = if (darkTheme) DarkColors else LightColors

    MaterialTheme(
        colorScheme = colorScheme,
        typography = SardarJiTypography,
        shapes = SardarJiShapes,
        content = content,
    )
}
