package com.goldpay.ui.fragment

import android.os.Bundle
import android.widget.Button
import android.widget.Switch
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.goldpay.R
import com.goldpay.databinding.FragmentSettingsBinding
import com.goldpay.util.Constants

class SettingsFragment : Fragment() {
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup?, savedInstanceState: Bundle?): android.view.View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: android.view.View, savedInstanceState: Bundle?) {
        val prefs = requireContext().getSharedPreferences(Constants.PREFS_NAME, android.content.Context.MODE_PRIVATE)

        binding.switchDarkMode.isChecked = prefs.getBoolean(Constants.KEY_DARK_MODE, false)
        binding.etTermiiKey.setText(prefs.getString(Constants.KEY_TERMII_API_KEY, ""))
        binding.etJsonBinKey.setText(prefs.getString(Constants.KEY_JSONBIN_MASTER_KEY, ""))
        binding.etJsonBinId.setText(prefs.getString(Constants.KEY_JSONBIN_BIN_ID, ""))
        binding.etPaystackKey.setText(prefs.getString(Constants.KEY_PAYSTACK_SECRET_KEY, ""))

        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean(Constants.KEY_DARK_MODE, isChecked).apply()
            requireActivity().recreate()
        }

        binding.btnSaveKeys.setOnClickListener {
            prefs.edit()
                .putString(Constants.KEY_TERMII_API_KEY, binding.etTermiiKey.text.toString())
                .putString(Constants.KEY_JSONBIN_MASTER_KEY, binding.etJsonBinKey.text.toString())
                .putString(Constants.KEY_JSONBIN_BIN_ID, binding.etJsonBinId.text.toString())
                .putString(Constants.KEY_PAYSTACK_SECRET_KEY, binding.etPaystackKey.text.toString())
                .apply()
            Toast.makeText(requireContext(), "Saved", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogout.setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(android.content.Intent(requireContext(), com.goldpay.ui.auth.LoginActivity::class.java))
            requireActivity().finish()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
