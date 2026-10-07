/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Version affichée dans les signalements : sha court du commit en CI, « dev » en local.
    __BUILD__: JSON.stringify((process.env.GITHUB_SHA ?? 'dev').slice(0, 7)),
  },
  // GitHub Pages sert le site sous /Clicker/ — BASE_PATH est posé par la CI.
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Word Forge',
        short_name: 'Forge',
        description:
          'Learn languages by forging words — FSRS spaced repetition.',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0e14',
        theme_color: '#0b0e14',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webp,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
