import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    react(),
    qiankun('code-editor-app', {
      useDevMode: true
    })
  ],
  server: {
    port: 3002,
    cors: true,
    origin: 'http://localhost:3002',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
