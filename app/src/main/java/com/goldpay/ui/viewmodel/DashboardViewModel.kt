package com.goldpay.ui.viewmodel

import androidx.lifecycle.*
import com.goldpay.data.model.Transaction
import com.goldpay.data.model.User
import com.goldpay.data.repository.GoldPayRepository
import com.goldpay.util.Constants
import com.goldpay.util.Result
import kotlinx.coroutines.launch

class DashboardViewModel(private val repository: GoldPayRepository) : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user

    private val _transactions = MutableLiveData<List<Transaction>>()
    val transactions: LiveData<List<Transaction>> = _transactions

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error

    fun loadUser(phone: String) {
        viewModelScope.launch {
            _loading.value = true
            when (val result = repository.getUser(phone)) {
                is Result.Success -> _user.value = result.data
                is Result.Error -> _error.value = result.exception.message
            }
            _loading.value = false
        }
    }

    fun loadTransactions() {
        viewModelScope.launch {
            _loading.value = true
            when (val result = repository.getTransactions()) {
                is Result.Success -> _transactions.value = result.data
                is Result.Error -> _error.value = result.exception.message
            }
            _loading.value = false
        }
    }
}
