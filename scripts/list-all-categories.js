import dotenv from 'dotenv';
import xml2js from 'xml2js';

dotenv.config();

const apiKey = process.env.UNAS_API_KEY;

async function getAllCategoriesFromUNAS() {
  console.log('🔐 Step 1: Logging in to UNAS API...\n');
  
  // Login
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

  if (!token) {
    throw new Error('Login failed!');
  }

  console.log('✅ Login successful!\n');
  console.log('📡 Step 2: Fetching ALL products (this may take a while)...\n');
  
  // Fetch products in batches
  let allProducts = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`   Fetching batch starting at offset ${offset}...`);
    
    const productXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <StatusBase>1</StatusBase>
    <ContentType>short</ContentType>
    <LimitNum>${batchSize}</LimitNum>
    <LimitStart>${offset}</LimitStart>
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
    
    const products = Array.isArray(result.Products?.Product) 
      ? result.Products.Product 
      : (result.Products?.Product ? [result.Products.Product] : []);
    
    if (products.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(products);
      console.log(`   ✓ Got ${products.length} products (total so far: ${allProducts.length})`);
      offset += batchSize;
      
      // Safety limit
      if (allProducts.length >= 200000) {
        console.log('   ⚠️  Reached 200K limit, stopping...');
        hasMore = false;
      }
    }
  }
  
  console.log(`\n✅ Total products fetched: ${allProducts.length}\n`);
  console.log('📂 Step 3: Extracting categories...\n');
  
  // Extract categories
  const categoryStats = new Map();
  
  for (const product of allProducts) {
    if (product.Categories && product.Categories.Category) {
      const cats = Array.isArray(product.Categories.Category) 
        ? product.Categories.Category 
        : [product.Categories.Category];
      
      for (const cat of cats) {
        if (cat.Type === 'base' && cat.Name) {
          const fullPath = cat.Name;
          
          // Get main category (first part before |)
          const mainCat = fullPath.split('|')[0].trim();
          
          if (!categoryStats.has(mainCat)) {
            categoryStats.set(mainCat, { count: 0, subCategories: new Set(), fullPath: fullPath });
          }
          
          const stats = categoryStats.get(mainCat);
          stats.count++;
          stats.subCategories.add(fullPath);
        }
      }
    }
  }
  
  // Sort by count
  const sortedCategories = Array.from(categoryStats.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      subCategoriesCount: stats.subCategories.size,
      examplePath: Array.from(stats.subCategories)[0]
    }))
    .sort((a, b) => b.count - a.count);
  
  console.log('📊 FŐ KATEGÓRIÁK (termékszám szerint rendezve):\n');
  console.log('═'.repeat(100));
  console.log('Kategória'.padEnd(50) + 'Termékek'.padStart(12) + 'Alkategóriák'.padStart(15));
  console.log('═'.repeat(100));
  
  for (const cat of sortedCategories) {
    console.log(
      cat.name.padEnd(50) + 
      cat.count.toString().padStart(12) + 
      cat.subCategoriesCount.toString().padStart(15)
    );
  }
  
  console.log('═'.repeat(100));
  console.log(`\nÖsszesen: ${sortedCategories.length} fő kategória, ${allProducts.length} termék\n`);
  
  console.log('💡 Példa alkategória útvonalak:\n');
  sortedCategories.slice(0, 10).forEach(cat => {
    console.log(`   ${cat.name}:`);
    console.log(`      → ${cat.examplePath}\n`);
  });
}

getAllCategoriesFromUNAS().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
