const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id') || 'A000001';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxdUclcFRqNlvfYxQ8LcCoDFnz0nZYBbU8DJDAtBLfdz-BgnYV1n6PxZsWxi8Yaxujb/exec';

function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  if (/android/i.test(ua)) {
    return 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }

  return 'Desktop';
}

async function handleRedirect() {
  try {
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
      console.warn('Gagal ambil data IP:', e);
    }

    const device = getDeviceType();
    const userAgent = navigator.userAgent;

    const logData = new URLSearchParams();
    logData.append('action', 'log_scan');
    logData.append('card_id', cardId);
    logData.append('ip', ip);
    logData.append('city', city);
    logData.append('country', country);
    logData.append('user_agent', userAgent);
    logData.append('device', device);
    logData.append('timestamp', new Date().toISOString());

    fetch(GAS_URL, {
      method: 'POST',
      body: logData
    }).catch(err => console.error('Error log scan:', err));

    const cardRes = await fetch(`${GAS_URL}?card_id=${cardId}`);
    const cardData = await cardRes.json();

    if (cardData.status === 'success' && cardData.card_status === 'active' && cardData.nama_toko) {
      let targetUrl = cardData.nama_toko;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      window.location.href = targetUrl;
    } else {
      window.location.href = `activate.html?id=${cardId}`;
    }
  } catch (err) {
    console.error('Redirect error:', err);
    window.location.href = `activate.html?id=${cardId}`;
  }
}

handleRedirect();