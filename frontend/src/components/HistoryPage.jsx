import React from 'react';
import TransactionList from './TransactionList';

const HistoryPage = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 bg-brand-bg flex justify-center items-start">
      <div className="w-full max-w-7xl my-4">
        <TransactionList />
      </div>
    </div>
  );
};

export default HistoryPage;