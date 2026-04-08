import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://focusforest-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // Strip Secure flag and blindly force SameSite=Lax to override any strict backend defaults
              proxyRes.headers['set-cookie'] = cookies.map(c => {
                let rewritten = c.replace(/;\s*secure/i, '');
                rewritten = rewritten.replace(/;\s*samesite=[a-z]+/i, '');
                return rewritten + '; SameSite=Lax';
              });
            }
          });
        }
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://focusforest-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // Strip Secure flag and blindly force SameSite=Lax to override any strict backend defaults
              proxyRes.headers['set-cookie'] = cookies.map(c => {
                let rewritten = c.replace(/;\s*secure/i, '');
                rewritten = rewritten.replace(/;\s*samesite=[a-z]+/i, '');
                return rewritten + '; SameSite=Lax';
              });
            }
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  }
});
