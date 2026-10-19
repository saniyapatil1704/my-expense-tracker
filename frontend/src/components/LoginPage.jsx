import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { useTransaction } from '../context/TransactionContext';

const LoginPage = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const { notificationPrefill } = useTransaction();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);

      const hasPendingData = Boolean(
        notificationPrefill ||
        (typeof window !== 'undefined' && window.pendingUpiSMS) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pending_upi_sms'))
      );

      console.log('[DIAG] LoginPage post-login: notificationPrefill present=' + (notificationPrefill ? 'yes' : 'no') + ', window.pendingUpiSMS present=' + ((typeof window !== 'undefined' && window.pendingUpiSMS) ? 'yes' : 'no') + ', hasPendingData=' + (hasPendingData ? 'yes' : 'no') + ', targetRoute=' + (hasPendingData ? '/add' : '/'));

      if (hasPendingData) {
        navigate('/add', { replace: true });
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 bg-brand-bg flex justify-center items-center">
      <div className="w-full max-w-md my-8">
        <div className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-8">
          <h2 className="text-3xl font-serif font-black text-center mb-8 text-brand-text">Welcome Back</h2>

          {error && (
            <div className="bg-brand-coral-light border border-brand-coral/20 text-brand-coral px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-brand-text text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full p-3 bg-white border border-brand-accent/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-brand-text transition-all"
                id="email"
                type="email"
                ref={emailRef}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-brand-text text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full p-3 bg-white border border-brand-accent/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/40 text-brand-text transition-all"
                id="password"
                type="password"
                ref={passwordRef}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="pt-2">
              <button
                className="bg-brand-accent hover:bg-brand-accent/95 text-white font-bold py-3 px-4 rounded-xl shadow-brand hover:scale-[1.01] transition-all w-full min-h-[44px] flex items-center justify-center"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging In..." : "Log In"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-brand-accent/10 pt-6">
            <p className="text-sm text-brand-text/75">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-accent hover:underline font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;