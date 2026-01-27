/**
 * UNAS API Wrapper
 * Handles XML-based UNAS API communication
 * Manual XML building for maximum compatibility
 */

import xml2js from 'xml2js';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const parseXML = promisify(xml2js.parseString);

/**
 * Login to UNAS and get auth token
 */
export async function getUnasToken(apiKey, apiUrl) {
  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: `<?xml version="1.0" encoding="UTF-8"?><Authentication><ApiKey>${apiKey}</ApiKey></Authentication>`
  });

  if (!response.ok) {
    throw new Error(`UNAS Login failed: ${response.status}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.Error) {
    throw new Error(`UNAS Login Error: ${result.Error}`);
  }

  let token = result.Login?.Token || result.Token || result.Response?.Token;
  
  // UNAS returns token in array format sometimes
  if (Array.isArray(token)) {
    token = token[0];
  }

  if (!token || typeof token !== 'string') {
    throw new Error('No valid token received from UNAS login');
  }

  return token;
}

/**
 * Delete Page (setPage)
 */
export async function deletePage(token, apiUrl, pageId) {
  const deleteXML = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>delete</Action>
    <Id>${pageId}</Id>
  </Page>
</Pages>`;

  const response = await fetch(`${apiUrl}/setPage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  const responseText = await response.text();
  const result = await parseXML(responseText);

  const status = result.Pages?.Page?.Status?.[0] || result.Pages?.Page?.Status;
  if (status === 'error') {
    const error = result.Pages?.Page?.Error?.[0] || result.Pages?.Page?.Error;
    throw new Error(`deletePage Error: ${error}`);
  }

  return true;
}

/**
 * Delete ScriptTag (setScriptTag)
 */
export async function deleteScriptTag(token, apiUrl, scriptTagId) {
  const deleteXML = `<?xml version="1.0" encoding="UTF-8"?>
<ScriptTags>
  <ScriptTag>
    <Action>delete</Action>
    <Id>${scriptTagId}</Id>
  </ScriptTag>
</ScriptTags>`;

  const response = await fetch(`${apiUrl}/setScriptTag`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  const responseText = await response.text();
  const result = await parseXML(responseText);

  const status = result.ScriptTags?.ScriptTag?.Status?.[0] || result.ScriptTags?.ScriptTag?.Status;
  if (status === 'error') {
    const error = result.ScriptTags?.ScriptTag?.Error?.[0] || result.ScriptTags?.ScriptTag?.Error;
    throw new Error(`deleteScriptTag Error: ${error}`);
  }

  return true;
}
