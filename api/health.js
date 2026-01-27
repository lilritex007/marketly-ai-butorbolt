/**
 * Vercel Serverless Function - Health Check
 * Endpoint: /api/health
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Marketly AI Shop API',
    version: '1.0.0'
  });
}
