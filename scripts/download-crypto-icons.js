const https = require('https');
const fs = require('fs');
const path = require('path');

const ICONS = {
  'bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  'ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'bnb': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  'solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  'avalanche': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  'cardano': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
};

const downloadIcon = (url, filename) => {
  return new Promise((resolve, reject) => {
    const iconPath = path.join(__dirname, '../public/crypto-icons');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(iconPath)) {
      fs.mkdirSync(iconPath, { recursive: true });
    }

    const filePath = path.join(iconPath, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
};

async function downloadAllIcons() {
  try {
    const downloads = Object.entries(ICONS).map(([name, url]) => {
      return downloadIcon(url, `${name}.png`);
    });

    await Promise.all(downloads);
    console.log('All icons downloaded successfully!');
  } catch (error) {
    console.error('Error downloading icons:', error);
  }
}

downloadAllIcons(); 