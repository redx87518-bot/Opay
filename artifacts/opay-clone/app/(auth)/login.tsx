import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import PinPad from '@/components/PinPad';

type Step = 'credentials' | 'pin';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('credentials');
  const [showPin, setShowPin] = useState(false);
  const [simBio, setSimBio] = useState(false);

  const { login, verifyPin, isBiometricEnabled } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  async function handleLogin() {
    if (!phone.trim()) return Alert.alert('Error', 'Enter your phone number.');
    if (!password.trim()) return Alert.alert('Error', 'Enter your password.');
    setLoading(true);
    try {
      await login(phone.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowPin(true);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometric() {
    setSimBio(true);
    // Simulate biometric authentication
    await new Promise(r => setTimeout(r, 1500));
    setSimBio(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/');
  }

  function onPinSuccess() {
    setShowPin(false);
    router.replace('/(tabs)/');
  }

  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.logoText}>OPay</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bottomOffset={20}>
        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.subtitle}>Log in to your OPay account</Text>

        <View style={s.form}>
          <View style={s.fieldWrap}>
            <Text style={s.label}>Phone Number</Text>
            <View style={s.inputRow}>
              <Ionicons name="call-outline" size={18} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={s.input} value={phone} onChangeText={setPhone}
                placeholder="080XXXXXXXX" placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={s.icon} />
              <TextInput
                style={s.input} value={password} onChangeText={setPassword}
                placeholder="Enter password" placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPass} autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.forgot}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Log In</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {isBiometricEnabled && Platform.OS !== 'web' && (
          <TouchableOpacity style={s.bioBtn} onPress={handleBiometric} activeOpacity={0.7} disabled={simBio}>
            <View style={s.bioBtnInner}>
              {simBio ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons name="finger-print" size={32} color={colors.primary} />
              )}
              <Text style={s.bioText}>Use Biometric Login</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.signupRow} onPress={() => router.push('/(auth)/signup')}>
          <Text style={s.signupText}>Don't have an account? <Text style={s.signupLink}>Sign up</Text></Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 20 }} />
      </KeyboardAwareScrollView>

      <PinPad
        visible={showPin}
        onSuccess={onPinSuccess}
        onCancel={() => setShowPin(false)}
        verifyPin={verifyPin}
        title="Enter PIN"
        subtitle="Enter your OPay PIN to continue"
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.primary },
  scroll: { paddingHorizontal: 24, paddingTop: 8 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 28 },
  form: { marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.foreground, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.input, borderRadius: colors.radius,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
  forgot: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.primary },
  btn: { borderRadius: colors.radius, marginBottom: 20 },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  bioBtn: { alignItems: 'center', marginBottom: 20 },
  bioBtnInner: { alignItems: 'center', gap: 8 },
  bioText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.primary },
  signupRow: { alignItems: 'center' },
  signupText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  signupLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
