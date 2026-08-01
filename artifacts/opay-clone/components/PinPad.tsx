import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface PinPadProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  verifyPin: (pin: string) => boolean;
  title?: string;
  subtitle?: string;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinPad({ visible, onSuccess, onCancel, verifyPin, title = 'Enter PIN', subtitle = 'Enter your 6-digit PIN to continue' }: PinPadProps) {
  const colors = useColors();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function handleKey(key: string) {
    if (key === '') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (pin.length >= 6) return;
    const newPin = pin + key;
    setPin(newPin);
    if (newPin.length === 6) {
      setTimeout(() => {
        if (verifyPin(newPin)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPin('');
          setError('');
          onSuccess();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('Incorrect PIN. Try again.');
          setPin('');
        }
      }, 100);
    }
  }

  function handleCancel() {
    setPin('');
    setError('');
    onCancel();
  }

  const s = styles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={s.overlay}>
        <View style={s.container}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>

          <View style={s.dots}>
            {[0,1,2,3,4,5].map(i => (
              <View key={i} style={[s.dot, pin.length > i && s.dotFilled]} />
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : <View style={{ height: 20 }} />}

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

          <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 32, paddingBottom: Platform.OS === 'web' ? 34 : 40,
    paddingTop: 16, alignItems: 'center',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 24 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 24, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.border },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.destructive, fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginTop: 16, gap: 0 },
  key: {
    width: '33.33%', height: 72, alignItems: 'center', justifyContent: 'center',
  },
  keyEmpty: {},
  keyText: { fontSize: 26, fontFamily: 'Inter_500Medium', color: colors.foreground },
  cancelBtn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 32 },
  cancelText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.primary },
});
