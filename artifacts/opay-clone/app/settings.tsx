import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isBiometricEnabled, toggleBiometric, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const s = styles(colors);

  function handleChangePin() {
    Alert.alert('Change PIN', 'You will be logged out to reset your PIN.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/set-pin'); } },
    ]);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Security */}
        <Text style={s.sectionTitle}>Security</Text>
        <View style={s.group}>
          <SettingRow
            icon="lock-closed-outline" iconColor="#5856D6" label="Change PIN"
            onPress={handleChangePin} showArrow colors={colors}
          />
          <SettingRow
            icon="finger-print" iconColor="#06C755" label="Biometric Login"
            right={<Switch value={isBiometricEnabled} onValueChange={toggleBiometric} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />}
            colors={colors}
          />
          <SettingRow icon="shield-checkmark-outline" iconColor="#FF3B30" label="Two-Factor Authentication" onPress={() => {}} showArrow colors={colors} />
        </View>

        {/* Notifications */}
        <Text style={s.sectionTitle}>Notifications</Text>
        <View style={s.group}>
          <SettingRow
            icon="notifications-outline" iconColor="#FF9500" label="Push Notifications"
            right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />}
            colors={colors}
          />
          <SettingRow
            icon="card-outline" iconColor="#007AFF" label="Transaction Alerts"
            right={<Switch value={transactionAlerts} onValueChange={setTransactionAlerts} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />}
            colors={colors}
          />
        </View>

        {/* Preferences */}
        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={s.group}>
          <SettingRow icon="moon-outline" iconColor="#5856D6" label="Dark Mode"
            right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />}
            colors={colors}
          />
          <SettingRow icon="language-outline" iconColor="#34AADC" label="Language" value="English" onPress={() => {}} showArrow colors={colors} />
          <SettingRow icon="earth-outline" iconColor="#06C755" label="Country" value="Nigeria" onPress={() => {}} showArrow colors={colors} />
        </View>

        {/* Privacy */}
        <Text style={s.sectionTitle}>Privacy & Legal</Text>
        <View style={s.group}>
          <SettingRow icon="eye-off-outline" iconColor="#888" label="Privacy Policy" onPress={() => {}} showArrow colors={colors} />
          <SettingRow icon="document-text-outline" iconColor="#888" label="Terms of Service" onPress={() => {}} showArrow colors={colors} />
          <SettingRow icon="trash-outline" iconColor={colors.destructive} label="Delete Account" onPress={() => Alert.alert('Delete Account', 'This action is irreversible. Contact support to delete your account.')} colors={colors} />
        </View>

        {/* About */}
        <Text style={s.sectionTitle}>About</Text>
        <View style={s.group}>
          <SettingRow icon="information-circle-outline" iconColor="#007AFF" label="App Version" value="1.0.0 (Simulation)" colors={colors} />
          <SettingRow icon="star-outline" iconColor="#FF9500" label="Rate OPay" onPress={() => {}} showArrow colors={colors} />
        </View>

        <View style={{ height: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }} />
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, iconColor, label, value, onPress, showArrow, right, colors }: {
  icon: string; iconColor: string; label: string; value?: string;
  onPress?: () => void; showArrow?: boolean; right?: React.ReactNode; colors: any;
}) {
  const s = rowStyles(colors);
  return (
    <TouchableOpacity style={s.row} onPress={onPress} disabled={!onPress && !right} activeOpacity={0.7}>
      <View style={[s.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={s.label}>{label}</Text>
      {value ? <Text style={s.value}>{value}</Text> : null}
      {right ?? null}
      {showArrow && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

const rowStyles = (colors: any) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingHorizontal: 16 },
  iconWrap: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground },
  value: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
});

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  group: { backgroundColor: colors.card, borderRadius: 0 },
});
