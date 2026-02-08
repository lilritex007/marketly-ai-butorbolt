/** Placeholder image (data URL) – nem függ külső szolgáltatástól (via.placeholder stb.) */
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16'%3ENincs kép%3C/text%3E%3C/svg%3E";

/**
 * Format price to Hungarian currency (safe for null/undefined)
 */
export const formatPrice = (price) => {
  const value = price != null && !Number.isNaN(Number(price)) ? Number(price) : 0;
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format relative time (e.g., "2 órája")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'most';
  if (diffMins < 60) return `${diffMins} perce`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} órája`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} napja`;
  
  return date.toLocaleDateString('hu-HU');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Smooth scroll to element
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/**
 * Copy to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Get contrast color (black or white) based on background
 */
export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Try to extract stock level from product data
 */
export const getStockLevel = (product) => {
  if (!product) return null;
  const direct = product.stockLevel ?? product.stock_level ?? product.stock ?? null;
  if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
  const params = product.params || '';
  if (typeof params !== 'string' || params.length === 0) return null;
  const match = params.match(/(rakt[aá]r|k[eé]szlet)[^0-9]{0,8}(\d{1,3})/i);
  if (match && match[2]) {
    const val = parseInt(match[2], 10);
    return Number.isFinite(val) ? val : null;
  }
  return null;
};

/**
 * Group items by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Calculate reading time
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} perc olvasás`;
};
