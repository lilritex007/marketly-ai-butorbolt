/**
 * UNAS API Wrapper
 * Minimal implementation for AI Shop deployment
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';
import fs from 'fs';
import path from 'path';

const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder({ headless: false });

/**
 * Parse XML response to JSON
 */
export async function parseXML(xmlString) {
  try {
    return await parser.parseStringPromise(xmlString);
  } catch (error) {
    console.error('XML Parse Error:', error.message);
    console.error('XML Content:', xmlString.substring(0, 500));
    throw error;
  }
}

/**
 * Get UNAS API Bearer Token
 */
export async function getUnasToken(apiKey, apiUrl) {
  const loginXML = builder.buildObject({
    Params: {
      ApiKey: apiKey
    }
  });

  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: loginXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`UNAS Login failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Error) {
    throw new Error(`UNAS Login Error: ${result.Error}`);
  }

  const token = result.Login?.Token || result.Token || result.Response?.Token;

  if (!token) {
    throw new Error('No token received from UNAS login');
  }

  return token;
}

/**
 * Create Page (setPage)
 */
export async function createPage(token, apiUrl, pageConfig) {
  const pageXML = builder.buildObject({
    Pages: {
      Page: {
        Action: 'add',
        Lang: pageConfig.lang,
        Name: pageConfig.name,
        Title: pageConfig.title || pageConfig.name,
        Parent: pageConfig.parent || 0,
        Order: pageConfig.order || 1,
        Reg: pageConfig.requireLogin ? 'yes' : 'no',
        Menu: pageConfig.showInMenu ? 'yes' : 'no',
        Target: pageConfig.target || 'self',
        Main: pageConfig.isMain ? 'yes' : 'no',
        ShowMainPage: pageConfig.showOnMain ? 'yes' : 'no',
        Type: pageConfig.type || 'normal',
        SefUrl: pageConfig.slug,
        Meta: {
          Keywords: pageConfig.metaKeywords || '',
          Description: pageConfig.metaDescription || '',
          Title: pageConfig.metaTitle || pageConfig.title || pageConfig.name
        }
      }
    }
  });

  const response = await fetch(`${apiUrl}/setPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: pageXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`setPage failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Pages?.Page?.Status === 'error') {
    throw new Error(`setPage Error: ${result.Pages.Page.Error}`);
  }

  return result.Pages?.Page?.Id;
}

/**
 * Create Content (setPageContent)
 */
export async function createContent(token, apiUrl, contentConfig) {
  const contentXML = builder.buildObject({
    Contents: {
      Content: {
        Action: 'add',
        Lang: contentConfig.lang,
        Title: contentConfig.title,
        Type: contentConfig.type || 'normal',
        Published: contentConfig.published ? 'yes' : 'no',
        NormalContent: {
          Text: contentConfig.html,
          ContentIsHTML: 'yes'
        }
      }
    }
  });

  const response = await fetch(`${apiUrl}/setPageContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: contentXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`setPageContent failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Contents?.Content?.Status === 'error') {
    throw new Error(`setPageContent Error: ${result.Contents.Content.Error}`);
  }

  return result.Contents?.Content?.Id;
}

/**
 * Link Content to Page (setPage modify)
 */
export async function linkContentToPage(token, apiUrl, pageId, contentId) {
  const linkXML = builder.buildObject({
    Pages: {
      Page: {
        Action: 'modify',
        Id: pageId,
        Contents: {
          Content: {
            Id: contentId
          }
        }
      }
    }
  });

  const response = await fetch(`${apiUrl}/setPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: linkXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`linkContentToPage failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Pages?.Page?.Status === 'error') {
    throw new Error(`linkContentToPage Error: ${result.Pages.Page.Error}`);
  }

  return true;
}

/**
 * Upload file to UNAS storage (setStorage)
 */
export async function uploadToStorage(token, apiUrl, filePath, remotePath) {
  const fileContent = fs.readFileSync(filePath);
  const base64Content = fileContent.toString('base64');
  const fileName = path.basename(remotePath);
  const remoteDir = path.dirname(remotePath).replace(/\\/g, '/');

  // Manual XML building - UNAS setStorage API
  // Try "upload" instead of "add" (common for file uploads)
  const storageXML = `<?xml version="1.0" encoding="UTF-8"?>
<StorageItems>
  <StorageItem>
    <Action>upload</Action>
    <Path>${remoteDir}</Path>
    <FileName>${fileName}</FileName>
    <Content>${base64Content}</Content>
  </StorageItem>
</StorageItems>`;

  // DEBUG: Log XML
  console.log('=== DEBUG setStorage XML ===');
  console.log('Remote Path:', remotePath);
  console.log('Remote Dir:', remoteDir);
  console.log('File Name:', fileName);
  console.log('Base64 length:', base64Content.length);
  console.log('XML (first 500 chars):');
  console.log(storageXML.substring(0, 500));
  console.log('============================');

  const response = await fetch(`${apiUrl}/setStorage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: storageXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`setStorage failed for ${remotePath}: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Files?.File?.Status === 'error') {
    throw new Error(`setStorage Error: ${result.Files.File.Error}`);
  }

  return true;
}

/**
 * Delete Page (setPage delete)
 */
export async function deletePage(token, apiUrl, pageId) {
  const deleteXML = builder.buildObject({
    Pages: {
      Page: {
        Action: 'delete',
        Id: pageId
      }
    }
  });

  const response = await fetch(`${apiUrl}/setPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`deletePage failed: ${response.status} - ${errorText}`);
  }

  return true;
}

/**
 * Delete Content (setPageContent delete)
 */
export async function deleteContent(token, apiUrl, contentId) {
  const deleteXML = builder.buildObject({
    Contents: {
      Content: {
        Action: 'delete',
        Id: contentId
      }
    }
  });

  const response = await fetch(`${apiUrl}/setPageContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`deleteContent failed: ${response.status} - ${errorText}`);
  }

  return true;
}

/**
 * Delete file from storage (setStorage delete)
 */
export async function deleteFromStorage(token, apiUrl, remotePath) {
  const fileName = path.basename(remotePath);
  const remoteDir = path.dirname(remotePath).replace(/\\/g, '/');

  // Manual XML building - UNAS expects StorageItems/StorageItem
  const deleteXML = `<?xml version="1.0" encoding="UTF-8"?>
<StorageItems>
  <StorageItem>
    <Action>delete</Action>
    <Path>${remoteDir}</Path>
    <FileName>${fileName}</FileName>
  </StorageItem>
</StorageItems>`;

  const response = await fetch(`${apiUrl}/setStorage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  if (!response.ok) {
    // Nem kritikus ha file nem létezik
    return false;
  }

  return true;
}
