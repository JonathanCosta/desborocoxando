import { z } from 'zod';

/**
 * Schemas Zod compartilhados entre hooks e validações.
 * Centraliza a validação de dados do Desborocoxando.
 */

export const MealSchema = z.object({
  id: z.string(),
  hora: z.string(),
  descricao: z.string(),
  kcal: z.number().min(0),
});

export const DailyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  water: z.number().min(0),
  meds: z.object({ done: z.boolean(), note: z.string() }),
  care: z.object({ done: z.boolean(), note: z.string() }),
  exercise: z.object({ done: z.boolean(), note: z.string() }),
  meals: z.array(MealSchema),
  weight: z.number().min(0).nullable(),
});

export const AppDatabaseSchema = z.record(z.string(), DailyRecordSchema);
