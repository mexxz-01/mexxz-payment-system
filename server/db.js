import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'ledger.json');

// Ensure data folder and db file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  incomingCredits: [],
  orders: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading ledger database:', err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing ledger database:', err);
  }
}

export const db = {
  // Add an incoming credit received from SMS / Observer webhook
  addIncomingCredit(credit) {
    const data = readDb();
    // Check if duplicate UTR
    const existing = data.incomingCredits.find((c) => c.utr === credit.utr);
    if (existing) {
      return { alreadyExists: true, credit: existing };
    }

    const newCredit = {
      utr: credit.utr,
      amount: parseFloat(credit.amount) || 0,
      senderBank: credit.senderBank || 'BANK_SMS',
      rawText: credit.rawText || '',
      receivedAt: credit.receivedAt || new Date().toISOString(),
      matchedOrderId: null
    };

    data.incomingCredits.unshift(newCredit);
    writeDb(data);
    return { alreadyExists: false, credit: newCredit };
  },

  // Find incoming credit by 12-digit UTR
  findCreditByUtr(utr) {
    const data = readDb();
    return data.incomingCredits.find((c) => c.utr === utr.trim()) || null;
  },

  // Get all incoming credits
  getAllCredits() {
    return readDb().incomingCredits;
  },

  // Create an active checkout order
  createOrder(order) {
    const data = readDb();
    const newOrder = {
      orderId: order.orderId,
      amount: parseFloat(order.amount) || 0,
      vpa: order.vpa || 'mexxz@slc',
      note: order.note || '',
      status: 'PENDING',
      utr: null,
      createdAt: new Date().toISOString(),
      expiresAt: order.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };

    data.orders.unshift(newOrder);
    writeDb(data);
    return newOrder;
  },

  // Find order by ID
  findOrder(orderId) {
    const data = readDb();
    return data.orders.find((o) => o.orderId === orderId) || null;
  },

  // Mark order as SETTLED
  settleOrder(orderId, utr) {
    const data = readDb();
    const order = data.orders.find((o) => o.orderId === orderId);
    if (order) {
      order.status = 'SETTLED';
      order.utr = utr;
      order.settledAt = new Date().toISOString();
    }

    // Also mark the credit record as matched
    const credit = data.incomingCredits.find((c) => c.utr === utr);
    if (credit) {
      credit.matchedOrderId = orderId;
    }

    writeDb(data);
    return order;
  },

  // Get all orders
  getAllOrders() {
    return readDb().orders;
  }
};
