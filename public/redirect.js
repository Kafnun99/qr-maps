// Dapatkan card_id dari query string URL (contoh: ?id=A000001)
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id') || 'A000001';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxdUclcFRqNlvfYxQ8LcCoDFnz0nZYBbU8DJDAtBLfdz-BgnYV1n6PxZsWxi8Yaxujb/exec';

/**
 * Fungsi pendeteksi jenis perangkat secara spesifik:
 * Output: "Android", "iOS", atau "Desktop"
 */
function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Deteksi Perangkat Android
  if (/android/i.test(ua)) {
    return 'Android';
  }

  // Deteksi Perangkat iOS (iPhone, iPod, iPad, serta iPadOS versi baru)
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    return 'iOS';
  }
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 'iOS';
  }

  // Jika bukan Android atau iOS, dikategorikan sebagai Desktop
  return 'Desktop';
}

async function handleRedirect() {
  try {
    // 1. Ambil data IP dan Lokasi Pengunjung
    let city = 'Unknown';
    let country = 'Unknown';
    let ip = '';

    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      city = ipData.city || 'Unknown';
      country = ipData.country_name || 'Unknown';
      ip = ipData.ip || '';
    } catch (e) {
      console.warn('Gagal mengambil lokasi IP:', e);
    }

    // Ambil jenis perangkat yang spesifik
    const device = getDeviceType();
    const userAgent = navigator.userAgent;

    // 2. Kirim data log scan ke Google Apps Script
    const logData = new URLSearchParams();
    logData.append('action', 'log_scan');
    logData.append('card_id', cardId);
    logData.append('ip', ip);
    logData.append('city', city);
    logData.append('country', country);
    logData.append('user_agent', userAgent);
    logData.append('device', device); // Berisi: Android / iOS / Desktop
    logData.append('timestamp', new Date().toISOString());

    // Jalankan pencatatan log di background
    fetch(GAS_URL, {
      method: 'POST',
      body: logData
    }).catch(err => console.error('Error log scan:', err));

    // 3. Cek status kartu & arahkan (redirect) pengunjung
    const cardRes = await fetch(`${GAS_URL}?card_id=${cardId}`);
    const cardData = await cardRes.json();

    if (cardData.status === 'success' && cardData.card_status === 'active' && cardData.nama_toko) {
      let targetUrl = cardData.nama_toko;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      window.location.href = targetUrl;
    } else {
      // Jika belum aktif, arahkan ke halaman aktivasi
      window.location.href = `activate.html?id=${cardId}`;
    }
  } catch (err) {
    console.error('Redirect error:', err);
    window.location.href = `activate.html?id=${cardId}`;
  }
}

// Eksekusi fungsi saat halaman dimuat
handleRedirect();