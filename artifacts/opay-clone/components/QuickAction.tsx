import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface Props {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
  size?: 'normal' | 'small';
}

export default function QuickAction({ icon, label, onPress, color, bgColor, size = 'normal' }: Props) {
  const colors = useColors();
  const isSmall = size === 'small';

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const s = styles(colors);
  return (
    <TouchableOpacity style={[s.container, isSmall && s.containerSmall]} onPress={handlePress} activeOpacity={0.7}>
      <View style={[
        s.iconWrap,
        isSmall && s.iconWrapSmall,
        { backgroundColor: bgColor ?? colors.lightGreen },
      ]}>
        <Ionicons name={icon as any} size={isSmall ? 18 : 22} color={color ?? colors.primary} />
      </View>
      <Text style={[s.label, isSmall && s.labelSmall]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { alignItems: 'center', width: 64 },
  containerSmall: { width: 56 },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  iconWrapSmall: { width: 46, height: 46, borderRadius: 23 },
  label: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
    color: colors.foreground, textAlign: 'center', lineHeight: 14,
  },
  labelSmall: { fontSize: 10 },
});
