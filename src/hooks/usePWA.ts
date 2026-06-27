import { useState, useEffect, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function usePWA() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream
    );

    // Detectar standalone
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );

    // Capturar beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const result = await installPromptEvent.userChoice;
      if (result.outcome === 'accepted') {
        setInstallPromptEvent(null);
      }
    }
  }, [installPromptEvent]);

  const canInstall = !!installPromptEvent || (isIOS && !isStandalone);

  return { isIOS, isStandalone, triggerInstall, canInstall };
}
