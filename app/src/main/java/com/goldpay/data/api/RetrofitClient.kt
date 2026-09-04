package com.goldpay.data.api

import com.goldpay.util.Constants
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

    private val okHttp = OkHttpClient.Builder().addInterceptor(logging).build()

    fun termii(baseUrl: String = Constants.DEFAULT_TERMII_BASE_URL): TermiiApi {
        return Retrofit.Builder().baseUrl(baseUrl).client(okHttp).addConverterFactory(GsonConverterFactory.create()).build().create(TermiiApi::class.java)
    }

    fun jsonBin(): JsonBinApi {
        return Retrofit.Builder().baseUrl("https://api.jsonbin.io/").client(okHttp).addConverterFactory(GsonConverterFactory.create()).build().create(JsonBinApi::class.java)
    }

    fun paystack(): PaystackApi {
        return Retrofit.Builder().baseUrl("https://api.paystack.co/").client(okHttp).addConverterFactory(GsonConverterFactory.create()).build().create(PaystackApi::class.java)
    }
}
