// Mexxz Payment System - Frontend API Client for YouPI-PG Observer Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Strict UTR Format Validator (NPCI 12-digit RRN)
export function validateUtrFormat(utr) {
  if (!utr || typeof utr !== 'string') {
    return { valid: false, error: 'UTR number cannot be empty.' };
  }

  const cleanUtr = utr.trim().replace(/\s+/g, '');

  if (!/^\d{12}$/.test(cleanUtr)) {
    return {
      valid: false,
      error: `Invalid UTR length. Bank UTR / UPI Reference must be exactly 12 numeric digits (you entered ${cleanUtr.length} digits).`
    };
  }

  // Reject obvious fake/dummy repeating sequences
  const blacklisted = [
    '000000000000',
    '111111111111',
    '222222222222',
    '333333333333',
    '444444444444',
    '555555555555',
    '666666666666',
    '777777777777',
    '888888888888',
    '999999999999',
    '123456789012',
    '012345678901',
    '987654321098'
  ];

  if (blacklisted.includes(cleanUtr)) {
    return {
      valid: false,
      error: 'Invalid test sequence. Please enter the authentic 12-digit UTR from your bank or UPI payment receipt.'
    };
  }

  return { valid: true, cleanUtr };
}

/**
 * Verify payment with the real YouPI-PG Backend Observer
 * Checks if the receiving phone has actually caught an incoming bank credit SMS!
 */
export async function verifyUtrWithObserver(utr, expectedAmount, vpa = 'mexxz@slc', note = '', txRef = '') {
  // Step 1: Client-side format validation
  const formatCheck = validateUtrFormat(utr);
  if (!formatCheck.valid) {
    return {
      success: false,
      code: 'INVALID_FORMAT',
      message: formatCheck.error
    };
  }

  const cleanUtr = formatCheck.cleanUtr;

  // Step 2: Query the YouPI-PG Backend Server
  try {
    const response = await fetch(`${API_BASE_URL}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        utr: cleanUtr,
        amount: expectedAmount ? parseFloat(expectedAmount) : 0,
        vpa: vpa || 'mexxz@slc',
        note,
        orderId: txRef
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        code: data.code || 'VERIFICATION_FAILED',
        message: data.error || 'Payment not detected. No bank notification received for this UTR.'
      };
    }

    return {
      success: true,
      code: 'VERIFIED',
      record: data.record,
      message: 'Payment confirmed and verified via Bank SMS Observer Mesh!'
    };
  } catch (err) {
    console.error('Failed to connect to Observer backend:', err);
    return {
      success: false,
      code: 'SERVER_OFFLINE',
      message: 'Could not connect to the Observer server. Please ensure the backend is running at http://localhost:3001.'
    };
  }
}

/**
 * Check backend observer health & connection status
 */
export async function checkObserverHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
    return { status: 'OFFLINE' };
  } catch {
    return { status: 'OFFLINE' };
  }
}
