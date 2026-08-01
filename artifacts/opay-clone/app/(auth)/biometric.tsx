import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function BiometricSetup() {
  const [loading, setLoading] = useState(false);
  const { toggleBiometric } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  async function handleEnable() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withRepeat(withSpring(1.15, { damping: 5 }), 3, true);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    await toggleBiometric(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    router.replace('/(tabs)/');
  }

  function handleSkip() {
    router.replace('/(tabs)/');
  }

  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 32) }]}>
      <View style={s.content}>
        <Animated.View style={[s.iconCircle, animStyle]}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.iconGradient}>
            <Ionicons name="finger-print" size={72} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={s.title}>Enable Biometric Login</Text>
        <Text style={s.subtitle}>
          Use your fingerprint or Face ID for quick and secure access to your OPay account.
        </Text>

        <View style={s.benefits}>
          {['Faster login experience', 'Enhanced account security', 'No need to type your PIN every time'].map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={s.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.buttons}>
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={s.loadingText}>Setting up biometric...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={s.enableBtn} onPress={handleEnable} activeOpacity={0.85} disabled={Platform.OS === 'web'}>
              <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="finger-print" size={20} color="#fff" />
                <Text style={s.enableText}>{Platform.OS === 'web' ? 'Not Available on Web' : 'Enable Biometric'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
              <Text style={s.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden', marginBottom: 32 },
  iconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  benefits: { width: '100%', gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.foreground },
  buttons: { paddingHorizontal: 24, gap: 12 },
  enableBtn: { borderRadius: colors.radius },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  enableText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  loadingWrap: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
});
