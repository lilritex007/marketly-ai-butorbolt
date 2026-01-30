/**
 * Gemini AI Service - Központi AI szolgáltatás
 * Minden AI hívás itt történik, egységes hibakezeléssel
 */

const GEMINI_API_KEY = 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Model nevek - a legstabilabb modellek
const MODELS = {
  TEXT: 'gemini-1.5-flash',      // Szöveges kérésekhez
  VISION: 'gemini-1.5-flash',    // Képelemzéshez (támogatja a vision-t is)
};

/**
 * Szöveges AI válasz generálása
 * @param {string} prompt - A kérdés vagy utasítás
 * @param {object} options - Opcionális beállítások
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function generateText(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500 } = options;
  
  console.log('[Gemini] Szöveges kérés indítása...', { promptLength: prompt.length });
  
  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${MODELS.TEXT}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const data = await response.json();
    
    // Részletes hibakezelés
    if (!response.ok) {
      console.error('[Gemini] HTTP hiba:', response.status, data);
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    if (data.error) {
      console.error('[Gemini] API hiba:', data.error);
      return { 
        success: false, 
        error: data.error.message || 'Ismeretlen API hiba' 
      };
    }

    // Válasz kinyerése
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[Gemini] Üres válasz:', data);
      
      // Ellenőrizzük, hogy blokkolva lett-e
      const blockReason = data.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY') {
        return { success: false, error: 'A válasz biztonsági okokból blokkolva lett.' };
      }
      
      return { success: false, error: 'Az AI nem adott választ.' };
    }

    console.log('[Gemini] Sikeres válasz:', text.substring(0, 100) + '...');
    return { success: true, text };

  } catch (error) {
    console.error('[Gemini] Hálózati hiba:', error);
    return { 
      success: false, 
      error: `Hálózati hiba: ${error.message}` 
    };
  }
}

/**
 * Kép elemzése AI-val
 * @param {string} base64Image - Base64 kódolt kép (data URL prefix nélkül)
 * @param {string} mimeType - Kép típusa (pl. 'image/jpeg')
 * @param {string} prompt - Az elemzési utasítás
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function analyzeImage(base64Image, mimeType, prompt) {
  console.log('[Gemini] Képelemzés indítása...', { mimeType, promptLength: prompt.length });
  
  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${MODELS.VISION}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Gemini Vision] HTTP hiba:', response.status, data);
      return { 
        success: false, 
        error: data.error?.message || `HTTP ${response.status}` 
      };
    }
    
    if (data.error) {
      console.error('[Gemini Vision] API hiba:', data.error);
      return { 
        success: false, 
        error: data.error.message || 'Ismeretlen API hiba' 
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[Gemini Vision] Üres válasz:', data);
      return { success: false, error: 'Az AI nem tudta elemezni a képet.' };
    }

    console.log('[Gemini Vision] Sikeres elemzés:', text.substring(0, 100) + '...');
    return { success: true, text };

  } catch (error) {
    console.error('[Gemini Vision] Hálózati hiba:', error);
    return { 
      success: false, 
      error: `Hálózati hiba: ${error.message}` 
    };
  }
}

/**
 * API kapcsolat tesztelése
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testConnection() {
  console.log('[Gemini] API teszt indítása...');
  
  const result = await generateText('Mondj egy rövid magyar köszöntést!', { maxTokens: 50 });
  
  if (result.success) {
    console.log('[Gemini] API teszt sikeres!');
    return { success: true, message: `API működik! Válasz: ${result.text}` };
  } else {
    console.error('[Gemini] API teszt sikertelen:', result.error);
    return { success: false, message: `API hiba: ${result.error}` };
  }
}

// Exportáljuk a default objektumot is
export default {
  generateText,
  analyzeImage,
  testConnection,
  GEMINI_API_KEY,
};
