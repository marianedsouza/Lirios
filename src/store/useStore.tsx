import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Payment, PaymentStatus, Expense, AppSettings } from '../types';
import { generatePaymentMonth } from '../lib/utils';

interface AppState {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  registerPayment: (paymentId: string, method: Payment['method'], date: string) => void;
  generateMonthlyPayments: () => void;
  getMemberPayments: (memberId: string) => Payment[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'João Silva',
    phone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321',
    birthDate: '1980-05-15',
    entryDate: '2023-01-10',
    monthlyFee: 50,
    dueDate: 10,
    status: 'Ativo',
    observations: 'Colaborador das palestras',
  },
  {
    id: 'm2',
    name: 'Maria Oliveira',
    phone: '(11) 91234-5678',
    whatsapp: '(11) 91234-5678',
    birthDate: '1992-08-22',
    entryDate: '2023-03-05',
    monthlyFee: 50,
    dueDate: 5,
    status: 'Ativo',
    observations: '',
  }
];

const INITIAL_SETTINGS: AppSettings = {
  pixKey: '55292931829',
  bankName: 'Nubank',
  accountName: 'Hugo Daniel Ribeiro Nantes',
  defaultMonthlyFee: 50,
  houseGuidelines: '',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('celp_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('celp_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('celp_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('celp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('celp_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('celp_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('celp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('celp_settings', JSON.stringify(settings));
  }, [settings]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter(e => e.id !== id));
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: crypto.randomUUID(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const registerPayment = (paymentId: string, method: Payment['method'], date: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: 'Pago', method, paymentDate: date }
          : p
      )
    );
  };

  // Function to generate pending payments for the current month for all active members
  const generateMonthlyPayments = () => {
    const currentMonth = generatePaymentMonth(new Date());
    const today = new Date();
    
    setPayments((prev) => {
      const newPayments = [...prev];
      members.filter(m => m.status === 'Ativo').forEach(member => {
        const existingPayment = newPayments.find(p => p.memberId === member.id && p.month === currentMonth);
        if (!existingPayment) {
          // Check if due date has passed
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
            status
          });
        } else if (existingPayment.status === 'Pendente' && today.getDate() > member.dueDate) {
           existingPayment.status = 'Atrasado';
        }
      });
      return newPayments;
    });
  };

  // Run on mount to ensure current month payments exist
  useEffect(() => {
    generateMonthlyPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const getMemberPayments = (memberId: string) => {
    return payments.filter(p => p.memberId === memberId).sort((a, b) => b.month.localeCompare(a.month));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ members, payments, expenses, settings, addMember, updateMember, registerPayment, generateMonthlyPayments, getMemberPayments, addExpense, deleteExpense, updateSettings }}>
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
