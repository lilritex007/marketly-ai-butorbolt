import React, { useState } from 'react';
import { Share2, Copy, Check, Facebook, MessageCircle, Mail, Link2, X } from 'lucide-react';

/**
 * ProductShare - Share product via social media or copy link
 * Features: Native share API, social links, copy link, QR code
 */
const ProductShare = ({ 
  product, 
  variant = 'button' // 'button' | 'icons' | 'modal'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const shareUrl = product.link || window.location.href;
  const shareTitle = product.name;
  const shareText = `Nézd meg ezt a terméket: ${product.name} - ${(product.salePrice || product.price || 0).toLocaleString('hu-HU')} Ft`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowModal(true);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Messenger',
      icon: MessageCircle,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
      url: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  ];

  // Button variant - single button that opens native share or modal
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Megosztás</span>
        </button>

        {/* Modal */}
        {showModal && (
          <ShareModal
            product={product}
            shareLinks={shareLinks}
            shareUrl={shareUrl}
            copied={copied}
            onCopy={handleCopyLink}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Icons variant - row of social icons
  if (variant === 'icons') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Megosztás:</span>
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full text-white transition-all hover:scale-110 ${link.color}`}
            title={link.name}
          >
            <link.icon className="w-4 h-4" />
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          className={`p-2 rounded-full transition-all hover:scale-110 ${
            copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title="Link másolása"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return null;
};

// Share Modal Component
const ShareModal = ({ product, shareLinks, shareUrl, copied, onCopy, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Termék megosztása</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product preview */}
        <div className="p-5">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-5">
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-16 h-16 object-contain bg-white rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</p>
              <p className="text-indigo-600 font-bold">
                {(product.salePrice || product.price || 0).toLocaleString('hu-HU')} Ft
              </p>
            </div>
          </div>

          {/* Share options */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${link.color}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-600">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl overflow-hidden">
              <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 truncate">{shareUrl}</span>
            </div>
            <button
              onClick={onCopy}
              className={`px-4 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Másolva!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Másolás
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProductShare;
