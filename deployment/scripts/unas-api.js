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
 * Create Page WITH embedded Content in one atomic operation
 * This ensures the content is properly linked from the start
 */
export async function createPageWithContent(token, apiUrl, pageConfig, htmlContent) {
  const pageXML = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>add</Action>
    <Lang>${pageConfig.lang}</Lang>
    <Name><![CDATA[${pageConfig.name}]]></Name>
    <Title><![CDATA[${pageConfig.title || pageConfig.name}]]></Title>
    <Parent>${pageConfig.parent || 0}</Parent>
    <Order>${pageConfig.order || 1}</Order>
    <Reg>${pageConfig.requireLogin ? 'yes' : 'no'}</Reg>
    <Menu>${pageConfig.showInMenu ? 'yes' : 'no'}</Menu>
    <Target>${pageConfig.target || 'self'}</Target>
    <Main>${pageConfig.isMain ? 'yes' : 'no'}</Main>
    <ShowMainPage>${pageConfig.showOnMain ? 'yes' : 'no'}</ShowMainPage>
    <Type>${pageConfig.type || 'normal'}</Type>
    <SefUrl><![CDATA[${pageConfig.slug}]]></SefUrl>
    <Meta>
      <Keywords><![CDATA[${pageConfig.metaKeywords || ''}]]></Keywords>
      <Description><![CDATA[${pageConfig.metaDescription || ''}]]></Description>
      <Title><![CDATA[${pageConfig.metaTitle || pageConfig.title || pageConfig.name}]]></Title>
    </Meta>
    <PageContents>
      <PageContent>
        <Lang>${pageConfig.lang}</Lang>
        <Title><![CDATA[${pageConfig.name} Content]]></Title>
        <Type>normal</Type>
        <Published>yes</Published>
        <NormalContent>
          <Text><![CDATA[${htmlContent}]]></Text>
          <ContentIsHTML>yes</ContentIsHTML>
        </NormalContent>
      </PageContent>
    </PageContents>
  </Page>
</Pages>`;

  console.log('=== createPageWithContent XML (first 500 chars) ===');
  console.log(pageXML.substring(0, 500));

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
  console.log('=== setPage Response ===');
  console.log(responseText);
  
  const result = await parseXML(responseText);

  // Check for errors
  const status = result.Pages?.Page?.Status?.[0] || result.Pages?.Page?.Status;
  if (status === 'error') {
    const error = result.Pages?.Page?.Error?.[0] || result.Pages?.Page?.Error || 'Unknown error';
    throw new Error(`setPage Error: ${error}`);
  }

  // Extract Page ID
  let pageId = result.Pages?.Page?.Id;
  if (Array.isArray(pageId)) {
    pageId = pageId[0];
  }
  
  if (!pageId) {
    throw new Error('setPage: No Page ID returned!');
  }

  console.log(`✅ Page ID extracted: ${pageId}`);
  
  // Extract Content ID if available (embedded content)
  let contentId = result.Pages?.Page?.PageContents?.PageContent?.Id;
  if (Array.isArray(contentId)) {
    contentId = contentId[0];
  }
  
  return { pageId, contentId };
}

/**
 * LEGACY - Create Page only (kept for compatibility)
 */
export async function createPage(token, apiUrl, pageConfig) {
  const pageXML = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>add</Action>
    <Lang>${pageConfig.lang}</Lang>
    <Name><![CDATA[${pageConfig.name}]]></Name>
    <Title><![CDATA[${pageConfig.title || pageConfig.name}]]></Title>
    <Parent>${pageConfig.parent || 0}</Parent>
    <Order>${pageConfig.order || 1}</Order>
    <Reg>${pageConfig.requireLogin ? 'yes' : 'no'}</Reg>
    <Menu>${pageConfig.showInMenu ? 'yes' : 'no'}</Menu>
    <Target>${pageConfig.target || 'self'}</Target>
    <Main>${pageConfig.isMain ? 'yes' : 'no'}</Main>
    <ShowMainPage>${pageConfig.showOnMain ? 'yes' : 'no'}</ShowMainPage>
    <Type>${pageConfig.type || 'normal'}</Type>
    <SefUrl><![CDATA[${pageConfig.slug}]]></SefUrl>
    <Meta>
      <Keywords><![CDATA[${pageConfig.metaKeywords || ''}]]></Keywords>
      <Description><![CDATA[${pageConfig.metaDescription || ''}]]></Description>
      <Title><![CDATA[${pageConfig.metaTitle || pageConfig.title || pageConfig.name}]]></Title>
    </Meta>
  </Page>
</Pages>`;

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
  console.log('=== setPage Response ===');
  console.log(responseText);
  
  const result = await parseXML(responseText);

  // Check for errors
  const status = result.Pages?.Page?.Status?.[0] || result.Pages?.Page?.Status;
  if (status === 'error') {
    const error = result.Pages?.Page?.Error?.[0] || result.Pages?.Page?.Error || 'Unknown error';
    throw new Error(`setPage Error: ${error}`);
  }

  // Extract Page ID correctly (UNAS returns it in array format)
  let pageId = result.Pages?.Page?.Id;
  if (Array.isArray(pageId)) {
    pageId = pageId[0];
  }
  
  if (!pageId) {
    throw new Error('setPage: No Page ID returned!');
  }

  console.log(`✅ Page ID extracted: ${pageId}`);
  return pageId;
}

