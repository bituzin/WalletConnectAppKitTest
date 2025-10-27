import { defineConfig } from 'vite'

export default defineConfig({
  base: '/WalletConnectAppKitTest/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})