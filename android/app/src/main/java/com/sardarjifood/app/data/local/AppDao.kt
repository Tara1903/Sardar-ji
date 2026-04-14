package com.sardarjifood.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    @Query("SELECT * FROM snapshots WHERE `key` = :key LIMIT 1")
    suspend fun getSnapshot(key: String): SnapshotEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSnapshot(snapshot: SnapshotEntity)

    @Query("SELECT * FROM cart_lines ORDER BY name ASC")
    fun observeCartLines(): Flow<List<CartLineEntity>>

    @Query("SELECT * FROM cart_lines ORDER BY name ASC")
    suspend fun getCartLines(): List<CartLineEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertCartLine(line: CartLineEntity)

    @Query("DELETE FROM cart_lines WHERE lineId = :lineId")
    suspend fun removeCartLine(lineId: String)

    @Query("DELETE FROM cart_lines")
    suspend fun clearCart()
}
