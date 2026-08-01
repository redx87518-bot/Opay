import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function Index() {
  const { isAuthenticated, isLoading, pin } = useAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && pin) {
      router.replace('/(tabs)/');
    } else if (isAuthenticated && !pin) {
      router.replace('/(auth)/set-pin');
    } else {
      router.replace('/(auth)/onboarding');
    }
  }, [isAuthenticated, isLoading, pin]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
