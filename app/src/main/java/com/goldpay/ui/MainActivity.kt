package com.goldpay.ui

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.goldpay.R
import com.goldpay.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)

        val navHost = NavHostFragment.create(R.navigation.nav_graph)
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, navHost)
            .setPrimaryNavigationFragment(navHost)
            .commitNow()
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
        binding.navHome.imageTintList = android.content.res.ColorStateList.valueOf(gray)
        binding.navSend.imageTintList = android.content.res.ColorStateList.valueOf(gray)
        binding.navHistory.imageTintList = android.content.res.ColorStateList.valueOf(gray)
        binding.navSettings.imageTintList = android.content.res.ColorStateList.valueOf(gray)
        (selected as android.widget.ImageView).imageTintList = android.content.res.ColorStateList.valueOf(gold)
    }
}
