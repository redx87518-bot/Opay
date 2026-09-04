package com.goldpay.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.goldpay.GoldPayApplication
import com.goldpay.R
import com.goldpay.data.model.Transaction
import com.goldpay.databinding.FragmentDashboardBinding
import com.goldpay.ui.adapter.TransactionAdapter
import com.goldpay.ui.fragment.ReceiptFragment
import com.goldpay.ui.viewmodel.DashboardViewModel
import com.goldpay.ui.viewmodel.GoldPayViewModelFactory
import com.goldpay.util.Constants
import java.text.SimpleDateFormat
import java.util.*

class DashboardFragment : Fragment() {
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private val viewModel: DashboardViewModel by viewModels {
        GoldPayViewModelFactory((requireActivity().application as GoldPayApplication).repository)
    }
    private lateinit var adapter: TransactionAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        adapter = TransactionAdapter()
        binding.rvTransactions.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTransactions.adapter = adapter

        adapter.onReceiptClick = { tx ->
            val dateFormat = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
            val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
            val date = dateFormat.format(Date(tx.timestamp))
            val time = timeFormat.format(Date(tx.timestamp))

            val receiptFragment = ReceiptFragment.newInstance(
                type = tx.description.ifBlank { tx.type.replaceFirstChar { it.uppercase() } },
                amount = tx.amount.toString(),
                txId = tx.txId.ifBlank { tx.id },
                from = if (tx.type == "credit") tx.recipient else "You",
                to = if (tx.type == "credit") "You" else tx.recipient,
                date = date,
                time = time
            )
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, receiptFragment)
                .addToBackStack(null)
                .commit()
        }

        val phone = requireActivity().getSharedPreferences(Constants.PREFS_NAME, android.content.Context.MODE_PRIVATE).getString(Constants.KEY_CURRENT_USER_PHONE, "") ?: ""
        if (phone.isNotBlank()) {
            viewModel.loadUser(phone)
            viewModel.loadTransactions()
        }

        viewModel.user.observe(viewLifecycleOwner) { user ->
            binding.tvBalance.text = String.format("₦%,.2f", user.balance)
        }

        viewModel.transactions.observe(viewLifecycleOwner) { txs ->
            adapter.submitList(txs)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
