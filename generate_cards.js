const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cards_export.csv');
let csvContent = 'card_id,pin,card_status\n';

// Menghasilkan 1000 kartu default
for (let i = 1; i <= 1000; i++) {
  const cardId = 'A' + i.toString().padStart(6, '0');
  const defaultPin = '1234';
  csvContent += `${cardId},${defaultPin},inactive\n`;
}

fs.writeFileSync(filePath, csvContent);
console.log('✅ File cards_export.csv berhasil dibuat!');