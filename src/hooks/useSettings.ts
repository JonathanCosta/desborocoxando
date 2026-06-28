import { useState, useRef, useEffect, useCallback } from 'react';
import { z } from 'zod';

const STORAGE_KEY = 'desborocoxando_settings';

export interface Settings {
  waterGoal: number;
  weightGoal: number;
}

export const SettingsSchema = z.object({
  waterGoal: z.number().min(0).max(10000),
  weightGoal: z.number().min(0).max(10000),
});

const DEFAULT_SETTINGS: Settings = {
  waterGoal: 2000,
  weightGoal: 70,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const result = SettingsSchema.safeParse(parsed);
        if (result.success) {
          return result.data as Settings;
        }
      }
    } catch {
      // localStorage corrompido ou vazio
    }
    return DEFAULT_SETTINGS;
  });

  const isFirstRender = useRef(true);

  // Persistir no localStorage após cada alteração (exceto na primeira renderização)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  return { settings, updateSettings };
}
