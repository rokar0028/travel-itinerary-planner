import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Default 8001 — use 8000 only if nothing else binds it (see .env.example).
      '/api': 'http://localhost:8001',
      '/health': 'http://localhost:8001',
    },
  },
})
