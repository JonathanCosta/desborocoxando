---
name: pwa-mechanics
description: Use ao configurar PWA ou implementar modal de instalação. Contém detecção de plataforma e lógica do beforeinstallprompt.
---

# PWA Mechanics — Instalação Inteligente

## Configuração (vite-plugin-pwa)

```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  strategies: 'generateSW',
  manifest: {
    name: 'Desborocoxando',
    short_name: 'Desboro',
    description: 'App de tracking de hábitos diários',
    theme_color: '#C496A1',
    background_color: '#F7F5F0',
    icons: [
      { src: '/pwaicons/ios/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwaicons/ios/512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
});
```

## Hook usePWA — Lógica de Detecção

### Android/Chrome
```typescript
let installPrompt: Event | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});
// triggerInstall:
installPrompt.prompt();
const result = await installPrompt.userChoice;
```

### iOS/Safari
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true;
```

## Modal Inteligente

- Se iOS + não standalone → instruções visuais (botão compartilhar Safari)
- Se Android + installPrompt capturado → botão "Instalar App"
- Animação: slide-up `translate-y-0` / `translate-y-full` com `duration-500`
- Fundo: `bg-white rounded-t-3xl shadow-[0_-10px_25px_rgba(0,0,0,0.1)]`
