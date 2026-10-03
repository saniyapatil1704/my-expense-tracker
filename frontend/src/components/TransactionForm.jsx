

// import React from 'react';
// import { useTransaction } from '../context/TransactionContext';

// const TransactionForm = () => {
//   const { newTransaction, handleInputChange, handleAddTransaction, handleQuickAdd } = useTransaction();

//   return (
//     <section className="bg-white rounded-lg shadow-md p-4 mb-6">
//       <h2 className="text-xl font-semibold mb-3 text-gray-700">Quick Add</h2>
//       <div className="flex justify-around space-x-2 mb-4">
//         <button
//           onClick={() => handleQuickAdd(-80, 'Lunch', 'Food', 'expense')}
//           className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex-1"
//         >
//           Lunch (₹80)
//         </button>
//         <button
//           onClick={() => handleQuickAdd(-62, 'Bus Fare', 'Travel', 'expense')}
//           className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex-1"
//         >
//           Bus Fare (₹62)
//         </button>
//       </div>

//       <h2 className="text-xl font-semibold mb-3 text-gray-700">Add New Transaction</h2>
//       <form onSubmit={handleAddTransaction} className="space-y-4">
//         <input
//           type="number"
//           placeholder="Amount"
//           name="amount"
//           value={newTransaction.amount}
//           onChange={handleInputChange}
//           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <input
//           type="text"
//           placeholder="Description"
//           name="description"
//           value={newTransaction.description}
//           onChange={handleInputChange}
//           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <select
//           name="type"
//           value={newTransaction.type}
//           onChange={handleInputChange}
//           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="expense">Expense</option>
//           <option value="income">Income</option>
//         </select>
        
//         {/* New: Category dropdown */}
//         <select
//           name="category"
//           value={newTransaction.category}
//           onChange={handleInputChange}
//           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="Other">Other</option>
//           <option value="Food">Food</option>
//           <option value="Travel">Travel</option>
//           <option value="Utilities">Utilities</option>
//           <option value="Shopping">Shopping</option>
//           <option value="Salary">Salary</option>
//         </select>

//         <button
//           type="submit"
//           className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
//         >
//           Add Transaction
//         </button>
//       </form>
//     </section>
//   );
// };

// export default TransactionForm;


// 18-04-2026

import React, { useEffect } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { useCategory } from '../context/CategoryContext';
import UPINotificationSetup from './UPINotificationSetup';

