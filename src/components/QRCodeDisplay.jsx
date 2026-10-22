import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, Check, Download, ExternalLink, RefreshCw, Smartphone, 
  ShieldCheck, AlertCircle, Sparkles, Share2
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function QRCodeDisplay({ 
  upiUri, 
  upiId, 
  amount, 
  note, 
  txRef,
  onOpenShare,
  onVerifyPayment,
  isPaid
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes session

  // Render QR Code onto canvas
  useEffect(() => {
    if (canvasRef.current && upiUri) {
      QRCode.toCanvas(
        canvasRef.current,
        upiUri,
        {
          width: 260,
          margin: 1.5,
          color: {
            dark: '#030712',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) console.error('QR code generation failed:', error);
        }
      );
    }
  }, [upiUri]);

  // Session timer countdown
  useEffect(() => {
    if (isPaid) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaid]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUPI = () => {
    sounds.playClick();
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    sounds.playClick();
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `UPI-QR-${txRef}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Direct app payment links for mobile
  const apps = [
    { name: 'Google Pay', icon: '⚡', scheme: upiUri, color: 'hover:border-blue-500' },
    { name: 'PhonePe', icon: '🟣', scheme: upiUri, color: 'hover:border-purple-500' },
    { name: 'Paytm', icon: '🔵', scheme: upiUri, color: 'hover:border-cyan-500' },
    { name: 'CRED / BHIM', icon: '💎', scheme: upiUri, color: 'hover:border-emerald-500' }
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with session timer */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaid ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaid ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            {isPaid ? 'Payment Confirmed' : 'Dynamic UPI Slot'}
          </span>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700/60 text-slate-400 flex items-center gap-1.5">
          <span>Expires in:</span>
          <span className={timeLeft < 120 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* QR Code Container with cyberpunk framing */}
      <div className="relative group p-3 bg-white rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.01]">
        {/* Subtle decorative corners */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-sm pointer-events-none" />

        <div className="relative overflow-hidden rounded-xl">
          <canvas ref={canvasRef} className="block w-[240px] h-[240px] md:w-[260px] md:h-[260px]" />
          
          {/* Animated scanline while waiting for payment */}
          {!isPaid && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scanline-bar shadow-[0_0_12px_#34d399] pointer-events-none" />
          )}

          {/* Paid overlay checkmark */}
          {isPaid && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-400 animate-fadeIn">
              <ShieldCheck className="w-16 h-16 mb-2 animate-bounce text-emerald-400" />
              <span className="font-bold text-lg text-white">Payment Received!</span>
              <span className="text-xs text-emerald-300 mt-1 font-mono">UTR Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount and UPI Target Display */}
      <div className="mt-5 text-center">
        <div className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
          <span className="text-emerald-400 text-2xl">₹</span>
          <span>{amount ? parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'Any Amount'}</span>
        </div>
        {note && (
          <p className="text-xs text-slate-400 mt-1 max-w-[260px] truncate mx-auto">
            Note: <span className="text-slate-200 font-medium">{note}</span>
          </p>
        )}
      </div>

      {/* Copy UPI ID Pill */}
      <div className="mt-4 w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col text-left pl-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Receiver VPA</span>
          <span className="text-xs font-mono font-medium text-emerald-300 select-all">{upiId}</span>
        </div>
        <button
          onClick={handleCopyUPI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Action Buttons: Share Link & Download QR */}
      <div className="grid grid-cols-2 gap-3 w-full mt-4">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenShare();
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/20 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Link</span>
        </button>

        <button
          onClick={handleDownloadQR}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Save QR</span>
        </button>
      </div>

      {/* Mobile Pay App Launcher */}
      <div className="w-full mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            Direct Pay on Mobile
          </span>
          <span className="text-[10px] text-slate-400 font-mono">0% Platform Fee</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.scheme}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300 transition-all ${app.color} hover:bg-slate-800/80`}
              title={`Pay with ${app.name}`}
            >
              <span className="text-base mb-0.5">{app.icon}</span>
              <span className="text-[10px] truncate max-w-full">{app.name.split(' ')[0]}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Payment Verification / Observer status button */}
      <button
        onClick={() => {
          sounds.playClick();
          onVerifyPayment();
        }}
        className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isPaid ? 'View Payment Receipt' : 'I Have Paid (Verify)'}</span>
      </button>

      {/* Micro footer disclaimer */}
      <p className="text-[10px] text-slate-400 mt-3 text-center">
        Transactions route directly to <span className="text-slate-400">{upiId}</span> via NPCI UPI protocol.
      </p>
    </div>
  );
}
