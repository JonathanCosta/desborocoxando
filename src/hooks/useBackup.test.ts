import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBackup } from './useBackup';
import { emptyRecord } from '../types';

const STORAGE_KEY = 'desborocoxando_data';

/**
 * Helper para mockar window.location.reload
 */
function mockLocationReload() {
  const reloadMock = vi.fn();
  // Preserva outras propriedades de location
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload: reloadMock },
    writable: true,
    configurable: true,
  });
  return reloadMock;
}

describe('useBackup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('exportData', () => {
    it('cria blob e link para download quando há dados', () => {
      const testData = { '2026-06-27': emptyRecord('2026-06-27') };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));

      const createObjectURLSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:test');
      const revokeObjectURLSpy = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      // Espia document.createElement e mocka o click do anchor
      const originalCreateElement = document.createElement.bind(document);
      const clickMock = vi.fn();
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') {
            // Como o click pode tentar navegar, mockamos
            (el as HTMLAnchorElement).click = clickMock;
          }
          return el;
        });

      const { result } = renderHook(() => useBackup());
      result.current.exportData();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('não faz nada quando localStorage está vazio', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

      const { result } = renderHook(() => useBackup());
      result.current.exportData();

      expect(createObjectURLSpy).not.toHaveBeenCalled();
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });
  });

  describe('importData', () => {
    it('rejeita JSON inválido', async () => {
      const { result } = renderHook(() => useBackup());
      const file = new File(
        ['{"invalido'],
        'backup.json',
        { type: 'application/json' },
      );
      const error = await result.current.importData(file);
      expect(error).toBe(
        'Erro ao ler o arquivo. Verifique se é um JSON válido.',
      );
    });

    it('rejeita array (objeto não-plano)', async () => {
      const { result } = renderHook(() => useBackup());
      const file = new File(['[]'], 'backup.json', { type: 'application/json' });
      const error = await result.current.importData(file);
      expect(error).toBe('Arquivo inválido: formato não reconhecido.');
    });

    it('rejeita null (objeto não-plano)', async () => {
      const { result } = renderHook(() => useBackup());
      const file = new File(['null'], 'backup.json', {
        type: 'application/json',
      });
      const error = await result.current.importData(file);
      expect(error).toBe('Arquivo inválido: formato não reconhecido.');
    });

    it('rejeita chave que não é data válida', async () => {
      const { result } = renderHook(() => useBackup());
      const data = { 'not-a-date': { water: 0 } };
      const file = new File([JSON.stringify(data)], 'backup.json', {
        type: 'application/json',
      });
      const error = await result.current.importData(file);
      expect(error).toContain('não é uma data válida');
      expect(error).toContain('not-a-date');
    });

    it('rejeita schema inválido (water como string)', async () => {
      const { result } = renderHook(() => useBackup());
      // Um objeto com chave de data válida mas com water como string (em vez de número)
      const data = { '2026-06-27': { water: 'string' } };
      const file = new File([JSON.stringify(data)], 'backup.json', {
        type: 'application/json',
      });
      const error = await result.current.importData(file);
      expect(error).toContain('Arquivo inválido');
    });

    it('aceita dados válidos e recarrega página', async () => {
      const reloadMock = mockLocationReload();
      const { result } = renderHook(() => useBackup());
      const validData = { '2026-06-27': emptyRecord('2026-06-27') };
      const file = new File([JSON.stringify(validData)], 'backup.json', {
        type: 'application/json',
      });
      const error = await result.current.importData(file);

      expect(error).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(validData));
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });
});
