package com.goldpay.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.goldpay.R
import com.goldpay.data.model.Transaction

class TransactionAdapter : RecyclerView.Adapter<TransactionAdapter.VH>() {
    private val items = mutableListOf<Transaction>()

    fun submitList(list: List<Transaction>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_transaction, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle = itemView.findViewById<TextView>(R.id.tvTitle)
        private val tvSubtitle = itemView.findViewById<TextView>(R.id.tvSubtitle)
        private val tvAmount = itemView.findViewById<TextView>(R.id.tvAmount)

        fun bind(tx: Transaction) {
            tvTitle.text = tx.description.ifBlank { tx.type.replaceFirstChar { it.uppercase() } }
            tvSubtitle.text = tx.recipient.ifBlank { "GoldPay" }
            val sign = if (tx.type.contains("credit", true)) "+" else "-"
            tvAmount.text = "$sign ₦${String.format("%,.2f", tx.amount)}"
            tvAmount.setTextColor(
                itemView.context.getColor(
                    if (tx.type.contains("credit", true)) R.color.green_500 else R.color.red_500
                )
            )
        }
    }
}
