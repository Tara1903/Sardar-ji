package com.sardarjifood.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "snapshots")
data class SnapshotEntity(
    @PrimaryKey val key: String,
    val json: String,
    val updatedAt: Long,
)

@Entity(tableName = "cart_lines")
data class CartLineEntity(
    @PrimaryKey val lineId: String,
    val productId: String,
    val name: String,
    val image: String,
    val description: String,
    val category: String,
    val basePrice: Int,
    val addonTotal: Int,
    val price: Int,
    val quantity: Int,
    val badge: String,
    val isVeg: Boolean,
    val isAvailable: Boolean,
    val isFreebie: Boolean,
    val isAddonLine: Boolean,
    val parentLineId: String,
    val parentProductId: String,
    val groupId: String,
    val groupTitle: String,
    val addonSummary: String,
    val addonsJson: String,
)
