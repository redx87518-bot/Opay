import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

type Params = {
  type: string;
  amount: string;
  recipient?: string;
  description?: string;
  reference: string;
  status: string;
};

const TYPE_LABELS: Record<string, string> = {
  add_money: 'Money Added',
  send_money: 'Money Sent',
  airtime: 'Airtime Purchase',
  data: 'Data Purchase',
  bills: 'Bill Payment',
  transfer: 'Bank Transfer',
};

export default function Receipt() {
  const params = useLocalSearchParams<Params>();
  const { type, amount, recipient, description, reference, status } = params;
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = styles(colors);

  const isSuccess = status === 'success';
  const label = TYPE_LABELS[type] ?? 'Transaction';
  const numAmount = parseFloat(amount ?? '0');

  function handleShare() {
    Share.share({ message: `OPay ${label}\nAmount: ₦${numAmount.toLocaleString()}\nRef: ${reference}\nStatus: ${status?.toUpperCase()}` });
  }

  function handleDone() {
    router.replace('/(tabs)/');
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Success Header */}
      <LinearGradient
        colors={isSuccess ? ['#06C755', '#04923E'] : ['#FF3B30', '#CC0000']}
        style={s.headerGradient}
      >
        <Animated.View entering={ZoomIn.duration(400)} style={s.iconCircle}>
          <Ionicons name={isSuccess ? 'checkmark' : 'close'} size={48} color="#fff" />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(200)} style={s.statusText}>
          {isSuccess ? 'Success!' : 'Failed'}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(300)} style={s.amountText}>
          ₦{numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(400)} style={s.labelText}>{label}</Animated.Text>
      </LinearGradient>

      {/* Details */}
      <Animated.View entering={FadeIn.delay(300)} style={s.details}>
        <Row label="Status" value={isSuccess ? 'Successful' : 'Failed'} valueColor={isSuccess ? colors.primary : colors.destructive} />
        {recipient ? <Row label="Recipient" value={recipient} /> : null}
        {description ? <Row label="Description" value={description} /> : null}
        <Row label="Reference" value={reference ?? '—'} mono />
        <Row label="Date" value={new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        <Row label="Transaction Type" value={label} />
        <Row label="Powered by" value="OPay Digital Services" />
      </Animated.View>

      {/* Actions */}
      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          <Text style={s.shareBtnText}>Share Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={s.doneBtnText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  const colors = useColors();
  return (
    <View style={rowStyles(colors).row}>
      <Text style={rowStyles(colors).label}>{label}</Text>
      <Text style={[rowStyles(colors).value, valueColor ? { color: valueColor } : {}, mono ? rowStyles(colors).mono : {}]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const rowStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  value: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.foreground, maxWidth: '60%', textAlign: 'right' },
  mono: { fontFamily: 'Inter_500Medium', letterSpacing: 0.5 },
});

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerGradient: { alignItems: 'center', paddingTop: 32, paddingBottom: 40, paddingHorizontal: 24 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statusText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 8 },
  amountText: { fontSize: 36, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 4 },
  labelText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)' },
  details: { flex: 1, backgroundColor: colors.card, marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 24 },
  footer: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: colors.radius, height: 48 },
  shareBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  doneBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
