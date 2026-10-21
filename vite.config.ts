import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // API jalan di wrangler pages dev (port 8788), dev server vite proxy ke sana.
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
})
