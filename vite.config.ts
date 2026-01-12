
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' is critical for GitHub Pages deployment to work in subdirectories
  base: './', 
  define: {
    // Shims process.env for the browser environment
    // Ensure you set API_KEY in your build environment variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {} 
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
