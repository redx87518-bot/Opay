package com.goldpay.ui.viewmodel

import androidx.lifecycle.*
import com.goldpay.data.model.Transaction
import com.goldpay.data.repository.GoldPayRepository
import kotlinx.coroutines.launch

class SendMoneyViewModel(private val repository: GoldPayRepository) : ViewModel() {
    private val _transferResult = MutableLiveData<Result<Transaction>>()
    val transferResult: LiveData<Result<Transaction>> = _transferResult

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    fun sendToApp(phone: String, amount: Double, note: String = "") {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.sendToApp(phone, amount, note)
            _transferResult.value = result
            _loading.value = false
        }
    }

    fun sendToBank(accountNumber: String, bankCode: String, amount: Double, recipientName: String) {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.sendToBank(accountNumber, bankCode, amount, recipientName)
            _transferResult.value = result
            _loading.value = false
        }
    }
}
