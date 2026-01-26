import dotenv from 'dotenv';
import xml2js from 'xml2js';

dotenv.config();

const apiKey = process.env.UNAS_API_KEY;

async function listAllCategories() {
  console.log('🔐 Logging in to UNAS API...');
  
  // STEP 1: Login
  const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>${apiKey}</ApiKey>
</Params>`;

  const loginResponse = await fetch('https://api.unas.eu/shop/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
    body: loginXml
  });

  const loginData = await loginResponse.text();
  const parser = new xml2js.Parser({ explicitArray: false });
  const loginResult = await parser.parseStringPromise(loginData);
  const token = loginResult.Login?.Token;

  console.log('✅ Token received\n');

  // STEP 2: Get ALL products to extract all categories
  console.log('📡 Fetching 1000 products to extract categories...');
  
  const productXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <StatusBase>1</StatusBase>
    <ContentType>short</ContentType>
    <LimitNum>1000</LimitNum>
</Params>`;

  const response = await fetch('https://api.unas.eu/shop/getProduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Authorization': `Bearer ${token}`
    },
    body: productXml,
    signal: AbortSignal.timeout(120000)
  });

  const xmlData = await response.text();
  const result = await parser.parseStringPromise(xmlData);
  
  const products = Array.isArray(result.Products.Product) 
    ? result.Products.Product 
    : [result.Products.Product];
    
  console.log(`✅ ${products.length} products fetched\n`);
  
  // Extract unique categories
  const categories = new Map();
  
  for (const product of products) {
    if (product.Categories && product.Categories.Category) {
      const cats = Array.isArray(product.Categories.Category) 
        ? product.Categories.Category 
        : [product.Categories.Category];
      
      for (const cat of cats) {
        if (cat.Type === 'base' && cat.Name) {
          const fullPath = cat.Name;
          // Get the last part of the category path
          const catName = fullPath.includes('|') ? fullPath.split('|').pop().trim() : fullPath;
          
          if (!categories.has(catName)) {
            categories.set(catName, { name: catName, fullPath: fullPath, count: 0 });
          }
          categories.get(catName).count++;
        }
      }
    }
  }
  
  // Sort by count
  const sortedCategories = Array.from(categories.values())
    .sort((a, b) => b.count - a.count);
  
  console.log('📂 ALL CATEGORIES:\n');
  console.log('Name | Count | Full Path');
  console.log('-----|-------|----------');
  
  for (const cat of sortedCategories) {
    console.log(`${cat.name.padEnd(40)} | ${cat.count.toString().padStart(4)} | ${cat.fullPath}`);
  }
  
  console.log(`\n✅ Total: ${categories.size} unique categories`);
}

listAllCategories().catch(error => {
  console.error('❌ Error:', error.message);
});
