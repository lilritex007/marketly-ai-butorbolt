import React, { useState } from 'react';
import { Gift, Share2, Users, Heart, Copy, Check, ExternalLink, Calendar, Lock, Globe, Plus, Trash2, ShoppingCart, Sparkles } from 'lucide-react';

/**
 * GiftRegistry - Shareable wishlist for weddings, moving, etc.
 * Beautiful UI for creating and managing gift lists
 */
const GiftRegistry = ({ 
  items = [],
  onAddItem,
  onRemoveItem,
  onShare,
  userName = 'Felhasználó'
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [registryData, setRegistryData] = useState({
    title: '',
    occasion: 'wedding',
    date: '',
    privacy: 'public',
    message: ''
  });
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const occasions = [
    { id: 'wedding', label: 'Esküvő', icon: '💒', color: 'bg-pink-100 text-pink-700' },
    { id: 'moving', label: 'Költözés', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
    { id: 'baby', label: 'Babavárás', icon: '👶', color: 'bg-purple-100 text-purple-700' },
    { id: 'birthday', label: 'Születésnap', icon: '🎂', color: 'bg-amber-100 text-amber-700' },
    { id: 'other', label: 'Egyéb', icon: '🎁', color: 'bg-gray-100 text-gray-700' },
  ];

  // Mock existing registry
  const mockRegistry = {
    id: 'reg_abc123',
    title: 'Anna & Péter esküvője',
    occasion: 'wedding',
    date: '2025-06-15',
    privacy: 'public',
    message: 'Segítsetek berendezni közös otthonunkat! 🏠❤️',
    url: 'https://marketly.ai/gift/anna-peter',
    items: items.length ? items : [
      { id: 1, name: 'Kanapé - Skandináv', price: 189000, image: null, reserved: false, reservedBy: null },
      { id: 2, name: 'Étkezőasztal', price: 125000, image: null, reserved: true, reservedBy: 'Kovács család' },
      { id: 3, name: 'Állólámpa', price: 35000, image: null, reserved: false, reservedBy: null },
    ],
    stats: {
      views: 156,
      contributors: 8,
      totalValue: 349000,
      reservedValue: 125000
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockRegistry.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRegistry = (e) => {
    e.preventDefault();
    // Would create registry in real app
    setIsCreating(false);
  };

  const reservedPercentage = Math.round((mockRegistry.stats.reservedValue / mockRegistry.stats.totalValue) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-6 h-6" />
                <h3 className="font-bold text-xl">Ajándéklista</h3>
              </div>
              <p className="text-white/80 text-sm">Ossz meg egy kívánságlistát</p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Megosztás
            </button>
          </div>
        </div>
      </div>

      {/* Registry Info Card */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
            {occasions.find(o => o.id === mockRegistry.occasion)?.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">{mockRegistry.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date(mockRegistry.date).toLocaleDateString('hu-HU')}
            </div>
          </div>
        </div>
        
        {mockRegistry.message && (
          <p className="text-sm text-gray-600 italic mb-4">"{mockRegistry.message}"</p>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lefoglalt ajándékok</span>
            <span className="font-bold text-gray-900">{reservedPercentage}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${reservedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{mockRegistry.stats.reservedValue.toLocaleString()} Ft lefoglalva</span>
            <span>{mockRegistry.stats.totalValue.toLocaleString()} Ft összesen</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{mockRegistry.items.length}</div>
            <div className="text-xs text-gray-500">termék</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{mockRegistry.stats.views}</div>
            <div className="text-xs text-gray-500">megtekintés</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{mockRegistry.stats.contributors}</div>
            <div className="text-xs text-gray-500">ajándékozó</div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900 text-sm">Kívánságok ({mockRegistry.items.length})</h4>
          <button 
            onClick={onAddItem}
            className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            Hozzáadás
          </button>
        </div>

        <div className="space-y-3">
          {mockRegistry.items.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                item.reserved 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 text-sm truncate">{item.name}</h5>
                <p className="text-sm font-bold text-primary-600">{item.price.toLocaleString()} Ft</p>
                {item.reserved && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" />
                    Lefoglalva: {item.reservedBy}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!item.reserved && (
                  <button className="px-3 py-1.5 bg-pink-500 text-white text-xs font-medium rounded-lg hover:bg-pink-600 transition-colors">
                    Lefoglalom
                  </button>
                )}
                <button 
                  onClick={() => onRemoveItem?.(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {mockRegistry.items.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Még nincs termék a listán</p>
            <p className="text-sm text-gray-500 mt-1">Adj hozzá termékeket a kívánságlistádhoz</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Megosztás</h4>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <span className="sr-only">Bezárás</span>×
              </button>
            </div>

            {/* Copy Link */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1.5 block">Link másolása</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mockRegistry.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Facebook', icon: '📘', color: 'bg-blue-50 hover:bg-blue-100' },
                { name: 'WhatsApp', icon: '💬', color: 'bg-green-50 hover:bg-green-100' },
                { name: 'Email', icon: '📧', color: 'bg-gray-50 hover:bg-gray-100' },
              ].map(platform => (
                <button
                  key={platform.name}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl ${platform.color} transition-colors`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="text-xs text-gray-700">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRegistry;
