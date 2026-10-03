import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCategory } from './CategoryContext';
import apiClient from '../lib/apiClient';
import { useToast } from './ToastContext';

const TransactionContext = createContext();

export function useTransaction() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }) {
  const { currentUser } = useAuth();
  const { categories } = useCategory();
  const { showToast } = useToast();

  // State
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filterType, setFilter] = useState('all'); // all, income, expense
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Prefill state for native deep-links/SMS notifications
  const [notificationPrefill, setNotificationPrefill] = useState(null);

  // Form state
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    type: 'expense',
    categoryId: '',
    attachment: null, // Holds File object
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setNewTransaction((prev) => ({
        ...prev,
        attachment: files ? files[0] : null,
      }));
    } else {
      setNewTransaction((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const fetchTransactions = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterCategoryId) {
        params.append('categoryId', filterCategoryId);
      }
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        params.append('startDate', start.toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }

      const queryString = params.toString();
      const url = `/transactions${queryString ? `?${queryString}` : ''}`;
      const data = await apiClient.request(url);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!currentUser) return;
    try {
      const params = new URLSearchParams();
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        params.append('startDate', start.toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }
      const queryString = params.toString();
      const url = `/transactions/summary${queryString ? `?${queryString}` : ''}`;
      const data = await apiClient.request(url);
      setBalance(data.balance || 0);
      setIncome(data.totalIncome || 0);
      setExpense(data.totalExpense || 0);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchTransactions(), fetchSummary()]);
  };

  // Re-fetch transactions whenever filter conditions or active user changes
  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setTransactions([]);
      setBalance(0);
      setIncome(0);
      setExpense(0);
    }
  }, [currentUser, filterType, filterCategoryId, startDate, endDate]);

  const handleAddTransaction = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!newTransaction.amount || !newTransaction.categoryId) {
      alert('Please fill out the amount and select a category.');
      return;
    }

    try {
      let response;
      // Send as FormData if an attachment file is present
      if (newTransaction.attachment) {
        const formData = new FormData();
        formData.append('amount', Math.abs(Number(newTransaction.amount)));
        formData.append('description', newTransaction.description);
        formData.append('type', newTransaction.type);
        formData.append('categoryId', newTransaction.categoryId);
        formData.append('attachment', newTransaction.attachment);
        
        try {
          response = await apiClient.request('/transactions', {
            method: 'POST',
            body: formData,
          });
        } catch (uploadErr) {
          console.error('Multipart upload failed, retrying without attachment:', uploadErr);
          
          // Retry without attachment
          response = await apiClient.request('/transactions', {
            method: 'POST',
            body: JSON.stringify({
              amount: Math.abs(Number(newTransaction.amount)),
              description: newTransaction.description,
              type: newTransaction.type,
              categoryId: newTransaction.categoryId,
            }),
          });
          
          // Transaction created, but file failed
          setNewTransaction({
            amount: '',
            description: '',
            type: 'expense',
            categoryId: '',
            attachment: null,
          });
          await refreshData();
          showToast('Transaction saved, but attachment upload failed!', 'error');
          return response;
        }
      } else {
        response = await apiClient.request('/transactions', {
          method: 'POST',
          body: JSON.stringify({
            amount: Math.abs(Number(newTransaction.amount)),
            description: newTransaction.description,
            type: newTransaction.type,
            categoryId: newTransaction.categoryId,
          }),
        });
      }

      // Reset form state
      setNewTransaction({
        amount: '',
        description: '',
        type: 'expense',
        categoryId: '',
        attachment: null,
      });

      // Refresh list & summary
      await refreshData();
      showToast('Transaction added successfully!', 'success');
      return response;
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.message || 'Failed to create transaction');
      showToast(err.message || 'Failed to create transaction', 'error');
    }
  };

  const handleQuickAdd = async (amount, description, categoryName, type) => {
    setError(null);
    try {
      // Look up matching category by name (case-insensitive)
      let matched = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      let resolvedCategoryId = matched?.id;

      if (!resolvedCategoryId) {
        // Fall back to "Other" category
        const other = categories.find(
          (c) => c.name.toLowerCase() === 'other'
        );
        resolvedCategoryId = other?.id;
      }

      if (!resolvedCategoryId) {
        console.warn(
          `⚠️ handleQuickAdd: Category "${categoryName}" or "Other" fallback not found. Skipping.`
        );
        return;
      }

      const response = await apiClient.request('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.abs(amount), // Backend expects positive numbers
          description,
          type,
          categoryId: resolvedCategoryId,
        }),
      });

      await refreshData();
      showToast('Transaction added successfully!', 'success');
      return response;
    } catch (err) {
      console.error('Error in handleQuickAdd:', err);
      setError(err.message || 'Failed in quick add');
      showToast(err.message || 'Failed in quick add', 'error');
    }
  };

  const deleteTransaction = async (id) => {
    setError(null);
    try {
      const response = await apiClient.request(`/transactions/${id}`, {
        method: 'DELETE',
      });
      await refreshData();
      showToast('Transaction deleted successfully!', 'success');
      return response;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.message || 'Failed to delete transaction');
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  const value = {
    transactions,
    balance,
    income,
    expense,
    loading,
    error,
    newTransaction,
    setNewTransaction,
    handleInputChange,
    handleAddTransaction,
    handleQuickAdd,
    deleteTransaction,
    filterType,
    setFilter,
    filterCategoryId,
    setFilterCategoryId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notificationPrefill,
    setNotificationPrefill,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
