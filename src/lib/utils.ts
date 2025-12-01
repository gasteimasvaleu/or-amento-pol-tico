import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Despesa } from "@/types/despesa";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parseia uma string de data no formato YYYY-MM-DD de forma segura,
 * evitando problemas de timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calcula a data de pagamento agendada considerando:
 * - Despesas Extra: retorna a data original
 * - Despesas Recorrentes: calcula dinamicamente baseado no mês/ano selecionado
 */
export function getScheduledPaymentDate(despesa: Despesa, month: number, year: number): Date {
  if (despesa.tipo === 'Extra') {
    return new Date(despesa.pagamento_agendado);
  }
  
  // Para recorrentes, usar o DIA do pagamento original
  const originalDay = new Date(despesa.pagamento_agendado).getDate();
  
  // Calcular o último dia do mês selecionado
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  
  // Ajustar se o dia original é maior que o último dia do mês
  const adjustedDay = Math.min(originalDay, lastDayOfMonth);
  
  return new Date(year, month, adjustedDay);
}
