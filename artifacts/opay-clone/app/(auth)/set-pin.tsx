import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

type Step = 'enter' | 'confirm';

export default function SetPin() {
  const [step, setStep] = useState<Step>('enter');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const { setUserPin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const current = step === 'enter' ? pin : confirm;
  const setCurrent = step === 'enter' ? setPin : setConfirm;

  function handleKey(key: string) {
    if (key === '') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setCurrent(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (current.length >= 6) return;
    const newVal = current + key;
    setCurrent(newVal);
    if (newVal.length === 6) {
      setTimeout(async () => {
        if (step === 'enter') {
          setStep('confirm');
          setConfirm('');
        } else {
          if (newVal !== pin) {
            setError('PINs do not match. Try again.');
            setConfirm('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await setUserPin(pin);
            router.replace('/(auth)/biometric');
          }
        }
      }, 100);
    }
  }

  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => step === 'confirm' ? (setStep('enter'), setError(''), setConfirm('')) : router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <View style={[s.iconCircle, { backgroundColor: colors.lightGreen }]}>
          <Ionicons name="lock-closed" size={40} color={colors.primary} />
        </View>
        <Text style={s.title}>{step === 'enter' ? 'Set Your PIN' : 'Confirm Your PIN'}</Text>
        <Text style={s.subtitle}>
          {step === 'enter'
            ? 'Create a 6-digit PIN to secure your OPay account'
            : 'Enter the same PIN again to confirm'}
        </Text>

        <View style={s.dots}>
          {[0,1,2,3,4,5].map(i => (
            <View key={i} style={[s.dot, current.length > i && s.dotFilled]} />
          ))}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : <View style={{ height: 24 }} />}
      </View>

      <View style={s.grid}>
        {KEYS.map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={[s.key, key === '' && s.keyEmpty]}
            onPress={() => handleKey(key)}
            activeOpacity={key === '' ? 1 : 0.6}
            disabled={key === ''}
          >
            {key === '⌫' ? (
              <Ionicons name="backspace-outline" size={24} color={colors.foreground} />
            ) : key !== '' ? (
              <Text style={s.keyText}>{key}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', paddingTop: 24, paddingHorizontal: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.foreground, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', gap: 16, marginTop: 32 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.destructive, fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24 },
  key: { width: '33.33%', height: 72, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: {},
  keyText: { fontSize: 28, fontFamily: 'Inter_500Medium', color: colors.foreground },
});
