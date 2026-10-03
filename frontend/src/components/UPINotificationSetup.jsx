// // src/components/UPINotificationSetup.jsx
// import React, { useEffect } from 'react';
// import { usePushNotification } from '../hooks/usePushNotification';
// import { useTransaction } from '../context/TransactionContext';
// import { parseUPISMS } from '../utils/upiParser';

// const UPINotificationSetup = () => {
//   const { permission, inAppMessage, loading, error, requestPermission } =
//     usePushNotification();
//   const { handleQuickAdd } = useTransaction();

//   // When a foreground UPI notification arrives, show a banner
//   useEffect(() => {
//     if (!inAppMessage) return;

//     const data = inAppMessage.data || {};
//     const smsText = data.smsText || '';
//     const parsed = parseUPISMS(smsText);

//     if (parsed) {
//       const confirmed = window.confirm(
//         `💳 UPI Transaction Detected!\n\nAmount: ₹${parsed.amount}\nTo: ${parsed.description}\n\nAdd this to Daily Balance?`
//       );
//       if (confirmed) {
//         const finalAmount =
//           parsed.type === 'expense'
//             ? -Math.abs(parsed.amount)
//             : Math.abs(parsed.amount);
//         handleQuickAdd(
//           finalAmount,
//           parsed.description,
//           'UPI',
//           parsed.type
//         );
//       }
//     }
//   }, [inAppMessage]);

//   // Already granted
// // Add this inside the 'granted' return block temporarily
// if (permission === 'granted') {
//   return (
//     <div>
//       <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
//         <span>🔔</span>
//         <span>UPI Notifications Active</span>
//       </div>
//       {token && (
//         <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all">
//           <strong>Token f01vT4nobl_F5VFJyhiMvR:APA91bEyKu6V_Bc9hdwZTLV4cVNEGjbsm1fZpMbgQ88bnVNeZGG3j1J_4BvKjuute7yOJw9f4uYCgz87y8aUALpDyHrYSW58_5LkSGwz-6ejjaPDUZ4vt8w:</strong> {token}
//         </div>
//       )}
//     </div>
//   );
// }

//   // Denied
//   if (permission === 'denied') {
//     return (
//       <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">
//         <span>🔕</span>
//         <span>Notifications blocked. Enable in browser settings.</span>
//       </div>
//     );
//   }

//   // Default — show enable button
//   return (
//     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//       <div className="flex items-start gap-3">
//         <span className="text-2xl">📲</span>
//         <div className="flex-1">
//           <h3 className="font-semibold text-blue-800 text-sm">
//             Auto-detect UPI Payments
//           </h3>
//           <p className="text-blue-600 text-xs mt-1">
//             Get notified when you make a UPI payment and log it instantly.
//           </p>
//           {error && (
//             <p className="text-red-500 text-xs mt-1">⚠️ {error}</p>
//           )}
//         </div>
//         <button
//           onClick={requestPermission}
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
//         >
//           {loading ? 'Setting up...' : 'Enable'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UPINotificationSetup;

// src/components/UPINotificationSetup.jsx
import React, { useEffect } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { useTransaction } from '../context/TransactionContext';
import { parseUPISMS } from '../utils/upiParser';

const UPINotificationSetup = () => {
  const { permission, inAppMessage, loading, error, requestPermission, token } =
    usePushNotification(); // ✅ added token here
  const { handleQuickAdd } = useTransaction();

  useEffect(() => {
    if (!inAppMessage) return;
    const data = inAppMessage.data || {};
    const smsText = data.smsText || '';
    const parsed = parseUPISMS(smsText);
    if (parsed) {
      const confirmed = window.confirm(
        `💳 UPI Transaction Detected!\n\nAmount: ₹${parsed.amount}\nTo: ${parsed.description}\n\nAdd this to Daily Balance?`
      );
      if (confirmed) {
        const finalAmount = parsed.type === 'expense'
          ? -Math.abs(parsed.amount)
          : Math.abs(parsed.amount);
        handleQuickAdd(finalAmount, parsed.description, 'UPI', parsed.type);
      }
    }
  }, [inAppMessage]);

  // Phase 1: Fully dormant, do not show banners to the user
  return null;

  if (permission === 'granted') {
    return (
      <div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
          <span>🔔</span>
          <span>UPI Notifications Active</span>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">
        <span>🔕</span>
        <span>Notifications blocked. Enable in browser settings.</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📲</span>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 text-sm">
            Auto-detect UPI Payments
          </h3>
          <p className="text-blue-600 text-xs mt-1">
            Get notified when you make a UPI payment and log it instantly.
          </p>
          {error && <p className="text-red-500 text-xs mt-1">⚠️ {error}</p>}
        </div>
        <button
          onClick={requestPermission}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
        >
          {loading ? 'Setting up...' : 'Enable'}
        </button>
      </div>
    </div>
  );
};

export default UPINotificationSetup;