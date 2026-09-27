// File: server.js (Project qr_maps)
const express = require('express');
const path = require('path');
const app = express();

const GAS_DATABASE_URL = 'https://script.google.com/macros/s/AKfycbwL1g3RLGss0zdKhbzWRB7PS80UtLB0mAnlr0uhLll5Jy1eJNo8yyQZnId-SksTgKpC/exec';

// 1. Sajikan file statis dari folder root
app.use(express.static(path.join(__dirname)));

// 2. Alias route: jika ada yang minta /activate.html (dengan 'c'), kirim file /aktivate.html (dengan 'k')
// Alias route: jika ada yang minta /activate.html, kirim file activate.html (pakai c)
app.get('/activate.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'activate.html'));
});

// 3. Endpoint pemicu QR /r/:id
app.get('/r/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    const response = await fetch(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`);
    const textData = await response.text();
    let cardData = {};

    try {
      cardData = JSON.parse(textData);
    } catch (parseErr) {
      console.error("Respon dari GAS bukan JSON valid:", textData);
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }

    // Skenario A: Kartu SUDAH AKTIF
    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      return res.redirect(302, cardData.target_url);
    } 
    // Skenario B: BELUM AKTIF
    else {
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }

  } catch (error) {
    console.error("Gagal membaca database QR Maps:", error);
    return res.redirect(302, `/activate.html?id=${cardId}`);
  }
});

// 4. Endpoint pendukung /api/r
app.get('/api/r', async (req, res) => {
  const cardId = req.query.id || req.query.card_id;
  if (!cardId) return res.status(400).send("ID Kartu tidak ditemukan.");

  try {
    const response = await fetch(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`);
    const textData = await response.text();
    let cardData = {};

    try {
      cardData = JSON.parse(textData);
    } catch (e) {
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      return res.redirect(302, cardData.target_url);
    } else {
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }
  } catch (error) {
    return res.redirect(302, `/aktivate.html?id=${cardId}`);
  }
});

// Export app untuk Vercel Serverless Handler
module.exports = app;