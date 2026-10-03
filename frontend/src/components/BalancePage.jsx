import React from 'react';
import { Link } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import CategoryChart from './CategoryChart';
import TransactionList from './TransactionList';

const BalancePage = () => {
  // Destructure all three calculated values from context
  const { balance, income, expense, transactions } = useTransaction();
  
  // Helper function for clean INR formatting and handling absolute values
  const formatINR = (amount) => `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <main className="flex-grow p-4 md:p-8 min-h-[calc(100vh-5rem)] bg-brand-bg flex justify-center items-start">
      <div className="w-full max-w-7xl my-4 flex flex-col gap-8">

        {/* Row 1: Stat Cards Grid (3 cards side-by-side on desktop, wider terracotta balance card) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Net Balance Card */}
          <div className="lg:col-span-2 bg-brand-accent rounded-2xl shadow-brand p-8 text-center text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] md:min-h-[180px]">
            <div>
              <h1 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Current Net Balance</h1>
              <p className="text-5xl md:text-6xl font-serif font-black tracking-tight mt-3 tabular-nums text-white">
                {balance < 0 ? '-' : ''}{formatINR(balance)}
              </p>
            </div>

            {/* Income/Expense Stat Chips inside the Hero Card (Mobile/Tablet only) */}
            <div className="flex gap-4 mt-6 lg:hidden">
              <div className="flex-1 bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-center">
                <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Total Income</h2>
                <p className="text-lg font-serif font-extrabold text-[#D2E0CD] mt-1 tabular-nums">
                  + {formatINR(income)}
                </p>
              </div>
              <div className="flex-1 bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-center">
                <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Total Expense</h2>
                <p className="text-lg font-serif font-extrabold text-[#F8C6BE] mt-1 tabular-nums">
                  - {formatINR(expense)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Income Card (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-1 bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-8 flex-col justify-center items-center text-center">
            <h2 className="text-xs font-bold text-brand-text/50 uppercase tracking-wider">Total Income</h2>
            <p className="text-3xl font-serif font-extrabold text-brand-sage mt-4 tabular-nums">
              + {formatINR(income)}
            </p>
          </div>

          {/* Total Expense Card (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-1 bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-8 flex-col justify-center items-center text-center">
            <h2 className="text-xs font-bold text-brand-text/50 uppercase tracking-wider">Total Expense</h2>
            <p className="text-3xl font-serif font-extrabold text-brand-coral mt-4 tabular-nums">
              - {formatINR(expense)}
            </p>
          </div>
        </div>

        {/* Row 2: Two-column layout (2fr 1fr) on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Activity (wider, ~65%) */}
          <div className="lg:col-span-2">
            <TransactionList limit={5} />
          </div>

          {/* Right Column: Spending chart & Shortcut Card (narrower, ~35%) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Quick Add Shortcut Card */}
            <div className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6 text-center">
              <h3 className="text-md font-serif font-black text-brand-text mb-2">New Transaction?</h3>
              <p className="text-xs text-brand-text/60 mb-4">Record your earnings and spending in one click.</p>
              <Link
                to="/add"
                className="inline-flex items-center justify-center w-full py-3 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold rounded-xl transition-all shadow-brand min-h-[44px]"
              >
                Add Transaction
              </Link>
            </div>

            {/* Spending Chart */}
            <div className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6">
              <h2 className="text-lg font-serif font-black text-brand-text mb-4">Spending Breakdown</h2>
              <CategoryChart transactions={transactions} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default BalancePage;
