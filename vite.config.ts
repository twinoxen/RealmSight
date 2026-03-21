import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'RealmSight',
        short_name: 'RealmSight',
        description: 'Draw maps. See worlds. No app store required.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB — TF.js bundle is ~2.4MB
        runtimeCaching: [
          {
            urlPattern: /\/models\/.+\.glb$/,
            handler: 'CacheFirst',
            options: { cacheName: 'gltf-models', expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@ar': fileURLToPath(new URL('src/ar', import.meta.url)),
      '@vision': fileURLToPath(new URL('src/vision', import.meta.url)),
      '@scene': fileURLToPath(new URL('src/scene', import.meta.url)),
      '@ui': fileURLToPath(new URL('src/ui', import.meta.url)),
      '@multiplayer': fileURLToPath(new URL('src/multiplayer', import.meta.url)),
      '@store': fileURLToPath(new URL('src/store', import.meta.url)),
      '@db': fileURLToPath(new URL('src/db', import.meta.url)),
      '@pwa': fileURLToPath(new URL('src/pwa', import.meta.url)),
      '@platform': fileURLToPath(new URL('src/platform', import.meta.url)),
    }
  }
})
