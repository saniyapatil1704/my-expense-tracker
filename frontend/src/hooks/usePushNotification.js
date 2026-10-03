import { useState } from 'react';

export function usePushNotification() {
  const [token] = useState(null);
  const [permission] = useState('denied');
  const [inAppMessage] = useState(null);
  const [loading] = useState(false);
  const [error] = useState('UPI auto-detect is temporarily unavailable');

  const requestPermission = async () => {};

  return { token, permission, inAppMessage, loading, error, requestPermission };
}