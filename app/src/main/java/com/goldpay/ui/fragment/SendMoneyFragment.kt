package com.goldpay.ui.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.goldpay.GoldPayApplication
import com.goldpay.R
import com.goldpay.databinding.FragmentSendMoneyBinding
import com.goldpay.ui.viewmodel.GoldPayViewModelFactory
import com.goldpay.ui.viewmodel.SendMoneyViewModel
import com.google.android.material.tabs.TabLayoutMediator

class SendMoneyFragment : Fragment() {
    private var _binding: FragmentSendMoneyBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SendMoneyViewModel by viewModels {
        GoldPayViewModelFactory((requireActivity().application as GoldPayApplication).repository)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSendMoneyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.viewPager.adapter = object : FragmentStateAdapter(this) {
            override fun getItemCount() = 2
            override fun createFragment(position: Int) = when (position) {
                0 -> SendToAppFragment()
                else -> SendToBankFragment()
            }
        }

        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, pos ->
            tab.text = if (pos == 0) "To App" else "To Bank"
        }.attach()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
