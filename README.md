# ⚡ Mexxz Payment System

A professional, enterprise-grade **Instant UPI Payment Terminal & Direct Settlement Engine** built for **`mexxz@slc`**.

---

## 🌟 Key Features

- **Mexxz Animated Brand Identity**:
  - Animated glowing SVG cybernetic badge with dynamic gradient stroke pulsation.
  - Dark glassmorphism fintech aesthetic tailored for high conversions.

- **Direct Peer-to-Bank (P2B) Settlement**:
  - Direct settlement to `mexxz@slc` via NPCI Unified Payments Interface rails.
  - Zero intermediary aggregator deductions (no 2% + GST fee cut).

- **Dynamic High-Resolution QR Generator**:
  - Compliant with standard NPCI UPI URI specification (`upi://pay?pa=mexxz@slc&pn=Mexxz+Payment+System&cu=INR...`).
  - Animated scanline indicator and live 10-minute session countdown.
  - One-click high-res PNG QR code download.
  - One-click copy for the receiver VPA (`mexxz@slc`).

- **Universal Shareable Payment Links**:
  - Generates custom URL query parameters (e.g. `?amount=500&note=Design&upi=mexxz@slc`).
  - Automatically loads customized payment requests for payers.
  - Instant sharing via **WhatsApp**, **Telegram**, **X / Tweet**, and mobile native sheet.
  - Embeddable HTML `<iframe>` widget for external checkout sites.

- **Mobile Direct 1-Tap UPI Launchers**:
  - Instant deep-links for **Google Pay**, **PhonePe**, **Paytm**, and **CRED / BHIM**.

- **Bank Settlement Verification**:
  - Strict 12-digit numeric NPCI UTR validation (rejects invalid/dummy strings).
  - Verifies incoming credits on bank ledger before issuing verified tax/payment receipts.
  - Printable and downloadable digital payment receipts.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mexxz-01/mexxz-payment-system.git

# Navigate to project
cd mexxz-payment-system

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🛠️ Tech Stack
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Glassmorphic Dark UI)
- **Icons & FX:** Lucide React, Canvas Confetti, Web Audio API
- **QR Generation:** High-resolution vector QRCode canvas

---
*Developed for Mexxz Payment System · All Rights Reserved.*
