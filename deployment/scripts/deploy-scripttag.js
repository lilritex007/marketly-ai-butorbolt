/**
 * UNAS AI Shop Deployment - ScriptTag Strategy
 * Uses setScriptTag API to inject React app loader
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getUnasToken } from './unas-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env.deployment') });

// SHOP_URL = full backend API base including /api (e.g. https://xxx.railway.app/api)
// GITHUB_CDN_BASE = opcionális; ha nincs megadva, a dist a Railway-ről szolgál (backend base + /dist)
const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL,
  shopUrl: process.env.SHOP_URL,
  lang: process.env.LANG || 'hu',
  pageSlug: process.env.PAGE_SLUG || 'butorbolt',
  pageName: process.env.PAGE_NAME || 'AI Bútorbolt',
  buildDir: path.join(__dirname, '../../dist'),
  githubRepo: process.env.GITHUB_REPO,
  githubBranch: process.env.GITHUB_BRANCH || 'main',
  cdnBase: process.env.GITHUB_CDN_BASE || (process.env.SHOP_URL ? process.env.SHOP_URL.replace(/\/api\/?$/, '') + '/dist' : undefined)
};

/**
 * Get build asset files
 */
function getAssetFiles(buildDir) {
  const assetsDir = path.join(buildDir, 'assets');
  const files = fs.readdirSync(assetsDir);
  
  return {
    jsFiles: files.filter(f => f.endsWith('.js') && !f.includes('.map')),
    cssFiles: files.filter(f => f.endsWith('.css'))
  };
}

/**
 * Generate loader script: fix URL, version.json + ?v=buildTime = mindig friss kód push után.
 * Egy deploy elég; a script src fix marad, a változások mindig élesben.
 */
function generateLoaderScript(jsFiles, cssFiles, cdnBase) {
  return `
(function() {
  'use strict';
  var cdnBase = '${cdnBase}';
  var container = document.createElement('div');
  container.id = 'root';
  container.className = 'marketly-ai-shop min-h-screen';
  var mainContent = document.querySelector('main') || document.querySelector('#content') || document.body;
  if (mainContent.firstChild) mainContent.insertBefore(container, mainContent.firstChild);
  else mainContent.appendChild(container);

  window.MARKETLY_CONFIG = {
    apiBase: '${config.shopUrl}',
    productBaseUrl: '/termek',
    cartUrl: '/cart',
    checkoutUrl: '/checkout',
    mode: 'unas-integrated',
    cdnBase: cdnBase,
    features: { sessionSharing: false, stockCheck: false, expressCheckout: false }
  };

  function onError() {
    container.innerHTML = '<div style="text-align:center;padding:50px;"><h2>Betöltési hiba</h2><p>Próbáld újra később.</p></div>';
  }

  fetch(cdnBase + '/version.json?t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var ver = (data && data.buildTime) || Date.now();
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cdnBase + '/assets/index.css?v=' + ver;
      document.head.appendChild(link);
      var script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      script.src = cdnBase + '/assets/index.js?v=' + ver;
      script.onerror = onError;
      document.body.appendChild(script);
    })
    .catch(function() {
      var ver = Date.now();
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cdnBase + '/assets/index.css?v=' + ver;
      document.head.appendChild(link);
      var script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      script.src = cdnBase + '/assets/index.js?v=' + ver;
      script.onerror = onError;
      document.body.appendChild(script);
    });
})();
`.trim();
}

/**
 * Create ScriptTag via UNAS API
 */
async function createScriptTag(token, apiUrl, scriptContent, pageUrl) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ScriptTags>
  <ScriptTag>
    <Action>add</Action>
    <Name><![CDATA[AI Shop Loader - ${pageUrl}]]></Name>
    <Position>body_end</Position>
    <PageUrl><![CDATA[${pageUrl}]]></PageUrl>
    <Script><![CDATA[${scriptContent}]]></Script>
  </ScriptTag>
