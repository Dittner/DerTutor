import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    allowedHosts: true,
    hmr: {
      port: 4444
    }
  }
})