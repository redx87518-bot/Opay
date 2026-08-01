import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

const METHODS = [
  { id: 'bank', icon: 'business-outline', label: 'Bank Transfer', sub: 'Transfer directly from your bank', color: '#007AFF' },
  { id: 'ussd', icon: 'call-outline', label: 'USSD', sub: 'Dial *955# to add money', color: '#06C755' },
  { id: 'card', icon: 'card-outline', label: 'Debit/Credit Card', sub: 'Visa, Mastercard, Verve', color: '#FF9500' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function AddMoney() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const { addMoney } = useWallet();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  async function handleAdd() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    if (num < 100) return Alert.alert('Minimum Amount', 'Minimum amount to add is ₦100.');
    setLoading(true);
    try {
      const methodName = METHODS.find(m => m.id === method)?.label ?? method;
      await new Promise(r => setTimeout(r, 1200));
      const tx = await addMoney(num, methodName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'add_money', amount: num.toString(), description: `Money Added via ${methodName}`, reference: tx.reference, status: 'success' } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Account Info */}
        <View style={s.accountCard}>
          <Text style={s.accountLabel}>Your OPay Account</Text>
          <Text style={s.accountNum}>{user?.accountNumber ?? '—'}</Text>
          <Text style={s.accountName}>{user?.name ?? 'User'}</Text>
          <Text style={s.bankName}>OPay Digital Services</Text>
        </View>

        {/* Amount Input */}
        <View style={s.amountSection}>
          <Text style={s.label}>Enter Amount</Text>
          <View style={s.amountRow}>
            <Text style={s.currency}>₦</Text>
            <TextInput
              style={s.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
            />
          </View>
          <View style={s.quickAmounts}>
            {QUICK_AMOUNTS.map(qa => (
              <TouchableOpacity
                key={qa}
                style={[s.quickBtn, amount === qa.toString() && s.quickBtnActive]}
                onPress={() => setAmount(qa.toString())}
              >
                <Text style={[s.quickText, amount === qa.toString() && s.quickTextActive]}>
                  ₦{qa.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Methods */}
        <Text style={s.methodsLabel}>Payment Method</Text>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[s.methodCard, method === m.id && s.methodCardActive]}
            onPress={() => setMethod(m.id)}
          >
            <View style={[s.methodIcon, { backgroundColor: m.color + '18' }]}>
              <Ionicons name={m.icon as any} size={22} color={m.color} />
            </View>
            <View style={s.methodInfo}>
              <Text style={s.methodLabel}>{m.label}</Text>
              <Text style={s.methodSub}>{m.sub}</Text>
            </View>
            <View style={[s.radio, method === m.id && s.radioActive]}>
              {method === m.id && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.addBtn} onPress={handleAdd} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.addBtnText}>Add ₦{amount ? parseFloat(amount.replace(/,/g, '')).toLocaleString() : '0'}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  accountCard: { backgroundColor: colors.lightGreen, borderRadius: colors.radius, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.primary + '30', alignItems: 'center' },
  accountLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 4 },
  accountNum: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.primary, marginBottom: 4, letterSpacing: 2 },
  accountName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  bankName: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  amountSection: { backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 8, marginBottom: 16 },
  currency: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 36, fontFamily: 'Inter_700Bold', color: colors.foreground },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.muted },
  quickBtnActive: { backgroundColor: colors.lightGreen },
  quickText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  quickTextActive: { color: colors.primary },
  methodsLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 8 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: colors.radius, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: colors.border },
  methodCardActive: { borderColor: colors.primary },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  methodSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  addBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
