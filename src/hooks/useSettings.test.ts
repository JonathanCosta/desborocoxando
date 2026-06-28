import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

const STORAGE_KEY = 'desborocoxando_settings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna valores padrão quando localStorage está vazio', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      waterGoal: 2000,
      weightGoal: 70,
    });
  });

  it('lê valores persistidos do localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ waterGoal: 2500, weightGoal: 65 }),
    );
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      waterGoal: 2500,
      weightGoal: 65,
    });
  });

  it('updateSettings atualiza parcialmente as configurações', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.updateSettings({ waterGoal: 3000 });
    });
    expect(result.current.settings.waterGoal).toBe(3000);
    expect(result.current.settings.weightGoal).toBe(70); // unchanged
  });

  it('updateSettings pode atualizar múltiplos campos ao mesmo tempo', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.updateSettings({ waterGoal: 1500, weightGoal: 80 });
    });
    expect(result.current.settings).toEqual({
      waterGoal: 1500,
      weightGoal: 80,
    });
  });

  it('persiste alterações no localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.updateSettings({ waterGoal: 3500 });
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    if (raw) {
      const parsed = JSON.parse(raw);
      expect(parsed.waterGoal).toBe(3500);
      expect(parsed.weightGoal).toBe(70);
    }
  });

  it('fallback para valores padrão quando localStorage tem JSON inválido', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json string');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      waterGoal: 2000,
      weightGoal: 70,
    });
  });

  it('fallback para valores padrão quando localStorage tem dados com schema inválido (waterGoal string)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ waterGoal: 'muitos', weightGoal: 70 }),
    );
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      waterGoal: 2000,
      weightGoal: 70,
    });
  });

  it('fallback para valores padrão quando localStorage tem dados com schema inválido (waterGoal negativo)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ waterGoal: -100, weightGoal: 70 }),
    );
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      waterGoal: 2000,
      weightGoal: 70,
    });
  });
});
