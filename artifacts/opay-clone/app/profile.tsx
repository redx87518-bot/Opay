import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = styles(colors);

  async function handleSave() {
    if (!name.trim()) return Alert.alert('Error', 'Name cannot be empty.');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    await updateUser({ name: name.trim(), email: email.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    Alert.alert('Success', 'Profile updated successfully.');
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Avatar */}
        <LinearGradient colors={['#06C755', '#04923E']} style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.kycBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text style={s.kycText}>KYC Level {user?.kycLevel ?? 1}</Text>
          </View>
        </LinearGradient>

        {/* Account Info */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Account Number</Text>
            <Text style={s.infoValue}>{user?.accountNumber ?? '—'}</Text>
          </View>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={s.infoLabel}>Bank Name</Text>
            <Text style={s.infoValue}>OPay Digital Services</Text>
          </View>
        </View>

        {/* Editable Fields */}
        <Text style={s.sectionLabel}>Personal Information</Text>

        <View style={s.form}>
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Full Name</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={colors.mutedForeground} />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Phone Number</Text>
            <View style={[s.inputRow, s.readOnly]}>
              <Ionicons name="call-outline" size={18} color={colors.mutedForeground} />
              <Text style={s.readOnlyText}>{user?.phone ?? '—'}</Text>
              <Ionicons name="lock-closed-outline" size={14} color={colors.mutedForeground} />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Email Address</Text>
            <View style={s.inputRow}>
              <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>
        </View>

        {/* KYC Upgrade */}
        {user?.kycLevel === 1 && (
          <TouchableOpacity style={s.upgradeCard}>
            <Ionicons name="arrow-up-circle" size={24} color="#FF9500" />
            <View style={s.upgradeText}>
              <Text style={s.upgradeTitle}>Upgrade to KYC Level 2</Text>
              <Text style={s.upgradeSub}>Increase your transaction limit to ₦500,000/day</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#fff' },
  kycBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  kycText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  infoCard: { backgroundColor: colors.card, marginHorizontal: 16, marginTop: -16, borderRadius: 12, overflow: 'hidden', ...({ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } as any) },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  infoValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  form: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 8 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.foreground, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.input, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50 },
  readOnly: { backgroundColor: colors.muted },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  readOnlyText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, backgroundColor: '#FFF8EE', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FF950040' },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#FF9500' },
  upgradeSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2 },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  saveBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
