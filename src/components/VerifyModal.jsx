import React, { useState } from 'react';
import { 
  X, CheckCircle, ShieldCheck, Printer, ArrowRight, Loader2, 
  AlertTriangle, Check, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { verifyUtrWithObserver } from '../utils/paymentObserver';

export default function VerifyModal({ 
  isOpen, 
  onClose, 
  upiId, 
  amount, 
  note, 
  txRef, 
  isPaid, 
  onConfirmSuccess 
}) {
  const [utr, setUtr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    sounds.playSuccess();
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleManualVerify = async () => {
    setErrorMsg('');
    sounds.playClick();

    if (!utr || utr.trim().length === 0) {
      setErrorMsg('Please enter your 12-digit UPI Reference / UTR number.');
      return;
    }

    setVerifying(true);
    const result = await verifyUtrWithObserver(utr.trim(), amount, upiId);
    setVerifying(false);

    if (result.success) {
      setVerifiedData(result.record || { utr: utr.trim(), amount });
      onConfirmSuccess();
      triggerCelebration();
    } else {
      sounds.playBeep(300, 0.2, 'sawtooth');
      setErrorMsg(result.message);
    }
  };

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const handleCopyRef = () => {
    sounds.playClick();
    navigator.clipboard.writeText(txRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isPaid ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Verification</h3>
                <p className="text-xs text-slate-400">Mexxz Payment System · Bank Settlement Check</p>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pb-2 border-b border-slate-800">
                <span>Receiver: <strong className="text-emerald-400">{upiId}</strong></span>
                <span>Amount: <strong className="text-white">₹{amount ? parseFloat(amount).toFixed(2) : 'Open'}</strong></span>
              </div>
              <p className="leading-relaxed">
                Transactions are confirmed through official banking settlement channels. Enter the <strong>12-digit UTR</strong> from your Google Pay, PhonePe, Paytm, or BHIM transaction receipt below.
              </p>
            </div>

            {/* UTR Input Form */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    12-Digit Bank UTR / UPI Ref ID
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {utr.length}/12 digits
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 429188291039"
                  value={utr}
                  onChange={(e) => {
                    setUtr(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                  className={`w-full bg-slate-950/90 border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition ${
                    errorMsg ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-200">Verification Rejected</p>
                      <p className="leading-relaxed text-[11px] text-rose-300">{errorMsg}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleManualVerify}
                disabled={verifying}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying with Receiving Bank...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Verify Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Where to find UTR? Open your UPI app payment history → Tap transaction → Copy the 12-digit "UPI Ref No." or "UTR".
            </p>
          </div>
        ) : (
          /* Payment Receipt View */
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-slate-800">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Verified & Settled</h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">MEXXZ PAYMENT SYSTEM · VERIFIED INVOICE</p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>Transaction Ref:</span>
                <button
                  onClick={handleCopyRef}
                  className="flex items-center gap-1 text-slate-200 hover:text-white transition"
                  title="Copy Reference"
                >
                  <span>{txRef}</span>
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Receiver VPA:</span>
                <span className="text-emerald-400 font-bold">{upiId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bank UTR (RRN):</span>
                <span className="text-slate-100 font-bold tracking-wider">{verifiedData?.utr || utr}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Timestamp:</span>
                <span className="text-slate-300">{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Purpose / Note:</span>
                <span className="text-slate-200">{note || 'Payment Settlement'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>System Gateway:</span>
                <span className="text-cyan-400">Mexxz Payment System</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-sans">
                <span className="text-slate-300 font-medium">Total Paid:</span>
                <span className="text-xl font-bold text-emerald-400">
                  ₹ {amount ? parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '150.00'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print / Download Tax Receipt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