const TransactionForm = () => {
  const {
    newTransaction,
    handleInputChange,
    handleAddTransaction,
    handleQuickAdd,
    notificationPrefill,
    setNotificationPrefill,
  } = useTransaction();

  const { categories } = useCategory();

  const [previewUrl, setPreviewUrl] = React.useState(null);

  useEffect(() => {
    if (!newTransaction.attachment) {
      setPreviewUrl(null);
      return;
    }
    if (newTransaction.attachment.type && newTransaction.attachment.type.startsWith('image/')) {
      const url = URL.createObjectURL(newTransaction.attachment);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [newTransaction.attachment]);

  // Filter categories to show only relevant ones based on transaction type (expense vs income)
  const filteredCategories = categories.filter((cat) => {
    if (newTransaction.type === 'expense') {
      return cat.type === 'EXPENSE' || cat.type === 'BOTH';
    } else {
      return cat.type === 'INCOME' || cat.type === 'BOTH';
    }
  });

  // Auto-fill form if user tapped a UPI notification
  useEffect(() => {
    if (!notificationPrefill) return;

    // Fill in amount, description, type directly
    ['amount', 'description', 'type'].forEach((field) => {
      handleInputChange({
        target: { name: field, value: notificationPrefill[field] },
      });
    });

    // Resolve category name to categoryId
    if (notificationPrefill.category) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === notificationPrefill.category.toLowerCase()
      );
      if (matched) {
        handleInputChange({
          target: { name: 'categoryId', value: matched.id },
        });
      } else {
        const other = categories.find((c) => c.name.toLowerCase() === 'other');
        if (other) {
          handleInputChange({
            target: { name: 'categoryId', value: other.id },
          });
        }
      }
    }

    setNotificationPrefill(null); // Clear after use
  }, [notificationPrefill, categories]);

  return (
    <section className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6 mb-6">
      {/* UPI Notification Banner */}
      <UPINotificationSetup />

      {/* Quick Add Section */}
      <h3 className="text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-3">Quick Add</h3>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleQuickAdd(80, 'Lunch', 'Food', 'expense')}
          className="flex-1 bg-[#EDE0D2] hover:bg-[#E5D7C9] text-[#2D2420] font-bold py-2.5 px-4 rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 text-sm min-h-[44px] shadow-sm border border-brand-accent/10"
        >
          <span className="w-8 h-8 rounded-full bg-brand-accent/15 flex items-center justify-center text-md flex-shrink-0">
            🍱
          </span>
          <span>Lunch (₹80)</span>
        </button>
        <button
          onClick={() => handleQuickAdd(62, 'Bus Fare', 'Travel', 'expense')}
          className="flex-1 bg-[#EDE0D2] hover:bg-[#E5D7C9] text-[#2D2420] font-bold py-2.5 px-4 rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 text-sm min-h-[44px] shadow-sm border border-brand-accent/10"
        >
          <span className="w-8 h-8 rounded-full bg-brand-accent/15 flex items-center justify-center text-md flex-shrink-0">
            🚌
          </span>
          <span>Bus Fare (₹62)</span>
        </button>
      </div>

      <h2 className="text-xl font-serif font-black text-brand-text mb-6 pb-4 border-b border-brand-accent/10">Add Transaction</h2>
      
      <form onSubmit={handleAddTransaction} className="space-y-6">
        
        {/* Dominant Amount Input Section */}
        <div className="relative flex flex-col items-center py-2 mb-2">
          <span className="text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-2">Amount</span>
          <div className="flex items-center justify-center font-serif text-brand-accent">
            <span className="text-3xl font-black mr-1">₹</span>
            <input
              type="number"
              placeholder="0.00"
              name="amount"
              value={newTransaction.amount}
              onChange={handleInputChange}
              className="bg-transparent border-b-2 border-brand-accent/25 focus:border-brand-accent text-center font-black text-4xl md:text-5xl focus:outline-none w-48 py-1 tabular-nums transition-colors"
              required
            />
          </div>
        </div>

        {/* Transaction Type Segmented Controller */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider">Type</span>
          <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-accent/10">
            <button
              type="button"
              onClick={() => handleInputChange({ target: { name: 'type', value: 'expense' } })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[40px] ${
                newTransaction.type === 'expense'
                  ? 'bg-brand-coral text-white shadow-brand'
                  : 'text-brand-text/70 hover:text-brand-text'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleInputChange({ target: { name: 'type', value: 'income' } })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[40px] ${
                newTransaction.type === 'income'
                  ? 'bg-brand-accent text-white shadow-brand'
                  : 'text-brand-text/70 hover:text-brand-text'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly grocery run"
            name="description"
            value={newTransaction.description}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
            required
          />
        </div>

        {/* Category Picker with Chips */}
        <div>
          <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-2.5">
            Category
          </label>
          {filteredCategories.length === 0 ? (
            <p className="text-xs text-brand-text/60 italic py-2">No categories available for this type. Please create one in Categories first.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCategories.map((cat) => {
                const isSelected = newTransaction.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'categoryId', value: cat.id } })}
                    style={{
                      borderColor: isSelected ? cat.color : 'transparent',
                      backgroundColor: isSelected ? cat.color + '15' : 'rgba(45,36,32,0.03)',
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] text-left min-h-[48px]`}
                  >
                    <span
                      style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      className="text-xl w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      {cat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-brand-text truncate">{cat.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Attachment Upload Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider">
            Receipt / Attachment (Optional)
          </label>
          
          {!newTransaction.attachment ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-accent/20 rounded-xl p-4 bg-white hover:bg-brand-accent/5 cursor-pointer transition-all min-h-[80px]">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-xl">📎</span>
                <span className="text-xs font-bold text-brand-text/70">Upload Receipt (JPEG, PNG, PDF up to 5MB)</span>
              </div>
              <input
                type="file"
                name="attachment"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                    if (!allowedTypes.includes(file.type)) {
                      alert('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
                      e.target.value = '';
                      return;
                    }
                    const maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                      alert('File is too large. Max size is 5MB.');
                      e.target.value = '';
                      return;
                    }
                    handleInputChange(e);
                  }
                }}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-white border border-brand-accent/15 rounded-xl animate-slide-in">
              <div className="flex items-center space-x-3 min-w-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded-lg border border-brand-accent/10 flex-shrink-0"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center text-xl flex-shrink-0">
                    📄
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-brand-text truncate">
                    {newTransaction.attachment.name}
                  </p>
                  <p className="text-[10px] text-brand-text/50">
                    {(newTransaction.attachment.size / 1024 / 1024).toFixed(2)} MB • {newTransaction.attachment.type ? newTransaction.attachment.type.split('/')[1].toUpperCase() : 'FILE'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleInputChange({ target: { name: 'attachment', files: null } });
                }}
                className="w-8 h-8 rounded-full bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral flex items-center justify-center text-xs font-bold transition-colors"
                aria-label="Remove Attachment"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-brand-accent hover:bg-brand-accent/95 text-white font-bold py-3.5 px-4 rounded-xl shadow-brand hover:scale-[1.01] transition-all min-h-[44px] flex items-center justify-center"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </section>
  );
};

export default TransactionForm;