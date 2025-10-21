import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],

  test:
  {
    // 👇 Налаштування Vitest
    globals: true, // Дозволяє використовувати 'describe', 'it', 'expect' без імпортів
    environment: 'jsdom', // Використовувати JSDOM для тестів
    setupFiles: './src/setupTests.js', // Файл для глобальних налаштувань тестів
    // Опціонально: налаштування для CSS/SVG файлів, якщо вони ламають тести
    css: true, 
  },
})
