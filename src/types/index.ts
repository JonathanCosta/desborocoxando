export interface Meal {
  id: string;       // timestamp ou uuid
  hora: string;     // "HH:mm"
  descricao: string;
  kcal: number;
}

export interface DailyRecord {
  date: string;                       // "YYYY-MM-DD"
  water: number;                      // ml (pode exceder a meta)
  meds: { done: boolean; note: string };
  care: { done: boolean; note: string };
  exercise: { done: boolean; note: string };
  meals: Meal[];
  weight: number | null;              // ex: 72.4
}

export type AppDatabase = Record<string, DailyRecord>;

export const emptyRecord = (date: string): DailyRecord => ({
  date,
  water: 0,
  meds: { done: false, note: '' },
  care: { done: false, note: '' },
  exercise: { done: false, note: '' },
  meals: [],
  weight: null,
});