</ScriptTags>`;

  console.log('=== setScriptTag Request ===');
  console.log(`Script length: ${scriptContent.length} chars`);
  console.log(`Page URL: ${pageUrl}`);

  const response = await fetch(`${apiUrl}/setScriptTag`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: xml
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`setScriptTag failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log('=== setScriptTag Response ===');
  console.log(responseText);

  // Parse response
  const { parseString } = await import('xml2js');
  const { promisify } = await import('util');
  const parseXML = promisify(parseString);
  const result = await parseXML(responseText);

  // Check status
  const status = result.ScriptTags?.ScriptTag?.Status?.[0] || result.ScriptTags?.ScriptTag?.Status;
  if (status === 'error') {
    const error = result.ScriptTags?.ScriptTag?.Error?.[0] || result.ScriptTags?.ScriptTag?.Error;
    throw new Error(`setScriptTag Error: ${error}`);
  }

  // Extract ScriptTag ID
  let scriptId = result.ScriptTags?.ScriptTag?.Id;
  if (Array.isArray(scriptId)) {
    scriptId = scriptId[0];
  }
  
  // Fallback: regex extraction
  if (!scriptId) {
    const idMatch = responseText.match(/<Id>(\d+)<\/Id>/);
    if (idMatch) {
      scriptId = idMatch[1];
    }
  }

  if (!scriptId) {
    throw new Error('setScriptTag: No ScriptTag ID returned!');
  }

  return scriptId;
}

/**
 * Create simple page (just the /butorbolt URL)
 */
async function createSimplePage(token, apiUrl, pageConfig) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>add</Action>
    <Lang>${pageConfig.lang}</Lang>
    <Name><![CDATA[${pageConfig.name}]]></Name>
    <Title><![CDATA[${pageConfig.title}]]></Title>
    <SefUrl><![CDATA[${pageConfig.slug}]]></SefUrl>
    <Type>normal</Type>
    <Menu>yes</Menu>
    <ShowMainPage>yes</ShowMainPage>
    <Meta>
      <Title><![CDATA[${pageConfig.metaTitle}]]></Title>
      <Description><![CDATA[${pageConfig.metaDescription}]]></Description>
      <Keywords><![CDATA[${pageConfig.metaKeywords}]]></Keywords>
    </Meta>
  </Page>
