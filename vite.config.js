import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_SERVER_URL || 'https://server.snsf.live',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    'process.env': process.env
  }
})
