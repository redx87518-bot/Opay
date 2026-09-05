package com.goldpay.util

object Constants {
    const val PREFS_NAME = "goldpay_prefs"
    const val KEY_TERMII_BASE_URL = "termii_base_url"
    const val KEY_TERMII_API_KEY = "termii_api_key"
    const val KEY_TERMII_SENDER_ID = "termii_sender_id"
    const val KEY_JSONBIN_MASTER_KEY = "jsonbin_master_key"
    const val KEY_JSONBIN_BIN_ID = "jsonbin_bin_id"
    const val KEY_PAYSTACK_SECRET_KEY = "paystack_secret_key"
    const val KEY_IS_LOGGED_IN = "is_logged_in"
    const val KEY_CURRENT_USER_PHONE = "current_user_phone"
    const val KEY_DARK_MODE = "dark_mode"
    const val KEY_BIOMETRIC = "biometric_enabled"

    const val DEFAULT_TERMII_BASE_URL = "https://v4.api.termii.com/"

    const val SMS_WELCOME = "Welcome to GoldPay, [NAME]! Your virtual wallet has been credited with N5,000,000. Account: [ACCOUNT]."

    const val SMS_CREDIT_ALERT = "Credit Alert\nAmount: N[AMOUNT]\nFrom: [SENDER_NAME]\nDate: [DATE]\nTime: [TIME]\nTransaction Type: Wallet Transfer\nTransaction ID: [TX_ID]"
    const val SMS_DEBIT_ALERT_APP = "Debit Alert\nAmount: N[AMOUNT]\nTo: [RECIPIENT_NAME]\nDate: [DATE]\nTime: [TIME]\nTransaction Type: Wallet Transfer\nTransaction ID: [TX_ID]"
    const val SMS_DEBIT_ALERT_BANK = "Debit Alert\nAmount: N[AMOUNT]\nTo: [RECIPIENT_NAME] - [BANK_NAME]\nAccount: [ACCOUNT_NUMBER]\nDate: [DATE]\nTime: [TIME]\nTransaction Type: Bank Transfer\nTransaction ID: [TX_ID]"
    const val SMS_AIRTIME = "Airtime of N[AMOUNT] for [NETWORK] ([PHONE]) purchased. Balance: N[BALANCE]. Txn: [TX_ID]."
    const val SMS_DATA = "Data bundle [PLAN] for [NETWORK] ([PHONE]) activated. Balance: N[BALANCE]. Txn: [TX_ID]."
    const val SMS_BILL = "[BILL_TYPE] payment of N[AMOUNT] to [PROVIDER] successful. Balance: N[BALANCE]. Txn: [TX_ID]."
    const val SMS_PIN_CHANGE = "Your GoldPay PIN was changed on [DATE] at [TIME]. If not you, contact support."
}
