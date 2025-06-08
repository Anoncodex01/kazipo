import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify('AIzaSyD___bCMYRNeJwiQg6Qcl5j6yT71QLA18k')
  }
});
