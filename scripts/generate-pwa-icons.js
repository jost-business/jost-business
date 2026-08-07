const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const src = path.join(root, 'apps/playground/public/icons/source.png');
const outDir = path.join(root, 'apps/playground/public/icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(src)) {
  console.error('Source icon not found at apps/playground/public/icons/source.png');
  process.exit(1);
}

Promise.all(
  sizes.map(size =>
    sharp(src)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`))
      .then(() => console.log(`✓ icon-${size}x${size}.png`))
  )
).then(() => console.log('All icons generated.'));
