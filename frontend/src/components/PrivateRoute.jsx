// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  console.log('[DIAG] PrivateRoute check: currentUser present=' + (currentUser ? 'yes' : 'no') + ', redirecting=' + (!currentUser ? 'yes(to /login)' : 'no'));

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;