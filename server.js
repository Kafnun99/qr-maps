const express = require('express');
const path = require('path');
const app = express();

// --- KONFIGURASI ---
const SPREADSHEET_ID = '1zP9ilzwuenTdbavzbFFxbDLjTrkbOjqWJDhijweoWAA';
const GOOGLE_API_KEY = 'AIzaSyDpiwfF970bbs07VzP8rHxuTaNDVmYEm3c';
const SHEET_NAME = 'cards_export';

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'activate.html'));
});
app.get('/c/:id', async (req, res) => {
  // Matikan caching Vercel CDN & Browser
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const cardId = req.params.id;
  const isDebug = req.query.debug === 'true';

  try {
    const cardIndex = parseInt(cardId.replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(cardIndex) || cardIndex < 1) {
      if (isDebug) return res.json({ error: 'Format Card ID tidak valid', cardId });
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }

    const rowNumber = cardIndex + 1;

    // Hapus parameter &_t agar Google Sheets API tidak error 400
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${SHEET_NAME}'!A${rowNumber}:D${rowNumber}?key=${GOOGLE_API_KEY}`;

    const apiRes = await fetch(apiUrl, { cache: 'no-store' });
    const data = await apiRes.json();

    const row = (data.values && data.values[0]) ? data.values[0] : [];
    
    let gmapsUrl = (row[2] || '').trim();
    let status = (row[3] || '').trim().toLowerCase();

    if (isDebug) {
      return res.json({
        cardId,
        rowNumberTarget: rowNumber,
        googleApiHttpStatus: apiRes.status,
        rawGoogleApiResponse: data,
        extractedRow: row,
        parsedGmapsUrl: gmapsUrl,
        parsedStatus: status,
        decision: (status === 'active' && gmapsUrl !== '') ? 'REDIRECT_KE_GMAPS' : 'REDIRECT_KE_AKTIVASI'
      });
    }

    if (status === 'active' && gmapsUrl !== '') {
      if (!gmapsUrl.startsWith('http://') && !gmapsUrl.startsWith('https://')) {
        gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gmapsUrl)}`;
      }
      return res.redirect(302, gmapsUrl);
    } else {
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }
  } catch (err) {
    console.error('Error fast redirect:', err);
    if (isDebug) return res.json({ error: err.toString() });
    return res.redirect(302, `/activate.html?id=${cardId}`);
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

module.exports = app;