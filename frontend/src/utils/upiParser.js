// src/utils/upiParser.js

/**
 * Parses UPI transaction SMS text and extracts amount + description
 * Covers: GPay, PhonePe, Paytm, HDFC, SBI, ICICI, Axis common formats
 */
export function parseUPISMS(smsText) {
  if (!smsText) return null;

  // Amount patterns: Rs.500, INR 500, ₹500, Rs 500.00
  const amountPatterns = [
    /(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?)/i,
    /(\d+(?:\.\d{1,2})?)\s*(?:Rs\.?|INR|₹)/i,
  ];

  let amount = null;
  for (const pattern of amountPatterns) {
    const match = smsText.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      break;
    }
  }

  if (!amount) return null;

  // Merchant / receiver name patterns
  const merchantPatterns = [
    /(?:to|paid to|sent to|transferred to)\s+([A-Za-z0-9\s&._-]{2,30}?)(?:\s+on|\s+via|\s+using|\.|$)/i,
    /(?:at|@)\s+([A-Za-z0-9\s&._-]{2,30}?)(?:\s+on|\s+via|\.|$)/i,
    /UPI\s*[:-]\s*([A-Za-z0-9\s&._-]{2,30}?)(?:\s+on|\s+via|\.|$)/i,
  ];

  let merchant = 'UPI Payment';
  for (const pattern of merchantPatterns) {
    const match = smsText.match(pattern);
    if (match) {
      merchant = match[1].trim();
      break;
    }
  }

  const lowerText = smsText.toLowerCase();
  // Filter out non-transactional/spam/OTP/reminder words
  if (
    lowerText.includes('otp') ||
    lowerText.includes('verification code') ||
    lowerText.includes('due') ||
    lowerText.includes('bill') ||
    lowerText.includes('will be debited') ||
    lowerText.includes('request') ||
    lowerText.includes('requested') ||
    lowerText.includes('failed') ||
    lowerText.includes('declined') ||
    lowerText.includes('insufficient')
  ) {
    return null;
  }

  // Determine if it's a debit (expense) or credit (income)
  const isDebit = /debited|spent|paid|sent|transferred|withdrawn/i.test(smsText);
  const isCredit = /credited|received|added/i.test(smsText);

  if (!isDebit && !isCredit) {
    return null;
  }

  let type = 'expense';
  if (isDebit && isCredit) {
    if (lowerText.includes('credited to') || lowerText.includes('received from')) {
      type = 'income';
    } else {
      type = 'expense';
    }
  } else {
    type = isDebit ? 'expense' : 'income';
  }

  return {
    amount,
    description: merchant,
    type,
    category: 'UPI',
    rawSMS: smsText,
  };
}