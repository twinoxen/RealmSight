import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'RealmSight',
        short_name: 'RealmSight',
        description: 'Draw maps. See worlds. No app store required.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['games', 'entertainment', 'education'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [],
      },
      devOptions: {
        enabled: false, // disable SW in dev to avoid caching headaches
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB for TF.js bundle
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Don't precache large model files — use runtime cache instead
        globIgnores: ['**/*.glb', '**/opencv.js'],
        runtimeCaching: [
          {
            // glTF models: cache-first, 30-day expiry
            urlPattern: /\/models\/.+\.glb$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gltf-models',
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // OpenCV.js from CDN: cache-first (large, rarely changes)
            urlPattern: /docs\.opencv\.org\/.+\/opencv\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'opencv-wasm',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            // Draco decoder from Google CDN
            urlPattern: /www\.gstatic\.com\/draco\/.+/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'draco-decoder',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
    }),
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
    },
  },
})
