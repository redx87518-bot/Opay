package com.goldpay.data.repository

import com.goldpay.data.api.JsonBinApi
import com.goldpay.data.api.PaystackApi
import com.goldpay.data.api.TermiiApi
import com.goldpay.data.model.*
import com.goldpay.data.local.GoldPayDatabase
import com.goldpay.data.local.TransactionEntity
import com.goldpay.data.local.toDomain
import com.goldpay.data.local.toEntity
import com.goldpay.data.local.PreferencesManager
import com.goldpay.util.Bank
import com.goldpay.util.Banks
import com.goldpay.util.Constants
import com.goldpay.util.Result
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.*

class GoldPayRepository(
    private val termiiApi: TermiiApi,
    private val jsonBinApi: JsonBinApi,
    private val paystackApi: PaystackApi,
    private val preferences: PreferencesManager,
    private val database: GoldPayDatabase
) {
    suspend fun getUser(phone: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            val binId = preferences.jsonBinBinId
            val masterKey = preferences.jsonBinMasterKey
            if (binId.isNotBlank() && masterKey.isNotBlank()) {
                val response = jsonBinApi.getBin(binId, masterKey)
                if (response.isSuccessful) {
                    val record = response.body()?.record
                    if (record is Map<*, *>) {
                        val userMap = record as Map<String, Any>
                        val user = User(
                            phone = userMap["phone"] as? String ?: phone,
                            name = userMap["name"] as? String ?: "",
                            accountNumber = userMap["accountNumber"] as? String ?: "",
                            pin = userMap["pin"] as? String ?: "",
                            balance = (userMap["balance"] as? Number)?.toDouble() ?: 5000000.0
                        )
                        return@withContext Result.Success(user)
                    }
                }
            }
            Result.Success(User(phone = phone))
        } catch (e: Exception) {
            Result.Success(User(phone = phone))
        }
    }

    suspend fun saveUser(user: User): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val binId = preferences.jsonBinBinId
            val masterKey = preferences.jsonBinMasterKey
            if (binId.isNotBlank() && masterKey.isNotBlank()) {
                val userMap = mapOf(
                    "phone" to user.phone,
                    "name" to user.name,
                    "accountNumber" to user.accountNumber,
                    "pin" to user.pin,
                    "balance" to user.balance
                )
                jsonBinApi.updateBin(binId, masterKey, body = mapOf("record" to userMap))
            }
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun getTransactions(): Result<List<Transaction>> = withContext(Dispatchers.IO) {
        try {
            val local = database.transactionDao().getAllTransactions()
            Result.Success(local.map { it.toDomain() })
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun sendToApp(phone: String, amount: Double, note: String): Result<Transaction> = withContext(Dispatchers.IO) {
        try {
            val prefsPhone = preferences.currentUserPhone
            val user = getUser(prefsPhone).let {
                if (it is Result.Success) it.data else User(phone = prefsPhone)
            }

            if (user.balance < amount) {
                return@withContext Result.Error(Exception("Insufficient balance"))
            }

            val formattedAccount = formatPhoneNumber(phone)
            val recipientName = resolveName(formattedAccount)

            val tx = Transaction(
                id = UUID.randomUUID().toString(),
                type = "debit",
                amount = amount,
                recipient = formattedAccount,
                description = note.ifBlank { "Send to App" },
                txId = "TXN${System.currentTimeMillis()}"
            )

            database.transactionDao().insert(tx.toEntity())

            val updatedUser = user.copy(balance = user.balance - amount)
            saveUser(updatedUser)

            val now = java.text.SimpleDateFormat("dd-MM-yyyy HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
            val datePart = now.split(" ")[0]
            val timePart = now.split(" ")[1]

            val smsValues = mapOf(
                "amount" to String.format("%,.2f", amount),
                "recipient_name" to recipientName,
                "account_number" to formattedAccount,
                "date" to datePart,
                "time" to timePart,
                "tx_id" to tx.txId,
                "sender_name" to (user.name.ifBlank { user.phone })
            )

            sendTransactionSms(phone, Constants.SMS_DEBIT_ALERT_APP, smsValues)

            Result.Success(tx)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun sendToBank(accountNumber: String, bankCode: String, amount: Double, recipientNameHint: String): Result<Transaction> = withContext(Dispatchers.IO) {
        try {
            val prefsPhone = preferences.currentUserPhone
            val user = getUser(prefsPhone).let {
                if (it is Result.Success) it.data else User(phone = prefsPhone)
            }

            if (user.balance < amount) {
                return@withContext Result.Error(Exception("Insufficient balance"))
            }

            var recipientName = recipientNameHint
            var bankName = bankCode

            if (preferences.paystackSecretKey.isNotBlank()) {
                when (val resolveResult = resolveBankAccount(accountNumber, bankCode)) {
                    is Result.Success -> {
                        recipientName = resolveResult.data.account_name
                        bankName = resolveResult.data.bank_id.toString()
                    }
                    else -> {}
                }
            }

            val tx = Transaction(
                id = UUID.randomUUID().toString(),
                type = "debit",
                amount = amount,
                recipient = recipientName,
                description = "Bank Transfer",
                txId = "TXN${System.currentTimeMillis()}"
            )

            database.transactionDao().insert(tx.toEntity())

            val updatedUser = user.copy(balance = user.balance - amount)
            saveUser(updatedUser)

            val now = java.text.SimpleDateFormat("dd-MM-yyyy HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
            val datePart = now.split(" ")[0]
            val timePart = now.split(" ")[1]

            val smsValues = mapOf(
                "amount" to String.format("%,.2f", amount),
                "recipient_name" to recipientName,
                "bank_name" to bankName,
                "account_number" to accountNumber,
                "date" to datePart,
                "time" to timePart,
                "tx_id" to tx.txId,
                "sender_name" to (user.name.ifBlank { user.phone })
            )

            sendTransactionSms(accountNumber, Constants.SMS_DEBIT_ALERT_BANK, smsValues)

            Result.Success(tx)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun resolveBankAccount(accountNumber: String, bankCode: String): Result<PaystackAccount> = withContext(Dispatchers.IO) {
        try {
            val secretKey = preferences.paystackSecretKey
            if (secretKey.isBlank()) {
                return@withContext Result.Error(Exception("Paystack key not configured"))
            }
            val response = paystackApi.resolveAccount(accountNumber, bankCode, "Bearer $secretKey")
            if (response.isSuccessful && response.body()?.status == true) {
                val account = response.body()?.data
                if (account != null) {
                    return@withContext Result.Success(account)
                }
            }
            Result.Error(Exception("Could not resolve account"))
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun getBanks(): Result<List<Bank>> = withContext(Dispatchers.IO) {
        try {
            val secretKey = preferences.paystackSecretKey
            if (secretKey.isBlank()) {
                return@withContext Result.Success(Banks.NIGERIAN_BANKS)
            }
            val response = paystackApi.listBanks("Bearer $secretKey")
            if (response.isSuccessful && response.body()?.status == true) {
                val banks = response.body()?.data?.map { Bank(it.code, it.name) } ?: Banks.NIGERIAN_BANKS
                Result.Success(banks)
            } else {
                Result.Success(Banks.NIGERIAN_BANKS)
            }
        } catch (e: Exception) {
            Result.Success(Banks.NIGERIAN_BANKS)
        }
    }

    suspend fun sendTransactionSms(phone: String, template: String, values: Map<String, String>): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val apiKey = preferences.termiiApiKey
            val senderId = preferences.termiiSenderId.ifBlank { "GoldPay" }
            if (apiKey.isBlank()) {
                return@withContext Result.Success(Unit)
            }
            var message = template
            values.forEach { (key, value) ->
                message = message.replace("[${key.uppercase()}]", value)
            }
            val formattedPhone = formatPhoneNumber(phone)
            val request = mapOf(
                "api_key" to apiKey,
                "phone_number" to formattedPhone,
                "sender_id" to senderId,
                "message" to message,
                "message_type" to "plain"
            )
            termiiApi.sendSms(request)
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    private fun formatPhoneNumber(phone: String): String {
        val cleaned = phone.replace(Regex("[^0-9]"), "")
        return if (cleaned.startsWith("0")) cleaned else "0$cleaned"
    }

    private suspend fun resolveName(phone: String): String {
        return try {
            val prefsPhone = preferences.currentUserPhone
            val user = getUser(prefsPhone)
            if (user is Result.Success && user.data.name.isNotBlank()) user.data.name
            else phone
        } catch (e: Exception) {
            phone
        }
    }
}
