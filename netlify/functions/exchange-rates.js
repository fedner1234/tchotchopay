// TchotchoPay — Exchange Rates
// Returns live USDC → HTG and USDC → USD rates
// Fetches from CoinGecko public API; falls back to a static rate if unavailable.

const https = require('https');

const STATIC_HTG_RATE = 132.5;   // fallback: 1 USDC ≈ 132.50 HTG
const STATIC_USD_RATE = 1.00;    // USDC is pegged to USD

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TchotchoPay/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return respond(204, {});
  }

  let usdcUsdRate = STATIC_USD_RATE;
  let source = 'static';

  // Try CoinGecko for live USDC price
  try {
    const data = await fetchJSON(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd'
    );
    if (data?.['usd-coin']?.usd) {
      usdcUsdRate = data['usd-coin'].usd;
      source = 'coingecko';
    }
  } catch {
    // use static fallback
  }

  // HTG rate: 1 USD ≈ 132.50 HTG (update periodically from BRH / Digicel data)
  const htgPerUsd = STATIC_HTG_RATE;
  const usdcHtgRate = usdcUsdRate * htgPerUsd;

  return respond(200, {
    success: true,
    data: {
      baseCurrency: 'USDC',
      rates: {
        USD: parseFloat(usdcUsdRate.toFixed(4)),
        HTG: parseFloat(usdcHtgRate.toFixed(2)),
      },
      source,
      updatedAt: new Date().toISOString(),
    },
  });
};
