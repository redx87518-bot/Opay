package com.goldpay.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.goldpay.data.repository.GoldPayRepository

class GoldPayViewModelFactory(private val repository: GoldPayRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(DashboardViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return DashboardViewModel(repository) as T
        }
        if (modelClass.isAssignableFrom(SendMoneyViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SendMoneyViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
