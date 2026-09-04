package com.goldpay.util

import android.app.Activity
import android.content.Context
import android.content.res.Configuration
import androidx.appcompat.app.AppCompatDelegate

object ThemeHelper {
    fun applyTheme(activity: Activity) {
        val prefs = activity.getSharedPreferences(Constants.PREFS_NAME, Context.MODE_PRIVATE)
        val isDark = prefs.getBoolean(Constants.KEY_DARK_MODE, false)
        if (isDark) AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        else AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
    }

    fun toggleTheme(activity: Activity) {
        val prefs = activity.getSharedPreferences(Constants.PREFS_NAME, Context.MODE_PRIVATE)
        val isDark = !prefs.getBoolean(Constants.KEY_DARK_MODE, false)
        prefs.edit().putBoolean(Constants.KEY_DARK_MODE, isDark).apply()
        applyTheme(activity)
        activity.recreate()
    }
}
