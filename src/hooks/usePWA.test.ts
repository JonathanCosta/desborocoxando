import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWA } from './usePWA';

describe('usePWA', () => {
  beforeEach(() => {
    // Setup matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('estado inicial com isIOS=false, isStandalone=false, canInstall=false', () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isIOS).toBe(false);
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('disparo do beforeinstallprompt atualiza canInstall para true', () => {
    const { result } = renderHook(() => usePWA());

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    expect(result.current.canInstall).toBe(true);
    expect(result.current.triggerInstall).toBeInstanceOf(Function);
  });
});
