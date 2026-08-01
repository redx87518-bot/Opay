import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Transaction } from '@/context/WalletContext';

interface Props { transaction: Transaction }

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCategoryIcon(category: Transaction['category']): { name: string; set: 'ion' | 'mci' } {
  switch (category) {
    case 'add_money': return { name: 'wallet', set: 'ion' };
    case 'send_money': return { name: 'paper-plane', set: 'ion' };
    case 'airtime': return { name: 'call', set: 'ion' };
    case 'data': return { name: 'wifi', set: 'ion' };
    case 'bills': return { name: 'flash', set: 'ion' };
    case 'transfer': return { name: 'swap-horizontal', set: 'ion' };
    case 'received': return { name: 'arrow-down-circle', set: 'ion' };
    default: return { name: 'cash', set: 'ion' };
  }
}

export default function TransactionItem({ transaction }: Props) {
  const colors = useColors();
  const isCredit = transaction.type === 'credit';
  const icon = getCategoryIcon(transaction.category);

  const s = styles(colors);
  return (
    <View style={s.row}>
      <View style={[s.iconWrap, { backgroundColor: isCredit ? colors.lightGreen : '#FFF1F0' }]}>
        <Ionicons
          name={icon.name as any}
          size={20}
          color={isCredit ? colors.primary : colors.destructive}
        />
      </View>
      <View style={s.info}>
        <Text style={s.desc} numberOfLines={1}>{transaction.description}</Text>
        <Text style={s.date}>{formatDate(transaction.date)}</Text>
      </View>
      <View style={s.right}>
        <Text style={[s.amount, { color: isCredit ? colors.primary : colors.foreground }]}>
          {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </Text>
        <View style={[s.badge, { backgroundColor: transaction.status === 'success' ? colors.lightGreen : '#FFF1F0' }]}>
          <Text style={[s.badgeText, { color: transaction.status === 'success' ? colors.primary : colors.destructive }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  desc: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.foreground },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
});
