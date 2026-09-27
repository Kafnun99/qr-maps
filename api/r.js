// File: api/r.js (pada project qr_maps)
module.exports = async (req, res) => {
  // Ambil id dari query string (?id=A000001)
  const cardId = req.query.id || req.query.card_id;

  if (!cardId) {
    return res.status(400).send("ID Kartu tidak ditemukan.");
  }

  const GAS_DATABASE_URL = 'https://script.google.com/macros/s/AKfycbwL1g3RLGss0zdKhbzWRB7PS80UtLB0mAnlr0uhLll5Jy1eJNo8yyQZnId-SksTgKpC/exec';

  try {
    const response = await fetch(`${GAS_DATABASE_URL}?action=check_card&card_id=${cardId}`);
    const textData = await response.text();
    let cardData = {};

    try {
      cardData = JSON.parse(textData);
    } catch (e) {
      console.error("Format respon GAS bukan JSON:", textData);
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

    // Skenario A: Kartu Aktif dan Ada Link Google Maps
    if (cardData.status === 'active' && cardData.target_url && cardData.target_url.startsWith('http')) {
      return res.redirect(302, cardData.target_url);
    } 
    // Skenario B: Belum Aktif / Kosong
    else {
      return res.redirect(302, `/aktivate.html?id=${cardId}`);
    }

  } catch (error) {
    console.error("Error koneksi GAS:", error);
    return res.redirect(302, `/aktivate.html?id=${cardId}`);
  }
};