---
name: local-storage-db
description: Use ao implementar hooks de estado ou persistência. Contém schema TypeScript e regras do banco offline localStorage.
---

# Local Storage DB — Banco Offline

## Chave no localStorage

`desborocoxando_data`

## Schema TypeScript

```typescript
export interface Meal {
  id: string;       // timestamp ou uuid
  hora: string;     // "HH:mm"
  descricao: string;
  kcal: number;
}

export interface DailyRecord {
  date: string;                       // "YYYY-MM-DD"
  water: number;                      // ml (pode exceder 2000)
  meds: { done: boolean; note: string };
  care: { done: boolean; note: string };
  exercise: { done: boolean; note: string };
  meals: Meal[];
  weight: number | null;              // ex: 72.4
}

export type AppDatabase = Record<string, DailyRecord>;
```

## Regras de Persistência

- **selectedDate**: data que o usuário está visualizando, independente da data real
- Leitura: `db[selectedDate] ?? emptyRecord`
- Escrita: `setDb(prev => ({ ...prev, [selectedDate]: updated }))`
- Salvar no `localStorage` em todo `setState` (via `useEffect` ou wrapper)
- Backup: export `JSON.stringify(db)` como blob .json
- Restore: validar se chaves são datas (`/^\d{4}-\d{2}-\d{2}$/`) antes de sobrescrever

## Dia Padrão (Vazio)

```typescript
const emptyRecord: DailyRecord = {
  date: selectedDate,
  water: 0,
  meds: { done: false, note: '' },
  care: { done: false, note: '' },
  exercise: { done: false, note: '' },
  meals: [],
  weight: null,
};
```
