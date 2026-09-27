// File: server.js pada project qr-maps

const GAS_DATABASE_URL = 'https://script.google.com/macros/s/AKfycbwL1g3RLGss0zdKhbzWRB7PS80UtLB0mAnlr0uhLll5Jy1eJNo8yyQZnId-SksTgKpC/exec';

app.get('/r/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    const response = await fetch(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`);
    
    // Ambil text dulu untuk menghindari crash parsing JSON jika GAS error
    const textData = await response.text();
    let cardData = {};

    try {
      cardData = JSON.parse(textData);
    } catch (parseErr) {
      console.error("Respon dari GAS bukan JSON valid:", textData);
      // Jika respon dari GAS bukan JSON, lempar ke halaman aktivasi daripada error 500
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

    // Skenario A: Kartu SUDAH AKTIF dan Memiliki link Google Maps
    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      return res.redirect(302, cardData.target_url);
    } 
    
    // Skenario B: Kartu BELUM AKTIF / Kosong
    else {
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

  } catch (error) {
    console.error("Gagal membaca database QR Maps:", error);
    // Fallback jika fetch koneksi gagal
    return res.redirect(302, `/aktivate.html?id=${cardId}`);
  }
});