import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'version-json',
      closeBundle() {
        const out = join(process.cwd(), 'dist', 'version.json')
        writeFileSync(out, JSON.stringify({ buildTime: Date.now() }))
      }
    }
  ],
  // Pre-bundle framer-motion to avoid TDZ issues
  optimizeDeps: {
    include: ['framer-motion']
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Disable code splitting to avoid framer-motion TDZ issues
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        // Use manualChunks to bundle framer-motion with vendor
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion']
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})
