/**
 * UNAS AI Shop Deployment Script - GitHub CDN Version
 * 
 * Strategy:
 * 1. Build React app
 * 2. Commit & push to GitHub
 * 3. Create UNAS page with HTML that loads JS/CSS from GitHub
 * 
 * No UNAS file upload needed!
 * 
 * Usage:
 *   node deployment/scripts/deploy-github.js           (live)
 *   node deployment/scripts/deploy-github.js --dry-run (test)
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
const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL,
  shopUrl: process.env.UNAS_SHOP_URL,
  pageName: process.env.AI_SHOP_PAGE_NAME,
  pageSlug: process.env.AI_SHOP_URL_SLUG,
  lang: process.env.AI_SHOP_LANG,
  buildDir: process.env.AI_SHOP_BUILD_DIR,
  githubRepo: process.env.GITHUB_REPO,
  githubBranch: process.env.GITHUB_BRANCH || 'main',
  cdnBase: process.env.GITHUB_CDN_BASE
};

/**
 * Get all asset files from dist
 */
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

/**
 * Generate HTML content for AI Shop (GitHub CDN)
 */
function generateHTMLContent(jsFiles, cssFiles, cdnBase) {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI-powered bútor keresés és személyre szabott ajánlások">
  
  <!-- AI Shop Styles (GitHub CDN) -->
  ${cssFiles.map(f => `<link rel="stylesheet" href="${cdnBase}/assets/${f}">`).join('\n  ')}
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
      cdnBase: '${cdnBase}',
      features: {
        sessionSharing: false,
        stockCheck: false,
        expressCheckout: false
      }
    };
  </script>
  
  <!-- React App (GitHub CDN) -->
  ${jsFiles.map(f => `<script type="module" crossorigin src="${cdnBase}/assets/${f}"></script>`).join('\n  ')}
  
  <!-- Loading Fallback -->
  <noscript>
    <div style="text-align:center;padding:50px;">
      <h2>JavaScript szükséges az AI Bútorbolt használatához</h2>
      <p>Kérjük engedélyezd a JavaScriptet a böngésződben.</p>
    </div>
  </noscript>
  
  <!-- GitHub CDN Info -->
  <script>
    console.log('🚀 AI Shop loaded from GitHub CDN');
    console.log('📦 CDN Base:', '${cdnBase}');
    console.log('📄 JS Files:', ${JSON.stringify(jsFiles)});
    console.log('🎨 CSS Files:', ${JSON.stringify(cssFiles)});
  </script>
</body>
</html>`;
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   🚀 UNAS AI SHOP DEPLOYMENT (GitHub CDN)   ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`Mode: ${isDryRun ? '🧪 DRY RUN (teszt)' : '🔴 LIVE'}`);
  console.log(`Target: ${config.shopUrl}/${config.pageSlug}`);
  console.log(`CDN: ${config.cdnBase}`);
  console.log('');

  const deploymentState = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    strategy: 'github-cdn',
    config: {
      pageSlug: config.pageSlug,
      pageName: config.pageName,
      cdnBase: config.cdnBase
    },
    pageId: null,
    contentId: null,
    githubCommit: null,
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

    // STEP 2: GIT COMMIT & PUSH
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 STEP 2: Pushing to GitHub');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      try {
        // Check git status
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        
        if (gitStatus.trim()) {
          console.log('Changes detected, committing...');
          execSync('git add dist/', { stdio: 'inherit' });
          execSync(`git commit -m "Deploy AI Shop - ${new Date().toISOString()}"`, { stdio: 'inherit' });
          
          const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
          deploymentState.githubCommit = commitHash;
          console.log(`✅ Committed: ${commitHash.substring(0, 7)}`);
        } else {
          console.log('No changes to commit');
          const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
          deploymentState.githubCommit = commitHash;
        }
        
        console.log('Pushing to GitHub...');
        execSync(`git push origin ${config.githubBranch}`, { stdio: 'inherit' });
        console.log('✅ Pushed to GitHub');
      } catch (error) {
        console.warn('⚠️  Git operations failed:', error.message);
        console.warn('⚠️  Continuing with existing GitHub files...');
      }
    } else {
      console.log('Skipped (dry-run mode)');
      deploymentState.githubCommit = 'DRY_RUN_COMMIT';
    }
    console.log('');

    // STEP 3: DETECT ASSETS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 STEP 3: Detecting Build Assets');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { jsFiles, cssFiles } = getAssetFiles(config.buildDir);
    console.log(`Found ${jsFiles.length} JS files:`);
    jsFiles.forEach(f => console.log(`  - ${f}`));
    console.log(`Found ${cssFiles.length} CSS files:`);
    cssFiles.forEach(f => console.log(`  - ${f}`));
    console.log('✅ Assets detected');
    console.log('');

    // STEP 4: LOGIN
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 STEP 4: UNAS API Authentication');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const token = await getUnasToken(config.apiKey, config.apiUrl);
    console.log(`✅ Token received: ${token.substring(0, 20)}...`);
    console.log('');

    // STEP 5: CREATE PAGE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 STEP 5: Creating AI Shop Page');
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

    // STEP 6: CREATE CONTENT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 STEP 6: Creating HTML Content (GitHub CDN)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const htmlContent = generateHTMLContent(jsFiles, cssFiles, config.cdnBase);
    const htmlSize = (Buffer.byteLength(htmlContent, 'utf8') / 1024).toFixed(1);
    console.log(`HTML size: ${htmlSize} KB`);
    console.log(`CDN Base: ${config.cdnBase}`);
    
    const contentConfig = {
      lang: config.lang,
      title: `${config.pageName} - React App (GitHub CDN)`,
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

    // STEP 7: LINK CONTENT TO PAGE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 STEP 7: Linking Content to Page');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      await linkContentToPage(token, config.apiUrl, deploymentState.pageId, deploymentState.contentId);
    }
    
    console.log('✅ Content linked to page');
    console.log('');

    // STEP 8: SAVE STATE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STEP 8: Saving Deployment State');
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
    console.log('📦 GitHub CDN:');
    console.log(`   ${config.cdnBase}`);
    console.log('');
    console.log('📋 Deployment Details:');
    console.log(`   Strategy: GitHub CDN`);
    console.log(`   Page ID: ${deploymentState.pageId}`);
    console.log(`   Content ID: ${deploymentState.contentId}`);
    console.log(`   GitHub Commit: ${deploymentState.githubCommit?.substring(0, 7) || 'N/A'}`);
    console.log(`   Timestamp: ${deploymentState.timestamp}`);
    console.log('');
    console.log('🧪 Next Steps:');
    console.log('   1. Open: https://www.marketly.hu/butorbolt');
    console.log('   2. Test AI features');
    console.log('   3. Check browser console for CDN loading');
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

    deploymentState.success = false;
    deploymentState.error = error.message;
    fs.writeFileSync(stateFile, JSON.stringify(deploymentState, null, 2));

    if (process.env.AUTO_ROLLBACK_ON_ERROR === 'true' && !isDryRun) {
      console.log('🔄 Auto-rollback triggered...');
      const { rollback } = await import('./rollback.js');
      await rollback(deploymentState);
    }

    process.exit(1);
  }
}

deploy().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
