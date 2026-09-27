// File: server.js pada project qr-maps

const GAS_DATABASE_URL = 'URL_GOOGLE_APPS_SCRIPT_DATABASE_QR_MAPS_ANDA'; // Script yang terhubung ke sheet 'card export'

app.get('/r/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    // Kueri TUNGGAL ke Database QR Maps (sheet 'card export')
    const response = await fetch(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`);
    const cardData = await response.json();

    // Skenario A: Kartu SUDAH AKTIF dan Memiliki Link Google Maps
    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      // Langsung lemparkan pengguna ke URL Google Maps
      return res.redirect(302, cardData.target_url);
    } 
    
    // Skenario B: Kartu BELUM AKTIF / Kosong
    else {
      // Lemparkan pengguna ke halaman form aktivasi
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

  } catch (error) {
    console.error("Gagal membaca database QR Maps:", error);
    // Fallback keamanan jika database bermasalah: Arahkan ke halaman aktivasi
    return res.redirect(302, `/aktivate.html?id=${cardId}`);
  }
});