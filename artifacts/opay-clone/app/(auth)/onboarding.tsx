import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'shield-checkmark',
    title: 'Beyond Banking',
    subtitle: 'Secure, fast and reliable financial services at your fingertips, 24/7.',
    color: '#06C755',
  },
  {
    icon: 'paper-plane',
    title: 'Send Money Instantly',
    subtitle: 'Transfer money to anyone in Nigeria — instantly, at zero fees.',
    color: '#FF9500',
  },
  {
    icon: 'flash',
    title: 'Pay All Your Bills',
    subtitle: 'Airtime, data, electricity, cable TV and more. All in one place.',
    color: '#007AFF',
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  function next() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      setCurrent(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      router.push('/(auth)/signup');
    }
  }

  function skip() {
    router.push('/(auth)/signup');
  }

  function login() {
    router.push('/(auth)/login');
  }

  const slide = SLIDES[current];
  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.logo}>
          <Text style={s.logoText}>OPay</Text>
        </View>
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={skip}>
            <Text style={s.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={s.scroll}
      >
        {SLIDES.map((sl, idx) => (
          <View key={idx} style={[s.slide, { width }]}>
            <View style={[s.iconCircle, { backgroundColor: sl.color + '18' }]}>
              <View style={[s.iconInner, { backgroundColor: sl.color }]}>
                <Ionicons name={sl.icon as any} size={56} color="#fff" />
              </View>
            </View>
            <Text style={s.title}>{sl.title}</Text>
            <Text style={s.subtitle}>{sl.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === current && s.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={[s.buttons, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}>
        <TouchableOpacity style={s.nextBtn} onPress={next} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={s.nextText}>{current === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={s.loginBtn} onPress={login} activeOpacity={0.7}>
          <Text style={s.loginText}>Already have an account? <Text style={s.loginTextGreen}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  logo: {},
  logoText: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.primary },
  skip: { fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
  scroll: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: {
    width: 200, height: 200, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  iconInner: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground,
    textAlign: 'center', marginBottom: 16,
  },
  subtitle: {
    fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.mutedForeground,
    textAlign: 'center', lineHeight: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.primary },
  buttons: { paddingHorizontal: 24, gap: 12 },
  nextBtn: { borderRadius: colors.radius },
  gradient: {
    height: 52, borderRadius: colors.radius,
    alignItems: 'center', justifyContent: 'center',
  },
  nextText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  loginBtn: { alignItems: 'center', paddingVertical: 12 },
  loginText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  loginTextGreen: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
