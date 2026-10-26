import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseBankSms } from './smsParser.js';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OBSERVER_SECRET = process.env.OBSERVER_SECRET || 'mexxz_observer_secret_key_2026';

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  const credits = db.getAllCredits();
  const orders = db.getAllOrders();
  res.json({
    status: 'ONLINE',
    service: 'Mexxz Payment System Observer Backend',
    vpa: 'mexxz@slc',
    totalCreditsLogged: credits.length,
    totalOrders: orders.length,
    lastCreditAt: credits[0]?.receivedAt || null
  });
});

/**
 * 1. OBSERVER WEBHOOK
 * Called by the merchant's Android SMS forwarder app or webhook
 * when a bank credit SMS arrives on the merchant's phone.
 */
app.post('/api/observer/webhook', (req, res) => {
  // Check secret key
  const authHeader = req.headers['x-observer-secret'] || req.query.secret || req.body.secret;
  if (authHeader && authHeader !== OBSERVER_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid observer secret key.' });
  }

  // Handle both raw SMS string or structured JSON payload
  const rawSms = req.body.sms || req.body.message || req.body.text || req.body.body || (typeof req.body === 'string' ? req.body : null);
  let utr = req.body.utr;
  let amount = req.body.amount;
  let senderBank = req.body.sender || req.body.bank || 'SMS_OBSERVER';

  if (rawSms) {
    const parsed = parseBankSms(rawSms);
    if (!parsed || parsed.error) {
      return res.status(400).json({
        success: false,
        error: parsed?.error || 'Failed to parse bank credit SMS.'
      });
    }
    utr = parsed.utr;
    amount = parsed.amount || amount;
    senderBank = parsed.senderBank || senderBank;
  }

  if (!utr || !/^\d{12}$/.test(utr)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid UTR. A valid 12-digit numeric UTR/RRN is required.'
    });
  }

  const result = db.addIncomingCredit({
    utr,
    amount: amount || 0,
    senderBank,
    rawText: rawSms || `Manual credit for UTR ${utr}`
  });

  console.log(`[Observer Webhook] Bank Credit Logged! UTR: ${utr}, Amount: ₹${amount}, Bank: ${senderBank}`);

  return res.json({
    success: true,
    message: result.alreadyExists ? 'Credit was already logged.' : 'Bank credit successfully logged into merchant ledger.',
    credit: result.credit
  });
});

/**
 * 2. CREATE PAYMENT ORDER
 * Frontend calls this when initiating a checkout session
 */
app.post('/api/payment/create-order', (req, res) => {
  const { amount, note, vpa } = req.body;
  const orderId = 'MEXXZ-ORD-' + Math.floor(100000 + Math.random() * 900000);

  const order = db.createOrder({
    orderId,
    amount: amount ? parseFloat(amount) : 0,
    vpa: vpa || 'mexxz@slc',
    note: note || 'Direct UPI Payment',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  });

  res.json({
    success: true,
    order
  });
});

/**
 * 3. STRICT PAYMENT VERIFICATION
 * The payer enters their 12-digit UTR on the website.
 * The server queries the database:
 * DID THE OBSERVER ACTUALLY RECEIVE A BANK SMS FOR THIS UTR?
 */
app.post('/api/payment/verify', (req, res) => {
  const { utr, amount, orderId, vpa } = req.body;

  if (!utr || typeof utr !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'UTR number cannot be empty.'
    });
  }

  const cleanUtr = utr.trim().replace(/\s+/g, '');

  if (!/^\d{12}$/.test(cleanUtr)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid UTR format. Bank UTR / UPI Ref must be exactly 12 numeric digits.'
    });
  }

  // Reject dummy blacklisted numbers immediately
  if (/^(0{12}|1{12}|2{12}|3{12}|4{12}|5{12}|6{12}|7{12}|8{12}|9{12}|123456789012)$/.test(cleanUtr)) {
    return res.status(400).json({
      success: false,
      error: 'Verification rejected: Invalid test sequence.'
    });
  }

  // QUERY OBSERVER DATABASE
  const creditRecord = db.findCreditByUtr(cleanUtr);

  // IF NO BANK CREDIT SMS EXISTS IN THE DATABASE -> STRICTLY REJECT!
  if (!creditRecord) {
    return res.status(404).json({
      success: false,
      code: 'BANK_CREDIT_NOT_FOUND',
      error: `Payment not detected. No incoming bank credit SMS has been received on mexxz@slc for UTR "${cleanUtr}". If you just paid, please ensure the transaction shows "SUCCESS" on your UPI app and wait 30-60 seconds for the bank notification.`
    });
  }

  // Optional: check amount match if amount was specified
  if (amount && Number(amount) > 0 && creditRecord.amount > 0) {
    const expected = parseFloat(amount);
    const actual = parseFloat(creditRecord.amount);
    if (Math.abs(expected - actual) > 0.01) {
      return res.status(400).json({
        success: false,
        code: 'AMOUNT_MISMATCH',
        error: `Amount mismatch: Bank SMS indicates credit of ₹${actual.toFixed(2)}, but this invoice expected ₹${expected.toFixed(2)}.`
      });
    }
  }

  // Settle the order
  const settledOrder = orderId ? db.settleOrder(orderId, cleanUtr) : null;

  return res.json({
    success: true,
    verified: true,
    record: {
      utr: cleanUtr,
      amount: creditRecord.amount || (amount ? parseFloat(amount) : 0),
      vpa: vpa || 'mexxz@slc',
      senderBank: creditRecord.senderBank,
      status: 'VERIFIED_SETTLED',
      settlementRail: 'YouPI-PG Bank SMS Observer Mesh',
      timestamp: creditRecord.receivedAt || new Date().toISOString()
    }
  });
});

/**
 * 4. ADMIN DASHBOARD DATA
 * View all verified orders and incoming bank SMS records
 */
app.get('/api/admin/ledger', (req, res) => {
  const credits = db.getAllCredits();
  const orders = db.getAllOrders();
  res.json({
    success: true,
    credits,
    orders
  });
});

/**
 * 5. SIMULATE BANK SMS (For Merchant Testing)
 * Allows the merchant to test what happens when an incoming bank SMS arrives
 */
app.post('/api/admin/simulate-sms', (req, res) => {
  const { amount = 150, utr } = req.body;
  const testUtr = utr || ('6298' + Math.floor(10000000 + Math.random() * 90000000));
  const testSms = `Dear Customer, Your A/c XXXX credited by Rs.${parseFloat(amount).toFixed(2)} on ${new Date().toLocaleDateString('en-IN')} by UPI/${testUtr}/MEXXZ/UPI.`;

  const parsed = parseBankSms(testSms);
  const result = db.addIncomingCredit({
    utr: parsed.utr,
    amount: parsed.amount,
    senderBank: parsed.senderBank,
    rawText: testSms
  });

  res.json({
    success: true,
    message: 'Test bank SMS registered into observer ledger!',
    simulatedSms: testSms,
    utr: testUtr,
    amount: parsed.amount,
    credit: result.credit
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Mexxz Payment System] YouPI-PG Backend running on port ${PORT}`);
  console.log(`[Webhook URL] http://localhost:${PORT}/api/observer/webhook`);
});
