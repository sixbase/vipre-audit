import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vipre-audit/',
  plugins: [react()],
  server: { port: 5190 },
})
