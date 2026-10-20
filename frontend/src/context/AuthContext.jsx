import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, setOnUnauthorized, TOKEN_KEY } from '../lib/apiClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const mapUser = (user) => {
  if (!user) return null;
  return user;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setCurrentUser(mapUser(JSON.parse(savedUser)));
        } catch (_) {}
      }

      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          const user = mapUser(res?.data || res);
          setCurrentUser(user);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          setCurrentUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    // Listen to global 401 logouts
    setOnUnauthorized(() => {
      setCurrentUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
    });

    initializeAuth();
  }, []);

  async function signup(email, password) {
    try {
      const payload = {
        email,
        password,
        name: email.split('@')[0], // Automatically derive name from email prefix
      };
      const response = await apiClient.post('/auth/register', payload);
      
      const token = response?.data?.access_token || response?.access_token || response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(mapUser(user));
      }

      return response;
    } catch (error) {
      if (error.status === 409 || error.message.includes('Email already in use')) {
        throw new Error('an account with this email already exists');
      }
      if (error.message.includes("can't reach the server")) {
        throw new Error("can't reach the server, check your connection");
      }
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const token = response?.data?.access_token || response?.access_token || response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(mapUser(user));
      }

      return response;
    } catch (error) {
      if (error.status === 401 || error.message.includes('Invalid credentials')) {
        throw new Error('incorrect email or password');
      }
      if (error.message.includes("can't reach the server")) {
        throw new Error("can't reach the server, check your connection");
      }
      throw error;
    }
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
