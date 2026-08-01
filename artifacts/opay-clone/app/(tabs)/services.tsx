import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

const SERVICES = [
  { section: 'Payments', items: [
    { icon: 'call-outline', label: 'Airtime', route: '/airtime', color: '#06C755' },
    { icon: 'wifi-outline', label: 'Data', route: '/data-plan', color: '#007AFF' },
    { icon: 'flash-outline', label: 'Electricity', route: '/bills', color: '#FF9500' },
    { icon: 'tv-outline', label: 'Cable TV', route: '/bills', color: '#FF3B30' },
    { icon: 'radio-outline', label: 'Internet', route: '/bills', color: '#5856D6' },
    { icon: 'water-outline', label: 'Water', route: '/bills', color: '#34AADC' },
    { icon: 'school-outline', label: 'Education', route: '/bills', color: '#FF9500' },
    { icon: 'medical-outline', label: 'Health', route: '/bills', color: '#06C755' },
  ]},
  { section: 'Finance', items: [
    { icon: 'swap-horizontal-outline', label: 'Transfer', route: '/transfer', color: '#06C755' },
    { icon: 'trending-up-outline', label: 'OWealth', route: '/bills', color: '#FF9500' },
    { icon: 'cash-outline', label: 'Loans', route: '/bills', color: '#007AFF' },
    { icon: 'shield-checkmark-outline', label: 'Insurance', route: '/bills', color: '#5856D6' },
  ]},
  { section: 'Entertainment', items: [
    { icon: 'game-controller-outline', label: 'Betting', route: '/bills', color: '#FF3B30' },
    { icon: 'gift-outline', label: 'Gift Cards', route: '/bills', color: '#FF9500' },
    { icon: 'film-outline', label: 'Streaming', route: '/bills', color: '#5856D6' },
    { icon: 'musical-notes-outline', label: 'Music', route: '/bills', color: '#007AFF' },
  ]},
  { section: 'Government & Others', items: [
    { icon: 'business-outline', label: 'Government', route: '/bills', color: '#34AADC' },
    { icon: 'car-outline', label: 'Transport', route: '/bills', color: '#06C755' },
    { icon: 'star-outline', label: 'Rewards', route: '/bills', color: '#FF9500' },
    { icon: 'people-outline', label: 'Referral', route: '/bills', color: '#FF3B30' },
  ]},
];

export default function Services() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Header */}
      <LinearGradient colors={['#06C755', '#04923E']} style={s.header}>
        <Text style={s.headerTitle}>All Services</Text>
        <Text style={s.headerSub}>Quick access to all OPay services</Text>
      </LinearGradient>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {SERVICES.map((group, gi) => (
          <View key={gi} style={s.group}>
            <Text style={s.groupTitle}>{group.section}</Text>
            <View style={s.grid}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.serviceItem}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={s.serviceLabel} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: Platform.OS === 'web' ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flex: 1 },
  group: { backgroundColor: colors.card, marginBottom: 8, padding: 16 },
  groupTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  serviceItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  serviceLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.foreground, textAlign: 'center', lineHeight: 16 },
});
