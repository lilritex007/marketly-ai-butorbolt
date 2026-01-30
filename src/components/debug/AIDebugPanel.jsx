import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react';

/**
 * AI Debug Panel - Tesztelő panel az AI API működésének ellenőrzésére
 * Ez a komponens segít diagnosztizálni az AI problémákat
 */
const AIDebugPanel = ({ onClose }) => {
  const [testStatus, setTestStatus] = useState('idle'); // idle, testing, success, error
  const [testResult, setTestResult] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const API_KEY = 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  const runAPITest = async () => {
    setTestStatus('testing');
    setTestResult(null);
    setErrorDetails(null);

    console.log('=== AI API TESZT INDÍTÁSA ===');
    console.log('API Kulcs:', API_KEY.substring(0, 10) + '...');
    console.log('API URL:', API_URL);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Mondj egy rövid magyar köszöntést!' }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        })
      });

      console.log('HTTP Status:', response.status);
      console.log('HTTP Status Text:', response.statusText);

      const data = await response.json();
      console.log('API Válasz:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        setTestStatus('error');
        setErrorDetails({
          httpStatus: response.status,
          httpStatusText: response.statusText,
          apiError: data.error || data,
          suggestion: getErrorSuggestion(response.status, data)
        });
        return;
      }

      if (data.error) {
        setTestStatus('error');
        setErrorDetails({
          apiError: data.error,
          suggestion: getErrorSuggestion(null, data)
        });
        return;
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiText) {
        setTestStatus('success');
        setTestResult(aiText);
        console.log('✅ API TESZT SIKERES!');
        console.log('AI Válasz:', aiText);
      } else {
        setTestStatus('error');
        setErrorDetails({
          message: 'Az API válaszolt, de nem adott szöveget',
          rawResponse: data,
          suggestion: 'A válasz formátuma nem megfelelő. Lehet, hogy a tartalom blokkolva lett.'
        });
      }

    } catch (error) {
      console.error('❌ API TESZT HIBA:', error);
      setTestStatus('error');
      setErrorDetails({
        message: error.message,
        type: error.name,
        suggestion: getNetworkErrorSuggestion(error)
      });
    }
  };

  const getErrorSuggestion = (httpStatus, data) => {
    if (httpStatus === 400) {
      return 'Rossz kérés formátum. Ellenőrizd a prompt-ot.';
    }
    if (httpStatus === 401 || httpStatus === 403) {
      return 'Az API kulcs érvénytelen vagy nincs engedélyezve. Menj a Google AI Studio-ba és ellenőrizd a kulcsot!';
    }
    if (httpStatus === 404) {
      return 'A model nem található. Lehet, hogy a gemini-1.5-flash nem elérhető.';
    }
    if (httpStatus === 429) {
      return 'Túl sok kérés! Várj egy percet és próbáld újra.';
    }
    if (httpStatus === 500 || httpStatus === 503) {
      return 'Google szerver hiba. Próbáld újra később.';
    }
    if (data?.error?.message) {
      return data.error.message;
    }
    return 'Ismeretlen hiba. Nézd meg a konzolt (F12) részletekért.';
  };

  const getNetworkErrorSuggestion = (error) => {
    if (error.message.includes('Failed to fetch')) {
      return 'Hálózati hiba vagy CORS probléma. Ellenőrizd az internet kapcsolatot.';
    }
    if (error.message.includes('NetworkError')) {
      return 'Nincs internet kapcsolat vagy a Google szerverek nem elérhetők.';
    }
    return 'Hálózati hiba történt. Ellenőrizd az internet kapcsolatot.';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                AI Debug Panel
              </h2>
              <p className="text-white/80 text-sm mt-1">Gemini API kapcsolat tesztelése</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* API Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-gray-800">API Konfiguráció</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">API Kulcs:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-200 px-2 py-0.5 rounded">{API_KEY.substring(0, 15)}...</code>
                  <button 
                    onClick={() => copyToClipboard(API_KEY)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Másolás"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model:</span>
                <code className="bg-gray-200 px-2 py-0.5 rounded">gemini-1.5-flash</code>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <button
            onClick={runAPITest}
            disabled={testStatus === 'testing'}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {testStatus === 'testing' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                API Teszt folyamatban...
              </>
            ) : (
              <>
                🧪 API Teszt Futtatása
              </>
            )}
          </button>

          {/* Results */}
          {testStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-bold text-green-800">✅ API Működik!</h3>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-gray-700">{testResult}</p>
              </div>
              <p className="mt-3 text-sm text-green-700">
                Az AI API megfelelően működik. Ha az app-okban mégsem működik, lehet, hogy más hiba van.
              </p>
            </div>
          )}

          {testStatus === 'error' && errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-red-800">❌ API Hiba!</h3>
              </div>
              
              <div className="space-y-3">
                {errorDetails.httpStatus && (
                  <div className="text-sm">
                    <span className="text-red-600 font-medium">HTTP Státusz: </span>
                    <code className="bg-red-100 px-2 py-0.5 rounded">{errorDetails.httpStatus} {errorDetails.httpStatusText}</code>
                  </div>
                )}
                
                {errorDetails.message && (
                  <div className="text-sm">
                    <span className="text-red-600 font-medium">Hiba: </span>
                    <span className="text-gray-700">{errorDetails.message}</span>
                  </div>
                )}

                {errorDetails.apiError && (
                  <div className="bg-red-100 rounded-lg p-3 text-xs overflow-x-auto">
                    <pre>{JSON.stringify(errorDetails.apiError, null, 2)}</pre>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-yellow-800 font-medium">💡 Javaslat:</p>
                  <p className="text-yellow-700 text-sm mt-1">{errorDetails.suggestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Links */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="font-bold text-gray-800 mb-3">🔧 Hibaelhárítás</h3>
            <div className="space-y-2">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-700 font-medium">Google AI Studio - API kulcs kezelése</span>
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </a>
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-700 font-medium">Google Cloud Console - API beállítások</span>
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <h4 className="font-bold text-gray-800 mb-2">📋 Ha nem működik az API:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
              <li>Nyisd meg a <strong>Google AI Studio</strong>-t a fenti linkről</li>
              <li>Jelentkezz be a Google fiókoddal</li>
              <li>Menj az <strong>API Keys</strong> menüpontra</li>
              <li>Hozz létre egy <strong>új API kulcsot</strong> vagy ellenőrizd a meglévőt</li>
              <li>Másold be ide az új kulcsot és add meg nekem</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDebugPanel;
