const express = require('express');
const router = express.Router();
const kf = require('./KrakenFuturesApiV3');

router.get('/example', async (req, res, next) => {
  const baseUrl = 'https://futures.kraken.com/derivatives';
  const requestTimeoutMs = 5000;
  const KrakenFutures = new kf.KrakenFuturesApiV3(baseUrl, 'YOUR-API-KEY', 'YOUR-API-SECRET', requestTimeoutMs);
  const accounts = await KrakenFutures.getAccounts();
  res.send(accounts)
});