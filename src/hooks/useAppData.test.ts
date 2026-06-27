import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppData } from './useAppData';
import { emptyRecord } from '../types';

const STORAGE_KEY = 'desborocoxando_data';

describe('useAppData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicializa com localStorage vazio retornando db={} e selectedDate = hoje', () => {
    const { result } = renderHook(() => useAppData());
    expect(result.current.db).toEqual({});
    expect(result.current.selectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getCurrentRecord retorna emptyRecord para data sem registro', () => {
    const { result } = renderHook(() => useAppData());
    const record = result.current.getCurrentRecord();
    expect(record).toEqual(emptyRecord(result.current.selectedDate));
  });

  it('updateRecord modifica o registro da data selecionada', () => {
    const { result } = renderHook(() => useAppData());
    act(() => {
      result.current.updateRecord({ water: 500 });
    });
    const record = result.current.getCurrentRecord();
    expect(record.water).toBe(500);
    expect(record.date).toBe(result.current.selectedDate);
    // Verifica que o db foi atualizado
    expect(result.current.db[result.current.selectedDate].water).toBe(500);
  });

  it('setSelectedDate atualiza a data selecionada', () => {
    const { result } = renderHook(() => useAppData());
    const newDate = '2026-06-01';
    act(() => {
      result.current.setSelectedDate(newDate);
    });
    expect(result.current.selectedDate).toBe(newDate);
  });

  it('persiste dados no localStorage via useEffect', () => {
    const { result } = renderHook(() => useAppData());
    act(() => {
      result.current.updateRecord({ water: 500, weight: 72.5 });
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    if (raw) {
      const parsed = JSON.parse(raw);
      expect(parsed[result.current.selectedDate].water).toBe(500);
      expect(parsed[result.current.selectedDate].weight).toBe(72.5);
    }
  });
});
