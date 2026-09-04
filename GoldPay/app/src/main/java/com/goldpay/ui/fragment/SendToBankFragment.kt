package com.goldpay.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.goldpay.GoldPayApplication
import com.goldpay.R
import com.goldpay.databinding.FragmentSendToBankBinding
import com.goldpay.ui.viewmodel.GoldPayViewModelFactory
import com.goldpay.ui.viewmodel.SendMoneyViewModel

class SendToBankFragment : Fragment() {
    private var _binding: FragmentSendToBankBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SendMoneyViewModel by viewModels {
        GoldPayViewModelFactory((requireActivity().application as GoldPayApplication).repository)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSendToBankBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnSendBank.setOnClickListener {
            val account = binding.etAccountNumber.text.toString().trim()
            val bank = binding.etBankCode.text.toString().trim()
            val amount = binding.etAmountBank.text.toString().toDoubleOrNull() ?: 0.0
            if (account.length >= 10 && bank.isNotBlank() && amount > 0) {
                viewModel.sendToBank(account, bank, amount, "$bank - $account")
                Toast.makeText(requireContext(), "Sent ₦$amount to $account ($bank)", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(requireContext(), "Invalid details", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
