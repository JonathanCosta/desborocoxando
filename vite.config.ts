import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
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
          { src: '/pwaicons/android/launchericon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwaicons/android/launchericon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwaicons/ios/180.png', sizes: '180x180', type: 'image/png' },
          { src: '/pwaicons/ios/152.png', sizes: '152x152', type: 'image/png' },
          { src: '/pwaicons/ios/144.png', sizes: '144x144', type: 'image/png' },
          { src: '/pwaicons/ios/120.png', sizes: '120x120', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
