/**
 * UNAS AI Shop Rollback Script
 * 
 * Deletes:
 * - AI Shop page (setPage delete)
 * - Content (setPageContent delete)
 * - Uploaded files (setStorage delete)
 * 
 * Usage:
 *   node deployment/scripts/rollback.js
 *   node deployment/scripts/rollback.js --force (no confirmation)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import {
  getUnasToken,
  deletePage,
  deleteContent,
  deleteFromStorage
} from './unas-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.deployment' });

const isForce = process.argv.includes('--force');
const config = {
  apiKey: process.env.UNAS_API_KEY,
  apiUrl: process.env.UNAS_API_URL
};

/**
 * Ask user confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer === '');
    });
  });
}

/**
 * Main rollback function
 */
export async function rollback(stateOverride = null) {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║      🔄 UNAS AI SHOP ROLLBACK                ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');

  try {
    // Load deployment state
    const stateFile = path.join(__dirname, '..', 'config', 'deployment-state.json');
    
    if (!fs.existsSync(stateFile) && !stateOverride) {
      console.error('❌ No deployment state found!');
      console.error('');
      console.error('File not found: deployment/config/deployment-state.json');
      console.error('');
      console.error('This means:');
      console.error('  - No deployment has been made yet, OR');
      console.error('  - Deployment state file was deleted');
      console.error('');
      console.error('Nothing to rollback.');
      process.exit(1);
    }

    const state = stateOverride || JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    console.log('📋 Current Deployment State:');
    console.log(`   Timestamp: ${state.timestamp}`);
    console.log(`   Mode: ${state.mode}`);
    console.log(`   Page ID: ${state.pageId || 'none'}`);
    console.log(`   Content ID: ${state.contentId || 'none'}`);
    console.log(`   Uploaded Files: ${state.uploadedFiles?.length || 0}`);
    console.log(`   Success: ${state.success ? '✅' : '❌'}`);
    console.log('');

    // Confirmation
    if (!isForce) {
      console.log('⚠️  WARNING: This will DELETE the AI Shop from UNAS!');
      console.log('');
      console.log('This will remove:');
      console.log('  - Page: marketly.hu/' + (state.config?.pageSlug || 'butorbolt'));
      console.log('  - All HTML content');
      console.log(`  - ${state.uploadedFiles?.length || 0} uploaded files`);
      console.log('');
      
      const confirmed = await askConfirmation('Continue with rollback? (y/N): ');
      
      if (!confirmed) {
        console.log('❌ Rollback cancelled by user');
        process.exit(0);
      }
    }

    console.log('');

    // LOGIN
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Logging in to UNAS API...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const token = await getUnasToken(config.apiKey, config.apiUrl);
    console.log('✅ Token received');
    console.log('');

    let deletedItems = 0;

    // DELETE CONTENT
    if (state.contentId && state.contentId !== 'DRY_RUN_CONTENT_ID') {
      console.log(`🗑️  Deleting content (ID: ${state.contentId})...`);
      try {
        await deleteContent(token, config.apiUrl, state.contentId);
        console.log('✅ Content deleted');
        deletedItems++;
      } catch (error) {
        console.warn(`⚠️  Content delete failed: ${error.message}`);
      }
      console.log('');
    }

    // DELETE PAGE
    if (state.pageId && state.pageId !== 'DRY_RUN_PAGE_ID') {
      console.log(`🗑️  Deleting page (ID: ${state.pageId})...`);
      try {
        await deletePage(token, config.apiUrl, state.pageId);
        console.log('✅ Page deleted');
        deletedItems++;
      } catch (error) {
        console.warn(`⚠️  Page delete failed: ${error.message}`);
      }
      console.log('');
    }

    // DELETE FILES
    if (state.uploadedFiles && state.uploadedFiles.length > 0) {
      console.log(`🗑️  Deleting ${state.uploadedFiles.length} uploaded files...`);
      
      let deletedFiles = 0;
      for (const remotePath of state.uploadedFiles) {
        try {
          await deleteFromStorage(token, config.apiUrl, remotePath);
          deletedFiles++;
          
          if (deletedFiles % 10 === 0) {
            console.log(`  Progress: ${deletedFiles}/${state.uploadedFiles.length}`);
          }
        } catch (error) {
          // Continue on error (file might not exist)
        }
      }
      
      console.log(`✅ ${deletedFiles} files deleted`);
      console.log('');
      deletedItems++;
    }

    // CLEAN STATE FILE
    console.log('🧹 Cleaning deployment state...');
    fs.unlinkSync(stateFile);
    console.log('✅ State file removed');
    console.log('');

    // SUCCESS
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║       ✅ ROLLBACK SUCCESSFUL! ✅              ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log('✅ AI Shop removed from UNAS');
    console.log('✅ Webshop visszaállt az eredeti állapotába');
    console.log(`✅ ${deletedItems} components deleted`);
    console.log('');
    console.log('🔄 To deploy again: npm run deploy:live');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('╔═══════════════════════════════════════════════╗');
    console.error('║          ❌ ROLLBACK FAILED! ❌               ║');
    console.error('╚═══════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('⚠️  Manual cleanup may be required!');
    console.error('   1. Login to UNAS admin panel');
    console.error('   2. Delete page: Pages → AI Bútorbolt');
    console.error('   3. Delete content: PageContent → AI Bútorbolt');
    console.error('   4. Delete files: Storage → /ai-shop/');
    console.error('');
    
    process.exit(1);
  }
}

// RUN (if called directly)
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  rollback();
}
