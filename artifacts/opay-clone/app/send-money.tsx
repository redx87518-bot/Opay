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
import PinPad from '@/components/PinPad';
import * as Haptics from 'expo-haptics';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function SendMoney() {
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const colors = useColors();
  const { sendMoney, balance } = useWallet();
  const { verifyPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  async function handleLookup() {
    if (phone.length < 11) return;
    setSearching(true);
    await new Promise(r => setTimeout(r, 800));
    setRecipientName('John Doe');
    setSearching(false);
  }

  function handleSend() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!phone || phone.length < 11) return Alert.alert('Error', 'Enter a valid phone number.');
    if (!num || num <= 0) return Alert.alert('Error', 'Enter a valid amount.');
    if (num > balance) return Alert.alert('Insufficient Balance', 'You do not have enough funds.');
    setShowPin(true);
  }

  async function onPinSuccess() {
    setShowPin(false);
    setLoading(true);
    try {
      const num = parseFloat(amount.replace(/,/g, ''));
      const name = recipientName || phone;
      await new Promise(r => setTimeout(r, 1000));
      const tx = await sendMoney(num, name, phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'send_money', amount: num.toString(), recipient: name, reference: tx.reference, status: 'success', description: `Money sent to ${name}` } });
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
        <Text style={s.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Recipient */}
        <View style={s.section}>
          <Text style={s.label}>Recipient Phone Number</Text>
          <View style={s.phoneRow}>
            <View style={s.flag}><Text style={s.flagText}>🇳🇬</Text></View>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={v => { setPhone(v); setRecipientName(''); }}
              onBlur={handleLookup}
              placeholder="080XXXXXXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              maxLength={11}
            />
            {searching && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          {recipientName ? (
            <View style={s.recipientFound}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={s.recipientName}>{recipientName}</Text>
            </View>
          ) : null}
        </View>

        {/* Amount */}
        <View style={s.section}>
          <Text style={s.label}>Amount</Text>
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
          <Text style={s.balanceHint}>Balance: ₦{balance.toLocaleString()}</Text>
          <View style={s.quickAmounts}>
            {QUICK_AMOUNTS.map(qa => (
              <TouchableOpacity key={qa} style={[s.quickBtn, amount === qa.toString() && s.quickBtnActive]} onPress={() => setAmount(qa.toString())}>
                <Text style={[s.quickText, amount === qa.toString() && s.quickTextActive]}>₦{qa.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={s.section}>
          <Text style={s.label}>Add Note (Optional)</Text>
          <TextInput
            style={s.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What is this for?"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.sendBtn} onPress={handleSend} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={s.sendBtnText}>Send ₦{amount ? parseFloat(amount.replace(/,/g,'')).toLocaleString() : '0'}</Text>
              </>
            )}
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
  section: { backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, marginBottom: 12 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, paddingHorizontal: 12, height: 50, gap: 8 },
  flag: { padding: 2 },
  flagText: { fontSize: 20 },
  phoneInput: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.foreground },
  recipientFound: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  recipientName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 8, marginBottom: 8 },
  currency: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 34, fontFamily: 'Inter_700Bold', color: colors.foreground },
  balanceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 12 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.muted },
  quickBtnActive: { backgroundColor: colors.lightGreen },
  quickText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  quickTextActive: { color: colors.primary },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, paddingHorizontal: 12, height: 44, fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  sendBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  sendBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
