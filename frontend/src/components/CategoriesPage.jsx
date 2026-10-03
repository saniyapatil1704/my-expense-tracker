import React, { useState } from 'react';
import { useCategory } from '../context/CategoryContext';

const EMOJIS = ['🍔', '🚗', '💡', '🛍️', '💰', '🎟️', '🏠', '🏥', '🎒', '📦', '💬', '⚡', '🎮', '✈️', '🥗', '🧺'];
const COLORS = [
  '#C45D3C', // clay/terracotta
  '#7A8B6F', // sage/moss
  '#E06C53', // coral
  '#D4A5A5', // dusty rose
  '#E1B382', // ochre
  '#8E9B7B', // moss green
  '#D9C3B0', // sand
  '#A96F56', // rust
  '#8C8A6B', // olive
  '#5C4D46', // charcoal/brown
];

export default function CategoriesPage() {
  const { categories, loading, error, createCategory, updateCategory, archiveCategory } = useCategory();
  
  // State for form / modal
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState('BOTH'); // BOTH, INCOME, EXPENSE
  
  // Alert/Banner states
  const [infoMessage, setInfoMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setIcon(EMOJIS[0]);
    setColor(COLORS[0]);
    setType('BOTH');
  };

  const handleEditClick = (cat) => {
    setIsEditing(true);
    setEditId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setType(cat.type);
    setInfoMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfoMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    try {
      if (isEditing) {
        await updateCategory(editId, { name, icon, color, type });
        setInfoMessage('Category updated successfully!');
      } else {
        await createCategory({ name, icon, color, type });
        setInfoMessage('Category created successfully!');
      }
      resetForm();
    } catch (err) {
      setErrorMessage(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id, catName) => {
    setInfoMessage(null);
    setErrorMessage(null);

    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    try {
      const result = await archiveCategory(id);
      if (result && result.archived) {
        setInfoMessage(
          `Category "${catName}" could not be hard-deleted because it contains associated transactions. It has been archived instead to preserve history.`
        );
      } else {
        setInfoMessage(`Category "${catName}" deleted successfully!`);
      }
      resetForm();
    } catch (err) {
      setErrorMessage(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 bg-brand-bg flex justify-center">
      <div className="w-full max-w-7xl my-4">
        <h2 className="text-3xl font-serif font-black mb-8 text-brand-text text-center">Manage Categories</h2>

        {/* Success/Error Alerts */}
        {infoMessage && (
          <div className="mb-6 p-4 text-brand-accent bg-brand-accent-light rounded-xl shadow-brand font-bold border border-brand-accent/20 text-sm">
            {infoMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 text-brand-coral bg-brand-coral-light rounded-xl shadow-brand font-bold border border-brand-coral/20 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Category Form */}
          <div className="bg-brand-card p-6 rounded-2xl shadow-brand border border-brand-accent/5 h-fit">
            <h3 className="text-lg font-serif font-black mb-5 text-brand-text">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="w-full p-2.5 bg-white border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all"
                >
                  <option value="BOTH">Both (Income & Expense)</option>
                  <option value="EXPENSE">Expense Only</option>
                  <option value="INCOME">Income Only</option>
                </select>
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">Icon: {icon}</label>
                <div className="grid grid-cols-6 gap-2 p-2 border border-brand-accent/15 rounded-xl max-h-32 overflow-y-auto bg-white/50">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`text-2xl p-1 rounded hover:bg-brand-accent/10 transition-colors ${
                        icon === emoji ? 'bg-brand-accent-light border border-brand-accent/30' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2 p-2 border border-brand-accent/15 rounded-xl bg-white/50">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                        color === col ? 'ring-2 ring-brand-accent ring-offset-2' : ''
                      }`}
                      title={col}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-accent hover:bg-brand-accent/95 text-white font-bold py-3.5 rounded-xl shadow-brand hover:scale-[1.01] transition-all min-h-[44px] flex items-center justify-center disabled:opacity-50"
                >
                  {isEditing ? 'Save Changes' : 'Add Category'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-brand-accent/10 hover:bg-brand-accent/15 text-brand-accent font-bold py-3.5 px-4 rounded-xl transition-all min-h-[44px]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Category Chips Grid */}
          <div className="bg-brand-card p-6 rounded-2xl shadow-brand border border-brand-accent/5 md:col-span-2">
            <h3 className="text-lg font-serif font-black mb-5 text-brand-text">Existing Categories</h3>
            {loading && categories.length === 0 ? (
              <p className="text-brand-text/60 italic text-sm">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-brand-text/60 italic text-sm">No categories found. Add one on the left!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center p-3.5 border border-brand-accent/5 rounded-xl shadow-brand hover:shadow-brand-hover transition-all bg-white"
                  >
                    <div
                      onClick={() => handleEditClick(cat)}
                      className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                    >
                      <span
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                        className="text-2xl p-2 rounded-lg flex items-center justify-center"
                      >
                        {cat.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-brand-text truncate">{cat.name}</h4>
                        <span className="text-[10px] text-brand-text/50 font-bold uppercase tracking-wider">{cat.type}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-brand-coral hover:text-brand-coral/80 transition-colors p-2 text-sm font-semibold min-h-[44px] flex items-center"
                      title="Delete Category"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
