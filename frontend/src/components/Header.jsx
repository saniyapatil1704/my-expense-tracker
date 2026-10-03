// src/components/Header.jsx
import React from 'react';
import { useTransaction } from '../context/TransactionContext';

const Header = () => {
  const { balance } = useTransaction(); // Use the hook to get the balance
  return (
    <header className="bg-white shadow-sm p-4 text-center">
      <h1 className="text-3xl font-bold text-gray-800">Daily Balance</h1>
      {/* <p 
        className="text-5xl font-extrabold mt-2"
        style={{ color: balance >= 0 ? '#10B981' : '#EF4444' }}
      >
        ₹{balance.toLocaleString('en-IN')}
      </p> */}
    </header>
  );
};

export default Header;