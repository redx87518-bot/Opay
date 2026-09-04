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
import com.goldpay.databinding.FragmentSendToAppBinding
import com.goldpay.ui.viewmodel.GoldPayViewModelFactory
import com.goldpay.ui.viewmodel.SendMoneyViewModel

class SendToAppFragment : Fragment() {
    private var _binding: FragmentSendToAppBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SendMoneyViewModel by viewModels {
        GoldPayViewModelFactory((requireActivity().application as GoldPayApplication).repository)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSendToAppBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnSendApp.setOnClickListener {
            val phone = binding.etRecipientPhone.text.toString().trim()
            val amount = binding.etAmount.text.toString().toDoubleOrNull() ?: 0.0
            if (phone.isNotBlank() && amount > 0) {
                viewModel.sendToApp(phone, amount)
                Toast.makeText(requireContext(), "Sent ₦$amount to $phone", Toast.LENGTH_SHORT).show()
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
