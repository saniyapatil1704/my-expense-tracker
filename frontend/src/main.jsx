// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TransactionProvider } from './context/TransactionContext.jsx'; // Import the new provider
import { AuthProvider } from './context/AuthContext.jsx';

// Programmatically unregister active service workers to prevent hybrid app cache issues
if (typeof window !== 'undefined') {
  if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('🗑️ Legacy Service Worker unregistered successfully!');
          }
        });
      }
    });
  }
  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
      console.log('🗑️ Cache Storage cleared successfully!');
    });
  }
}

import { CategoryProvider } from './context/CategoryContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <CategoryProvider>
          <TransactionProvider>
            <App />
          </TransactionProvider>
        </CategoryProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
);