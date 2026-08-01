import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import QuickAction from '@/components/QuickAction';
import TransactionItem from '@/components/TransactionItem';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'paper-plane-outline', label: 'Send Money', route: '/send-money' },
  { icon: 'add-circle-outline', label: 'Add Money', route: '/add-money' },
  { icon: 'call-outline', label: 'Airtime', route: '/airtime' },
  { icon: 'wifi-outline', label: 'Data', route: '/data-plan' },
  { icon: 'flash-outline', label: 'Bills', route: '/bills' },
  { icon: 'swap-horizontal-outline', label: 'Transfer', route: '/transfer' },
];

const SECOND_ACTIONS = [
  { icon: 'card-outline', label: 'Pay', route: '/bills' },
  { icon: 'trending-up-outline', label: 'Savings', route: '/bills' },
  { icon: 'ribbon-outline', label: 'OWealth', route: '/bills' },
  { icon: 'cash-outline', label: 'Loan', route: '/bills' },
  { icon: 'shield-outline', label: 'Insurance', route: '/bills' },
];

export default function Home() {
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();
  const { user, logout } = useAuth();
  const { balance, transactions, unreadCount } = useWallet();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  }

  const s = styles(colors);
  const recent = transactions.slice(0, 5);

  return (
    <View style={s.root}>
      {/* Green Header */}
      <LinearGradient
        colors={['#06C755', '#04923E']}
        style={[s.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}
      >
        <View style={s.headerTop}>
          <View style={s.userRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
            </View>
            <View>
              <Text style={s.greeting}>Good {getGreeting()}</Text>
              <Text style={s.userName} numberOfLines={1}>{user?.name ?? 'User'}</Text>
            </View>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn}>
              <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.balanceCard}>
          <View style={s.balanceRow}>
            <View>
              <Text style={s.balanceLabel}>Available Balance</Text>
              <Text style={s.balanceAmount}>
                {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦ ••••••'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowBalance(p => !p)} style={s.eyeBtn}>
              <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={s.accountRow}>
            <Text style={s.accountNum}>Acc: {user?.accountNumber ?? '—'}</Text>
            <View style={s.kycBadge}>
              <Text style={s.kycText}>KYC Level {user?.kycLevel ?? 1}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Quick Actions */}
        <View style={s.section}>
          <View style={s.actionsRow}>
            {QUICK_ACTIONS.map((action, i) => (
              <QuickAction
                key={i}
                icon={action.icon as any}
                label={action.label}
                onPress={() => router.push(action.route as any)}
              />
            ))}
          </View>
        </View>

        {/* Second row */}
        <View style={[s.section, s.secondSection]}>
          <View style={s.actionsRow2}>
            {SECOND_ACTIONS.map((action, i) => (
              <QuickAction
                key={i}
                icon={action.icon as any}
                label={action.label}
                onPress={() => router.push(action.route as any)}
                bgColor={colors.muted}
                color={colors.foreground}
                size="small"
              />
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <TouchableOpacity style={s.promo} activeOpacity={0.9}>
          <LinearGradient colors={['#FF9500', '#FF6B00']} style={s.promoBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={s.promoContent}>
              <Ionicons name="gift-outline" size={28} color="#fff" />
              <View style={s.promoText}>
                <Text style={s.promoTitle}>Refer & Earn</Text>
                <Text style={s.promoSub}>Get ₦1,000 for every friend you invite</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={s.txSection}>
          <View style={s.txHeader}>
            <Text style={s.txTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
              <Text style={s.txSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No transactions yet</Text>
              <Text style={s.emptySubtext}>Your transactions will appear here</Text>
            </View>
          ) : (
            <View style={s.txList}>
              {recent.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
            </View>
          )}
        </View>

        <View style={{ height: Platform.OS === 'web' ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  greeting: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff', maxWidth: 150 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8, position: 'relative' },
  badge: {
    position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#fff' },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  eyeBtn: { padding: 4 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  accountNum: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  kycBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  kycText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  section: { backgroundColor: colors.card, marginBottom: 8, paddingVertical: 20, paddingHorizontal: 16 },
  secondSection: { paddingTop: 0 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionsRow2: { flexDirection: 'row', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 16 },
  promo: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  promoBg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  promoContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoText: {},
  promoTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
  promoSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  txSection: { backgroundColor: colors.card, marginTop: 8 },
  txHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  txTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  txSeeAll: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.primary },
  txList: {},
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.foreground },
  emptySubtext: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
});
