import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#006D37',
                color: '#FAFAFA',
              },
              iconTheme: {
                primary: '#FAFAFA',
                secondary: '#006D37',
              },
            },
            error: {
              style: {
                background: '#DC2626',
                color: '#FAFAFA',
              },
              iconTheme: {
                primary: '#FAFAFA',
                secondary: '#DC2626',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
