import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const djangoTarget = process.env.VITE_DJANGO_PROXY_TARGET || 'http://127.0.0.1:8000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: djangoTarget, changeOrigin: true },
      '/admin': { target: djangoTarget, changeOrigin: true },
    },
  },
  // Same as dev: `vite preview` has no /api without this — login would "Failed to fetch".
  preview: {
    proxy: {
      '/api': { target: djangoTarget, changeOrigin: true },
      '/admin': { target: djangoTarget, changeOrigin: true },
    },
  },
})
