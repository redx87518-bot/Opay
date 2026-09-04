package com.goldpay.ui.auth

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.goldpay.R
import com.goldpay.ui.MainActivity
import com.goldpay.util.Constants

class OtpActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOtpBinding
    private var phone: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtpBinding.inflate(layoutInflater)
        setContentView(binding.root)

        phone = intent.getStringExtra("phone") ?: ""

        binding.btnVerify.setOnClickListener {
            val otp = binding.etOtp.text.toString().trim()
            if (otp == "1234") {
                getSharedPreferences(Constants.PREFS_NAME, MODE_PRIVATE).edit().putBoolean(Constants.KEY_IS_LOGGED_IN, true).apply()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Invalid OTP. Use 1234", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
