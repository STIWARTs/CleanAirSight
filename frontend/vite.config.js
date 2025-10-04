import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,  // Required for Docker on Windows
      interval: 1000,
    },
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',  // Use Docker service name
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
