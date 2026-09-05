package com.goldpay.data.local

import androidx.room.*
import com.goldpay.data.model.Transaction

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String = "",
    val type: String = "",
    val amount: Double = 0.0,
    val recipient: String = "",
    val description: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val status: String = "success",
    val txId: String = ""
)

fun TransactionEntity.toDomain(): Transaction = Transaction(
    id = id,
    type = type,
    amount = amount,
    recipient = recipient,
    description = description,
    timestamp = timestamp,
    status = status,
    txId = txId
)

fun Transaction.toEntity(): TransactionEntity = TransactionEntity(
    id = id,
    type = type,
    amount = amount,
    recipient = recipient,
    description = description,
    timestamp = timestamp,
    status = status,
    txId = txId
)
