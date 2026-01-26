/**
 * Debug script to check UNAS Page & Content
 */

import { getUnasToken } from './unas-api.js';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env.deployment') });

const parseXML = promisify(parseString);

const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL,
  pageId: '500381',
  contentId: 'embedded'
};

async function getPage(token, pageId) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>get</Action>
    <Id>${pageId}</Id>
  </Page>
</Pages>`;

  const response = await fetch(`${config.apiUrl}/getPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: xml
  });

  const text = await response.text();
  console.log('\n=== getPage Response ===');
  console.log(text);
  return parseXML(text);
}

async function getPageContent(token, contentId) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PageContents>
  <PageContent>
    <Action>get</Action>
    <Id>${contentId}</Id>
  </PageContent>
</PageContents>`;

  const response = await fetch(`${config.apiUrl}/getPageContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: xml
  });

  const text = await response.text();
  console.log('\n=== getPageContent Response ===');
  console.log(text);
  return parseXML(text);
}

async function main() {
  console.log('🔍 UNAS Content Debugger\n');
  console.log(`Page ID: ${config.pageId}`);
  console.log(`Content ID: ${config.contentId}`);
  
  try {
    // 1. Login
    console.log('\n🔐 Authenticating...');
    const token = await getUnasToken(config.apiKey, config.apiUrl);
    console.log('✅ Token OK');

    // 2. Get Page
    console.log('\n📄 Fetching Page...');
    const pageData = await getPage(token, config.pageId);
    console.log('\n📊 Page Data:');
    console.log(JSON.stringify(pageData, null, 2));

    // 3. Get Content
    console.log('\n📝 Fetching Content...');
    const contentData = await getPageContent(token, config.contentId);
    console.log('\n📊 Content Data:');
    console.log(JSON.stringify(contentData, null, 2));

    // 4. Check if content is linked
    console.log('\n🔗 Checking Link...');
    const page = pageData.Pages?.Page;
    const pageContents = page?.PageContents?.PageContent;
    
    if (pageContents) {
      const contentIds = Array.isArray(pageContents) 
        ? pageContents.map(c => c.Id?.[0]) 
        : [pageContents.Id?.[0]];
      
      console.log('Linked Content IDs:', contentIds);
      console.log(`Is ${config.contentId} linked?`, contentIds.includes(config.contentId));
    } else {
      console.log('❌ NO CONTENT LINKED TO PAGE!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();
