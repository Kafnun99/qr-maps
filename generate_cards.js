const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./cards.db');

// --- KONFIGURASI 100.000 KARTU ---
const TOTAL_CARDS = 100000;
const PREFIX = 'A';
const DEFAULT_PIN = '8888';
// URL Domain Vercel Terbaru
const DOMAIN_URL = 'https://qr-maps.vercel.app/c/'; 

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      card_id TEXT PRIMARY KEY,
      pin TEXT NOT NULL,
      gmaps_url TEXT,
      status TEXT DEFAULT 'unactive'
    )
  `);

  // Gunakan Transaction agar proses insert 100.000 data super cepat
  db.run('BEGIN TRANSACTION');

  const stmt = db.prepare(`INSERT OR IGNORE INTO cards (card_id, pin, status) VALUES (?, ?, 'unactive')`);
  const stream = fs.createWriteStream(path.join(__dirname, 'cards_export.csv'));
  stream.write('Card_ID,PIN,QR_URL\n');

  console.log(`⏳ Memproses pembuatan ${TOTAL_CARDS} kartu...`);

  for (let i = 1; i <= TOTAL_CARDS; i++) {
    // Format ID 6 digit angka: A000001 sampai A100000
    const cardId = PREFIX + i.toString().padStart(6, '0');
    const qrUrl = DOMAIN_URL + cardId;

    stmt.run(cardId, DEFAULT_PIN);
    stream.write(`${cardId},${DEFAULT_PIN},${qrUrl}\n`);
  }

  stmt.finalize();
  
  db.run('COMMIT', (err) => {
    if (!err) {
      console.log(`✅ BERHASIL! ${TOTAL_CARDS} kartu tersimpan di database dan cards_export.csv`);
    }
  });

  stream.end();
});

db.close();