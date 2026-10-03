import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, setOnUnauthorized } from '../lib/apiClient';

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
      const token = localStorage.getItem('expense_tracker_token');
      if (token) {
        try {
          const user = await apiClient.get('/auth/me');
          setCurrentUser(mapUser(user));
        } catch (error) {
          console.error('Session restoration failed:', error);
          setCurrentUser(null);
          localStorage.removeItem('expense_tracker_token');
        }
      }
      setLoading(false);
    };

    // Listen to global 401 logouts
    setOnUnauthorized(() => {
      setCurrentUser(null);
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
      
      localStorage.setItem('expense_tracker_token', response.access_token);
      setCurrentUser(mapUser(response.user));
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
      
      localStorage.setItem('expense_tracker_token', response.access_token);
      setCurrentUser(mapUser(response.user));
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
    localStorage.removeItem('expense_tracker_token');
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
