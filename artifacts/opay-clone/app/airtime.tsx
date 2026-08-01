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

const NETWORKS = [
  { id: 'MTN', color: '#FFCD00', bg: '#FFFBEB' },
  { id: 'Airtel', color: '#E2231A', bg: '#FEF2F2' },
  { id: 'Glo', color: '#009A44', bg: '#F0FDF4' },
  { id: '9mobile', color: '#00673A', bg: '#F0FDF4' },
];

const AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function Airtime() {
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const { buyAirtime, balance } = useWallet();
  const { verifyPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  function handleBuy() {
    const num = parseFloat(amount);
    if (!phone || phone.length < 11) return Alert.alert('Error', 'Enter a valid phone number.');
    if (!num || num < 50) return Alert.alert('Error', 'Minimum airtime is ₦50.');
    if (num > balance) return Alert.alert('Insufficient Balance', 'Not enough funds.');
    setShowPin(true);
  }

  async function onPinSuccess() {
    setShowPin(false);
    setLoading(true);
    try {
      const num = parseFloat(amount);
      await new Promise(r => setTimeout(r, 1000));
      const tx = await buyAirtime(num, network, phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'airtime', amount: num.toString(), description: `${network} ₦${num} Airtime → ${phone}`, reference: tx.reference, status: 'success' } });
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
        <Text style={s.headerTitle}>Buy Airtime</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.sectionLabel}>Select Network</Text>
        <View style={s.networksRow}>
          {NETWORKS.map(n => (
            <TouchableOpacity key={n.id} style={[s.networkBtn, { backgroundColor: n.bg }, network === n.id && s.networkBtnActive]} onPress={() => setNetwork(n.id)}>
              <View style={[s.networkDot, { backgroundColor: n.color }]} />
              <Text style={[s.networkText, { color: n.color }]}>{n.id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Phone Number</Text>
        <View style={s.inputRow}>
          <Ionicons name="call-outline" size={18} color={colors.mutedForeground} style={s.inputIcon} />
          <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="080XXXXXXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" maxLength={11} />
        </View>

        <Text style={s.sectionLabel}>Amount (₦)</Text>
        <View style={s.amountsGrid}>
          {AMOUNTS.map(a => (
            <TouchableOpacity key={a} style={[s.amountBtn, amount === a.toString() && s.amountBtnActive]} onPress={() => setAmount(a.toString())}>
              <Text style={[s.amountText, amount === a.toString() && s.amountTextActive]}>₦{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.inputRow}>
          <Text style={s.currencySign}>₦</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} placeholder="Or enter custom amount" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
        </View>

        <Text style={s.balanceHint}>Balance: ₦{balance.toLocaleString()}</Text>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.buyBtn} onPress={handleBuy} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buyBtnText}>Buy ₦{amount || '0'} Airtime</Text>}
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
  sectionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 10, marginTop: 8 },
  networksRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  networkBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent' },
  networkBtnActive: { borderColor: colors.primary },
  networkDot: { width: 10, height: 10, borderRadius: 5 },
  networkText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50, marginBottom: 16 },
  inputIcon: { marginRight: 8 },
  currencySign: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, marginRight: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  amountBtn: { width: '30%', paddingVertical: 12, borderRadius: 8, backgroundColor: colors.muted, alignItems: 'center' },
  amountBtnActive: { backgroundColor: colors.lightGreen },
  amountText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  amountTextActive: { color: colors.primary },
  balanceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  buyBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
