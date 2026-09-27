// File: server.js (Project qr_maps)
const express = require('express');
const path = require('path');
const app = express();

const GAS_DATABASE_URL = 'https://script.google.com/macros/s/AKfycbwL1g3RLGss0zdKhbzWRB7PS80UtLB0mAnlr0uhLll5Jy1eJNo8yyQZnId-SksTgKpC/exec';

// 1. Sajikan file statis dari folder root
app.use(express.static(path.join(__dirname)));

// 2. Alias Route (Handle 'c' maupun 'k' biar gak pernah 404 lagi)
app.get('/activate.html', (req, res) => res.sendFile(path.join(__dirname, 'activate.html')));
app.get('/aktivate.html', (req, res) => res.sendFile(path.join(__dirname, 'activate.html')));

// Fungsi fetch dengan timeout 3 detik agar TIDAK LEMOT
async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 3. Endpoint pemicu QR /r/:id
app.get('/r/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    // Dipanggil dengan timeout 3 detik
    const response = await fetchWithTimeout(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`, 3000);
    const textData = await response.text();
    let cardData = {};

    try {
      cardData = JSON.parse(textData);
    } catch (parseErr) {
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
    // Jika GAS lemot / error / timeout > 3 detik, LANGSUNG REDIRECT tanpa nunggu!
    console.log("GAS Response Slow/Timeout, fallback to activate.html");
    return res.redirect(302, `/activate.html?id=${cardId}`);
  }
});

// 4. Endpoint pendukung /api/r
app.get('/api/r', async (req, res) => {
  const cardId = req.query.id || req.query.card_id;
  if (!cardId) return res.status(400).send("ID Kartu tidak ditemukan.");

  try {
    const response = await fetchWithTimeout(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`, 3000);
    const textData = await response.text();
    let cardData = JSON.parse(textData);

    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      return res.redirect(302, cardData.target_url);
    } else {
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }
  } catch (error) {
    return res.redirect(302, `/activate.html?id=${cardId}`);
  }
});

module.exports = app;