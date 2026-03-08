import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const proxyTarget = 'https://punch-log-941728631592.us-west2.run.app'

  return {
    base: "./",
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true
        }
      }
    },
    resolve: { alias: { '@': '/src' } }
  }
})
