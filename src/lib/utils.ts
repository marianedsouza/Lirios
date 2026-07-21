import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export function generatePaymentMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
