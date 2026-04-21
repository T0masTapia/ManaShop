import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // 1. Importa el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // 2. Agrégalo aquí
    react(),
  ],
  server: {
    host: true, 
  },
})