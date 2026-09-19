import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || './',
  plugins: [react(), tailwindcss()],

  test: {
    // Vitest configuration
    globals: true, // Allows using 'describe', 'it', 'expect' without explicit imports
    environment: 'jsdom', // Use JSDOM for tests
    setupFiles: './src/setupTests.js', // Global test setup file
    css: true,
  },
})
