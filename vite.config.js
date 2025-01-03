import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import config from './src/config/config.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: config.serverUrl,
        changeOrigin: true,
      },
    },
  },
})
