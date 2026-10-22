import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle, Code, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function ShareModal({ isOpen, onClose, shareUrl, upiId, amount, note }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'embed'

  if (!isOpen) return null;

  const handleCopyLink = () => {
    sounds.playClick();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const embedCode = `<iframe src="${shareUrl}" width="420" height="680" frameborder="0" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></iframe>`;

  const handleCopyEmbed = () => {
    sounds.playClick();
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const shareText = `Hi! Please complete payment of ${amount ? `₹${amount}` : ''} via Mexxz Payment System (UPI: ${upiId})${note ? ` for "${note}"` : ''}.\nPayment Link: ${shareUrl}`;

  const handleWhatsAppShare = () => {
    sounds.playClick();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTelegramShare = () => {
    sounds.playClick();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Pay ${amount ? `₹${amount}` : ''} to ${upiId}`)}`, '_blank');
  };

  const handleTwitterShare = () => {
    sounds.playClick();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Pay ${amount ? `₹${amount}` : ''} securely via UPI direct: ${shareUrl}`)}`, '_blank');
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `UPI Payment to ${upiId}`,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Share Payment Request</h3>
            <p className="text-xs text-slate-400">Anyone with this link can pay directly to {upiId}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mt-4">
          <button
            onClick={() => setActiveTab('link')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'link' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Link & Social
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'embed' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HTML Embed Widget
          </button>
        </div>

        {activeTab === 'link' ? (
          <>
            {/* Payment Summary Pill */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">TARGET AMOUNT</span>
                <span className="text-base font-bold text-emerald-400">
                  {amount ? `₹ ${parseFloat(amount).toLocaleString('en-IN')}` : 'Open Amount'}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-mono">RECEIVING UPI ID</span>
                <span className="text-xs font-mono font-medium text-slate-300">{upiId}</span>
              </div>
            </div>

            {/* Copyable Link Input */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Direct Payment Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="mt-5">
              <span className="text-xs font-medium text-slate-400 block mb-2.5">Instant Channels</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-medium transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleTelegramShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] text-xs font-medium transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </button>

                <button
                  onClick={handleTwitterShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium transition cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X / Tweet</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>More Apps</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Embed code view */
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              Embed on any Website / Blog
            </label>
            <textarea
              readOnly
              rows={4}
              value={embedCode}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none resize-none"
            />
            <button
              onClick={handleCopyEmbed}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              {copiedEmbed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
