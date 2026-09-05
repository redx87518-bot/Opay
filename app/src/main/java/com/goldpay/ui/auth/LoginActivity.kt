package com.goldpay.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.widget.EditText
import com.goldpay.R
import com.goldpay.databinding.ActivityLoginBinding
import com.goldpay.ui.MainActivity
import com.goldpay.util.Constants

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val prefs = getSharedPreferences(Constants.PREFS_NAME, MODE_PRIVATE)
        if (prefs.getBoolean(Constants.KEY_IS_LOGGED_IN, false)) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        binding.btnLogin.setOnClickListener {
            val phone = binding.etPhone.text.toString().trim()
            if (phone.length >= 10) {
                prefs.edit().putString(Constants.KEY_CURRENT_USER_PHONE, phone).apply()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Enter valid phone", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
