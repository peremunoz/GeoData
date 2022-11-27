import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: 'index.html',
    host: 'true',
    port: 5173,
    sourceMap: true,
    https: false},
})
