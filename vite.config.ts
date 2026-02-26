
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base removed: Default to root '/' for Cloud Run / Standard deployment
  server: {
    host: true, // Listen on all addresses
    port: 8080,
  },
  preview: {
    host: true, // Listen on all addresses for preview/production
    port: 8080,
    allowedHosts: true
  }
});
