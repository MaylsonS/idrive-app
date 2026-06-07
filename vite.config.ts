import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
     define: {
        global: 'globalThis',  // <- corrige o "global is not defined"
      },
  plugins: [react()],
})
