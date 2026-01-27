/**
 * Test endpoint - csak UNAS login
 * Endpoint: /api/test-login
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const startTime = Date.now();
    const apiKey = process.env.UNAS_API_KEY;

    console.log('🔐 Testing UNAS login...');

    const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>${apiKey}</ApiKey>
</Params>`;

    const response = await fetch('https://api.unas.eu/shop/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      body: loginXml
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const loginData = await response.text();
    const parser = new xml2js.Parser({ explicitArray: false });
    const loginResult = await parser.parseStringPromise(loginData);

    if (loginResult.Error) {
      throw new Error(`UNAS Error: ${loginResult.Error}`);
    }

    const token = loginResult.Login?.Token || 
                  loginResult.Token || 
                  loginResult.Response?.Token;

    const elapsed = Date.now() - startTime;

    console.log(`✅ Login successful (${elapsed}ms)`);

    res.status(200).json({
      success: true,
      loginTime: elapsed,
      hasToken: !!token,
      message: `Login took ${elapsed}ms`
    });

  } catch (error) {
    console.error('❌ Login test failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
