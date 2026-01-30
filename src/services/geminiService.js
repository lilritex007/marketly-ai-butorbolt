/**
 * Gemini AI Service - Frontend service for AI calls
 * All calls go through our backend proxy for security
 * The API key is stored on the server, NOT in the frontend
 */

// Backend API URL - automatically detects if we're on the Railway server or localhost
const API_BASE = window.MARKETLY_CONFIG?.apiBase || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://marketly-ai-butorbolt-production.up.railway.app/api');

/**
 * Generate text response from AI
 * @param {string} prompt - The prompt to send to AI
 * @param {object} options - Optional settings (temperature, maxTokens)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function generateText(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500 } = options;
  
  console.log('[AI Service] Sending text generation request...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature,
        maxTokens,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('[AI Service] Error:', data.error);
      return { 
        success: false, 
        error: data.error || `HTTP ${response.status}` 
      };
    }

    console.log('[AI Service] Success, response received');
    return { success: true, text: data.text };

  } catch (error) {
    console.error('[AI Service] Network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

/**
 * Analyze image with AI
 * @param {string} base64Image - Base64 encoded image (without data URL prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function analyzeImage(base64Image, mimeType, prompt) {
  console.log('[AI Service] Sending image analysis request...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        mimeType,
        prompt,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('[AI Service] Error:', data.error);
      return { 
        success: false, 
        error: data.error || `HTTP ${response.status}` 
      };
    }

    console.log('[AI Service] Image analysis success');
    return { success: true, text: data.text };

  } catch (error) {
    console.error('[AI Service] Network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

/**
 * Test AI connection
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function testConnection() {
  console.log('[AI Service] Testing connection...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('[AI Service] Connection OK:', data.message);
      return { success: true, message: data.message };
    } else {
      console.error('[AI Service] Connection failed:', data.error);
      return { success: false, error: data.error };
    }

  } catch (error) {
    console.error('[AI Service] Connection test failed:', error);
    return { 
      success: false, 
      error: `Cannot reach server: ${error.message}` 
    };
  }
}

export default {
  generateText,
  analyzeImage,
  testConnection,
};
