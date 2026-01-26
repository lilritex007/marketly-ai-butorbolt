/**
 * UNAS Deployment Status Checker
 * 
 * Shows current deployment state and verifies deployment
 * 
 * Usage:
 *   node deployment/scripts/status.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.deployment' });

const config = {
  shopUrl: process.env.UNAS_SHOP_URL,
  pageSlug: process.env.AI_SHOP_URL_SLUG
};

async function checkStatus() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║     📊 UNAS DEPLOYMENT STATUS                ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');

  // Check deployment state file
  const stateFile = path.join(__dirname, '..', 'config', 'deployment-state.json');
  
  if (!fs.existsSync(stateFile)) {
    console.log('📋 Deployment State: ❌ NOT DEPLOYED');
    console.log('');
    console.log('No deployment found.');
    console.log('');
    console.log('To deploy: npm run deploy:live');
    console.log('');
    return;
  }

  // Load state
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

  console.log('📋 Deployment State: ✅ DEPLOYED');
  console.log('');
  console.log('Details:');
  console.log(`  Timestamp: ${state.timestamp}`);
  console.log(`  Mode: ${state.mode}`);
  console.log(`  Success: ${state.success ? '✅' : '❌'}`);
  console.log(`  Page ID: ${state.pageId}`);
  console.log(`  Content ID: ${state.contentId}`);
  console.log(`  Files: ${state.uploadedFiles?.length || 0}`);
  console.log('');

  // Check if page is accessible
  console.log('🌐 Checking AI Shop Accessibility...');
  console.log(`   URL: ${config.shopUrl}/${config.pageSlug}`);
  
  try {
    const response = await fetch(`${config.shopUrl}/${config.pageSlug}`, {
      method: 'HEAD',
      redirect: 'follow'
    });

    if (response.ok) {
      console.log('   Status: ✅ ACCESSIBLE (HTTP 200)');
    } else {
      console.log(`   Status: ⚠️  HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`   Status: ❌ ERROR - ${error.message}`);
  }
  
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Deployment: ${state.success ? '✅ Active' : '❌ Failed'}`);
  console.log(`Page URL: ${config.shopUrl}/${config.pageSlug}`);
  console.log(`Deployed: ${new Date(state.timestamp).toLocaleString('hu-HU')}`);
  console.log('');
  console.log('Commands:');
  console.log('  npm run deploy:rollback  - Remove deployment');
  console.log('  npm run deploy:live      - Re-deploy');
  console.log('');
}

checkStatus().catch(err => {
  console.error('Error checking status:', err);
  process.exit(1);
});
