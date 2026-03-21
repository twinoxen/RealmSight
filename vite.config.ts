import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

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
      '@ar': path.resolve(__dirname, 'src/ar'),
      '@vision': path.resolve(__dirname, 'src/vision'),
      '@scene': path.resolve(__dirname, 'src/scene'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@multiplayer': path.resolve(__dirname, 'src/multiplayer'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@db': path.resolve(__dirname, 'src/db'),
      '@pwa': path.resolve(__dirname, 'src/pwa'),
      '@platform': path.resolve(__dirname, 'src/platform'),
    }
  }
})
