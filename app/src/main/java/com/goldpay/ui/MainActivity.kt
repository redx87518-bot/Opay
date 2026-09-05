package com.goldpay.ui

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.goldpay.R
import com.goldpay.databinding.ActivityMainBinding
import com.goldpay.util.ThemeHelper

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ThemeHelper.applyTheme(this)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)

        val navHost = supportFragmentManager.findFragmentById(R.id.fragment_container) as NavHostFragment
        navController = navHost.navController

        binding.navHome.setOnClickListener {
            navController.navigate(R.id.dashboardFragment)
            updateBottomNavIcons(it)
        }
        binding.navSend.setOnClickListener {
            navController.navigate(R.id.sendMoneyFragment)
            updateBottomNavIcons(it)
        }
        binding.navHistory.setOnClickListener {
            navController.navigate(R.id.historyFragment)
            updateBottomNavIcons(it)
        }
        binding.navSettings.setOnClickListener {
            navController.navigate(R.id.settingsFragment)
            updateBottomNavIcons(it)
        }
    }

    private fun updateBottomNavIcons(selected: View) {
        val gold = getColor(R.color.gold_primary)
        val gray = getColor(R.color.gray_300)
        binding.navHome.setColorFilter(gray)
        binding.navSend.setColorFilter(gray)
        binding.navHistory.setColorFilter(gray)
        binding.navSettings.setColorFilter(gray)
        selected.setColorFilter(gold)
    }
}
