import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  async function handleSignup() {
    if (!name.trim()) return Alert.alert('Error', 'Please enter your full name.');
    if (!phone.trim() || phone.length < 11) return Alert.alert('Error', 'Enter a valid phone number.');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Error', 'Enter a valid email address.');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match.');
    setLoading(true);
    try {
      await signup(name.trim(), phone.trim(), email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(auth)/set-pin');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message);
    } finally {
      setLoading(false);
    }
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

      <KeyboardAwareScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Join millions of Nigerians banking with OPay</Text>

        <View style={s.form}>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" icon="person-outline" colors={colors} />
          <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="080XXXXXXXX" icon="call-outline" keyboardType="phone-pad" colors={colors} />
          <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail-outline" keyboardType="email-address" colors={colors} />
          <Field
            label="Password" value={password} onChangeText={setPassword}
            placeholder="Min. 6 characters" icon="lock-closed-outline"
            secureTextEntry={!showPass} colors={colors}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightIcon={() => setShowPass(p => !p)}
          />
          <Field
            label="Confirm Password" value={confirm} onChangeText={setConfirm}
            placeholder="Re-enter password" icon="lock-closed-outline"
            secureTextEntry={!showConfirm} colors={colors}
            rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
            onRightIcon={() => setShowConfirm(p => !p)}
          />
        </View>

        <Text style={s.terms}>
          By signing up, you agree to OPay's{' '}
          <Text style={s.link}>Terms of Service</Text> and{' '}
          <Text style={s.link}>Privacy Policy</Text>.
        </Text>

        <TouchableOpacity style={s.btn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#06C755', '#04923E']} style={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginRow} onPress={() => router.push('/(auth)/login')}>
          <Text style={s.loginText}>Already have an account? <Text style={s.loginLink}>Log in</Text></Text>
        </TouchableOpacity>
        <View style={{ height: insets.bottom + 20 }} />
      </KeyboardAwareScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, icon, keyboardType, secureTextEntry, colors, rightIcon, onRightIcon }: any) {
  const s = fieldStyles(colors);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <Ionicons name={icon} size={18} color={colors.mutedForeground} style={s.leftIcon} />
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIcon}>
            <Ionicons name={rightIcon} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const fieldStyles = (colors: any) => StyleSheet.create({
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.foreground, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.input, borderRadius: colors.radius,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, height: 50,
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
});

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.primary },
  scroll: { paddingHorizontal: 24 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 8, marginTop: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 28 },
  form: {},
  terms: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  link: { color: colors.primary, fontFamily: 'Inter_500Medium' },
  btn: { borderRadius: colors.radius, marginBottom: 16 },
  gradient: { height: 52, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
  loginLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
