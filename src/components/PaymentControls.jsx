import React from 'react';
import { IndianRupee, MessageSquare, Shield, Lock, Unlock, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function PaymentControls({
  amount,
  setAmount,
  note,
  setNote,
  upiId,
  setUpiId,
  onReset
}) {
  const quickAmounts = ['50', '100', '250', '500', '1000', '2500'];
  const [isUpiEditable, setIsUpiEditable] = React.useState(false);

  const handleQuickAmount = (val) => {
    sounds.playClick();
    setAmount(val);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Target UPI ID Section */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Receiver UPI ID (VPA)
          </label>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsUpiEditable(!isUpiEditable);
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
          >
            {isUpiEditable ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {isUpiEditable ? 'Lock ID' : 'Edit ID'}
          </button>
        </div>
        <input
          type="text"
          value={upiId}
          disabled={!isUpiEditable}
          onChange={(e) => setUpiId(e.target.value.trim())}
          className={`w-full rounded-xl px-4 py-2.5 text-xs font-mono border transition ${
            isUpiEditable
              ? 'bg-slate-900 border-cyan-500/80 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500'
              : 'bg-slate-950/70 border-slate-800 text-emerald-300 cursor-not-allowed'
          }`}
          placeholder="e.g. mexxz@slc"
        />
      </div>

      {/* Amount Section */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Payment Amount (INR ₹)
          </label>
          {amount && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setAmount('');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear Amount
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Enter custom amount or leave open"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Quick Amount Pills */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {quickAmounts.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAmount(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                amount === val
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              + ₹{val}
            </button>
          ))}
        </div>
      </div>

      {/* Note / Purpose Section */}
      <div>
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          Payment Purpose / Remark
        </label>
        <input
          type="text"
          placeholder="e.g. Freelance Invoice, Tip, Coffee"
          value={note}
          maxLength={50}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Form</span>
        </button>
      </div>
    </div>
  );
}
