import React from "react";
import { Link } from "react-router-dom";
import { useTransaction } from "../context/TransactionContext";
import { useCategory } from "../context/CategoryContext";
import { FaTrashAlt } from "react-icons/fa";
import apiClient from "../lib/apiClient";

const AttachmentButton = ({ url, type }) => {
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [blobUrl, setBlobUrl] = React.useState(null);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (blobUrl) {
      if (type === "pdf") {
        window.open(blobUrl, "_blank");
      } else {
        setShowModal(true);
      }
      return;
    }

    setLoading(true);
    try {
      const blob = await apiClient.request(url, { responseType: "blob" });
      const objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
      if (type === "pdf") {
        window.open(objectUrl, "_blank");
      } else {
        setShowModal(true);
      }
    } catch (err) {
      console.error("Failed to load attachment:", err);
      alert("Failed to load attachment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-brand-text/40 hover:text-brand-accent transition-colors p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-brand-bg/50 border border-brand-accent/5 hover:border-brand-accent/15"
        title="View Receipt"
      >
        {loading ? (
          <span className="text-xs animate-spin">⏳</span>
        ) : type === "pdf" ? (
          <span className="text-md">📄</span>
        ) : (
          <span className="text-md">🖼️</span>
        )}
      </button>

      {showModal && blobUrl && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-brand-bg rounded-2xl max-w-2xl w-full p-6 shadow-brand border border-brand-accent/10 relative animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-black text-brand-text">Receipt Attachment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center bg-white border border-brand-accent/15 rounded-xl p-4 overflow-hidden max-h-[70vh]">
              <img
                src={blobUrl}
                alt="Receipt Attachment"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <a
                href={blobUrl}
                download={`receipt-${url.split("/").pop()}`}
                className="px-4 py-2 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-brand hover:scale-[1.01] transition-all"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TransactionList = ({ limit }) => {
  const {
    transactions,
    deleteTransaction,
    filterType,
    setFilter,
    filterCategoryId,
    setFilterCategoryId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
  } = useTransaction();

  const { categories } = useCategory();

  // 1. Apply Filtering Logic based on filterType state
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "income") return t.type === "income";
    if (filterType === "expense") return t.type === "expense";
    return true; // 'all'
  });

  // 2. Apply Limit
  const transactionsToDisplay = limit
    ? filteredTransactions.slice(0, limit)
    : filteredTransactions;

  // Handle delete confirmation
  const handleDelete = (id, description) => {
    if (
      window.confirm(
        `Are you sure you want to delete transaction: "${description}"?`
      )
    ) {
      deleteTransaction(id);
    }
  };

  // Helper for filter button styling
  const getButtonClass = (type) =>
    `px-5 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center flex-grow sm:flex-initial ${
      filterType === type
        ? "bg-brand-accent text-white shadow-brand"
        : "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15"
    }`;

  // Render Skeleton Loaders if context is fetching data
  if (loading) {
    return (
      <section className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6 animate-pulse">
        <div className="h-7 w-48 bg-brand-text/10 rounded-lg mb-6"></div>
        {!limit && (
          <div className="flex gap-3 mb-6">
            <div className="h-10 w-16 bg-brand-text/10 rounded-lg"></div>
            <div className="h-10 w-20 bg-brand-text/10 rounded-lg"></div>
            <div className="h-10 w-20 bg-brand-text/10 rounded-lg"></div>
          </div>
        )}
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex justify-between items-center py-4 border-b border-brand-accent/5">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-brand-text/10 rounded-lg"></div>
                <div className="h-4 w-32 bg-brand-text/10 rounded-lg"></div>
              </div>
              <div className="h-6 w-24 bg-brand-text/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-card rounded-2xl shadow-brand border border-brand-accent/5 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif font-black text-brand-text">
          {limit ? "Recent Activity" : "All Transactions"}
        </h2>
        {limit && (
          <Link
            to="/history"
            className="text-sm font-bold text-brand-accent hover:underline flex items-center gap-1 transition-all"
          >
            See all &rarr;
          </Link>
        )}
      </div>

      {/* Main Grid: split sidebar vs list for History page on Desktop */}
      <div className={`grid grid-cols-1 ${!limit ? "lg:grid-cols-3 lg:gap-8" : ""}`}>
        
        {/* Filtering Column (Left Sidebar on Desktop, top block on mobile) */}
        {!limit && (
          <div className="lg:col-span-1 flex flex-col gap-6 mb-6 lg:mb-0 lg:border-r lg:pr-6 border-brand-accent/10">
            {/* Type Filter Buttons */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-text/50 uppercase tracking-wider">Type</span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={getButtonClass("all")}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("income")}
                  className={getButtonClass("income")}
                >
                  Income
                </button>
                <button
                  onClick={() => setFilter("expense")}
                  className={getButtonClass("expense")}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="w-full py-2.5 px-3 bg-brand-bg/40 border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all cursor-pointer min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-brand-bg/40 border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all cursor-pointer min-w-[160px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1.5">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-brand-bg/40 border border-brand-accent/15 rounded-xl text-sm text-brand-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all cursor-pointer min-w-[160px]"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filterType !== "all" || filterCategoryId || startDate || endDate) && (
              <button
                onClick={() => {
                  setFilter("all");
                  setFilterCategoryId("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full py-2.5 px-4 bg-brand-coral/10 hover:bg-brand-coral/15 text-brand-coral font-bold rounded-xl text-sm transition-all min-h-[44px]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* List Column (Right Side on Desktop, bottom block on mobile) */}
        <div className={!limit ? "lg:col-span-2" : ""}>
          {transactionsToDisplay.length > 0 ? (
            <ul className="divide-y divide-brand-accent/5">
              {transactionsToDisplay.map((transaction) => (
                <li
                  key={transaction.id}
                  className="py-3.5 flex justify-between items-center group hover:bg-brand-bg/40 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-brand-text font-bold truncate">
                      {transaction.description}{" "}
                      <span className="text-sm font-normal text-brand-text/65">
                        ({transaction.category?.name || "Other"})
                      </span>
                    </p>
                    <p className="text-xs text-brand-text/60 mt-0.5">
                      {transaction.date || transaction.createdAt
                        ? new Date(
                            transaction.date || transaction.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    {transaction.attachmentUrl && (
                      <AttachmentButton
                        url={transaction.attachmentUrl}
                        type={transaction.attachmentType}
                      />
                    )}

                    <span
                      className={`text-lg font-serif font-extrabold tabular-nums ${
                        transaction.type === "income"
                          ? "text-brand-sage"
                          : "text-brand-coral"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"} ₹
                      {Number(transaction.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={() =>
                        handleDelete(transaction.id, transaction.description)
                      }
                      className="text-brand-text/30 hover:text-brand-coral opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Delete Transaction"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 px-4 bg-brand-bg/50 rounded-xl border border-dashed border-brand-accent/20">
              <span className="text-4xl mb-3 block">🍂</span>
              <p className="text-brand-text/70 font-medium text-sm">
                {filterType === "all" &&
                !filterCategoryId &&
                !startDate &&
                !endDate
                  ? "Nothing here yet — add your first transaction to start tracking."
                  : "No matching transactions found. Try adjusting your filters."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransactionList;
