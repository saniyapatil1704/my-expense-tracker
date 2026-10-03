import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../lib/apiClient';

const CategoryContext = createContext();

export function useCategory() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    if (!currentUser) {
      setCategories([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.request('/categories');
      // Set only non-archived categories by default
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser]);

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCat = await apiClient.request('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryData.name,
          icon: categoryData.icon,
          color: categoryData.color,
          type: categoryData.type || 'BOTH',
        }),
      });
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err) {
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCat = await apiClient.request(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(categoryData),
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCat : cat))
      );
      return updatedCat;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const archiveCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.request(`/categories/${id}`, {
        method: 'DELETE',
      });
      // The backend returns the deleted/archived category object.
      // If archived is true, we keep it in state or remove it?
      // Since our UI should show the list of active categories, we filter it out.
      // But we return the result so the page can see if it was archived vs hard deleted.
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return result;
    } catch (err) {
      setError(err.message || 'Failed to delete/archive category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}
