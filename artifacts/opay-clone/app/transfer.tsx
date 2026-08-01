import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import PinPad from '@/components/PinPad';
import * as Haptics from 'expo-haptics';

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Kuda Bank', 'Opay', 'PalmPay', 'Stanbic IBTC', 'FCMB', 'Fidelity', 'Polaris', 'Sterling', 'Union Bank', 'Wema Bank'];

export default function Transfer() {
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const { bankTransfer, balance } = useWallet();
  const { verifyPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  async function verifyAccount() {
    if (!bank || accountNumber.length < 10) return;
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    setAccountName('ADEWALE JOHN');
    setVerifying(false);
  }

  function handleTransfer() {
    const num = parseFloat(amount);
    if (!bank) return Alert.alert('Error', 'Select a bank.');
    if (!accountNumber || accountNumber.length < 10) return Alert.alert('Error', 'Enter a valid account number.');
    if (!num || num < 100) return Alert.alert('Error', 'Minimum transfer is ₦100.');
    if (num > balance) return Alert.alert('Insufficient Balance', 'Not enough funds.');
    setShowPin(true);
  }

  async function onPinSuccess() {
    setShowPin(false);
    setLoading(true);
    try {
      const num = parseFloat(amount);
      await new Promise(r => setTimeout(r, 1200));
      const tx = await bankTransfer(num, bank, accountNumber, accountName || 'Account Holder');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'transfer', amount: num.toString(), recipient: `${accountName} (${bank})`, reference: tx.reference, status: 'success' } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}><Ionicons name="close" size={24} color={colors.foreground} /></TouchableOpacity>
        <Text style={s.headerTitle}>Bank Transfer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Bank Selection */}
        <Text style={s.sectionLabel}>Select Bank</Text>
        <TouchableOpacity style={s.bankSelector} onPress={() => setShowBankList(p => !p)}>
          <Ionicons name="business-outline" size={18} color={colors.mutedForeground} />
          <Text style={[s.bankSelectorText, !bank && s.placeholder]}>{bank || 'Choose a bank'}</Text>
          <Ionicons name={showBankList ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {showBankList && (
          <View style={s.bankList}>
            {BANKS.map(b => (
              <TouchableOpacity key={b} style={s.bankItem} onPress={() => { setBank(b); setShowBankList(false); setAccountName(''); }}>
                <Text style={[s.bankItemText, b === bank && s.bankItemActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={s.sectionLabel}>Account Number</Text>
        <View style={s.inputRow}>
          <Ionicons name="card-outline" size={18} color={colors.mutedForeground} style={s.inputIcon} />
          <TextInput
            style={s.input}
            value={accountNumber}
            onChangeText={v => { setAccountNumber(v); setAccountName(''); }}
            onBlur={verifyAccount}
            placeholder="10-digit account number"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={10}
          />
          {verifying && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {accountName ? (
          <View style={s.verifiedRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={s.verifiedName}>{accountName}</Text>
          </View>
        ) : null}

        <Text style={s.sectionLabel}>Amount</Text>
        <View style={s.inputRow}>
          <Text style={s.currencySign}>₦</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} placeholder="Enter amount" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
        </View>
        <Text style={s.balanceHint}>Balance: ₦{balance.toLocaleString()}</Text>

        <Text style={s.sectionLabel}>Note (Optional)</Text>
        <TextInput style={s.noteInput} value={note} onChangeText={setNote} placeholder="What is this transfer for?" placeholderTextColor={colors.mutedForeground} />

        {/* Fee note */}
        <View style={s.feeNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={s.feeText}>Transfer fee: ₦10 - ₦50 (waived for this simulation)</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.transferBtn} onPress={handleTransfer} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.transferBtnText}>Transfer ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <PinPad visible={showPin} onSuccess={onPinSuccess} onCancel={() => setShowPin(false)} verifyPin={verifyPin} />
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
  sectionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 8, marginTop: 8 },
  bankSelector: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50, marginBottom: 8 },
  bankSelectorText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  placeholder: { color: colors.mutedForeground },
  bankList: { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, marginBottom: 12, maxHeight: 200, overflow: 'hidden' },
  bankItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  bankItemText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground },
  bankItemActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50, marginBottom: 8, gap: 8 },
  inputIcon: { marginRight: 0 },
  currencySign: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  verifiedName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  balanceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 8 },
  noteInput: { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 44, fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground },
  feeNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: colors.lightGreen, borderRadius: 8, padding: 12 },
  feeText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.primary, flex: 1 },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  transferBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  transferBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
