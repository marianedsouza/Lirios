export type MemberStatus = 'Ativo' | 'Inativo';
export type PaymentMethod = 'PIX' | 'Dinheiro' | 'Transferência';
export type PaymentStatus = 'Pago' | 'Pendente' | 'Atrasado';
export type ReceiptStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Member {
  id: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  whatsapp: string;
  birthDate: string; // YYYY-MM-DD
  entryDate: string; // YYYY-MM-DD
  monthlyFee: number;
  dueDate: number; // 1 to 31
  status: MemberStatus;
  observations: string;
}

export interface Payment {
  id: string;
  memberId: string;
  month: string; // YYYY-MM
  paymentDate: string | null; // YYYY-MM-DD
  amount: number;
  method: PaymentMethod | null;
  status: PaymentStatus;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface AppSettings {
  pixKey: string;
  bankName: string;
  accountName: string;
  defaultMonthlyFee: number;
  defaultDueDate: number;
  houseGuidelines: string;
}

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  memberId: string;
  description: string;
  amount: number;
  paidAt: string;
  status: ReceiptStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

