import React, { useState } from 'react';
import { Ruler, Camera, Check, X, AlertTriangle, RefreshCw, Maximize2, ArrowRight, Home, HelpCircle, Sparkles } from 'lucide-react';

/**
 * ARMeasure - AR Measurement tool for checking if furniture fits
 * Room dimension calculator and fit checker
 */
const ARMeasure = ({ 
  product,
  onClose,
  onConfirmFit 
}) => {
  const [step, setStep] = useState('input'); // 'input' | 'measuring' | 'result'
  const [roomDimensions, setRoomDimensions] = useState({
    width: '',
    length: '',
    height: ''
  });
  const [fitResult, setFitResult] = useState(null);

  // Product dimensions (mock if not provided)
  const productDimensions = {
    width: product?.dimensions?.width || 220,
    depth: product?.dimensions?.depth || 95,
    height: product?.dimensions?.height || 85,
  };

  const handleDimensionChange = (field, value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setRoomDimensions(prev => ({ ...prev, [field]: numValue }));
  };

  const handleCheckFit = () => {
    setStep('measuring');
    
    // Simulate measurement processing
    setTimeout(() => {
      const roomW = parseInt(roomDimensions.width) || 0;
      const roomL = parseInt(roomDimensions.length) || 0;
      const roomH = parseInt(roomDimensions.height) || 300;
      
      const fitsWidth = productDimensions.width + 100 <= roomW; // 100cm clearance
      const fitsDepth = productDimensions.depth + 80 <= roomL; // 80cm walkway
      const fitsHeight = productDimensions.height + 50 <= roomH;
      
      const spaceFit = fitsWidth && fitsDepth && fitsHeight;
      const tightFit = !spaceFit && (productDimensions.width <= roomW && productDimensions.depth <= roomL);
      
      setFitResult({
        fits: spaceFit,
        tightFit: tightFit,
        details: {
          width: { room: roomW, product: productDimensions.width, fits: fitsWidth },
          depth: { room: roomL, product: productDimensions.depth, fits: fitsDepth },
          height: { room: roomH, product: productDimensions.height, fits: fitsHeight },
        },
        suggestions: !spaceFit ? [
          tightFit ? 'Szoros illeszkedés - kevés mozgástér marad' : 'Válassz kisebb méretet',
          'Mérj újra pontosan',
          'Nézd meg a hasonló, kisebb termékeket'
        ] : []
      });
      
      setStep('result');
    }, 1500);
  };

  const resetMeasurement = () => {
    setStep('input');
    setRoomDimensions({ width: '', length: '', height: '' });
    setFitResult(null);
  };

  const isFormValid = roomDimensions.width && roomDimensions.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-700 p-4 sm:p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Befér-e?</h3>
              <p className="text-white/80 text-sm">Méret ellenőrzés</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Dimensions Card */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm">
            {product?.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Home className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">{product?.name || 'Termék'}</h4>
            <p className="text-xs text-gray-500">{product?.category}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Szélesség</p>
            <p className="font-bold text-gray-900">{productDimensions.width} cm</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Mélység</p>
            <p className="font-bold text-gray-900">{productDimensions.depth} cm</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Magasság</p>
            <p className="font-bold text-gray-900">{productDimensions.height} cm</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 sm:p-5">
        {/* Input Step */}
        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">Add meg a szoba méreteit</label>
                <button className="text-gray-400 hover:text-gray-600">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Szélesség (cm)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={roomDimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    placeholder="pl. 400"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Hosszúság (cm)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={roomDimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    placeholder="pl. 500"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-100"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">Mennyezet magasság (opcionális)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={roomDimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  placeholder="pl. 270"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-100"
                />
              </div>
            </div>

            {/* AR Measure Option */}
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl p-3 border border-secondary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Camera className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">AR Mérés</p>
                  <p className="text-xs text-gray-500">Mérd le kamerával</p>
                </div>
                <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-[10px] font-bold rounded-full">
                  Hamarosan
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckFit}
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                isFormValid 
                  ? 'bg-gradient-to-r from-secondary-500 to-secondary-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Maximize2 className="w-5 h-5" />
              Ellenőrzés
            </button>
          </div>
        )}

        {/* Measuring Step */}
        {step === 'measuring' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-secondary-600 animate-pulse" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Számítás folyamatban...</h4>
            <p className="text-sm text-gray-500">Ellenőrizzük, hogy befér-e a bútor</p>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && fitResult && (
          <div className="space-y-4">
            {/* Result Header */}
            <div className={`p-4 rounded-xl ${
              fitResult.fits 
                ? 'bg-green-50 border border-green-200' 
                : fitResult.tightFit 
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  fitResult.fits 
                    ? 'bg-green-500' 
                    : fitResult.tightFit 
                      ? 'bg-amber-500' 
                      : 'bg-red-500'
                }`}>
                  {fitResult.fits ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : fitResult.tightFit ? (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  ) : (
                    <X className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h4 className={`font-bold ${
                    fitResult.fits 
                      ? 'text-green-700' 
                      : fitResult.tightFit 
                        ? 'text-amber-700' 
                        : 'text-red-700'
                  }`}>
                    {fitResult.fits 
                      ? 'Tökéletesen befér!' 
                      : fitResult.tightFit 
                        ? 'Szoros illeszkedés' 
                        : 'Nem fér be'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {fitResult.fits 
                      ? 'A bútor kényelmesen elfér a szobában' 
                      : fitResult.tightFit 
                        ? 'Fizikailag befér, de kevés hely marad' 
                        : 'Sajnos túl nagy a termék'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimension Details */}
            <div className="space-y-2">
              {Object.entries(fitResult.details).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 capitalize">
                    {key === 'width' ? 'Szélesség' : key === 'depth' ? 'Mélység' : 'Magasság'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-900">
                      {data.product} / {data.room} cm
                    </span>
                    {data.fits ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {fitResult.suggestions.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Javaslatok:</p>
                <ul className="space-y-1">
                  {fitResult.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetMeasurement}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Újra
              </button>
              {fitResult.fits && (
                <button
                  onClick={() => onConfirmFit?.()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Kosárba
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARMeasure;
