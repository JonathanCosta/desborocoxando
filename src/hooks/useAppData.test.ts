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

  describe('updateWater', () => {
    it('updateWater adiciona água corretamente (delta positivo)', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updateWater(500);
      });
      const record = result.current.getCurrentRecord();
      expect(record.water).toBe(500);
    });

    it('updateWater com delta negativo reduz água', () => {
      const { result } = renderHook(() => useAppData());
      // Primeiro adiciona água
      act(() => {
        result.current.updateWater(800);
      });
      act(() => {
        result.current.updateWater(-300);
      });
      const record = result.current.getCurrentRecord();
      expect(record.water).toBe(500);
    });

    it('updateWater acumula múltiplas adições corretamente', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updateWater(200);
      });
      act(() => {
        result.current.updateWater(300);
      });
      act(() => {
        result.current.updateWater(150);
      });
      const record = result.current.getCurrentRecord();
      expect(record.water).toBe(650);
    });

    it('updateWater com delta negativo nunca deixa água negativa (clamp a 0)', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updateWater(-100);
      });
      const record = result.current.getCurrentRecord();
      expect(record.water).toBe(0);
    });

    it('updateWater com delta negativo grande clampa a 0', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updateWater(200);
      });
      act(() => {
        result.current.updateWater(-5000);
      });
      const record = result.current.getCurrentRecord();
      expect(record.water).toBe(0);
    });

    it('updateWater não afeta outras datas', () => {
      const { result } = renderHook(() => useAppData());
      const originalDate = result.current.selectedDate;
      // Adiciona água na data atual
      act(() => {
        result.current.updateWater(300);
      });
      // Muda para outra data
      act(() => {
        result.current.setSelectedDate('2026-06-01');
      });
      const otherRecord = result.current.getCurrentRecord();
      expect(otherRecord.water).toBe(0);
      // Volta para a data original
      act(() => {
        result.current.setSelectedDate(originalDate);
      });
      const originalRecord = result.current.getCurrentRecord();
      expect(originalRecord.water).toBe(300);
    });

    it('updateWater persiste o valor atualizado no localStorage', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updateWater(750);
      });
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      if (raw) {
        const parsed = JSON.parse(raw);
        expect(parsed[result.current.selectedDate].water).toBe(750);
      }
    });
  });
});
