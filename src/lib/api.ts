const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ─── Members ───────────────────────────────────────────────
export interface MemberData {
  id?: string;
  name: string;
  phone: string;
  whatsapp: string;
  birthDate: string;
  entryDate: string;
  monthlyFee: number;
  dueDate: number;
  status: string;
  observations: string;
}

export const membersApi = {
  list: () => request<MemberData[]>('/members'),
  create: (data: Omit<MemberData, 'id'>) => request<MemberData>('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MemberData>) => request<MemberData>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<{ ok: boolean }>(`/members/${id}`, { method: 'DELETE' }),
};

// ─── Payments ──────────────────────────────────────────────
export interface PaymentData {
  id?: string;
  memberId: string;
  month: string;
  paymentDate: string | null;
  amount: number;
  method: string | null;
  status: string;
}

export const paymentsApi = {
  list: () => request<PaymentData[]>('/payments'),
  create: (data: Omit<PaymentData, 'id'>) => request<PaymentData>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PaymentData>) => request<PaymentData>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<{ ok: boolean }>(`/payments/${id}`, { method: 'DELETE' }),
};

// ─── Expenses ──────────────────────────────────────────────
export interface ExpenseData {
  id?: string;
  description: string;
  amount: number;
  date: string;
}

export const expensesApi = {
  list: () => request<ExpenseData[]>('/expenses'),
  create: (data: Omit<ExpenseData, 'id'>) => request<ExpenseData>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => request<{ ok: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
};

// ─── Settings ──────────────────────────────────────────────
export interface SettingsData {
  id?: string;
  pixKey: string;
  bankName: string;
  accountName: string;
  defaultMonthlyFee: number;
  houseGuidelines: string;
}

export const settingsApi = {
  get: () => request<SettingsData>('/settings'),
  update: (data: Partial<SettingsData>) => request<SettingsData>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
