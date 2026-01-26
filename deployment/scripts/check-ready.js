/**
 * Pre-Deployment Readiness Check
 * 
 * Verifies that everything is ready for deployment
 * 
 * Usage:
 *   node deployment/scripts/check-ready.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.deployment' });

const checks = [];
let hasErrors = false;

function check(name, condition, errorMsg) {
  if (condition) {
    checks.push({ name, status: '✅', message: 'OK' });
  } else {
    checks.push({ name, status: '❌', message: errorMsg });
    hasErrors = true;
  }
}

console.log('╔═══════════════════════════════════════════════╗');
console.log('║    🔍 PRE-DEPLOYMENT READINESS CHECK         ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');

// 1. Environment Config
check(
  'Environment Config',
  fs.existsSync('.env.deployment'),
  '.env.deployment file missing! Create it first.'
);

check(
  'UNAS API Key',
  process.env.UNAS_API_KEY && process.env.UNAS_API_KEY.length > 20,
  'UNAS_API_KEY not configured or invalid!'
);

check(
  'UNAS API URL',
  process.env.UNAS_API_URL === 'https://api.unas.eu/shop',
  'UNAS_API_URL not configured correctly!'
);

check(
  'Shop URL',
  process.env.UNAS_SHOP_URL && process.env.UNAS_SHOP_URL.startsWith('http'),
  'UNAS_SHOP_URL not configured!'
);

check(
  'Page Slug',
  process.env.AI_SHOP_URL_SLUG && process.env.AI_SHOP_URL_SLUG.length > 0,
  'AI_SHOP_URL_SLUG not configured!'
);

// 2. Dependencies
check(
  'node-fetch installed',
  fs.existsSync('./node_modules/node-fetch'),
  'node-fetch missing! Run: npm install'
);

check(
  'xml2js installed',
  fs.existsSync('./node_modules/xml2js'),
  'xml2js missing! Run: npm install'
);

// 3. Build Directory
const buildDir = process.env.AI_SHOP_BUILD_DIR || './dist';
check(
  'Build directory exists',
  fs.existsSync(buildDir),
  `Build directory not found! Run: npm run build`
);

if (fs.existsSync(buildDir)) {
  const assetsDir = path.join(buildDir, 'assets');
  check(
    'Assets directory exists',
    fs.existsSync(assetsDir),
    'dist/assets/ not found! Run: npm run build'
  );

  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
    const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
    
    check(
      'JavaScript files built',
      jsFiles.length > 0,
      'No .js files in dist/assets/! Build failed?'
    );

    check(
      'CSS files built',
      cssFiles.length > 0,
      'No .css files in dist/assets/! Build failed?'
    );
  }
}

// 4. Deployment Scripts
check(
  'Deploy script exists',
  fs.existsSync('./deployment/scripts/deploy.js'),
  'deploy.js missing!'
);

check(
  'Rollback script exists',
  fs.existsSync('./deployment/scripts/rollback.js'),
  'rollback.js missing!'
);

check(
  'UNAS API wrapper exists',
  fs.existsSync('./deployment/scripts/unas-api.js'),
  'unas-api.js missing!'
);

// 5. Deployment Directory Structure
check(
  'Config directory exists',
  fs.existsSync('./deployment/config'),
  'deployment/config/ missing!'
);

check(
  'Backups directory exists',
  fs.existsSync('./deployment/backups'),
  'deployment/backups/ missing!'
);

// Print Results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Check Results:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

checks.forEach((check, idx) => {
  console.log(`${idx + 1}. ${check.status} ${check.name}`);
  if (check.status === '❌') {
    console.log(`   → ${check.message}`);
  }
});

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Summary
if (hasErrors) {
  console.log('');
  console.log('❌ NOT READY FOR DEPLOYMENT!');
  console.log('');
  console.log('Please fix the errors above before deploying.');
  console.log('');
  process.exit(1);
} else {
  console.log('');
  console.log('✅ READY FOR DEPLOYMENT!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Test deployment: npm run deploy:test');
  console.log('  2. Live deployment: npm run deploy:live');
  console.log('');
  process.exit(0);
}
