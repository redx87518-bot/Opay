package com.goldpay.data.local

import android.content.Context
import android.content.SharedPreferences
import com.goldpay.util.Constants

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(Constants.PREFS_NAME, Context.MODE_PRIVATE)

    var termiiBaseUrl: String
        get() = prefs.getString(Constants.KEY_TERMII_BASE_URL, Constants.DEFAULT_TERMII_BASE_URL) ?: Constants.DEFAULT_TERMII_BASE_URL
        set(value) = prefs.edit().putString(Constants.KEY_TERMII_BASE_URL, value).apply()

    var termiiApiKey: String
        get() = prefs.getString(Constants.KEY_TERMII_API_KEY, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_TERMII_API_KEY, value).apply()

    var termiiSenderId: String
        get() = prefs.getString(Constants.KEY_TERMII_SENDER_ID, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_TERMII_SENDER_ID, value).apply()

    var jsonBinMasterKey: String
        get() = prefs.getString(Constants.KEY_JSONBIN_MASTER_KEY, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_JSONBIN_MASTER_KEY, value).apply()

    var jsonBinBinId: String
        get() = prefs.getString(Constants.KEY_JSONBIN_BIN_ID, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_JSONBIN_BIN_ID, value).apply()

    var paystackSecretKey: String
        get() = prefs.getString(Constants.KEY_PAYSTACK_SECRET_KEY, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_PAYSTACK_SECRET_KEY, value).apply()

    var isLoggedIn: Boolean
        get() = prefs.getBoolean(Constants.KEY_IS_LOGGED_IN, false)
        set(value) = prefs.edit().putBoolean(Constants.KEY_IS_LOGGED_IN, value).apply()

    var currentUserPhone: String
        get() = prefs.getString(Constants.KEY_CURRENT_USER_PHONE, "") ?: ""
        set(value) = prefs.edit().putString(Constants.KEY_CURRENT_USER_PHONE, value).apply()

    var isDarkMode: Boolean
        get() = prefs.getBoolean(Constants.KEY_DARK_MODE, false)
        set(value) = prefs.edit().putBoolean(Constants.KEY_DARK_MODE, value).apply()

    var isBiometricEnabled: Boolean
        get() = prefs.getBoolean(Constants.KEY_BIOMETRIC, false)
        set(value) = prefs.edit().putBoolean(Constants.KEY_BIOMETRIC, value).apply()

    fun clear() {
        prefs.edit().clear().apply()
    }
}
