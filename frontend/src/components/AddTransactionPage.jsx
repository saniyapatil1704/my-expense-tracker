import React from 'react';
import TransactionForm from './TransactionForm';
import { useTransaction } from '../context/TransactionContext';

const AddTransactionPage = () => {
  const { transactions } = useTransaction();

  // Calculate stats for "This month so far"
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter transactions for current month
  const thisMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date || t.createdAt);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const thisMonthExpenseSum = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthCount = thisMonthTransactions.length;

  const formatINR = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 md:p-8 bg-brand-bg flex justify-center items-start">
      <div className="w-full max-w-5xl my-4 flex flex-col lg:flex-row gap-8 justify-center items-start">
        
        {/* Left Column: Form (Strictly kept at narrow width) */}
        <div className="w-full max-w-[480px]">
          <TransactionForm />
        </div>

        {/* Right Column: Desktop-only Sidebar (hidden on mobile, ~320px wide) */}
        <div className="hidden lg:flex lg:w-[320px] flex-col gap-6">
          {/* Month Summary Card */}
          <div className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6">
            <h4 className="text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-4">This Month So Far</h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-brand-text/60 block">Total Spent</span>
                <span className="text-3xl font-serif font-black text-brand-coral mt-1 block">
                  {formatINR(thisMonthExpenseSum)}
                </span>
              </div>
              <div className="border-t border-brand-accent/5 pt-3 flex justify-between items-center">
                <span className="text-xs text-brand-text/60">Transactions</span>
                <span className="text-sm font-bold text-brand-text bg-brand-accent/10 px-2.5 py-1 rounded-lg">
                  {thisMonthCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tip Card (Commented out)
          <div className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">💡</span>
              <h4 className="text-sm font-bold text-brand-text">Quick Tip</h4>
            </div>
            <p className="text-xs text-brand-text/70 leading-relaxed">
              Use the <strong>Quick Add</strong> buttons at the top of the form to record common recurring purchases like meals or transit fares in a single tap.
            </p>
          </div>
          */}
        </div>

      </div>
    </div>
  );
};

export default AddTransactionPage;