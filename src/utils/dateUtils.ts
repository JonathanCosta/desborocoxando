import { format } from 'date-fns';

/**
 * Normaliza uma data para o formato "YYYY-MM-DD" usado como chave no banco.
 */
export function normalizeDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Retorna a data de hoje no formato "YYYY-MM-DD".
 */
export function today(): string {
  return normalizeDate(new Date());
}

/**
 * Valida se uma string está no formato de data "YYYY-MM-DD".
 */
export function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}
