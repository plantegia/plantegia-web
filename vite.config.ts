import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Dev server middleware to mimic Vercel rewrites
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Rewrite /p/* and /tutorial/* to /app/index.html (same as Vercel rewrites)
          if (req.url?.startsWith('/p') || req.url?.startsWith('/tutorial')) {
            req.url = '/app/index.html'
          }
          next()
        })
      },
    },
  ],
  base: '/app/',
  server: {
    allowedHosts: ['factor-extras-multi-science.trycloudflare.com'],
    open: '/p/',
  },
})
