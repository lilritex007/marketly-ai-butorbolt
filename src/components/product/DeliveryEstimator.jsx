import React, { useState, useMemo } from 'react';
import { Truck, Clock, MapPin, CheckCircle, Package, Calendar, Zap, Info } from 'lucide-react';

/**
 * DeliveryEstimator - Shows estimated delivery date based on location
 * Features: Postal code lookup, express delivery option, store pickup
 */
const DeliveryEstimator = ({ 
  product, 
  variant = 'compact' // 'compact' | 'full'
}) => {
  const [postalCode, setPostalCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // Simulated delivery calculation
  const calculateDelivery = (code) => {
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const isBudapest = code.startsWith('1');
      const isLargeCity = ['2', '3', '4', '5', '6', '7', '8', '9'].some(n => code.startsWith(n) && parseInt(code) < 5000);
      
      const today = new Date();
      const standardDays = isBudapest ? 2 : isLargeCity ? 3 : 5;
      const expressDays = isBudapest ? 1 : 2;
      
      const standardDate = new Date(today);
      standardDate.setDate(standardDate.getDate() + standardDays);
      
      const expressDate = new Date(today);
      expressDate.setDate(expressDate.getDate() + expressDays);

      setDeliveryInfo({
        postalCode: code,
        city: isBudapest ? 'Budapest' : isLargeCity ? 'Nagyváros' : 'Vidék',
        standard: {
          date: standardDate,
          days: standardDays,
          price: 0, // Free
          available: true
        },
        express: {
          date: expressDate,
          days: expressDays,
          price: 2990,
          available: isBudapest || isLargeCity
        },
        pickup: {
          available: isBudapest,
          stores: isBudapest ? ['Budapest - Westend', 'Budapest - Árkád'] : []
        }
      });
      
      setIsChecking(false);
    }, 800);
  };

  const formatDate = (date) => {
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const months = ['jan.', 'feb.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}.`;
  };

  // Default delivery estimate without postal code
  const defaultEstimate = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 5);
    
    return {
      minDays: 2,
      maxDays: 5,
      minDate,
      maxDate
    };
  }, []);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          {deliveryInfo ? (
            <>
              <p className="font-bold text-green-800 text-sm">
                Kiszállítás: {formatDate(deliveryInfo.standard.date)}
              </p>
              <p className="text-green-600 text-xs">
                {deliveryInfo.city} • Ingyenes szállítás
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-green-800 text-sm">
                Kiszállítás {defaultEstimate.minDays}-{defaultEstimate.maxDays} munkanapon belül
              </p>
              <p className="text-green-600 text-xs">
                50.000 Ft felett ingyenes
              </p>
            </>
          )}
        </div>
        {!deliveryInfo && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Ir.szám"
              className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none"
              maxLength={4}
            />
            <button
              onClick={() => postalCode.length === 4 && calculateDelivery(postalCode)}
              disabled={postalCode.length !== 4 || isChecking}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? '...' : 'OK'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Szállítás & Átvétel</h3>
          <p className="text-sm text-gray-500">Add meg az irányítószámot a pontos időpontért</p>
        </div>
      </div>

      {/* Postal code input */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Irányítószám (pl. 1052)"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
            maxLength={4}
          />
        </div>
        <button
          onClick={() => postalCode.length === 4 && calculateDelivery(postalCode)}
          disabled={postalCode.length !== 4 || isChecking}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Keresés
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              Ellenőrzés
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {deliveryInfo ? (
        <div className="space-y-3">
          {/* Standard delivery */}
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-green-800">Standard szállítás</p>
                <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded-full">INGYENES</span>
              </div>
              <p className="text-green-700 text-sm">
                Megérkezik: <strong>{formatDate(deliveryInfo.standard.date)}</strong>
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>

          {/* Express delivery */}
          {deliveryInfo.express.available && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-amber-800">Express szállítás</p>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">
                    +{deliveryInfo.express.price.toLocaleString('hu-HU')} Ft
                  </span>
                </div>
                <p className="text-amber-700 text-sm">
                  Megérkezik: <strong>{formatDate(deliveryInfo.express.date)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Store pickup */}
          {deliveryInfo.pickup.available && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-800">Személyes átvétel</p>
                <p className="text-blue-700 text-sm">
                  {deliveryInfo.pickup.stores.join(' • ')}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">INGYENES</span>
            </div>
          )}
        </div>
      ) : (
        /* Default estimate */
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700">
                A várható szállítási idő <strong>{defaultEstimate.minDays}-{defaultEstimate.maxDays} munkanap</strong>.
                Add meg az irányítószámot a pontos dátumért!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                50.000 Ft feletti rendelésnél ingyenes házhozszállítás.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryEstimator;
