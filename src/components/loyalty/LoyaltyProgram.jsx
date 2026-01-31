import React, { useState } from 'react';
import { Crown, Star, Gift, Zap, TrendingUp, Award, Lock, Check, ChevronRight, Sparkles, Trophy, Target } from 'lucide-react';

/**
 * LoyaltyProgram - Points collection and tier system UI
 * Beautiful visualization with progress tracking and rewards
 */
const LoyaltyProgram = ({ 
  currentPoints = 2450,
  totalSpent = 485000,
  memberSince = '2024-03-15',
  tier = 'silver', // 'bronze' | 'silver' | 'gold' | 'platinum'
  onViewRewards,
  onRedeemPoints
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tiers = {
    bronze: {
      name: 'Bronze',
      icon: Award,
      color: 'from-amber-600 to-amber-700',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      minPoints: 0,
      maxPoints: 1000,
      benefits: ['5% pont visszatérítés', 'Havi hírlevél'],
      nextTier: 'silver'
    },
    silver: {
      name: 'Silver',
      icon: Star,
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      minPoints: 1000,
      maxPoints: 5000,
      benefits: ['8% pont visszatérítés', 'Ingyenes szállítás 50.000 Ft felett', 'Early access akciókhoz'],
      nextTier: 'gold'
    },
    gold: {
      name: 'Gold',
      icon: Crown,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      minPoints: 5000,
      maxPoints: 15000,
      benefits: ['12% pont visszatérítés', 'Ingyenes szállítás', 'Exkluzív ajánlatok', 'Prioritásos ügyfélszolgálat'],
      nextTier: 'platinum'
    },
    platinum: {
      name: 'Platinum',
      icon: Trophy,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      minPoints: 15000,
      maxPoints: 999999,
      benefits: ['15% pont visszatérítés', 'VIP szállítás', 'Személyes tanácsadó', 'Exkluzív előrendelés', 'Születésnapi meglepetés'],
      nextTier: null
    }
  };

  const currentTierData = tiers[tier];
  const nextTierData = currentTierData.nextTier ? tiers[currentTierData.nextTier] : null;
  
  const progressToNextTier = nextTierData 
    ? Math.min(100, ((currentPoints - currentTierData.minPoints) / (nextTierData.minPoints - currentTierData.minPoints)) * 100)
    : 100;
  
  const pointsToNextTier = nextTierData ? nextTierData.minPoints - currentPoints : 0;

  // Sample rewards
  const rewards = [
    { id: 1, name: '500 Ft kedvezmény', points: 500, icon: Gift },
    { id: 2, name: '1000 Ft kedvezmény', points: 1000, icon: Gift },
    { id: 3, name: 'Ingyenes szállítás', points: 800, icon: Zap },
    { id: 4, name: '10% extra kedvezmény', points: 2000, icon: Star },
  ];

  // Points history
  const history = [
    { date: '2025-01-20', description: 'Vásárlás - Kanapé', points: 850, type: 'earned' },
    { date: '2025-01-15', description: 'Kupon beváltás', points: -500, type: 'redeemed' },
    { date: '2025-01-10', description: 'Vásárlás - Lámpa', points: 150, type: 'earned' },
    { date: '2025-01-05', description: 'Bónusz - Értékelés', points: 50, type: 'bonus' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header Card */}
      <div className={`bg-gradient-to-br ${currentTierData.color} p-5 sm:p-6 text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <currentTierData.icon className="w-6 h-6" />
                <span className="font-bold text-lg">{currentTierData.name} tag</span>
              </div>
              <p className="text-white/80 text-sm">Tag {new Date(memberSince).toLocaleDateString('hu-HU')} óta</p>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black">{currentPoints.toLocaleString()}</div>
              <p className="text-white/80 text-sm">pont</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTierData && (
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-white/80">Következő szint: {nextTierData.name}</span>
                <span className="font-bold">{pointsToNextTier.toLocaleString()} pont kell még</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextTier}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Áttekintés' },
          { id: 'rewards', label: 'Jutalmak' },
          { id: 'history', label: 'Előzmények' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-primary-600 border-b-2 border-primary-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Current Tier Benefits */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-500" />
                {currentTierData.name} előnyeid
              </h4>
              <div className="space-y-2">
                {currentTierData.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* All Tiers */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3">Szintek</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tiers).map(([key, t]) => {
                  const isActive = key === tier;
                  const isLocked = tiers[key].minPoints > currentPoints;
                  
                  return (
                    <div 
                      key={key}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        isActive 
                          ? 'border-primary-400 bg-primary-50' 
                          : isLocked 
                            ? 'border-gray-200 bg-gray-50 opacity-60' 
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                          <t.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{t.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{t.minPoints.toLocaleString()}+ pont</p>
                      
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{totalSpent.toLocaleString()} Ft</div>
                <p className="text-xs text-gray-500">Összes vásárlás</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{Math.round(progressToNextTier)}%</div>
                <p className="text-xs text-gray-500">Következő szintig</p>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-3">
            {rewards.map(reward => {
              const canRedeem = currentPoints >= reward.points;
              
              return (
                <div 
                  key={reward.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    canRedeem ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    canRedeem ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <reward.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{reward.name}</h4>
                    <p className="text-xs text-gray-500">{reward.points.toLocaleString()} pont</p>
                  </div>
                  <button
                    onClick={() => canRedeem && onRedeemPoints?.(reward)}
                    disabled={!canRedeem}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      canRedeem 
                        ? 'bg-primary-500 text-white hover:bg-primary-600' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem ? 'Beváltom' : <Lock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <span className={`font-bold text-sm ${
                  item.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.points > 0 ? '+' : ''}{item.points.toLocaleString()} pont
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyProgram;
