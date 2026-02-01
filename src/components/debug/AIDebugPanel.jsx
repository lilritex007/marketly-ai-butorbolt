import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Server, Shield } from 'lucide-react';
import { testConnection, generateText } from '../../services/geminiService';

/**
 * AI Debug Panel - Tesztelő panel az AI API működésének ellenőrzésére
 * Most már a backend proxy-n keresztül tesztel (biztonságos!)
 */
const AIDebugPanel = ({ onClose }) => {
  const [healthStatus, setHealthStatus] = useState(null); // null, 'checking', 'ok', 'error'
  const [healthMessage, setHealthMessage] = useState('');
  const [testStatus, setTestStatus] = useState('idle'); // idle, testing, success, error
  const [testResult, setTestResult] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Auto-check health on open
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus('checking');
    const result = await testConnection();
    
    if (result.success) {
      setHealthStatus('ok');
      setHealthMessage(result.message || 'AI connected');
    } else {
      setHealthStatus('error');
      setHealthMessage(result.error || 'Connection failed');
    }
  };

  const runFullTest = async () => {
    setTestStatus('testing');
    setTestResult(null);
    setErrorDetails(null);

    console.log('=== AI FULL TEST ===');

    try {
      const result = await generateText(
        'Mondj egy rövid magyar köszöntést, 1 mondat!', 
        { temperature: 0.8, maxTokens: 100 }
      );

      if (result.success && result.text) {
        setTestStatus('success');
        setTestResult(result.text);
        console.log('✅ AI TESZT SIKERES:', result.text);
      } else {
        setTestStatus('error');
        setErrorDetails({
          message: result.error || 'Ismeretlen hiba',
          suggestion: getSuggestion(result.error)
        });
        console.error('❌ AI TESZT HIBA:', result.error);
      }

    } catch (error) {
      console.error('❌ TESZT EXCEPTION:', error);
      setTestStatus('error');
      setErrorDetails({
        message: error.message,
        suggestion: 'Hálózati hiba. Ellenőrizd, hogy a szerver fut-e.'
      });
    }
  };

  const getSuggestion = (error) => {
    if (!error) return 'Ismeretlen hiba történt.';
    
    const e = error.toLowerCase();
    
    if (e.includes('api_key') || e.includes('invalid') || e.includes('401') || e.includes('403')) {
      return 'Az API kulcs érvénytelen vagy nincs beállítva a Railway-en. Ellenőrizd a GEMINI_API_KEY környezeti változót!';
    }
    if (e.includes('not configured') || e.includes('not set')) {
      return 'A GEMINI_API_KEY nincs beállítva a Railway szerveren. Menj a Railway dashboard-ra és add hozzá!';
    }
    if (e.includes('network') || e.includes('fetch')) {
      return 'Nem sikerült kapcsolódni a szerverhez. Lehet, hogy a Railway szerver nem fut.';
    }
    if (e.includes('429') || e.includes('quota') || e.includes('rate')) {
      return 'Túl sok kérés! Várj egy percet és próbáld újra.';
    }
    if (e.includes('500') || e.includes('server')) {
      return 'Szerver hiba. Nézd meg a Railway logokat!';
    }
    
    return 'Ellenőrizd a Railway logokat a részletekért.';
  };

  return (
    <div 
      className="fixed inset-0 lg:top-[60px] z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Server className="w-6 h-6" />
                AI Debug Panel
              </h2>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Biztonságos backend proxy
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Health Check Status */}
          <div className={`rounded-xl p-4 ${
            healthStatus === 'ok' ? 'bg-green-50 border border-green-200' :
            healthStatus === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {healthStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                {healthStatus === 'ok' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {healthStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                {healthStatus === null && <AlertTriangle className="w-5 h-5 text-gray-400" />}
                
                <div>
                  <p className="font-bold text-gray-800">Backend Kapcsolat</p>
                  <p className={`text-sm ${
                    healthStatus === 'ok' ? 'text-green-600' :
                    healthStatus === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {healthStatus === 'checking' ? 'Ellenőrzés...' :
                     healthStatus === 'ok' ? `✓ ${healthMessage}` :
                     healthStatus === 'error' ? `✗ ${healthMessage}` :
                     'Nincs ellenőrizve'}
                  </p>
                </div>
              </div>
              <button
                onClick={checkHealth}
                disabled={healthStatus === 'checking'}
                className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                Újra
              </button>
            </div>
          </div>

          {/* Full Test Button */}
          <button
            onClick={runFullTest}
            disabled={testStatus === 'testing'}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {testStatus === 'testing' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                AI Teszt folyamatban...
              </>
            ) : (
              <>
                🧪 Teljes AI Teszt
              </>
            )}
          </button>

          {/* Test Results */}
          {testStatus === 'success' && testResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-bold text-green-800">✅ AI Működik!</h3>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-gray-700">{testResult}</p>
              </div>
              <p className="mt-3 text-sm text-green-700">
                Az AI backend helyesen működik. Az appok most már használhatják az AI-t!
              </p>
            </div>
          )}

          {testStatus === 'error' && errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-red-800">❌ Hiba!</h3>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-red-200 mb-3">
                <p className="text-red-700 text-sm">{errorDetails.message}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium text-sm">💡 Javaslat:</p>
                <p className="text-yellow-700 text-sm mt-1">{errorDetails.suggestion}</p>
              </div>
            </div>
          )}

          {/* Configuration Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">⚙️ Konfiguráció</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Backend:</span>
                <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">Railway Server</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">AI Model:</span>
                <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">gemini-2.0-flash</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Key:</span>
                <code className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">🔒 Szerveren tárolva</code>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-bold text-gray-800 mb-3">🔧 Ha nem működik</h3>
            <div className="space-y-2">
              <a 
                href="https://railway.app/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-700 font-medium">Railway Dashboard - Logok</span>
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </a>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-700 font-medium">Google AI Studio - Új API kulcs</span>
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-primary-50 rounded-xl p-4 text-sm">
            <h4 className="font-bold text-primary-700 mb-2">📋 Checklist</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-primary-600">
              <li>Railway-en van <strong>GEMINI_API_KEY</strong> változó?</li>
              <li>Az API kulcs <strong>aktív</strong> a Google AI Studio-ban?</li>
              <li>A Railway deploy <strong>sikeresen lefutott</strong>?</li>
              <li>A szerver <strong>fut</strong> (nem "sleeping")?</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDebugPanel;
