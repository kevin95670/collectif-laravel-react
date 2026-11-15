import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Nécessaire dans Docker : écoute sur toutes les interfaces
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Sous Windows, Docker ne transmet pas les changements de fichiers :
      // Vite vérifie donc lui-même les fichiers toutes les 300 ms.
      usePolling: true,
      interval: 300,
    },
  },
})