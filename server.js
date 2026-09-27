const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/c/:id', async (req, res) => {
  const cardId = req.params.id;
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwodRYnXTP7pgvvDGX6guR6xeSKUCDUFF3IT5-1o0-kE3MkYT3S97ms36wY9NblWYbM/exec'
  try {
    const response = await fetch(`${GAS_URL}?card_id=${cardId}`);
    const data = await response.json();

    if (data.status === 'success' && data.card_status === 'active' && data.nama_toko) {
      res.redirect(data.nama_toko);
    } else {
      res.redirect(`/activate.html?id=${cardId}`);
    }
  } catch (err) {
    res.redirect(`/activate.html?id=${cardId}`);
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}