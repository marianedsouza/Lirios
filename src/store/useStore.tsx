import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Member, Payment, PaymentStatus, Expense, AppSettings, PaymentReceipt, Donation } from '../types';
import { generatePaymentMonth } from '../lib/utils';
import { membersApi, paymentsApi, expensesApi, settingsApi, receiptsApi, donationsApi } from '../lib/api';

interface AppState {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;
  receipts: PaymentReceipt[];
  donations: Donation[];
  loading: boolean;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  registerPayment: (paymentId: string, method: Payment['method'], date: string) => Promise<void>;
  generateMonthlyPayments: () => Promise<void>;
  getMemberPayments: (memberId: string) => Payment[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  submitReceipt: (receipt: Omit<PaymentReceipt, 'id' | 'status' | 'reviewedBy' | 'reviewedAt'>) => Promise<void>;
  approveReceipt: (receiptId: string) => Promise<void>;
  rejectReceipt: (receiptId: string) => Promise<void>;
  getMemberReceipts: (memberId: string) => PaymentReceipt[];
  refreshPayments: () => Promise<void>;
  addDonation: (donation: Omit<Donation, 'id'>) => Promise<void>;
  updateDonation: (id: string, donation: Partial<Donation>) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  pixKey: '55292931829',
  bankName: 'Nubank',
  accountName: 'Hugo Daniel Ribeiro Nantes',
  defaultMonthlyFee: 50,
  defaultDueDate: 10,
  houseGuidelines: '',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data from API on mount
  useEffect(() => {
    async function load() {
      try {
        const [m, p, e, s, r, d] = await Promise.all([
          membersApi.list(),
          paymentsApi.list(),
          expensesApi.list(),
          settingsApi.get(),
          receiptsApi.list(),
          donationsApi.list(),
        ]);
        setMembers(m as Member[]);
        setPayments(p as Payment[]);
        setExpenses(e as Expense[]);
        setSettings(s as AppSettings);
        setReceipts(r as PaymentReceipt[]);
        setDonations(d as Donation[]);
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

  const deleteMember = useCallback(async (id: string) => {
    await membersApi.remove(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
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
    const [curYear, curMonth] = currentMonth.split('-').map(Number);

    // Lista de meses (YYYY-MM) entre "from" e o mês atual, inclusive.
    const monthList = (from: string): string[] => {
      const list: string[] = [];
      const [fy, fm] = from.split('-').map(Number);
      let y = fy, m = fm;
      while (y < curYear || (y === curYear && m <= curMonth)) {
        list.push(`${y}-${String(m).padStart(2, '0')}`);
        m++;
        if (m > 12) { m = 1; y++; }
      }
      return list;
    };

    const newPayments: Payment[] = [];
    const updates: { id: string; status: string }[] = [];

    members.filter(m => m.status === 'Ativo').forEach(member => {
      const memberMonths = payments
        .filter(p => p.memberId === member.id)
        .map(p => p.month);

      // Mês inicial das cobranças: depois do último mês já gerado,
      // senão a partir da data de entrada, senão o mês atual.
      let startMonth = currentMonth;
      if (memberMonths.length > 0) {
        const lastMonth = memberMonths.slice().sort().pop()!;
        const [ly, lm] = lastMonth.split('-').map(Number);
        startMonth = lm === 12 ? `${ly + 1}-01` : `${ly}-${String(lm + 1).padStart(2, '0')}`;
      } else if (member.entryDate) {
        const parsed = new Date(member.entryDate.includes('T') ? member.entryDate : `${member.entryDate}T00:00:00`);
        if (!isNaN(parsed.getTime())) {
          startMonth = generatePaymentMonth(parsed);
        }
      }

      monthList(startMonth).forEach(month => {
        const existing = payments.find(p => p.memberId === member.id && p.month === month);
        if (existing) {
          // Marca como atrasado quando o vencimento do mês atual já passou
          if (existing.status === 'Pendente' && month === currentMonth && today.getDate() > member.dueDate) {
            updates.push({ id: existing.id, status: 'Atrasado' });
          }
          return;
        }

        let status: PaymentStatus = 'Pendente';
        if (month < currentMonth || (month === currentMonth && today.getDate() > member.dueDate)) {
          status = 'Atrasado';
        }
        newPayments.push({
          id: crypto.randomUUID(),
          memberId: member.id,
          month,
          paymentDate: null,
          amount: member.monthlyFee,
          method: null,
          status,
        });
      });
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

  const submitReceipt = useCallback(async (receiptData: Omit<PaymentReceipt, 'id' | 'status' | 'reviewedBy' | 'reviewedAt'>) => {
    const created = await receiptsApi.create(receiptData) as PaymentReceipt;
    setReceipts((prev) => [...prev, created]);
  }, []);

  const approveReceipt = useCallback(async (receiptId: string) => {
    const updated = await receiptsApi.approve(receiptId) as PaymentReceipt;
    setReceipts((prev) => prev.map(r => r.id === receiptId ? updated : r));
    // Update the related payment status
    if (updated.paymentId) {
      const payment = payments.find(p => p.id === updated.paymentId);
      if (payment) {
        const payUpdated = await paymentsApi.update(updated.paymentId, {
          status: 'Pago',
          method: 'PIX',
          paymentDate: updated.paidAt,
        }) as Payment;
        setPayments((prev) => prev.map(p => p.id === updated.paymentId ? payUpdated : p));
      }
    }
  }, [payments]);

  const rejectReceipt = useCallback(async (receiptId: string) => {
    const updated = await receiptsApi.reject(receiptId) as PaymentReceipt;
    setReceipts((prev) => prev.map(r => r.id === receiptId ? updated : r));
  }, []);

  const refreshPayments = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([paymentsApi.list(), receiptsApi.list()]);
      setPayments(p as Payment[]);
      setReceipts(r as PaymentReceipt[]);
    } catch (err) {
      console.error('Failed to refresh payments:', err);
    }
  }, []);

  const getMemberReceipts = useCallback((memberId: string) => {
    return receipts.filter(r => r.memberId === memberId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [receipts]);

  const addDonation = useCallback(async (donationData: Omit<Donation, 'id'>) => {
    const created = await donationsApi.create(donationData) as Donation;
    setDonations((prev) => [...prev, created]);
  }, []);

  const updateDonation = useCallback(async (id: string, updates: Partial<Donation>) => {
    const updated = await donationsApi.update(id, updates) as Donation;
    setDonations((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const deleteDonation = useCallback(async (id: string) => {
    await donationsApi.remove(id);
    setDonations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      members, payments, expenses, settings, receipts, donations, loading,
      addMember, updateMember, deleteMember, registerPayment, generateMonthlyPayments,
      getMemberPayments, addExpense, deleteExpense, updateSettings,
      submitReceipt, approveReceipt, rejectReceipt, getMemberReceipts,
      refreshPayments,
      addDonation, updateDonation, deleteDonation,
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
