import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
  },
  server: {
    port: 5173,
  },
  plugins: [react()],
});
