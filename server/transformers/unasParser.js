import xml2js from 'xml2js';

/**
 * Auto-detect format and parse UNAS data
 */
export async function parseUnasData(rawData, contentType) {
  const lowerContentType = contentType.toLowerCase();
  
  // Try to auto-detect format
  if (lowerContentType.includes('json') || rawData.trim().startsWith('{') || rawData.trim().startsWith('[')) {
    console.log('Detected JSON format');
    return parseJSON(rawData);
  } else if (lowerContentType.includes('xml') || rawData.trim().startsWith('<?xml') || rawData.trim().startsWith('<')) {
    console.log('Detected XML format');
    return parseXML(rawData);
  } else if (lowerContentType.includes('csv') || rawData.includes(';') || rawData.includes(',')) {
    console.log('Detected CSV format');
    return parseCSV(rawData);
  } else {
    throw new Error('Unknown data format. Expected JSON, XML, or CSV');
  }
}

/**
 * Parse JSON format
 */
function parseJSON(rawData) {
  try {
    const data = JSON.parse(rawData);
    const products = Array.isArray(data) ? data : (data.products || data.items || [data]);
    return products.map(transformUnasProduct);
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

/**
 * Parse XML format
 */
async function parseXML(rawData) {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });
    
    const result = await parser.parseStringPromise(rawData);
    
    // Check for UNAS API error response
    if (result.Error) {
      throw new Error(`UNAS API Error: ${result.Error}`);
    }
    
    // Try common XML structures
    let products = [];
    
    // UNAS API specific structure: <Products><Product>...</Product></Products>
    if (result.Products && result.Products.Product) {
      products = Array.isArray(result.Products.Product) 
        ? result.Products.Product 
        : [result.Products.Product];
      console.log(`✅ Found ${products.length} products in UNAS XML`);
    }
    // Alternative: <Response><Products><Product>...</Product></Products></Response>
    else if (result.Response && result.Response.Products) {
      const productsNode = result.Response.Products;
      if (productsNode.Product) {
        products = Array.isArray(productsNode.Product) 
          ? productsNode.Product 
          : [productsNode.Product];
      }
    }
    // Standard structures
    else if (result.products && result.products.product) {
      products = Array.isArray(result.products.product) 
        ? result.products.product 
        : [result.products.product];
    } else if (result.rss && result.rss.channel && result.rss.channel.item) {
      products = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];
    } else if (result.feed && result.feed.entry) {
      products = Array.isArray(result.feed.entry)
        ? result.feed.entry
        : [result.feed.entry];
    } else {
      // Try to find any array in the structure
      const findArray = (obj) => {
        for (const key in obj) {
          if (Array.isArray(obj[key])) return obj[key];
          if (typeof obj[key] === 'object') {
            const found = findArray(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };
      products = findArray(result) || [];
    }
    
    if (products.length === 0) {
      console.warn('⚠️ No products found in XML. Structure:', JSON.stringify(result, null, 2).substring(0, 1000));
    }
    
    return products.map(transformUnasProduct);
  } catch (error) {
    throw new Error(`XML parsing failed: ${error.message}`);
  }
}

/**
 * Parse CSV format (reuse existing logic from App.jsx)
 */
function parseCSV(csvText) {
  const splitCSVLine = (line, delimiter) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === delimiter && !inQuotes) { values.push(current); current = ''; }
      else { current += char; }
    }
    values.push(current);
    return values;
  };

  const lines = csvText.split(/\r?\n/);
  const products = [];
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const headers = splitCSVLine(firstLine, delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  
  const findCol = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const nameCol = findCol("Termék Név") || findCol("name") || findCol("title");
  const priceCol = findCol("Bruttó Ár") || findCol("price") || findCol("ár");
  const catCol = findCol("Kategória") || findCol("category");
  const imgCol = findCol("Kép link") || findCol("image") || findCol("img");
  const urlCol = findCol("Termék link") || findCol("link") || findCol("url");
  const descCol = findCol("Tulajdonságok") || findCol("description") || findCol("leírás");
  const stockCol = findCol("Raktárkészlet") || findCol("stock") || findCol("készlet");
  const altImgCol = findCol("Kép kapcsolat") || findCol("images");
  
  const paramCols = headers.reduce((acc, header, index) => {
    if (header.startsWith("Paraméter:") || header.startsWith("param_")) {
      const cleanName = header.replace("Paraméter:", "").replace("param_", "").split("|")[0].trim();
      acc.push({ index, name: cleanName });
    }
    return acc;
  }, []);

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = splitCSVLine(lines[i], delimiter);
    const getVal = (colIndex) => colIndex > -1 && row[colIndex] ? row[colIndex].replace(/^"|"$/g, '').trim() : "";

    const name = getVal(nameCol);
    const priceStr = getVal(priceCol);
    if (!priceStr || !name) continue;

    let categoryPath = getVal(catCol) || "Egyéb";
    const category = categoryPath.includes('>') ? categoryPath.split('>').pop().trim() : categoryPath;

    const mainImgUrl = getVal(imgCol);
    let images = mainImgUrl ? [mainImgUrl] : [];
    
    const altImgsRaw = getVal(altImgCol);
    if (altImgsRaw) {
      const alts = altImgsRaw.split(/[|,]/).map(url => url.trim()).filter(Boolean);
      images = [...images, ...alts].slice(0, 4);
    }

    let aiContextParams = [];
    paramCols.forEach(p => {
      const val = getVal(p.index);
      if (val) aiContextParams.push(`${p.name}: ${val}`);
    });
    const paramsString = aiContextParams.join(", ");

    const stock = getVal(stockCol);
    const stockNum = stock && !isNaN(parseInt(stock, 10)) ? parseInt(stock, 10) : null;

    products.push({
      id: `unas-prod-${i}`,
      name: name,
      price: parseInt(priceStr.replace(/[^0-9]/g, '')) || 0,
      category: category,
      images: images,
      description: getVal(descCol).replace(/<[^>]*>/g, ' ').substring(0, 500),
      params: paramsString,
      link: getVal(urlCol) || '#',
      inStock: stockNum != null ? stockNum > 0 : !(stock === '0' || stock.toLowerCase() === 'nincs' || stock.toLowerCase() === 'no'),
      stock_qty: stockNum
    });
  }
  
  return products;
}

