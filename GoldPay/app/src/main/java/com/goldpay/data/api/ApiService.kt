package com.goldpay.data.api

import com.goldpay.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface TermiiApi {
    @POST("api/sms/send")
    suspend fun sendSms(@Body request: Map<String, String>): Response<ApiResponse>

    @POST("api/check/balance")
    suspend fun checkBalance(@Body request: Map<String, String>): Response<ApiResponse>

    @GET("api/phone-numbers/validate")
    suspend fun validatePhone(
        @Query("phone_number") phone: String,
        @Query("api_key") apiKey: String
    ): Response<ApiResponse>
}

interface JsonBinApi {
    @GET("b/{binId}/latest")
    suspend fun getBin(
        @Path("binId") binId: String,
        @Header("X-Master-Key") masterKey: String
    ): Response<JsonBinResponse>

    @PUT("b/{binId}")
    suspend fun updateBin(
        @Path("binId") binId: String,
        @Header("X-Master-Key") masterKey: String,
        @Header("Content-Type") contentType: String = "application/json",
        @Body body: Map<String, Any>
    ): Response<JsonBinResponse>
}

interface PaystackApi {
    @GET("bank/resolve")
    suspend fun resolveAccount(
        @Query("account_number") accountNumber: String,
        @Query("bank_code") bankCode: String,
        @Header("Authorization") secretKey: String
    ): Response<PaystackResolveResponse>
}
