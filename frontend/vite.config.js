import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',            // a fake browser (document, window) so components can render
    setupFiles: './src/test/setup.js',
    globals: true,                   // lets us write describe/it/expect without importing them
  },
})
