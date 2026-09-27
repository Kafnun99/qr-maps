const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const outputDir = path.join(__dirname, 'qr_codes');

// Buat folder 'qr_codes' jika belum ada
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// BACA CSV DAN SECARA BERTAHAP SIMPAN GAMBAR PNG
const generateQRs = async () => {
  console.log('⏳ Mulai generate gambar QR Code...');

  // Contoh generate 1.000 kartu pertama (sesuaikan jumlahnya)
  for (let i = 1; i <= 1000; i++) {
    const cardId = 'A' + i.toString().padStart(6, '0');
    const url = `https://qr-maps.vercel.app/c/${cardId}`;
    const filePath = path.join(outputDir, `${cardId}.png`);

    await QRCode.toFile(filePath, url, {
      width: 300,
      margin: 2
    });
  }

  console.log('✅ Selesai! Gambar QR tersimpan di folder qr_codes');
};

generateQRs();