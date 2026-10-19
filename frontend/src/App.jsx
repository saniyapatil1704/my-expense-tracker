
// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useTransaction } from "./context/TransactionContext";

// // Import the new pages and navbar
// import Navbar from "./components/Navbar";
// import BalancePage from "./components/BalancePage";
// import AddTransactionPage from "./components/AddTransactionPage";
// import HistoryPage from "./components/HistoryPage";
// import SignupPage from "./components/SignupPage";
// import LoginPage from "./components/LoginPage";
// import PrivateRoute from "./components/PrivateRoute";

// function App() {
//   const { loading } = useTransaction();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-2xl font-semibold text-gray-700">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <div style={{ overflow: "hidden" }}>
//         <Navbar />
//         <div className="mt-20">
//           <Routes>
//             <Route path="/signup" element={<SignupPage />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route
//               path="/"
//               element={
//                 <PrivateRoute>
//                   <BalancePage />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/add"
//               element={
//                 <PrivateRoute>
//                   <AddTransactionPage />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/history"
//               element={
//                 <PrivateRoute>
//                   <HistoryPage />
//                 </PrivateRoute>
//               }
//             />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;


// 18-04-2026
// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTransaction } from "./context/TransactionContext";

import Navbar from "./components/Navbar";
import BalancePage from "./components/BalancePage";
import AddTransactionPage from "./components/AddTransactionPage";
import HistoryPage from "./components/HistoryPage";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import CategoriesPage from "./components/CategoriesPage";

// Native UPI auto-detect enabled for Phase 2 notification listening pipeline.
const UPI_AUTO_DETECT_ENABLED = true;

// Handles UPI deep-link from notification tap
// Must be inside <Router> to use useLocation/useNavigate
function UPIDeepLinkHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setNotificationPrefill } = useTransaction();

  // ✅ Handle URL params (when app was closed)
  useEffect(() => {
    if (!UPI_AUTO_DETECT_ENABLED) return;
    const params = new URLSearchParams(location.search);
    const upiAmount = params.get('upi_amount');
    const upiDesc = params.get('upi_desc');
    const upiType = params.get('upi_type');
    const upiNotify = params.get('upi_notify');

    if (upiNotify === 'true' && upiAmount) {
      setNotificationPrefill({
        amount: upiAmount,
        description: decodeURIComponent(upiDesc || 'UPI Payment'),
        type: upiType || 'expense',
        category: 'UPI',
      });
      navigate('/add', { replace: true });
    }
  }, [location.search]);

  // ✅ NEW: Handle postMessage (when app was already open)
  useEffect(() => {
    if (!UPI_AUTO_DETECT_ENABLED) return;
    const handleMessage = (event) => {
      if (event.data?.type === 'UPI_NOTIFICATION_CLICKED') {
        console.log('UPI postMessage received:', event.data);
        setNotificationPrefill({
          amount: event.data.amount || '',
          description: event.data.description || 'UPI Payment',
          type: event.data.transactionType || 'expense',
          category: 'UPI',
        });
        navigate('/add', { replace: true });
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  // ✅ NEW: Handle Native Android SMS Broadcasts (from Capacitor Java)
  useEffect(() => {
    if (!UPI_AUTO_DETECT_ENABLED) return;
    const processSMS = (data) => {
      if (!data) return;
      console.log('[DIAG] UPIDeepLinkHandler.processSMS: prefill incoming=yes, navigating to /add');
      setNotificationPrefill({
        amount: data.amount,
        description: data.description || 'UPI Payment',
        type: data.type || 'expense',
        category: 'UPI',
      });
      navigate('/add', { replace: true });
      // Reset global value
      window.pendingUpiSMS = null;
    };

    // 1. Check if there was a pending SMS before React mounted
    if (window.pendingUpiSMS) {
      console.log('[DIAG] UPIDeepLinkHandler mount: window.pendingUpiSMS present=yes');
      processSMS(window.pendingUpiSMS);
    } else {
      console.log('[DIAG] UPIDeepLinkHandler mount: window.pendingUpiSMS present=no');
    }

    // 2. Listen for future events (when app is already running)
    const handleNativeSMS = (event) => {
      console.log('[DIAG] UPIDeepLinkHandler event: upi_sms_received received');
      processSMS(event.detail);
    };

    window.addEventListener('upi_sms_received', handleNativeSMS);
    return () => window.removeEventListener('upi_sms_received', handleNativeSMS);
  }, []);

  return null;
}

// Floating Action Button to Add Transaction
// Visible only on Dashboard (/) and History (/history)
function FloatingActionButton() {
  const location = useLocation();
  const showFab = location.pathname === '/' || location.pathname === '/history';

  if (!showFab) return null;

  return (
    <Link
      to="/add"
      className="fixed bottom-6 right-6 w-14 h-14 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-50 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
      aria-label="Add Transaction"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        className="w-7 h-7"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </Link>
  );
}

// ✅ FIX: Removed { loading } from useTransaction — it doesn't exist there
// Loading is handled by AuthContext internally already
function App() {
  return (
    <Router>
      <UPIDeepLinkHandler />
      <div style={{ overflow: "hidden" }}>
        <Navbar />
        <div className="mt-20">
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><BalancePage /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddTransactionPage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
      <FloatingActionButton />
    </Router>
  );
}

export default App;