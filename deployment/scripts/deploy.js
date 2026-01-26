/**
 * UNAS AI Shop Deployment Script
 * 
 * Minimal deployment using only:
 * - getPage, setPage
 * - getPageContent, setPageContent
 * - getStorage, setStorage
 * 
 * Usage:
 *   node deployment/scripts/deploy.js           (live deployment)
 *   node deployment/scripts/deploy.js --dry-run (test mode)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  getUnasToken,
  createPage,
  createContent,
  linkContentToPage,
  uploadToStorage
} from './unas-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load deployment config
dotenv.config({ path: '.env.deployment' });

const isDryRun = process.argv.includes('--dry-run');
const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL,
  shopUrl: process.env.UNAS_SHOP_URL,
  pageName: process.env.AI_SHOP_PAGE_NAME,
  pageSlug: process.env.AI_SHOP_URL_SLUG,
  lang: process.env.AI_SHOP_LANG,
  remotePath: process.env.AI_SHOP_REMOTE_PATH,
  buildDir: process.env.AI_SHOP_BUILD_DIR
};

/**
 * Get all files recursively from directory
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        localPath: fullPath,
        relativePath: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
        size: stat.size
      });
    }
  }

  return files;
}

/**
 * Generate HTML content for AI Shop
 */
function generateHTMLContent(assetFiles) {
  const jsFiles = assetFiles.filter(f => f.relativePath.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.relativePath.endsWith('.css'));

  const cdnBase = `${config.shopUrl}${config.remotePath}`;

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI-powered bútor keresés és személyre szabott ajánlások">
  
  <!-- AI Shop Styles -->
  ${cssFiles.map(f => `<link rel="stylesheet" href="${cdnBase}/${f.relativePath}">`).join('\n  ')}
</head>
<body>
  <!-- AI Shop Root -->
  <div id="ai-shop-root" class="min-h-screen"></div>
  
  <!-- Configuration -->
  <script>
    window.MARKETLY_CONFIG = {
      apiBase: '${config.shopUrl}',
      productBaseUrl: '/termek',
      cartUrl: '/cart',
      checkoutUrl: '/checkout',
      mode: 'unas-integrated',
      features: {
        sessionSharing: false,  // checkCustomer nem engedélyezett
        stockCheck: false,      // getStock nem engedélyezett
        expressCheckout: false  // setOrder nem engedélyezett
      }
    };
  </script>
  
  <!-- React App -->
  ${jsFiles.map(f => `<script type="module" src="${cdnBase}/${f.relativePath}"></script>`).join('\n  ')}
  
  <!-- Loading Fallback -->
  <noscript>
    <div style="text-align:center;padding:50px;">
      <h2>JavaScript szükséges az AI Bútorbolt használatához</h2>
      <p>Kérjük engedélyezd a JavaScriptet a böngésződben.</p>
    </div>
  </noscript>
</body>
</html>`;
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   🚀 UNAS AI SHOP DEPLOYMENT                 ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`Mode: ${isDryRun ? '🧪 DRY RUN (teszt)' : '🔴 LIVE'}`);
  console.log(`Target: ${config.shopUrl}/${config.pageSlug}`);
  console.log('');

  const deploymentState = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    config: {
      pageSlug: config.pageSlug,
      pageName: config.pageName
    },
    pageId: null,
    contentId: null,
    uploadedFiles: [],
    success: false
  };

  const stateFile = path.join(__dirname, '..', 'config', 'deployment-state.json');

  try {
    // STEP 1: BUILD
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 STEP 1: Building React App');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      console.log('Running: npm run build');
      execSync('npm run build', { stdio: 'inherit' });
    } else {
      console.log('Skipped (dry-run mode)');
    }
    console.log('✅ Build completed');
    console.log('');

    // STEP 2: LOGIN
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 STEP 2: UNAS API Authentication');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`API Key: ${config.apiKey.substring(0, 10)}...`);
    
    const token = await getUnasToken(config.apiKey, config.apiUrl);
    console.log(`✅ Token received: ${token.substring(0, 20)}...`);
    console.log('');

    // STEP 3: UPLOAD FILES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 STEP 3: Uploading Build Files to UNAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const files = getAllFiles(config.buildDir);
    console.log(`Found ${files.length} files to upload`);
    
    let uploadCount = 0;
    for (const file of files) {
      const remotePath = `${config.remotePath}/${file.relativePath}`;
      
      if (!isDryRun) {
        await uploadToStorage(token, config.apiUrl, file.localPath, remotePath);
      }
      
      deploymentState.uploadedFiles.push(remotePath);
      uploadCount++;
      
      const sizeKB = (file.size / 1024).toFixed(1);
      console.log(`  [${uploadCount}/${files.length}] ✅ ${file.relativePath} (${sizeKB} KB)`);
    }
    
    console.log(`✅ ${uploadCount} files uploaded`);
    console.log('');

    // STEP 4: CREATE PAGE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 STEP 4: Creating AI Shop Page');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const pageConfig = {
      lang: config.lang,
      name: config.pageName,
      title: config.pageName,
      slug: config.pageSlug,
      showInMenu: true,
      showOnMain: true,
      metaTitle: `${config.pageName} | Marketly`,
      metaDescription: 'Találd meg a tökéletes bútort AI segítségével! Képfelismerés, chat asszisztens és személyre szabott ajánlások.',
      metaKeywords: 'AI, bútor, keresés, mesterséges intelligencia, képfelismerés, chat'
    };

    if (!isDryRun) {
      deploymentState.pageId = await createPage(token, config.apiUrl, pageConfig);
    } else {
      deploymentState.pageId = 'DRY_RUN_PAGE_ID';
    }
    
    console.log(`✅ Page created with ID: ${deploymentState.pageId}`);
    console.log(`   URL: ${config.shopUrl}/${config.pageSlug}`);
    console.log('');

    // STEP 5: CREATE CONTENT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 STEP 5: Creating HTML Content');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const htmlContent = generateHTMLContent(files);
    const htmlSize = (Buffer.byteLength(htmlContent, 'utf8') / 1024).toFixed(1);
    console.log(`HTML size: ${htmlSize} KB`);
    
    const contentConfig = {
      lang: config.lang,
      title: `${config.pageName} - React App`,
      type: 'normal',
      published: true,
      html: htmlContent
    };

    if (!isDryRun) {
      deploymentState.contentId = await createContent(token, config.apiUrl, contentConfig);
    } else {
      deploymentState.contentId = 'DRY_RUN_CONTENT_ID';
    }
    
    console.log(`✅ Content created with ID: ${deploymentState.contentId}`);
    console.log('');

    // STEP 6: LINK CONTENT TO PAGE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 STEP 6: Linking Content to Page');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      await linkContentToPage(token, config.apiUrl, deploymentState.pageId, deploymentState.contentId);
    }
    
    console.log('✅ Content linked to page');
    console.log('');

    // STEP 7: SAVE STATE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 7: Saving Deployment State');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    deploymentState.success = true;
    fs.writeFileSync(stateFile, JSON.stringify(deploymentState, null, 2));
    console.log(`✅ State saved: ${stateFile}`);
    console.log('');

    // SUCCESS
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        🎉 DEPLOYMENT SUCCESSFUL! 🎉          ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log('🌐 AI Shop URL:');
    console.log(`   ${config.shopUrl}/${config.pageSlug}`);
    console.log('');
    console.log('📋 Deployment Details:');
    console.log(`   Page ID: ${deploymentState.pageId}`);
    console.log(`   Content ID: ${deploymentState.contentId}`);
    console.log(`   Files uploaded: ${deploymentState.uploadedFiles.length}`);
    console.log(`   Timestamp: ${deploymentState.timestamp}`);
    console.log('');
    console.log('🧪 Next Steps:');
    console.log('   1. Open: https://www.marketly.hu/butorbolt');
    console.log('   2. Test AI features');
    console.log('   3. Check browser console for errors');
    console.log('');
    console.log('⚠️  Rollback Command:');
    console.log('   npm run deploy:rollback');
    console.log('');

    return deploymentState;

  } catch (error) {
    console.error('');
    console.error('╔═══════════════════════════════════════════════╗');
    console.error('║         ❌ DEPLOYMENT FAILED! ❌              ║');
    console.error('╚═══════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
    console.error('');

    // Save failed state
    deploymentState.success = false;
    deploymentState.error = error.message;
    fs.writeFileSync(stateFile, JSON.stringify(deploymentState, null, 2));

    // AUTO ROLLBACK
    if (process.env.AUTO_ROLLBACK_ON_ERROR === 'true' && !isDryRun) {
      console.log('🔄 Auto-rollback triggered...');
      const { rollback } = await import('./rollback.js');
      await rollback(deploymentState);
    } else {
      console.error('⚠️  Rollback Command:');
      console.error('   npm run deploy:rollback');
      console.error('');
    }

    process.exit(1);
  }
}

// RUN
deploy().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
