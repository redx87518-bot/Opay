package com.goldpay.ui.viewmodel

import androidx.lifecycle.*
import com.goldpay.data.model.Transaction
import com.goldpay.data.repository.GoldPayRepository
import com.goldpay.util.Bank
import com.goldpay.util.Result
import kotlinx.coroutines.launch

class SendMoneyViewModel(private val repository: GoldPayRepository) : ViewModel() {
    private val _transferResult = MutableLiveData<Result<Transaction>>()
    val transferResult: LiveData<Result<Transaction>> = _transferResult

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _banks = MutableLiveData<List<Bank>>()
    val banks: LiveData<List<Bank>> = _banks

    private val _accountName = MutableLiveData<Result<String>>()
    val accountName: LiveData<Result<String>> = _accountName

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

    fun loadBanks() {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.getBanks()
            if (result is Result.Success) {
                _banks.value = result.data
            }
            _loading.value = false
        }
    }

    fun lookupAccountName(accountNumber: String, bankCode: String) {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.resolveBankAccount(accountNumber, bankCode)
            if (result is Result.Success) {
                _accountName.value = Result.Success(result.data.account_name)
            } else {
                _accountName.value = Result.Error(Exception("Account name not found"))
            }
            _loading.value = false
        }
    }
}
