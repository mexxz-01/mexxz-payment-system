import React, { useState, useEffect, useMemo } from 'react';
import AnimatedLogo from './components/AnimatedLogo';
import QRCodeDisplay from './components/QRCodeDisplay';
import PaymentControls from './components/PaymentControls';
import ShareModal from './components/ShareModal';
import VerifyModal from './components/VerifyModal';
import { 
  ShieldCheck, Zap, Share2, ArrowRight, 
  Sparkles, CheckCircle2, Terminal, Copy, Check, Lock, Smartphone
} from 'lucide-react';
import { sounds } from './utils/audio';

export default function App() {
  // Query param parsing on initial load
  const [upiId, setUpiId] = useState('mexxz@slc');
  const [amount, setAmount] = useState('150');
  const [note, setNote] = useState('Project Payment');
  const [isPaid, setIsPaid] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Generate a unique transaction reference for this session
  const [txRef, setTxRef] = useState(() => 'MEXXZ-' + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    // Read URL Search Parameters if someone opens a shared payment link
    const params = new URLSearchParams(window.location.search);
    const queryUpi = params.get('upi');
    const queryAmount = params.get('amount') || params.get('am');
    const queryNote = params.get('note') || params.get('tn');

    if (queryUpi) setUpiId(queryUpi);
    if (queryAmount) setAmount(queryAmount);
    if (queryNote) setNote(decodeURIComponent(queryNote));
  }, []);

  // Standard NPCI UPI URI
  const upiUri = useMemo(() => {
    const merchantName = 'Mexxz Payment System';
    let uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&cu=INR`;
    if (amount && Number(amount) > 0) {
      uri += `&am=${parseFloat(amount).toFixed(2)}`;
    }
    if (note) {
      uri += `&tn=${encodeURIComponent(note)}`;
    }
    if (txRef) {
      uri += `&tr=${encodeURIComponent(txRef)}`;
    }
    return uri;
  }, [upiId, amount, note, txRef]);

  // Shareable Web URL for this exact payment configuration
  const shareUrl = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (upiId && upiId !== 'mexxz@slc') params.set('upi', upiId);
    if (amount) params.set('amount', amount);
    if (note) params.set('note', note);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [upiId, amount, note]);

  const handleReset = () => {
    sounds.playClick();
    setAmount('');
    setNote('');
    setIsPaid(false);
    setTxRef('MEXXZ-' + Math.floor(100000 + Math.random() * 900000));
  };

  const handleCopyVpa = () => {
    sounds.playClick();
    navigator.clipboard.writeText(upiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#05070f]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Animated Logo + Brand Name */}
          <div className="flex items-center gap-3.5">
            <AnimatedLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Mexxz Payment System
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Official Rail
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                NPCI Instant Settlement · Zero Aggregator Fees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct VPA Badge with copy */}
            <button
              onClick={handleCopyVpa}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs transition cursor-pointer"
              title="Click to copy UPI ID"
            >
              <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-slate-400 hidden sm:inline">UPI VPA:</span>
              <span className="font-mono text-emerald-300 font-semibold">{upiId}</span>
              {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Share Link Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsShareModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-xs font-bold text-slate-950 shadow-md shadow-emerald-950 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        
        {/* Sleek Fintech Status & Merchant Banner */}
        <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/70 text-xs">
                <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="text-slate-200 font-semibold">Mexxz Instant Rail</span>
                <span className="text-emerald-400 font-mono">100% Direct P2B</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pay directly to <span className="text-gradient">{upiId}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Seamless peer-to-bank settlements for <strong className="text-white">Mexxz Payment System</strong>. Scan the dynamic QR code or launch Google Pay, PhonePe, and Paytm with instantaneous verification.
              </p>
            </div>

            {/* Live Amount Box */}
            <div className="bg-slate-950/85 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-center min-w-[220px]">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Amount Payable</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 flex items-baseline gap-1">
                <span className="text-emerald-400 text-2xl font-bold">₹</span>
                <span>{amount ? parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'Open'}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Session Ref:</span>
                <span className="text-slate-300">{txRef}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Config Controls & Dynamic QR Terminal */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <PaymentControls
              amount={amount}
              setAmount={setAmount}
              note={note}
              setNote={setNote}
              upiId={upiId}
              setUpiId={setUpiId}
              onReset={handleReset}
            />

            {/* Architecture Highlights */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Mexxz Payment System Architecture</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Intermediary Commissions:</strong> Funds go directly to your designated bank account without aggregator holding periods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Strict UTR Settlement Validation:</strong> Enforces authentic 12-digit bank reference checks before issuing certified tax receipts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Share Links:</strong> Create one-click customized payment links with pre-set amounts for clients and customers.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Dynamic QR Terminal & Direct Pay (7 cols) */}
          <div className="lg:col-span-7">
            <QRCodeDisplay
              upiUri={upiUri}
              upiId={upiId}
              amount={amount}
              note={note}
              txRef={txRef}
              isPaid={isPaid}
              onOpenShare={() => setIsShareModalOpen(true)}
              onVerifyPayment={() => setIsVerifyModalOpen(true)}
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 mt-8 bg-[#04060c] text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <span className="font-semibold text-slate-200">Mexxz Payment System</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-mono">{upiId}</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-400">
            <span className="flex items-center gap-1.5 text-[11px] font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NPCI Direct UPI Protocol · 256-Bit Encrypted
            </span>
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        upiId={upiId}
        amount={amount}
        note={note}
      />

      {/* Verification & Receipt Modal */}
      <VerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        upiId={upiId}
        amount={amount}
        note={note}
        txRef={txRef}
        isPaid={isPaid}
        onConfirmSuccess={() => {
          setIsPaid(true);
        }}
      />
    </div>
  );
}
