// Simulate frontend API call
const API_BASE = 'http://localhost:3002';

console.log('🔍 Testing frontend API call...\n');
console.log(`API Base: ${API_BASE}\n`);

async function testFrontendAPI() {
  try {
    console.log('1️⃣ Fetching products...');
    const response = await fetch(`${API_BASE}/api/products?limit=5`);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Error response:`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log(`\n2️⃣ Success! Received ${data.count} products`);
    console.log(`   Total in database: ${data.total}`);
    console.log(`   Last sync: ${data.lastSync}`);
    
    if (data.products && data.products.length > 0) {
      console.log(`\n3️⃣ First product:`);
      console.log(`   Name: ${data.products[0].name}`);
      console.log(`   Price: ${data.products[0].price} Ft`);
      console.log(`   Category: ${data.products[0].category}`);
      console.log(`   Images: ${data.products[0].images?.length || 0}`);
    }
    
    console.log(`\n✅ Frontend API is working correctly!`);
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    console.error(`   Stack:`, error.stack);
  }
}

testFrontendAPI();