</Pages>`;

  const response = await fetch(`${apiUrl}/setPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: xml
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`setPage failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log('=== setPage Response ===');
  console.log(responseText);

  const { parseString } = await import('xml2js');
  const { promisify } = await import('util');
  const parseXML = promisify(parseString);
  const result = await parseXML(responseText);

  // Extract Page ID
  let pageId = result.Pages?.Page?.Id;
  if (Array.isArray(pageId)) {
    pageId = pageId[0];
  }
  if (!pageId) {
    const idMatch = responseText.match(/<Id>(\d+)<\/Id>/);
    if (idMatch) pageId = idMatch[1];
  }

  if (!pageId) {
    throw new Error('setPage: No Page ID returned!');
  }

  return pageId;
}

/**
 * Main deployment
 */
async function deploy() {
  const isDryRun = process.argv.includes('--dry-run');
  const stateFile = path.join(__dirname, '../config/deployment-state.json');
  
  const deploymentState = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    strategy: 'scripttag',
    config: {
      pageSlug: config.pageSlug,
      pageName: config.pageName,
      cdnBase: config.cdnBase
    },
    pageId: null,
    scriptTagId: null,
    githubCommit: null,
    success: false
  };

  try {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   🚀 UNAS AI SHOP - SCRIPTTAG DEPLOY        ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log(`Mode: ${isDryRun ? '🟡 DRY RUN' : '🔴 LIVE'}`);
    console.log(`Target: ${config.shopUrl}/${config.pageSlug}`);
    console.log(`CDN: ${config.cdnBase}`);
    console.log('');

    // STEP 1: BUILD
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 STEP 1: Building React App');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      console.log('Running: npm run build');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed');
    } else {
      console.log('Skipped (dry-run)');
    }
    console.log('');

    // STEP 2: PUSH TO GITHUB
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 STEP 2: Pushing to GitHub');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!isDryRun) {
      try {
        execSync('git add dist/', { stdio: 'pipe' });
        
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.includes('dist/')) {
          console.log('Changes detected, committing...');
          execSync(`git commit -m "Deploy AI Shop - ${new Date().toISOString()}"`, { stdio: 'inherit' });
          const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
          deploymentState.githubCommit = commitHash;
        } else {
          console.log('No changes to commit');
        }
        
        console.log('Pushing to GitHub...');
        execSync(`git push origin ${config.githubBranch}`, { stdio: 'inherit' });
        console.log('✅ Pushed to GitHub');
      } catch (error) {
        console.warn('⚠️  Git operations failed:', error.message);
        console.warn('⚠️  Continuing with existing GitHub files...');
      }
    } else {
      console.log('Skipped (dry-run)');
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

    // STEP 5: CREATE SIMPLE PAGE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 STEP 5: Creating Page (Empty)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const pageConfig = {
      lang: config.lang,
      name: config.pageName,
      title: config.pageName,
      slug: config.pageSlug,
      metaTitle: `${config.pageName} | Marketly`,
      metaDescription: 'AI-powered furniture shopping with image search, chat assistant, and personalized recommendations.',
      metaKeywords: 'AI, furniture, search, artificial intelligence, image recognition, chat'
    };

    if (!isDryRun) {
      deploymentState.pageId = await createSimplePage(token, config.apiUrl, pageConfig);
    } else {
      deploymentState.pageId = 'DRY_RUN_PAGE_ID';
    }
    
    console.log(`✅ Page created with ID: ${deploymentState.pageId}`);
    console.log(`   URL: ${config.shopUrl}/${config.pageSlug}`);
    console.log('');

    // STEP 6: CREATE LOADER SCRIPT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📜 STEP 6: Creating ScriptTag Loader');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const loaderScript = generateLoaderScript(jsFiles, cssFiles, config.cdnBase);
    const scriptSize = (Buffer.byteLength(loaderScript, 'utf8') / 1024).toFixed(1);
    console.log(`Script size: ${scriptSize} KB`);
    console.log(`Target page: /${config.pageSlug}`);

    if (!isDryRun) {
      deploymentState.scriptTagId = await createScriptTag(
        token, 
        config.apiUrl, 
        loaderScript, 
        `/${config.pageSlug}`
      );
    } else {
      deploymentState.scriptTagId = 'DRY_RUN_SCRIPT_ID';
    }
    
    console.log(`✅ ScriptTag created with ID: ${deploymentState.scriptTagId}`);
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
    console.log('📦 GitHub CDN:');
    console.log(`   ${config.cdnBase}`);
    console.log('');
    console.log('📋 Deployment Details:');
    console.log(`   Strategy: ScriptTag Injection`);
    console.log(`   Page ID: ${deploymentState.pageId}`);
    console.log(`   ScriptTag ID: ${deploymentState.scriptTagId}`);
    console.log(`   GitHub Commit: ${deploymentState.githubCommit || 'N/A'}`);
    console.log(`   Timestamp: ${deploymentState.timestamp}`);
    console.log('');
    console.log('🧪 Next Steps:');
    console.log(`   1. Open: ${config.shopUrl}/${config.pageSlug}`);
    console.log('   2. Check browser console for "AI Shop loader initialized"');
    console.log('   3. Verify React app loads from GitHub CDN');
    console.log('');
    console.log('⚠️  Rollback Command:');
    console.log('   npm run deploy:rollback');
    console.log('');

  } catch (error) {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║         ❌ DEPLOYMENT FAILED! ❌              ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log(`Stack: ${error.stack}`);
    console.log('');
    
    // Auto-rollback on failure
    if (!isDryRun && deploymentState.pageId) {
      console.log('🔄 Auto-rollback triggered...');
      try {
        const rollback = await import('./rollback.js');
        await rollback.performRollback(deploymentState, false);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError.message);
      }
    }
    
    process.exit(1);
  }
}

deploy();
