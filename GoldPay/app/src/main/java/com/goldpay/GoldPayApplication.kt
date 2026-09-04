package com.goldpay

import android.app.Application
import com.goldpay.data.api.JsonBinApi
import com.goldpay.data.api.PaystackApi
import com.goldpay.data.api.RetrofitClient
import com.goldpay.data.api.TermiiApi
import com.goldpay.data.local.GoldPayDatabase
import com.goldpay.data.local.PreferencesManager
import com.goldpay.data.repository.GoldPayRepository

class GoldPayApplication : Application() {
    lateinit var repository: GoldPayRepository
        private set

    override fun onCreate() {
        super.onCreate()
        val prefs = PreferencesManager(this)
        val db = GoldPayDatabase.getInstance(this)
        repository = GoldPayRepository(
            termiiApi = RetrofitClient.termii(),
            jsonBinApi = RetrofitClient.jsonBin(),
            paystackApi = RetrofitClient.paystack(),
            preferences = prefs,
            database = db
        )
    }
}
