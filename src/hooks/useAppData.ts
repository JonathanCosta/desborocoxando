import { useState, useRef, useEffect, useCallback } from 'react';
import type { AppDatabase, DailyRecord } from '../types';
import { emptyRecord } from '../types';
import { today } from '../utils/dateUtils';
import { AppDatabaseSchema } from '../schemas';

const STORAGE_KEY = 'desborocoxando_data';

export function useAppData() {
  const [selectedDate, setSelectedDate] = useState<string>(today());
  const [db, setDb] = useState<AppDatabase>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const result = AppDatabaseSchema.safeParse(parsed);
        if (result.success) {
          return result.data as AppDatabase;
        }
      }
    } catch {
      // localStorage corrompido ou vazio
    }
    return {};
  });

  const isFirstRender = useRef(true);

  // Persistir no localStorage após cada alteração no db (exceto na primeira renderização)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const getCurrentRecord = useCallback((): DailyRecord => {
    return db[selectedDate] ?? emptyRecord(selectedDate);
  }, [db, selectedDate]);

  const updateRecord = useCallback((partial: Partial<DailyRecord>) => {
    setDb(prev => {
      const current = prev[selectedDate] ?? emptyRecord(selectedDate);
      return {
        ...prev,
        [selectedDate]: { ...current, ...partial, date: selectedDate },
      };
    });
  }, [selectedDate]);

  return { db, selectedDate, setSelectedDate, getCurrentRecord, updateRecord };
}
