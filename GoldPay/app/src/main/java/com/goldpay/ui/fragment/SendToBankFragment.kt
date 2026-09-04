package com.goldpay.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.goldpay.GoldPayApplication
import com.goldpay.R
import com.goldpay.databinding.FragmentSendToBankBinding
import com.goldpay.ui.viewmodel.GoldPayViewModelFactory
import com.goldpay.ui.viewmodel.SendMoneyViewModel
import com.goldpay.util.Bank
import com.goldpay.util.Constants

class SendToBankFragment : Fragment() {
    private var _binding: FragmentSendToBankBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SendMoneyViewModel by viewModels {
        GoldPayViewModelFactory((requireActivity().application as GoldPayApplication).repository)
    }
    private var selectedBank: Bank? = null
    private var resolvedAccountName: String = ""

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSendToBankBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        loadBanks()

        binding.btnLookup.setOnClickListener {
            val account = binding.etAccountNumber.text.toString().trim()
            if (account.isBlank()) {
                Toast.makeText(requireContext(), "Enter account number", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedBank == null) {
                Toast.makeText(requireContext(), "Select a bank", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            lookupAccountName(account, selectedBank!!.code)
        }

        binding.btnSendBank.setOnClickListener {
            val account = binding.etAccountNumber.text.toString().trim()
            val amount = binding.etAmountBank.text.toString().toDoubleOrNull() ?: 0.0
            if (account.isBlank() || selectedBank == null) {
                Toast.makeText(requireContext(), "Fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (amount <= 0) {
                Toast.makeText(requireContext(), "Enter valid amount", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (resolvedAccountName.isBlank()) {
                Toast.makeText(requireContext(), "Lookup account name first", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.sendToBank(account, selectedBank!!.code, amount, resolvedAccountName)
            Toast.makeText(requireContext(), "Sent ₦$amount to $resolvedAccountName", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadBanks() {
        viewModel.loadBanks()
        viewModel.banks.observe(viewLifecycleOwner) { banks ->
            val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, banks.map { it.name })
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            binding.spinnerBank.adapter = adapter
            binding.spinnerBank.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                    selectedBank = banks[position]
                }
                override fun onNothingSelected(parent: AdapterView<*>) {
                    selectedBank = null
                }
            }
        }
    }

    private fun lookupAccountName(accountNumber: String, bankCode: String) {
        viewModel.lookupAccountName(accountNumber, bankCode)
        viewModel.accountName.observe(viewLifecycleOwner) { result ->
            if (result is com.goldpay.util.Result.Success) {
                resolvedAccountName = result.data
                binding.tvAccountName.text = "Account Name: $resolvedAccountName"
                binding.tvAccountName.visibility = View.VISIBLE
            } else {
                Toast.makeText(requireContext(), "Lookup failed", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
