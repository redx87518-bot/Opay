import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

const MENU_ITEMS = [
  { section: 'Account', items: [
    { icon: 'person-circle-outline', label: 'My Profile', route: '/profile', color: '#06C755' },
    { icon: 'people-outline', label: 'Referral Program', route: null, color: '#FF9500' },
    { icon: 'qr-code-outline', label: 'My QR Code', route: null, color: '#007AFF' },
  ]},
  { section: 'Security', items: [
    { icon: 'lock-closed-outline', label: 'Change PIN', route: null, color: '#5856D6' },
    { icon: 'finger-print', label: 'Biometric Login', route: '/settings', color: '#06C755' },
    { icon: 'shield-checkmark-outline', label: 'Security Settings', route: '/settings', color: '#FF3B30' },
  ]},
  { section: 'Preferences', items: [
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications', color: '#FF9500' },
    { icon: 'settings-outline', label: 'App Settings', route: '/settings', color: '#34AADC' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null, color: '#5856D6' },
  ]},
  { section: 'About', items: [
    { icon: 'star-outline', label: 'Rate OPay', route: null, color: '#FF9500' },
    { icon: 'document-text-outline', label: 'Terms of Service', route: null, color: '#888' },
    { icon: 'lock-open-outline', label: 'Privacy Policy', route: null, color: '#888' },
    { icon: 'information-circle-outline', label: 'About OPay', route: null, color: '#007AFF' },
  ]},
];

export default function More() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const s = styles(colors);

  function handleItem(route: string | null) {
    if (route) router.push(route as any);
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Profile Header */}
      <LinearGradient colors={['#06C755', '#04923E']} style={s.profileHeader}>
        <TouchableOpacity style={s.profileCard} onPress={() => router.push('/profile')} activeOpacity={0.8}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={s.profilePhone}>{user?.phone ?? '—'}</Text>
            <View style={s.kycRow}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
              <Text style={s.kycText}>KYC Level {user?.kycLevel ?? 1} Verified</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((group, gi) => (
          <View key={gi} style={s.group}>
            <Text style={s.groupTitle}>{group.section}</Text>
            {group.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[s.menuItem, i < group.items.length - 1 && s.menuItemBorder]}
                onPress={() => handleItem(item.route)}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>OPay v1.0.0 · Simulation Build</Text>
        <View style={{ height: Platform.OS === 'web' ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  profileHeader: { paddingHorizontal: 20, paddingVertical: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  profilePhone: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  kycRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  kycText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.9)' },
  scroll: { flex: 1 },
  group: { backgroundColor: colors.card, marginBottom: 8, paddingHorizontal: 16, paddingTop: 8 },
  groupTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, margin: 16, borderRadius: colors.radius, padding: 16 },
  logoutText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.destructive },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 8 },
});
