import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Bell, BellOff, Sparkles, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';

/**
 * AIPricePredictor - AI-powered price prediction and smart alerts
 * Uses Gemini to analyze product prices and predict trends
 */
const AIPricePredictor = ({ product, onAlertSet }) => {
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  useEffect(() => {
    // Check if alert is already enabled for this product
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '{}');
    setAlertEnabled(!!alerts[product.id]);
  }, [product.id]);

  const analyzePriceTrend = async () => {
    setIsAnalyzing(true);
    
    try {
      const prompt = `
Elemezz egy bútor termék árát és jósolj trendet magyarul.

TERMÉK ADATOK:
- Név: ${product.name}
- Kategória: ${product.category}
- Jelenlegi ár: ${product.price} HUF
- Webshop: Marketly bútoráruház

FELADAT:
1. Elemezd az árat a kategóriához képest (drága/közepes/olcsó)
2. Jósolj áru trendet (csökkenés/stabil/emelkedés valószínűsége)
3. Adj ajánlást a vásárláshoz (várjak vagy vegyem meg most)
4. Becsüld meg mikorra várható változás (ha várható)

VÁLASZ FORMÁTUM (JSON):
{
  "priceLevel": "közepes/drága/olcsó",
  "trend": "down/stable/up",
  "trendPercent": -5 to +10 (várható változás %),
  "recommendation": "buy_now/wait/good_deal",
  "reasoning": "rövid indoklás magyarul",
  "expectedChange": "1-2 hét/1 hónap/szezonális" vagy null
}

Adj reális elemzést a bútoráruház kontextusában.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      
      setPrediction(result);

    } catch (error) {
      setPrediction({
        trend: 'stable',
        trendPercent: 0,
        recommendation: 'buy_now',
        reasoning: 'Az árfolyam elemzés jelenleg nem elérhető.',
        priceLevel: 'közepes'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAlert = () => {
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '{}');
    
    if (alertEnabled) {
      // Remove alert
      delete alerts[product.id];
      setAlertEnabled(false);
    } else {
      // Add alert
      alerts[product.id] = {
        productName: product.name,
        currentPrice: product.price,
        targetPrice: product.price * 0.9, // Alert if 10% cheaper
        createdAt: new Date().toISOString()
      };
      setAlertEnabled(true);
      
      if (onAlertSet) {
        onAlertSet(product);
      }
    }
    
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  };

  const getTrendIcon = () => {
    if (!prediction) return null;
    
    if (prediction.trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-green-600" />;
    } else if (prediction.trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-red-600" />;
    }
    return <DollarSign className="w-5 h-5 text-gray-600" />;
  };

  const getRecommendationBadge = () => {
    if (!prediction) return null;
    
    const badges = {
      buy_now: { text: '✓ Jó ár', color: 'bg-green-100 text-green-800' },
      wait: { text: '⏳ Érdemes várni', color: 'bg-yellow-100 text-yellow-800' },
      good_deal: { text: '🔥 Kiváló ajánlat', color: 'bg-indigo-100 text-indigo-800' }
    };
    
    const badge = badges[prediction.recommendation] || badges.buy_now;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">AI Ár Előrejelzés</h3>
        </div>
        
        <button
          onClick={toggleAlert}
          className={`
            p-2 rounded-lg transition-colors
            ${alertEnabled 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-indigo-50'
            }
          `}
          title={alertEnabled ? 'Értesítés kikapcsolva' : 'Értesítés bekapcsolva'}
        >
          {alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </div>

      {!prediction && !isAnalyzing && (
        <button
          onClick={analyzePriceTrend}
          className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-3 rounded-lg transition-colors border-2 border-indigo-200 hover:border-indigo-300"
        >
          Ár trend elemzése
        </button>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">AI elemzés folyamatban...</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {prediction && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Trend Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon()}
                  <span className="font-semibold text-gray-900">
                    {prediction.trend === 'down' ? 'Csökkenő' : prediction.trend === 'up' ? 'Emelkedő' : 'Stabil'}
                  </span>
                </div>
                {getRecommendationBadge()}
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-indigo-600">
                  {prediction.trendPercent > 0 ? '+' : ''}{prediction.trendPercent}%
                </span>
                <span className="text-sm text-gray-600">várható változás</span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {prediction.reasoning}
              </p>
              
              {prediction.expectedChange && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4" />
                  <span>Várható időkeret: <strong>{prediction.expectedChange}</strong></span>
                </div>
              )}
            </div>

            {/* Alert Info */}
            {alertEnabled && (
              <div className="bg-indigo-100 text-indigo-800 rounded-lg p-3 text-sm flex items-start gap-2">
                <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Értesítést kapsz, ha az ár <strong>10%-kal csökken</strong> vagy várható akció van.
                </span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={analyzePriceTrend}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
            >
              Frissítés
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPricePredictor;
