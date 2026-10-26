// Intelligent Indian Bank SMS Parser for UPI Credits

/**
 * Parse an incoming bank SMS and extract UTR, amount, and account info
 * Supports all major Indian banks: SBI, HDFC, ICICI, Axis, PNB, Bank of Baroda,
 * Canara, Union Bank, Paytm Payments Bank, Kotak, IDFC, IndusInd, etc.
 *
 * Typical SMS formats:
 * - "Dear Customer, Your A/c XXXX credited by Rs.150.00 on 26-Oct-26 by UPI/629810482910/MEXXZ/UPI..."
 * - "Rs. 150.00 received in your A/C XXXX via UPI Ref 629810482910 from MEXXZ..."
 * - "HDFC Bank: Rs 150.00 credited to a/c **1234 on 26-10-26 by UPI-629810482910..."
 * - "ICICI Bank: Acct XX123 credited with Rs 150.00 on 26-Oct. UPI: 629810482910..."
 */
export function parseBankSms(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const clean = text.trim();

  // 1. Credit Check: Ensure this is an incoming CREDIT SMS, NOT a debit!
  const isCredit = /(?:credited|credit|received|deposited|added to|cr\b|inward)/i.test(clean);
  const isDebit = /(?:debited|debit|sent to|dr\b|withdrawn|spent)/i.test(clean);

  if (isDebit && !isCredit) {
    return { error: 'Debit SMS detected. Only incoming credit SMS is accepted.' };
  }

  // 2. Extract Amount
  // Matches "Rs. 150.00", "Rs 150", "INR 150.00", "credited by Rs.150", "credit of Rs 150"
  let amount = null;
  const amountMatch = clean.match(/(?:(?:rs\.?|inr|credit(?:ed)?\s*(?:by|of)?\s*(?:rs\.?|inr)?)\s*[:\-]?\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i) ||
                      clean.match(/(?:(?:rs\.?|inr)\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i);

  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 3. Extract 12-digit UTR / RRN (Retrieval Reference Number)
  // Look for patterns like "UPI/629810482910", "UPI-629810482910", "Ref no 629810482910", "RRN 629810482910", "UPI: 629810482910"
  let utr = null;

  const utrPatterns = [
    /upi[\/:\-_]\s*(\d{12})\b/i,
    /(?:ref|rrn|txn|reference|utr)(?:\s*no\.?|\s*id|\s*number|\s*:|\s*#)?\s*[:\-]?\s*(\d{12})\b/i,
    /\bupi\b.*?(\d{12})\b/i,
    /\b(\d{12})\b/ // Fallback: any standalone 12-digit number in the SMS
  ];

  for (const pattern of utrPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      // Reject blacklisted dummy numbers
      if (!/^(0{12}|1{12}|2{12}|3{12}|4{12}|5{12}|6{12}|7{12}|8{12}|9{12}|123456789012)$/.test(match[1])) {
        utr = match[1];
        break;
      }
    }
  }

  if (!utr) {
    return { error: 'Could not extract a valid 12-digit UPI UTR from the SMS.' };
  }

  // 4. Try to identify bank sender
  let senderBank = 'Unknown Bank';
  const banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Canara', 'BOB', 'Kotak', 'Paytm', 'Union', 'IDFC'];
  for (const b of banks) {
    if (new RegExp(b, 'i').test(clean)) {
      senderBank = b.toUpperCase();
      break;
    }
  }

  return {
    success: true,
    utr,
    amount,
    senderBank,
    rawText: clean,
    parsedAt: new Date().toISOString()
  };
}
