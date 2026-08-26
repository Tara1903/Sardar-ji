package com.sardarjifood.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.sardarjifood.app.R

private val SardarJiHeadlineFontFamily =
    FontFamily(
        Font(R.font.plus_jakarta_sans, FontWeight.SemiBold),
        Font(R.font.plus_jakarta_sans, FontWeight.Bold),
        Font(R.font.plus_jakarta_sans, FontWeight.ExtraBold),
    )

private val SardarJiBodyFontFamily =
    FontFamily(
        Font(R.font.be_vietnam_pro_regular, FontWeight.Normal),
        Font(R.font.be_vietnam_pro_medium, FontWeight.Medium),
        Font(R.font.be_vietnam_pro_semibold, FontWeight.SemiBold),
        Font(R.font.be_vietnam_pro_bold, FontWeight.Bold),
    )

val SardarJiTypography =
    Typography(
        displaySmall =
            TextStyle(
                fontFamily = SardarJiHeadlineFontFamily,
                fontSize = 40.sp,
                lineHeight = 44.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.sp,
            ),
        headlineLarge =
            TextStyle(
                fontFamily = SardarJiHeadlineFontFamily,
                fontSize = 34.sp,
                lineHeight = 40.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.sp,
            ),
        headlineMedium =
            TextStyle(
                fontFamily = SardarJiHeadlineFontFamily,
                fontSize = 28.sp,
                lineHeight = 34.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.sp,
            ),
        headlineSmall =
            TextStyle(
                fontFamily = SardarJiHeadlineFontFamily,
                fontSize = 24.sp,
                lineHeight = 30.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.sp,
            ),
        titleLarge =
            TextStyle(
                fontFamily = SardarJiHeadlineFontFamily,
                fontSize = 22.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.sp,
            ),
        titleMedium =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 18.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.sp,
            ),
        titleSmall =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 15.sp,
                lineHeight = 20.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.sp,
            ),
        bodyLarge =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 16.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight.Normal,
                letterSpacing = 0.sp,
            ),
        bodyMedium =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 15.sp,
                lineHeight = 22.sp,
                fontWeight = FontWeight.Normal,
                letterSpacing = 0.sp,
            ),
        bodySmall =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.Normal,
                letterSpacing = 0.sp,
            ),
        labelLarge =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 14.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.sp,
            ),
        labelMedium =
            TextStyle(
                fontFamily = SardarJiBodyFontFamily,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.sp,
            ),
    )
