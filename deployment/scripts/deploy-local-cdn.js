/**
 * UNAS AI Shop Deployment - Local CDN Version
 * 
 * For testing WITHOUT GitHub push:
 * - Uses local file:// URLs (works in development)
 * - Or serve dist/ folder locally with python/nginx
 * 
 * Usage:
 *   node deployment/scripts/deploy-local-cdn.js --dry-run
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
  linkContentToPage
} from './unas-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.deployment' });

const isDryRun = process.argv.includes('--dry-run');

// Use LOCAL server for testing
const LOCAL_SERVER = 'http://localhost:8080'; // python -m http.server 8080
const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL,
  shopUrl: process.env.UNAS_SHOP_URL,
  pageName: process.env.AI_SHOP_PAGE_NAME,
  pageSlug: process.env.AI_SHOP_URL_SLUG,
  lang: process.env.AI_SHOP_LANG,
  buildDir: process.env.AI_SHOP_BUILD_DIR,
  cdnBase: LOCAL_SERVER + '/dist'  // Local CDN
};

function getAssetFiles(dir) {
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    return { jsFiles: [], cssFiles: [] };
  }

  const files = fs.readdirSync(assetsDir);
  return {
    jsFiles: files.filter(f => f.endsWith('.js') && !f.endsWith('.map')),
    cssFiles: files.filter(f => f.endsWith('.css'))
  };
}

function generateHTMLContent(jsFiles, cssFiles, cdnBase) {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI-powered bútor keresés">
  
  ${cssFiles.map(f => `<link rel="stylesheet" href="${cdnBase}/assets/${f}">`).join('\n  ')}
</head>
<body>
  <div id="ai-shop-root" class="min-h-screen"></div>
  
  <script>
    window.MARKETLY_CONFIG = {
      apiBase: '${config.shopUrl}',
      productBaseUrl: '/termek',
      cartUrl: '/cart',
      checkoutUrl: '/checkout',
      mode: 'unas-integrated',
      cdnBase: '${cdnBase}'
    };
  </script>
  
  ${jsFiles.map(f => `<script type="module" crossorigin src="${cdnBase}/assets/${f}"></script>`).join('\n  ')}
  
  <noscript>
    <div style="text-align:center;padding:50px;">
      <h2>JavaScript szükséges</h2>
    </div>
  </noscript>
</body>
</html>`;
}

async function deploy() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   🚀 UNAS DEPLOYMENT (Local CDN)            ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`⚠️  This uses LOCAL CDN: ${config.cdnBase}`);
  console.log('⚠️  Start local server: cd to project root, then run:');
  console.log('    python -m http.server 8080');
  console.log('');
  console.log(`Mode: ${isDryRun ? '🧪 DRY RUN' : '🔴 LIVE'}`);
  console.log('');

  const deploymentState = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    strategy: 'local-cdn',
    cdnBase: config.cdnBase,
    pageId: null,
    contentId: null,
    success: false
  };

  const stateFile = path.join(__dirname, '..', 'config', 'deployment-state.json');

  try {
    // BUILD
    if (!isDryRun) {
      execSync('npm run build', { stdio: 'inherit' });
    }
    console.log('✅ Build completed\n');

    // DETECT ASSETS
    const { jsFiles, cssFiles } = getAssetFiles(config.buildDir);
    console.log(`Found ${jsFiles.length} JS, ${cssFiles.length} CSS\n`);

    // LOGIN
    const token = await getUnasToken(config.apiKey, config.apiUrl);
    console.log(`✅ Token received\n`);

    // CREATE PAGE
    const pageConfig = {
      lang: config.lang,
      name: config.pageName,
      title: config.pageName,
      slug: config.pageSlug,
      showInMenu: true,
      showOnMain: true,
      metaTitle: `${config.pageName} | Marketly`,
      metaDescription: 'AI bútor keresés',
      metaKeywords: 'AI, bútor'
    };

    if (!isDryRun) {
      deploymentState.pageId = await createPage(token, config.apiUrl, pageConfig);
    } else {
      deploymentState.pageId = 'DRY_RUN_PAGE_ID';
    }
    console.log(`✅ Page created: ${deploymentState.pageId}\n`);

    // CREATE CONTENT
    const htmlContent = generateHTMLContent(jsFiles, cssFiles, config.cdnBase);
    const contentConfig = {
      lang: config.lang,
      title: `${config.pageName} - Local CDN`,
      type: 'normal',
      published: true,
      html: htmlContent
    };

    if (!isDryRun) {
      deploymentState.contentId = await createContent(token, config.apiUrl, contentConfig);
      await linkContentToPage(token, config.apiUrl, deploymentState.pageId, deploymentState.contentId);
    } else {
      deploymentState.contentId = 'DRY_RUN_CONTENT_ID';
    }
    console.log(`✅ Content created: ${deploymentState.contentId}\n`);

    deploymentState.success = true;
    fs.writeFileSync(stateFile, JSON.stringify(deploymentState, null, 2));

    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        🎉 DEPLOYMENT SUCCESSFUL! 🎉          ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log('🌐 AI Shop URL:');
    console.log(`   ${config.shopUrl}/${config.pageSlug}`);
    console.log('');
    console.log('📦 Local CDN:');
    console.log(`   ${config.cdnBase}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Start local server!');
    console.log('   python -m http.server 8080');
    console.log('');

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED!');
    console.error('Error:', error.message);
    deploymentState.success = false;
    deploymentState.error = error.message;
    fs.writeFileSync(stateFile, JSON.stringify(deploymentState, null, 2));
    process.exit(1);
  }
}

deploy();
