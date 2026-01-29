import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { join, resolve } from 'path'

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
  // Replace framer-motion with our CSS-based shim to avoid TDZ issues
  resolve: {
    alias: {
      'framer-motion': resolve(__dirname, 'src/utils/motion-shim.jsx')
    }
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
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        manualChunks: {
          vendor: ['react', 'react-dom']
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})
