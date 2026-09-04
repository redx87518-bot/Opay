package com.goldpay.data.local

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import android.content.Context

@Database(entities = [TransactionEntity::class], version = 1, exportSchema = false)
abstract class GoldPayDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao

    companion object {
        @Volatile private var INSTANCE: GoldPayDatabase? = null
        fun getInstance(context: Context): GoldPayDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    GoldPayDatabase::class.java,
                    "goldpay.db"
                ).fallbackToDestructiveMigration().build().also { INSTANCE = it }
            }
    }
}
