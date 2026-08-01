import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import PinPad from '@/components/PinPad';
import * as Haptics from 'expo-haptics';

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const PLANS: Record<string, { id: string; name: string; size: string; validity: string; price: number }[]> = {
  MTN: [
    { id: '1', name: 'Daily', size: '100MB', validity: '1 Day', price: 100 },
    { id: '2', name: 'Weekly', size: '1GB', validity: '7 Days', price: 300 },
    { id: '3', name: 'Monthly', size: '3GB', validity: '30 Days', price: 1000 },
    { id: '4', name: 'Monthly', size: '5GB', validity: '30 Days', price: 1500 },
    { id: '5', name: 'Monthly', size: '10GB', validity: '30 Days', price: 2500 },
    { id: '6', name: 'Monthly', size: '20GB', validity: '30 Days', price: 4000 },
  ],
  Airtel: [
    { id: '1', name: 'Daily', size: '100MB', validity: '1 Day', price: 100 },
    { id: '2', name: 'Weekly', size: '750MB', validity: '7 Days', price: 250 },
    { id: '3', name: 'Monthly', size: '2GB', validity: '30 Days', price: 1000 },
    { id: '4', name: 'Monthly', size: '6GB', validity: '30 Days', price: 1500 },
    { id: '5', name: 'Monthly', size: '12GB', validity: '30 Days', price: 2500 },
  ],
  Glo: [
    { id: '1', name: 'Daily', size: '200MB', validity: '1 Day', price: 100 },
    { id: '2', name: 'Weekly', size: '1.5GB', validity: '7 Days', price: 300 },
    { id: '3', name: 'Monthly', size: '4.8GB', validity: '30 Days', price: 1000 },
    { id: '4', name: 'Monthly', size: '7.5GB', validity: '30 Days', price: 1500 },
  ],
  '9mobile': [
    { id: '1', name: 'Daily', size: '150MB', validity: '1 Day', price: 100 },
    { id: '2', name: 'Weekly', size: '1GB', validity: '7 Days', price: 300 },
    { id: '3', name: 'Monthly', size: '2.5GB', validity: '30 Days', price: 1000 },
  ],
};

export default function DataPlan() {
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const { buyData, balance } = useWallet();
  const { verifyPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  const plans = PLANS[network] ?? [];
  const plan = plans.find(p => p.id === selectedPlan);

  function handleBuy() {
    if (!phone || phone.length < 11) return Alert.alert('Error', 'Enter a valid phone number.');
    if (!plan) return Alert.alert('Error', 'Select a data plan.');
    if (plan.price > balance) return Alert.alert('Insufficient Balance', 'Not enough funds.');
    setShowPin(true);
  }

  async function onPinSuccess() {
    setShowPin(false);
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const tx = await buyData(plan!.price, network, `${plan!.size}/${plan!.validity}`, phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'data', amount: plan!.price.toString(), description: `${network} ${plan!.size} Data → ${phone}`, reference: tx.reference, status: 'success' } });
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
        <Text style={s.headerTitle}>Buy Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.sectionLabel}>Select Network</Text>
        <View style={s.networksRow}>
          {NETWORKS.map(n => (
            <TouchableOpacity key={n} style={[s.networkBtn, network === n && s.networkBtnActive]} onPress={() => { setNetwork(n); setSelectedPlan(null); }}>
              <Text style={[s.networkText, network === n && s.networkTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Phone Number</Text>
        <View style={s.inputRow}>
          <Ionicons name="call-outline" size={18} color={colors.mutedForeground} style={s.inputIcon} />
          <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="080XXXXXXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" maxLength={11} />
        </View>

        <Text style={s.sectionLabel}>Select Data Plan</Text>
        {plans.map(p => (
          <TouchableOpacity key={p.id} style={[s.planCard, selectedPlan === p.id && s.planCardActive]} onPress={() => setSelectedPlan(p.id)}>
            <View style={s.planLeft}>
              <Text style={s.planSize}>{p.size}</Text>
              <Text style={s.planMeta}>{p.name} · {p.validity}</Text>
            </View>
            <View style={s.planRight}>
              <Text style={s.planPrice}>₦{p.price.toLocaleString()}</Text>
              {selectedPlan === p.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={s.balanceHint}>Balance: ₦{balance.toLocaleString()}</Text>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.buyBtn} onPress={handleBuy} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buyBtnText}>{plan ? `Buy ${plan.size} for ₦${plan.price.toLocaleString()}` : 'Select a Plan'}</Text>}
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
  networksRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  networkBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 10, backgroundColor: colors.muted },
  networkBtnActive: { backgroundColor: colors.lightGreen },
  networkText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground },
  networkTextActive: { color: colors.primary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50, marginBottom: 16 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  planCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: colors.border },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.lightGreen },
  planLeft: { flex: 1 },
  planSize: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.foreground },
  planMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2 },
  planRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planPrice: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  balanceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 8 },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  buyBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
