package com.sardarjifood.app.ui

import androidx.compose.ui.Modifier
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.widthIn

enum class AppWidthClass {
    COMPACT,
    MEDIUM,
    EXPANDED,
}

@Immutable
data class AppAdaptiveState(
    val widthDp: Int,
    val heightDp: Int,
    val widthClass: AppWidthClass,
    val maxContentWidth: Dp,
) {
    val isMediumUp: Boolean = widthClass != AppWidthClass.COMPACT
    val isExpanded: Boolean = widthClass == AppWidthClass.EXPANDED
    val horizontalPadding: Dp =
        when (widthClass) {
            AppWidthClass.COMPACT -> 16.dp
            AppWidthClass.MEDIUM -> 24.dp
            AppWidthClass.EXPANDED -> 32.dp
        }
    val paneSpacing: Dp =
        when (widthClass) {
            AppWidthClass.COMPACT -> 16.dp
            AppWidthClass.MEDIUM -> 20.dp
            AppWidthClass.EXPANDED -> 24.dp
        }
    val gridColumns: Int =
        when (widthClass) {
            AppWidthClass.COMPACT -> 1
            AppWidthClass.MEDIUM -> 2
            AppWidthClass.EXPANDED -> 3
        }
}

@Composable
fun rememberAdaptiveState(): AppAdaptiveState {
    val configuration = LocalConfiguration.current
    val widthDp = configuration.screenWidthDp
    val heightDp = configuration.screenHeightDp

    return remember(widthDp, heightDp) {
        val widthClass =
            when {
                widthDp >= 980 -> AppWidthClass.EXPANDED
                widthDp >= 620 -> AppWidthClass.MEDIUM
                else -> AppWidthClass.COMPACT
            }
        val maxContentWidth =
            when (widthClass) {
                AppWidthClass.COMPACT -> Dp.Unspecified
                AppWidthClass.MEDIUM -> 920.dp
                AppWidthClass.EXPANDED -> 1180.dp
            }

        AppAdaptiveState(
            widthDp = widthDp,
            heightDp = heightDp,
            widthClass = widthClass,
            maxContentWidth = maxContentWidth,
        )
    }
}

fun Modifier.appMaxContentWidth(adaptiveState: AppAdaptiveState): Modifier =
    if (adaptiveState.maxContentWidth == Dp.Unspecified) {
        this
    } else {
        widthIn(max = adaptiveState.maxContentWidth)
    }
