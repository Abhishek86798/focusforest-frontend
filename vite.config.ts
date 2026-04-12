import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        cookiePathRewrite: {
          '*': '/'
        },
        configure: (proxy) => {
          // Log ALL requests going through proxy
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('\n🔄 PROXY REQUEST');
            console.log('   From:', req.url);
            console.log('   To:', proxyReq.path);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            const url = req.url;
            
            console.log('\n🔄 PROXY RESPONSE');
            console.log('   URL:', url);
            console.log('   Status:', proxyRes.statusCode);
            
            // Log ALL responses that set cookies
            if (cookies) {
              console.log('\n═══════════════════════════════════════════════════════');
              console.log('🍪 VITE PROXY - Cookie Response Detected');
              console.log('═══════════════════════════════════════════════════════');
              console.log('📍 URL:', url);
              console.log('📊 Status:', proxyRes.statusCode);
              console.log('\n🔴 RAW Set-Cookie Headers from Backend:');
              cookies.forEach((cookie, index) => {
                console.log(`   [${index}] ${cookie}`);
              });
              
              // Rewrite cookies for local development
              const rewrittenCookies = cookies.map((cookie, index) => {
                let rewritten = cookie;
                const original = cookie;
                
                // Remove Secure flag (required for http://localhost)
                rewritten = rewritten.replace(/;\s*Secure/gi, '');
                
                // Replace SameSite=Strict with SameSite=Lax
                rewritten = rewritten.replace(/;\s*SameSite=Strict/gi, '; SameSite=Lax');
                
                // Remove any Domain restrictions
                rewritten = rewritten.replace(/;\s*Domain=[^;]+/gi, '');
                
                // Ensure Path is set to /
                if (!rewritten.includes('Path=')) {
                  rewritten += '; Path=/';
                }
                
                // Ensure SameSite is set
                if (!rewritten.includes('SameSite')) {
                  rewritten += '; SameSite=Lax';
                }
                
                console.log(`\n🟢 REWRITTEN Cookie [${index}]:`);
                console.log(`   ${rewritten}`);
                
                // Show what changed
                if (original !== rewritten) {
                  console.log(`   ✏️  Changes made:`);
                  if (!rewritten.includes('Secure') && original.includes('Secure')) {
                    console.log(`      - Removed: Secure flag`);
                  }
                  if (rewritten.includes('SameSite=Lax') && original.includes('SameSite=Strict')) {
                    console.log(`      - Changed: SameSite=Strict → SameSite=Lax`);
                  }
                  if (!rewritten.match(/Domain=/i) && original.match(/Domain=/i)) {
                    console.log(`      - Removed: Domain restriction`);
                  }
                }
                
                return rewritten;
              });
              
              proxyRes.headers['set-cookie'] = rewrittenCookies;
              
              console.log('\n✅ Cookies rewritten and sent to browser');
              console.log('═══════════════════════════════════════════════════════\n');
            }
          });
        }
      }
    }
  },
  preview: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        cookiePathRewrite: {
          '*': '/'
        },
        configure: (proxy) => {
          // Log ALL requests going through proxy
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('\n🔄 PROXY REQUEST');
            console.log('   From:', req.url);
            console.log('   To:', proxyReq.path);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie'];
            const url = req.url;
            
            console.log('\n🔄 PROXY RESPONSE');
            console.log('   URL:', url);
            console.log('   Status:', proxyRes.statusCode);
            
            // Log ALL responses that set cookies
            if (cookies) {
              console.log('\n═══════════════════════════════════════════════════════');
              console.log('🍪 VITE PROXY - Cookie Response Detected');
              console.log('═══════════════════════════════════════════════════════');
              console.log('📍 URL:', url);
              console.log('📊 Status:', proxyRes.statusCode);
              console.log('\n🔴 RAW Set-Cookie Headers from Backend:');
              cookies.forEach((cookie, index) => {
                console.log(`   [${index}] ${cookie}`);
              });
              
              // Rewrite cookies for local development
              const rewrittenCookies = cookies.map((cookie, index) => {
                let rewritten = cookie;
                const original = cookie;
                
                // Remove Secure flag (required for http://localhost)
                rewritten = rewritten.replace(/;\s*Secure/gi, '');
                
                // Replace SameSite=Strict with SameSite=Lax
                rewritten = rewritten.replace(/;\s*SameSite=Strict/gi, '; SameSite=Lax');
                
                // Remove any Domain restrictions
                rewritten = rewritten.replace(/;\s*Domain=[^;]+/gi, '');
                
                // Ensure Path is set to /
                if (!rewritten.includes('Path=')) {
                  rewritten += '; Path=/';
                }
                
                // Ensure SameSite is set
                if (!rewritten.includes('SameSite')) {
                  rewritten += '; SameSite=Lax';
                }
                
                console.log(`\n🟢 REWRITTEN Cookie [${index}]:`);
                console.log(`   ${rewritten}`);
                
                // Show what changed
                if (original !== rewritten) {
                  console.log(`   ✏️  Changes made:`);
                  if (!rewritten.includes('Secure') && original.includes('Secure')) {
                    console.log(`      - Removed: Secure flag`);
                  }
                  if (rewritten.includes('SameSite=Lax') && original.includes('SameSite=Strict')) {
                    console.log(`      - Changed: SameSite=Strict → SameSite=Lax`);
                  }
                  if (!rewritten.match(/Domain=/i) && original.match(/Domain=/i)) {
                    console.log(`      - Removed: Domain restriction`);
                  }
                }
                
                return rewritten;
              });
              
              proxyRes.headers['set-cookie'] = rewrittenCookies;
              
              console.log('\n✅ Cookies rewritten and sent to browser');
              console.log('═══════════════════════════════════════════════════════\n');
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
        manualChunks: undefined
      }
    }
  }
});
