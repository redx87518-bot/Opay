package com.goldpay.ui.fragment

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.goldpay.R
import com.goldpay.databinding.FragmentReceiptBinding
import java.io.OutputStream

class ReceiptFragment : Fragment() {
    private var _binding: FragmentReceiptBinding? = null
    private val binding get() = _binding!!

    private var txType: String = "Wallet Transfer"
    private var txAmount: String = "0.00"
    private var txId: String = ""
    private var txFrom: String = ""
    private var txTo: String = ""
    private var txDate: String = ""
    private var txTime: String = ""

    companion object {
        fun newInstance(
            type: String,
            amount: String,
            txId: String,
            from: String,
            to: String,
            date: String,
            time: String
        ) = ReceiptFragment().apply {
            arguments = Bundle().apply {
                putString("type", type)
                putString("amount", amount)
                putString("txId", txId)
                putString("from", from)
                putString("to", to)
                putString("date", date)
                putString("time", time)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            txType = it.getString("type", "Wallet Transfer")
            txAmount = it.getString("amount", "0.00")
            txId = it.getString("txId", "")
            txFrom = it.getString("from", "")
            txTo = it.getString("to", "")
            txDate = it.getString("date", "")
            txTime = it.getString("time", "")
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentReceiptBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.tvType.text = txType
        binding.tvAmount.text = "₦${String.format("%,.2f", txAmount.toDoubleOrNull() ?: 0.0)}"
        binding.tvTxId.text = txId
        binding.tvFrom.text = txFrom
        binding.tvTo.text = txTo
        binding.tvDate.text = txDate
        binding.tvTime.text = txTime

        binding.btnSaveReceipt.setOnClickListener {
            saveReceiptAsImage()
        }

        binding.btnShareReceipt.setOnClickListener {
            shareReceipt()
        }
    }

    private fun saveReceiptAsImage() {
        try {
            val bitmap = Bitmap.createBitmap(binding.root.width, binding.root.height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            binding.root.draw(canvas)

            val filename = "GoldPay_Receipt_${System.currentTimeMillis()}.png"
            val values = android.content.ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, filename)
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/GoldPay")
            }

            val uri: Uri? = requireContext().contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            uri?.let {
                val outputStream: OutputStream? = requireContext().contentResolver.openOutputStream(it)
                outputStream?.use { stream ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
                }
                Toast.makeText(requireContext(), "Receipt saved to gallery", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Failed to save receipt", Toast.LENGTH_SHORT).show()
        }
    }

    private fun shareReceipt() {
        try {
            val bitmap = Bitmap.createBitmap(binding.root.width, binding.root.height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            binding.root.draw(canvas)

            val uri = android.provider.MediaStore.Images.Media.insertImage(
                requireContext().contentResolver,
                bitmap,
                "GoldPay_Receipt",
                "GoldPay Transaction Receipt"
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, Uri.parse(uri))
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(shareIntent, "Share Receipt"))
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Failed to share receipt", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
