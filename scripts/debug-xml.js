import dotenv from 'dotenv';
import xml2js from 'xml2js';

dotenv.config();

const apiKey = process.env.UNAS_API_KEY;

async function testUnasAPI() {
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

  console.log('✅ Token received');

  // STEP 2: Get Products with short content
  console.log('📡 Fetching ONE product with SHORT content...');
  
  const productXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <StatusBase>1</StatusBase>
    <ContentType>short</ContentType>
    <LimitNum>1</LimitNum>
</Params>`;

  const response = await fetch('https://api.unas.eu/shop/getProduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Authorization': `Bearer ${token}`
    },
    body: productXml,
    signal: AbortSignal.timeout(60000)
  });

  const xmlData = await response.text();
  console.log('\n📦 RAW XML (first 3000 chars):');
  console.log(xmlData.substring(0, 3000));
  
  console.log('\n\n🔍 Parsing XML...');
  const result = await parser.parseStringPromise(xmlData);
  
  const products = Array.isArray(result.Products.Product) 
    ? result.Products.Product 
    : [result.Products.Product];
    
  console.log('\n✅ First product structure:');
  console.log(JSON.stringify(products[0], null, 2));
}

testUnasAPI().catch(error => {
  console.error('❌ Error:', error.message);
});
