import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: 'add_money' | 'send_money' | 'airtime' | 'data' | 'bills' | 'transfer' | 'received';
  amount: number;
  description: string;
  recipient?: string;
  phone?: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
  reference: string;
}

export interface OPayNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: 'credit' | 'debit' | 'info' | 'promo';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  notifications: OPayNotification[];
  unreadCount: number;
  isLoading: boolean;
  addMoney: (amount: number, method: string) => Promise<Transaction>;
  sendMoney: (amount: number, recipient: string, phone: string) => Promise<Transaction>;
  buyAirtime: (amount: number, network: string, phone: string) => Promise<Transaction>;
  buyData: (amount: number, network: string, plan: string, phone: string) => Promise<Transaction>;
  payBill: (amount: number, service: string, accountNumber: string) => Promise<Transaction>;
  bankTransfer: (amount: number, bank: string, accountNumber: string, accountName: string) => Promise<Transaction>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

const KEYS = { BALANCE: 'opay_balance', TRANSACTIONS: 'opay_transactions', NOTIFICATIONS: 'opay_notifications' };

function genId() { return Date.now().toString() + Math.random().toString(36).substr(2, 6); }
function genRef() { return 'OPY' + Date.now().toString().slice(-8).toUpperCase(); }

const SEED_NOTIFICATIONS: OPayNotification[] = [
  { id: '1', title: 'Welcome to OPay!', body: 'Your account is set up and ready to use.', date: new Date().toISOString(), read: false, type: 'info' },
  { id: '2', title: 'Cashback Available', body: 'Earn 2% cashback on all airtime purchases this weekend.', date: new Date(Date.now() - 3600000).toISOString(), read: false, type: 'promo' },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<OPayNotification[]>(SEED_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadWallet(); }, []);

  async function loadWallet() {
    try {
      const [bal, txns, notifs] = await Promise.all([
        AsyncStorage.getItem(KEYS.BALANCE),
        AsyncStorage.getItem(KEYS.TRANSACTIONS),
        AsyncStorage.getItem(KEYS.NOTIFICATIONS),
      ]);
      if (bal) setBalance(parseFloat(bal));
      if (txns) setTransactions(JSON.parse(txns));
      if (notifs) setNotifications(JSON.parse(notifs));
    } finally {
      setIsLoading(false);
    }
  }

  async function saveBalance(newBal: number) {
    setBalance(newBal);
    await AsyncStorage.setItem(KEYS.BALANCE, newBal.toString());
  }

  async function saveTransactions(txns: Transaction[]) {
    setTransactions(txns);
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txns));
  }

  async function addTransaction(txn: Transaction, newBalance: number, notif: OPayNotification) {
    const newTxns = [txn, ...transactions];
    const newNotifs = [notif, ...notifications];
    await Promise.all([
      saveBalance(newBalance),
      saveTransactions(newTxns),
      AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(newNotifs)),
    ]);
    setNotifications(newNotifs);
    return txn;
  }

  const addMoney = useCallback(async (amount: number, method: string): Promise<Transaction> => {
    const txn: Transaction = {
      id: genId(), type: 'credit', category: 'add_money', amount,
      description: `Added via ${method}`, date: new Date().toISOString(),
      status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Money Added', body: `₦${amount.toLocaleString()} added to your wallet.`,
      date: new Date().toISOString(), read: false, type: 'credit',
    };
    return addTransaction(txn, balance + amount, notif);
  }, [balance, transactions, notifications]);

  const sendMoney = useCallback(async (amount: number, recipient: string, phone: string): Promise<Transaction> => {
    if (balance < amount) throw new Error('Insufficient balance');
    const txn: Transaction = {
      id: genId(), type: 'debit', category: 'send_money', amount,
      description: `Money sent to ${recipient}`, recipient, phone,
      date: new Date().toISOString(), status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Money Sent', body: `₦${amount.toLocaleString()} sent to ${recipient}.`,
      date: new Date().toISOString(), read: false, type: 'debit',
    };
    return addTransaction(txn, balance - amount, notif);
  }, [balance, transactions, notifications]);

  const buyAirtime = useCallback(async (amount: number, network: string, phone: string): Promise<Transaction> => {
    if (balance < amount) throw new Error('Insufficient balance');
    const txn: Transaction = {
      id: genId(), type: 'debit', category: 'airtime', amount,
      description: `${network} Airtime - ${phone}`, phone,
      date: new Date().toISOString(), status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Airtime Purchase', body: `₦${amount.toLocaleString()} ${network} airtime sent to ${phone}.`,
      date: new Date().toISOString(), read: false, type: 'debit',
    };
    return addTransaction(txn, balance - amount, notif);
  }, [balance, transactions, notifications]);

  const buyData = useCallback(async (amount: number, network: string, plan: string, phone: string): Promise<Transaction> => {
    if (balance < amount) throw new Error('Insufficient balance');
    const txn: Transaction = {
      id: genId(), type: 'debit', category: 'data', amount,
      description: `${network} Data - ${plan}`, phone,
      date: new Date().toISOString(), status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Data Purchase', body: `${plan} ${network} data sent to ${phone}.`,
      date: new Date().toISOString(), read: false, type: 'debit',
    };
    return addTransaction(txn, balance - amount, notif);
  }, [balance, transactions, notifications]);

  const payBill = useCallback(async (amount: number, service: string, accountNumber: string): Promise<Transaction> => {
    if (balance < amount) throw new Error('Insufficient balance');
    const txn: Transaction = {
      id: genId(), type: 'debit', category: 'bills', amount,
      description: `${service} Bill - ${accountNumber}`,
      date: new Date().toISOString(), status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Bill Payment', body: `₦${amount.toLocaleString()} paid for ${service}.`,
      date: new Date().toISOString(), read: false, type: 'debit',
    };
    return addTransaction(txn, balance - amount, notif);
  }, [balance, transactions, notifications]);

  const bankTransfer = useCallback(async (amount: number, bank: string, accountNumber: string, accountName: string): Promise<Transaction> => {
    if (balance < amount) throw new Error('Insufficient balance');
    const txn: Transaction = {
      id: genId(), type: 'debit', category: 'transfer', amount,
      description: `Transfer to ${accountName}`, recipient: accountName,
      date: new Date().toISOString(), status: 'success', reference: genRef(),
    };
    const notif: OPayNotification = {
      id: genId(), title: 'Transfer Successful', body: `₦${amount.toLocaleString()} transferred to ${accountName} (${bank}).`,
      date: new Date().toISOString(), read: false, type: 'debit',
    };
    return addTransaction(txn, balance - amount, notif);
  }, [balance, transactions, notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <WalletContext.Provider value={{
      balance, transactions, notifications, unreadCount, isLoading,
      addMoney, sendMoney, buyAirtime, buyData, payBill, bankTransfer,
      markNotificationRead, markAllRead,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
