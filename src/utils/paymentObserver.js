// YouPI-PG Banking Observer & Settlement Verification Engine

const LEDGER_KEY = 'youpi_pg_ledger';

// Helper to get verified ledger from storage
export function getLedger() {
  try {
    const data = localStorage.getItem(LEDGER_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Helper to save ledger
function saveLedger(ledger) {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  } catch (e) {
    console.error('Failed to save ledger', e);
  }
}

// Strict UTR Format Validator (NPCI 12-digit RRN)
export function validateUtrFormat(utr) {
  if (!utr || typeof utr !== 'string') {
    return { valid: false, error: 'UTR number cannot be empty.' };
  }

  const cleanUtr = utr.trim();

  if (!/^\d{12}$/.test(cleanUtr)) {
    return {
      valid: false,
      error: `Invalid UTR length. Bank UTR / UPI Ref must be exactly 12 numeric digits (you entered ${cleanUtr.length} digits).`
    };
  }

  // Reject obvious fake/dummy sequences
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
      error: 'Invalid test sequence. Please enter the actual 12-digit UTR from your UPI payment receipt.'
    };
  }

  return { valid: true, cleanUtr };
}

/**
 * Verify if an incoming payment exists on the merchant's bank account
 * @param {string} utr - The 12-digit UTR number entered
 * @param {number|string} expectedAmount - Expected amount in INR
 * @param {string} vpa - Receiver UPI VPA (e.g., mexxz@slc)
 */
export async function verifyUtrWithObserver(utr, expectedAmount, vpa = 'mexxz@slc') {
  // Simulate network verification delay to the observer server
  await new Promise((res) => setTimeout(res, 1200));

  // Step 1: Format validation
  const formatCheck = validateUtrFormat(utr);
  if (!formatCheck.valid) {
    return {
      success: false,
      code: 'INVALID_FORMAT',
      message: formatCheck.error
    };
  }

  const cleanUtr = formatCheck.cleanUtr;
  const ledger = getLedger();

  // Step 2: Check if this UTR has been logged by the merchant's observer
  const matchedRecord = ledger.find(
    (record) => record.utr === cleanUtr && record.vpa.toLowerCase() === vpa.toLowerCase()
  );

  if (!matchedRecord) {
    return {
      success: false,
      code: 'PAYMENT_NOT_FOUND',
      message: `No incoming payment credit found on ${vpa} for UTR "${cleanUtr}". If you have not paid yet, please complete the payment via GPay, PhonePe, or Paytm first.`
    };
  }

  // Step 3: Check if amount matches (if expected amount is specified)
  if (expectedAmount && Number(expectedAmount) > 0) {
    const numExpected = parseFloat(expectedAmount);
    const numActual = parseFloat(matchedRecord.amount);
    if (Math.abs(numExpected - numActual) > 0.01) {
      return {
        success: false,
        code: 'AMOUNT_MISMATCH',
        message: `Amount mismatch: UTR "${cleanUtr}" was for ₹${numActual.toFixed(2)}, but this invoice is for ₹${numExpected.toFixed(2)}.`
      };
    }
  }

  return {
    success: true,
    code: 'VERIFIED',
    record: matchedRecord,
    message: 'Payment successfully verified via Bank Observer Mesh.'
  };
}

/**
 * Register an incoming payment in the bank ledger
 * (Simulates the Merchant's Android phone observer or webhook catching a bank SMS)
 */
export function recordIncomingPayment({ utr, amount, vpa = 'mexxz@slc', note = '', sender = 'UPI Customer' }) {
  const ledger = getLedger();

  // Avoid duplicates
  const existing = ledger.find((r) => r.utr === utr);
  if (existing) return existing;

  const newRecord = {
    utr,
    amount: parseFloat(amount || 0),
    vpa,
    note,
    sender,
    timestamp: new Date().toISOString()
  };

  ledger.unshift(newRecord);
  saveLedger(ledger);
  return newRecord;
}
