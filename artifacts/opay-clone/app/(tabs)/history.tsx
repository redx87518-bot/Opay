import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useWallet, Transaction } from '@/context/WalletContext';
import TransactionItem from '@/components/TransactionItem';

type Filter = 'all' | 'credit' | 'debit';

export default function History() {
  const [filter, setFilter] = useState<Filter>('all');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions } = useWallet();
  const s = styles(colors);

  const filtered = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <LinearGradient colors={['#06C755', '#04923E']} style={s.header}>
        <Text style={s.headerTitle}>Transaction History</Text>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statLabel}>Total Income</Text>
            <Text style={s.statAmount}>+₦{totalCredit.toLocaleString()}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statLabel}>Total Spent</Text>
            <Text style={[s.statAmount, { color: '#FFD4D0' }]}>-₦{totalDebit.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={s.filters}>
        {(['all', 'credit', 'debit'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'credit' ? 'Income' : 'Expense'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={tx => tx.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No transactions</Text>
            <Text style={s.emptySub}>
              {filter === 'all' ? 'Your transactions will appear here.' : `No ${filter === 'credit' ? 'income' : 'expense'} transactions found.`}
            </Text>
          </View>
        )}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: Platform.OS === 'web' ? 100 : 80 }}
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  statAmount: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  filters: { flexDirection: 'row', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', backgroundColor: colors.muted },
  filterTabActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  filterTextActive: { color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'center' },
});
