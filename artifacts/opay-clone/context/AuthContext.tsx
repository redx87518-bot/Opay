import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  accountNumber: string;
  kycLevel: 1 | 2 | 3;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pin: string;
  isBiometricEnabled: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<void>;
  setUserPin: (pin: string) => Promise<void>;
  verifyPin: (input: string) => boolean;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const KEYS = {
  USER: 'opay_user',
  PIN: 'opay_pin',
  BIOMETRIC: 'opay_biometric',
  AUTH: 'opay_authenticated',
  ACCOUNTS: 'opay_accounts',
};

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const [userData, pinData, bioData, authData] = await Promise.all([
        AsyncStorage.getItem(KEYS.USER),
        AsyncStorage.getItem(KEYS.PIN),
        AsyncStorage.getItem(KEYS.BIOMETRIC),
        AsyncStorage.getItem(KEYS.AUTH),
      ]);
      if (userData) setUser(JSON.parse(userData));
      if (pinData) setPin(pinData);
      if (bioData) setIsBiometricEnabled(bioData === 'true');
      if (authData === 'true' && userData) setIsAuthenticated(true);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (phone: string, _password: string) => {
    const accountsRaw = await AsyncStorage.getItem(KEYS.ACCOUNTS);
    const accounts: { phone: string; password: string; userId: string }[] = accountsRaw
      ? JSON.parse(accountsRaw)
      : [];
    const account = accounts.find((a) => a.phone === phone);
    if (!account) throw new Error('Account not found. Please sign up.');
    if (account.password !== _password) throw new Error('Incorrect password.');

    const userData = await AsyncStorage.getItem(KEYS.USER + '_' + account.userId);
    if (!userData) throw new Error('User data not found.');
    const parsedUser: User = JSON.parse(userData);
    setUser(parsedUser);
    setIsAuthenticated(true);
    await Promise.all([
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(parsedUser)),
      AsyncStorage.setItem(KEYS.AUTH, 'true'),
    ]);
  }, []);

  const signup = useCallback(async (name: string, phone: string, email: string, password: string) => {
    const accountsRaw = await AsyncStorage.getItem(KEYS.ACCOUNTS);
    const accounts: { phone: string; password: string; userId: string }[] = accountsRaw
      ? JSON.parse(accountsRaw)
      : [];
    if (accounts.find((a) => a.phone === phone)) {
      throw new Error('An account with this phone number already exists.');
    }
    const newUser: User = {
      id: generateId(),
      name,
      phone,
      email,
      accountNumber: generateAccountNumber(),
      kycLevel: 1,
    };
    accounts.push({ phone, password, userId: newUser.id });
    setUser(newUser);
    setIsAuthenticated(false);
    await Promise.all([
      AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts)),
      AsyncStorage.setItem(KEYS.USER + '_' + newUser.id, JSON.stringify(newUser)),
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(newUser)),
    ]);
  }, []);

  const setUserPin = useCallback(async (newPin: string) => {
    setPin(newPin);
    setIsAuthenticated(true);
    await Promise.all([
      AsyncStorage.setItem(KEYS.PIN, newPin),
      AsyncStorage.setItem(KEYS.AUTH, 'true'),
    ]);
  }, []);

  const verifyPin = useCallback(
    (input: string) => {
      return input === pin;
    },
    [pin]
  );

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    await AsyncStorage.setItem(KEYS.BIOMETRIC, enabled ? 'true' : 'false');
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    await AsyncStorage.setItem(KEYS.AUTH, 'false');
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await Promise.all([
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(updated)),
      AsyncStorage.setItem(KEYS.USER + '_' + user.id, JSON.stringify(updated)),
    ]);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        pin,
        isBiometricEnabled,
        login,
        logout,
        signup,
        setUserPin,
        verifyPin,
        toggleBiometric,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
