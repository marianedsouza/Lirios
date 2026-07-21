import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Member, Payment, PaymentStatus, Expense, AppSettings } from '../types';
import { generatePaymentMonth } from '../lib/utils';
import { membersApi, paymentsApi, expensesApi, settingsApi } from '../lib/api';

interface AppState {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;
  loading: boolean;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  registerPayment: (paymentId: string, method: Payment['method'], date: string) => Promise<void>;
  generateMonthlyPayments: () => Promise<void>;
  getMemberPayments: (memberId: string) => Payment[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  pixKey: '55292931829',
  bankName: 'Nubank',
  accountName: 'Hugo Daniel Ribeiro Nantes',
  defaultMonthlyFee: 50,
  houseGuidelines: '',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load all data from API on mount
  useEffect(() => {
    async function load() {
      try {
        const [m, p, e, s] = await Promise.all([
          membersApi.list(),
          paymentsApi.list(),
          expensesApi.list(),
          settingsApi.get(),
        ]);
        setMembers(m as Member[]);
        setPayments(p as Payment[]);
        setExpenses(e as Expense[]);
        setSettings(s as AppSettings);
      } catch (err) {
        console.error('Failed to load data from API:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addMember = useCallback(async (memberData: Omit<Member, 'id'>) => {
    const created = await membersApi.create(memberData) as Member;
    setMembers((prev) => [...prev, created]);
  }, []);

  const updateMember = useCallback(async (id: string, updates: Partial<Member>) => {
    const updated = await membersApi.update(id, updates) as Member;
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const registerPayment = useCallback(async (paymentId: string, method: Payment['method'], date: string) => {
    const updated = await paymentsApi.update(paymentId, {
      status: 'Pago',
      method: method as string,
      paymentDate: date,
    }) as Payment;
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
  }, []);

  const generateMonthlyPayments = useCallback(async () => {
    const currentMonth = generatePaymentMonth(new Date());
    const today = new Date();

    const newPayments: Payment[] = [];
    const updates: { id: string; status: string }[] = [];

    members.filter(m => m.status === 'Ativo').forEach(member => {
      const existingPayment = payments.find(p => p.memberId === member.id && p.month === currentMonth);
      if (!existingPayment) {
        let status: PaymentStatus = 'Pendente';
        if (today.getDate() > member.dueDate) {
          status = 'Atrasado';
        }
        newPayments.push({
          id: crypto.randomUUID(),
          memberId: member.id,
          month: currentMonth,
          paymentDate: null,
          amount: member.monthlyFee,
          method: null,
          status,
        });
      } else if (existingPayment.status === 'Pendente' && today.getDate() > member.dueDate) {
        updates.push({ id: existingPayment.id, status: 'Atrasado' });
      }
    });

    // Persist new payments
    for (const np of newPayments) {
      try {
        const created = await paymentsApi.create(np) as Payment;
        setPayments((prev) => [...prev, created]);
      } catch (e) {
        console.error('Failed to create payment:', e);
      }
    }

    // Persist status updates
    for (const u of updates) {
      try {
        await paymentsApi.update(u.id, { status: u.status });
        setPayments((prev) => prev.map(p => p.id === u.id ? { ...p, status: u.status as PaymentStatus } : p));
      } catch (e) {
        console.error('Failed to update payment:', e);
      }
    }
  }, [members, payments]);

  useEffect(() => {
    if (!loading && members.length > 0) {
      generateMonthlyPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, members]);

  const getMemberPayments = useCallback((memberId: string) => {
    return payments.filter(p => p.memberId === memberId).sort((a, b) => b.month.localeCompare(a.month));
  }, [payments]);

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    const created = await expensesApi.create(expenseData) as Expense;
    setExpenses((prev) => [...prev, created]);
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await expensesApi.remove(id);
    setExpenses((prev) => prev.filter(e => e.id !== id));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await settingsApi.update(updates) as AppSettings;
    setSettings(updated);
  }, []);

  return (
    <AppContext.Provider value={{
      members, payments, expenses, settings, loading,
      addMember, updateMember, registerPayment, generateMonthlyPayments,
      getMemberPayments, addExpense, deleteExpense, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
