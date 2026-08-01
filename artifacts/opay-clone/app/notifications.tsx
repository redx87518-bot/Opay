import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useWallet, OPayNotification } from '@/context/WalletContext';

function NotifIcon({ type }: { type: OPayNotification['type'] }) {
  const colors = useColors();
  const map: Record<string, { icon: string; color: string }> = {
    credit: { icon: 'arrow-down-circle', color: colors.primary },
    debit: { icon: 'arrow-up-circle', color: colors.destructive },
    info: { icon: 'information-circle', color: '#007AFF' },
    promo: { icon: 'gift', color: '#FF9500' },
  };
  const { icon, color } = map[type] ?? map.info;
  return <Ionicons name={icon as any} size={24} color={color} />;
}

export default function Notifications() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllRead } = useWallet();
  const s = styles(colors);

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={s.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        scrollEnabled={notifications.length > 0}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.notifRow, !item.read && s.unreadRow]}
            onPress={() => markNotificationRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={[s.iconWrap, { backgroundColor: !item.read ? colors.lightGreen : colors.muted }]}>
              <NotifIcon type={item.type} />
            </View>
            <View style={s.notifContent}>
              <Text style={[s.notifTitle, !item.read && s.unreadTitle]}>{item.title}</Text>
              <Text style={s.notifBody} numberOfLines={2}>{item.body}</Text>
              <Text style={s.notifTime}>{formatTime(item.date)}</Text>
            </View>
            {!item.read && <View style={s.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No notifications</Text>
            <Text style={s.emptySub}>You are all caught up!</Text>
          </View>
        )}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: insets.bottom + 20 }}
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  markAll: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.primary },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.card },
  unreadRow: { backgroundColor: colors.greenOverlay },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.foreground },
  unreadTitle: { fontFamily: 'Inter_700Bold' },
  notifBody: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
});
