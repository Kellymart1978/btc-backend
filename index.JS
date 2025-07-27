const express = require('express');
const bodyParser = require('body-parser');
const bitcoin = require('bitcoinjs-lib');
const cors = require('cors');
const https = require('https');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Route to generate a new Bitcoin wallet
app.get('/wallet/new', (req, res) => {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  const privateKey = keyPair.toWIF();

  res.json({
    address,
    privateKey,
    wallet: "bc1q594u56ldpnwc5duuwxpzdcsr7vf8yt2v9k0tg9"
  });
});

// Route to fetch real Bitcoin price in USD and ZAR
app.get('/price', (req, res) => {
  https.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,zar', (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => {
      data += chunk;
    });
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const usd = `$${json.bitcoin.usd.toLocaleString()}`;
        const zar = `R${json.bitcoin.zar.toLocaleString()}`;

        res.json({
          success: true,
          price: {
            USD: usd,
            ZAR: zar
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to parse price data.' });
      }
    });
  }).on('error', () => {
    res.status(500).json({ success: false, error: 'Failed to fetch price data.' });
  });
});

app.listen(port, () => {
  console.log(`BTC backend running on http://localhost:${port}`);
});
