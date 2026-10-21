import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' permite publicar en GitHub Pages o cualquier subcarpeta
export default defineConfig({
  plugins: [react()],
  base: './',
});