/**
 * Create Content (setPageContent)
 */
export async function createContent(token, apiUrl, contentConfig) {
  // Manual XML - xml2js has issues with UNAS API
  const contentXML = `<?xml version="1.0" encoding="UTF-8"?>
<PageContents>
  <PageContent>
    <Action>add</Action>
    <Lang>${contentConfig.lang}</Lang>
    <Title><![CDATA[${contentConfig.title}]]></Title>
    <Type>${contentConfig.type || 'normal'}</Type>
    <Published>${contentConfig.published ? 'yes' : 'no'}</Published>
    <NormalContent>
      <Text><![CDATA[${contentConfig.html}]]></Text>
      <ContentIsHTML>yes</ContentIsHTML>
    </NormalContent>
  </PageContent>
</PageContents>`;

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

  if (result.PageContents?.PageContent?.Status === 'error') {
    throw new Error(`setPageContent Error: ${result.PageContents.PageContent.Error}`);
  }

  return result.PageContents?.PageContent?.Id;
}

/**
 * Link Content to Page (setPage modify)
 * CRITICAL: Use <Contents> not <PageContents>!
 */
export async function linkContentToPage(token, apiUrl, pageId, contentId) {
  // Manual XML - UNAS expects Type even for modify
  const linkXML = `<?xml version="1.0" encoding="UTF-8"?>
<Pages>
  <Page>
    <Action>modify</Action>
    <Id>${pageId}</Id>
    <Type>normal</Type>
    <Contents>
      <Content>
        <Id>${contentId}</Id>
      </Content>
    </Contents>
  </Page>
</Pages>`;

  console.log('=== linkContentToPage XML ===');
  console.log(linkXML);

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
  console.log('=== linkContentToPage Response ===');
  console.log(responseText);
  
  const result = await parseXML(responseText);

  // Check for errors
  const status = result.Pages?.Page?.Status?.[0] || result.Pages?.Page?.Status;
  if (status === 'error') {
    const error = result.Pages?.Page?.Error?.[0] || result.Pages?.Page?.Error || 'Unknown error';
    throw new Error(`linkContentToPage Error: ${error}`);
  }

  return true;
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

  if (result.Pages?.Page?.Status === 'error') {
    throw new Error(`deletePage Error: ${result.Pages.Page.Error}`);
  }

  return true;
}

/**
 * Delete Content (setPageContent)
 */
export async function deleteContent(token, apiUrl, contentId) {
  const deleteXML = `<?xml version="1.0" encoding="UTF-8"?>
<PageContents>
  <PageContent>
    <Action>delete</Action>
    <Id>${contentId}</Id>
  </PageContent>
</PageContents>`;

  const response = await fetch(`${apiUrl}/setPageContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: deleteXML
  });

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.PageContents?.PageContent?.Status === 'error') {
    throw new Error(`deleteContent Error: ${result.PageContents.PageContent.Error}`);
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

  const storageXML = `<?xml version="1.0" encoding="UTF-8"?>
<StorageItems>
  <StorageItem>
    <Action>upload</Action>
    <Path>${remoteDir}</Path>
    <FileName>${fileName}</FileName>
    <Content>${base64Content}</Content>
  </StorageItem>
</StorageItems>`;

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
    throw new Error(`uploadToStorage failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.StorageItems?.StorageItem?.Status === 'error') {
    throw new Error(`uploadToStorage Error: ${result.StorageItems.StorageItem.Error}`);
  }

  return true;
}

/**
 * Delete file from UNAS storage (setStorage)
 */
export async function deleteFromStorage(token, apiUrl, remotePath) {
  const fileName = path.basename(remotePath);
  const remoteDir = path.dirname(remotePath).replace(/\\/g, '/');

  const storageXML = `<?xml version="1.0" encoding="UTF-8"?>
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
    body: storageXML
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`deleteFromStorage failed: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  const result = await parseXML(responseText);

  if (result.StorageItems?.StorageItem?.Status === 'error') {
    throw new Error(`deleteFromStorage Error: ${result.StorageItems.StorageItem.Error}`);
  }

  return true;
}
