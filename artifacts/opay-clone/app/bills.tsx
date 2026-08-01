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

const SERVICES = [
  { id: 'electricity', icon: 'flash-outline', label: 'Electricity', color: '#FF9500', providers: ['EKEDC', 'IKEDC', 'AEDC', 'PHEDC', 'BEDC'] },
  { id: 'water', icon: 'water-outline', label: 'Water', color: '#34AADC', providers: ['Lagos Water', 'Abuja Water', 'Rivers Water'] },
  { id: 'cable', icon: 'tv-outline', label: 'Cable TV', color: '#FF3B30', providers: ['DStv', 'GOtv', 'StarTimes'] },
  { id: 'internet', icon: 'wifi-outline', label: 'Internet', color: '#5856D6', providers: ['Spectranet', 'Smile', 'iPNX'] },
];

export default function Bills() {
  const [service, setService] = useState(SERVICES[0]);
  const [provider, setProvider] = useState(SERVICES[0].providers[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const { payBill, balance } = useWallet();
  const { verifyPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  function handlePay() {
    const num = parseFloat(amount);
    if (!accountNumber.trim()) return Alert.alert('Error', 'Enter account/meter number.');
    if (!num || num < 100) return Alert.alert('Error', 'Minimum bill payment is ₦100.');
    if (num > balance) return Alert.alert('Insufficient Balance', 'Not enough funds.');
    setShowPin(true);
  }

  async function onPinSuccess() {
    setShowPin(false);
    setLoading(true);
    try {
      const num = parseFloat(amount);
      await new Promise(r => setTimeout(r, 1000));
      const tx = await payBill(num, `${provider} ${service.label}`, accountNumber);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/receipt', params: { type: 'bills', amount: num.toString(), description: `${provider} Bill - ${accountNumber}`, reference: tx.reference, status: 'success' } });
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
        <Text style={s.headerTitle}>Pay Bills</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.sectionLabel}>Bill Type</Text>
        <View style={s.servicesGrid}>
          {SERVICES.map(sv => (
            <TouchableOpacity
              key={sv.id}
              style={[s.serviceBtn, service.id === sv.id && s.serviceBtnActive]}
              onPress={() => { setService(sv); setProvider(sv.providers[0]); }}
            >
              <View style={[s.serviceIcon, { backgroundColor: sv.color + '18' }]}>
                <Ionicons name={sv.icon as any} size={22} color={sv.color} />
              </View>
              <Text style={[s.serviceLabel, service.id === sv.id && s.serviceLabelActive]}>{sv.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Provider</Text>
        <View style={s.providersRow}>
          {service.providers.map(p => (
            <TouchableOpacity key={p} style={[s.providerBtn, provider === p && s.providerBtnActive]} onPress={() => setProvider(p)}>
              <Text style={[s.providerText, provider === p && s.providerTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Meter/Account Number</Text>
        <View style={s.inputRow}>
          <Ionicons name="barcode-outline" size={18} color={colors.mutedForeground} style={s.inputIcon} />
          <TextInput style={s.input} value={accountNumber} onChangeText={setAccountNumber} placeholder="Enter meter or account number" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
        </View>

        <Text style={s.sectionLabel}>Amount (₦)</Text>
        <View style={s.inputRow}>
          <Text style={s.currencySign}>₦</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} placeholder="Enter amount" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
        </View>

        <Text style={s.balanceHint}>Balance: ₦{balance.toLocaleString()}</Text>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.payBtn} onPress={handlePay} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.payBtnText}>Pay ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</Text>}
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
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  serviceBtn: { width: '22%', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, borderWidth: 1.5, borderColor: 'transparent' },
  serviceBtnActive: { borderColor: colors.primary, backgroundColor: colors.lightGreen },
  serviceIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.foreground, textAlign: 'center' },
  serviceLabelActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  providersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  providerBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.muted },
  providerBtnActive: { backgroundColor: colors.lightGreen },
  providerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  providerTextActive: { color: colors.primary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50, marginBottom: 12 },
  inputIcon: { marginRight: 8 },
  currencySign: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, marginRight: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  balanceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  payBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
