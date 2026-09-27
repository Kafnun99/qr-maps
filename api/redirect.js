export default async function handler(req, res) {
  const cardId = req.query.id;
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbxdUclcFRqNlvfYxQ8LcCoDFnz0nZYBbU8DJDAtBLfdz-BgnYV1n6PxZsWxi8Yaxujb/exec';

  if (!cardId) {
    return res.redirect(302, '/activate.html');
  }

  // Tangkap metadata pengunjung dari Vercel Edge Headers
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'Unknown';
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  const userAgent = req.headers['user-agent'] || '';

  let device = 'Desktop';
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';

  try {
    const response = await fetch(`${GAS_URL}?card_id=${cardId}`);
    const data = await response.json();

    if (data.status === 'success' && data.card_status === 'active' && data.nama_toko) {
      // Kirim log secara async (non-blocking)
      saveLogAsync(GAS_URL, {
        card_id: cardId,
        nama_toko: data.nama_toko,
        ip: clientIp,
        city: city,
        country: country,
        user_agent: userAgent,
        device: device
      });

      return res.redirect(302, data.nama_toko);
    } else {
      return res.redirect(302, `/activate.html?id=${cardId}`);
    }
  } catch (err) {
    return res.redirect(302, `/activate.html?id=${cardId}`);
  }
}

function saveLogAsync(gasUrl, logPayload) {
  const formData = new URLSearchParams();
  formData.append('action', 'log_scan');
  formData.append('timestamp', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
  formData.append('card_id', logPayload.card_id);
  formData.append('nama_toko', logPayload.nama_toko);
  formData.append('ip', logPayload.ip);
  formData.append('city', logPayload.city);
  formData.append('country', logPayload.country);
  formData.append('user_agent', logPayload.user_agent);
  formData.append('device', logPayload.device);

  fetch(gasUrl, { method: 'POST', body: formData }).catch(err => console.error('Log error:', err));
}