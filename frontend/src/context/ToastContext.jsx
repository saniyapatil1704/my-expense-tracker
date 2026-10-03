import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - positioned in top-right with high z-index */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between bg-brand-text text-brand-bg border border-brand-accent/20 rounded-xl shadow-brand p-4 animate-slide-in"
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'success' ? (
                <span className="w-6 h-6 rounded-full bg-brand-sage text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                  ✓
                </span>
              ) : toast.type === 'error' ? (
                <span className="w-6 h-6 rounded-full bg-brand-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                  ✕
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-brand-accent text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                  ℹ
                </span>
              )}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-brand-bg/40 hover:text-brand-bg/70 ml-4 text-xs font-bold focus:outline-none"
              aria-label="Close Notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
