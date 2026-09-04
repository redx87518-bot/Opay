package com.goldpay.data.model

data class User(
    val phone: String = "",
    val name: String = "",
    val accountNumber: String = "",
    val pin: String = "",
    val balance: Double = 5000000.0,
    val createdAt: Long = System.currentTimeMillis()
)

data class Transaction(
    val id: String = "",
    val type: String = "",
    val amount: Double = 0.0,
    val recipient: String = "",
    val description: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val status: String = "success",
    val txId: String = ""
)

data class ApiResponse(
    val status: Boolean,
    val message: String,
    val data: Any? = null
)

data class TerminiRequest(
    val phoneNumber: String,
    val apiKey: String
)

data class TerminiOtpResponse(
    val code: String,
    val messageId: String
)

data class PaystackResolveResponse(
    val status: Boolean,
    val message: String,
    val data: PaystackAccount?
)

data class PaystackAccount(
    val account_number: String,
    val account_name: String,
    val bank_id: Int
)

data class JsonBinResponse(
    val record: Any? = null,
    val success: JsonBinSuccess? = null
)

data class JsonBinSuccess(
    val insertedId: String? = null
)
