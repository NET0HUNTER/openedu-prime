import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@client': path.resolve(__dirname, 'client'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': 'http://127.0.0.1:4100',
      '/openapi.json': 'http://127.0.0.1:4100',
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
});