/**
 * Transform UNAS product to frontend format
 */
function transformUnasProduct(unasProduct) {
  // UNAS API specific field mapping
  const getId = () => {
    return unasProduct.Id || unasProduct.id || unasProduct.Ref || unasProduct.ref ||
           unasProduct.Sku || unasProduct.sku || `unas-${Date.now()}-${Math.random()}`;
  };

  const getName = () => {
    return unasProduct.Name || unasProduct.name || unasProduct.title || 
           unasProduct.product_name || 'Névtelen termék';
  };

  const getPrice = () => {
    // UNAS API: Prices.Price.Gross or Prices.Price.Net
    if (unasProduct.Prices) {
      const prices = unasProduct.Prices;
      
      // Normal price
      if (prices.Price) {
        const priceArray = Array.isArray(prices.Price) ? prices.Price : [prices.Price];
        const normalPrice = priceArray.find(p => p.Type === 'normal');
        const salePrice = priceArray.find(p => p.Type === 'sale');
        
        // Prefer sale price if available and active
        if (salePrice && salePrice.Gross) {
          const price = parseInt(salePrice.Gross) || 0;
          if (price > 0) return price;
        }
        
        // Otherwise use normal price
        if (normalPrice && normalPrice.Gross) {
          return parseInt(normalPrice.Gross) || 0;
        }
      }
    }
    
    // Fallback to other possible fields
    const fallbackFields = [
      unasProduct.price,
      unasProduct.Price,
      unasProduct.g_price,
      unasProduct.brutto_price,
      unasProduct.price_brutto
    ];
    
    for (const field of fallbackFields) {
      if (field) {
        const numPrice = typeof field === 'string' 
          ? parseInt(field.replace(/[^0-9]/g, '')) 
          : parseInt(field);
        if (!isNaN(numPrice) && numPrice > 0) return numPrice;
      }
    }
    return 0;
  };

  const getCategoryPath = () => {
    // UNAS API: full path (e.g. "Otthon|Bútor|Kanapé") for main category filtering
    if (unasProduct.Categories && unasProduct.Categories.Category) {
      const categories = Array.isArray(unasProduct.Categories.Category)
        ? unasProduct.Categories.Category
        : [unasProduct.Categories.Category];
      const baseCategory = categories.find(c => c.Type === 'base');
      if (baseCategory && baseCategory.Name) return baseCategory.Name.trim();
    }
    const cat = unasProduct.category || unasProduct.Category ||
                unasProduct.product_type || unasProduct.g_product_category || 'Egyéb';
    return cat.includes('>') ? cat : (cat.includes('|') ? cat : cat);
  };

  const getCategory = () => {
    // UNAS API: Categories.Category.Name (leaf = last part of path)
    const catPath = getCategoryPath();
    return catPath.includes('|') ? catPath.split('|').pop().trim() :
           (catPath.includes('>') ? catPath.split('>').pop().trim() : catPath);
  };

  const getImages = () => {
    let images = [];
    
    // UNAS API: Images.Image
    if (unasProduct.Images && unasProduct.Images.Image) {
      const imageArray = Array.isArray(unasProduct.Images.Image) 
        ? unasProduct.Images.Image 
        : [unasProduct.Images.Image];
      
      for (const img of imageArray) {
        if (img.SefUrl) {
          images.push(img.SefUrl);
        }
      }
    }
    
    // Fallback: Try different image field names
    if (images.length === 0) {
      const imgFields = [
        unasProduct.image_link,
        unasProduct.g_image_link,
        unasProduct.image,
        unasProduct.img,
        unasProduct.picture,
        unasProduct.images
      ];

      for (const field of imgFields) {
        if (field) {
          if (Array.isArray(field)) {
            images = field;
          } else if (typeof field === 'string') {
            images = field.split(/[|,]/).map(url => url.trim()).filter(Boolean);
          }
          if (images.length > 0) break;
        }
      }
    }

    // Fallback to placeholder
    if (images.length === 0) {
      images = ["https://via.placeholder.com/400x400?text=Nincs+Kép"];
    }

    return images.slice(0, 4); // Max 4 images
  };

  const getDescription = () => {
    // UNAS API: Description.Short or Description.Long
    let desc = '';
    
    if (unasProduct.Description) {
      desc = unasProduct.Description.Short || unasProduct.Description.Long || '';
    }
    
    // Fallback
    if (!desc) {
      desc = unasProduct.description || unasProduct.g_description || 
             unasProduct.short_description || unasProduct.summary || '';
    }
    
    return desc.replace(/<[^>]*>/g, ' ').trim().substring(0, 500);
  };

  const getParams = () => {
    const params = [];
    
    // UNAS API: Params.Param
    if (unasProduct.Params && unasProduct.Params.Param) {
      const paramArray = Array.isArray(unasProduct.Params.Param) 
        ? unasProduct.Params.Param 
        : [unasProduct.Params.Param];
      
      for (const param of paramArray) {
        if (param.Name && param.Value) {
          params.push(`${param.Name}: ${param.Value}`);
        }
      }
    }
    
    // Common parameter fields (fallback)
    const paramFields = {
      'Anyag': unasProduct.material || unasProduct.fabric,
      'Szín': unasProduct.color || unasProduct.colour,
      'Szélesség': unasProduct.width || unasProduct.size_width,
      'Magasság': unasProduct.height || unasProduct.size_height,
      'Mélység': unasProduct.depth || unasProduct.size_depth,
      'Márka': unasProduct.brand || unasProduct.manufacturer
    };

    for (const [key, value] of Object.entries(paramFields)) {
      if (value && !params.find(p => p.startsWith(key))) {
        params.push(`${key}: ${value}`);
      }
    }

    // Look for custom attributes
    if (unasProduct.attributes && typeof unasProduct.attributes === 'object') {
      for (const [key, value] of Object.entries(unasProduct.attributes)) {
        if (value) params.push(`${key}: ${value}`);
      }
    }

    return params.join(', ');
  };

  const getLink = () => {
    return unasProduct.Url || unasProduct.url || unasProduct.link || 
           unasProduct.product_url || unasProduct.g_link || '#';
  };

  const getStockQty = () => {
    // UNAS API: Stocks.Stock.Qty (single or array of warehouses)
    if (unasProduct.Stocks && unasProduct.Stocks.Stock) {
      const stockEntries = Array.isArray(unasProduct.Stocks.Stock)
        ? unasProduct.Stocks.Stock
        : [unasProduct.Stocks.Stock];
      let totalQty = 0;
      for (const s of stockEntries) {
        if (s && s.Qty !== undefined) {
          const qty = parseInt(s.Qty);
          if (!isNaN(qty)) totalQty += qty;
        }
      }
      if (stockEntries.length > 0) return totalQty;
    }
    
    // Fallback
    const stockFields = [
      unasProduct.availability,
      unasProduct.g_availability,
      unasProduct.in_stock,
      unasProduct.stock,
      unasProduct.quantity
    ];

    for (const field of stockFields) {
      if (field !== undefined && field !== null) {
        if (typeof field === 'number') return field;
        if (typeof field === 'string') {
          const trimmed = field.trim();
          const asNum = parseInt(trimmed, 10);
          if (!Number.isNaN(asNum)) return asNum;
        }
      }
    }
    
    return null;
  };

  const getStock = () => {
    const qty = getStockQty();
    if (typeof qty === 'number') return qty > 0;
    if (typeof qty === 'boolean') return qty;
    return true;
  };

  const id = getId();
  const ref = unasProduct.Ref || unasProduct.ref;
  return {
    id,
    ...(ref ? { unas_ref: ref } : {}),
    name: getName(),
    price: getPrice(),
    category: getCategory(),
    category_path: getCategoryPath(),
    images: getImages(),
    description: getDescription(),
    params: getParams(),
    link: getLink(),
    inStock: getStock(),
    stock_qty: getStockQty()
  };
}
