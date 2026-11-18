import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-icon.svg', 'powerdex-logo.svg', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'POWERDEX MOVIES',
          short_name: 'POWERDEX',
          description:
            'Explore evoluções Pokémon, transformações Dragon Ball e filmes no POWERDEX MOVIES.',
          lang: 'pt-BR',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          theme_color: '#08243a',
          background_color: '#ffffff',
          icons: [
            {
              src: '/pwa-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg,jpeg,webp,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname === '/api/movie',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'omdb-movie-api',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) =>
                ['pokeapi.co', 'dragonball-api.com', 'mockapi.io'].some(
                  (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
                ),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'universo-geek-api',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request, url }) =>
                request.destination === 'image' &&
                [
                  'raw.githubusercontent.com',
                  'images.unsplash.com',
                  'm.media-amazon.com',
                  'upload.wikimedia.org',
                ].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)),
              handler: 'CacheFirst',
              options: {
                cacheName: 'external-images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api/movie': {
          target: 'https://www.omdbapi.com',
          changeOrigin: true,
          rewrite: () => {
            const params = new URLSearchParams({
              i: 'tt0816692',
              apikey: env.OMDB_API_KEY || '',
            })

            return `/?${params.toString()}`
          },
        },
      },
    },
  }
})
