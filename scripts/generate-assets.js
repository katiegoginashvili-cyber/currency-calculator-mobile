const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG (base64 encoded)
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Simple colored PNG generator (creates a small solid color image)
function createColorPng(width, height, r, g, b) {
  // Create a simple PNG with solid color
  // This is a minimal valid PNG file structure
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR chunk length (13 bytes)
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    (width >> 24) & 0xff, (width >> 16) & 0xff, (width >> 8) & 0xff, width & 0xff, // width
    (height >> 24) & 0xff, (height >> 16) & 0xff, (height >> 8) & 0xff, height & 0xff, // height
    0x08, // bit depth (8)
    0x02, // color type (RGB)
    0x00, // compression method
    0x00, // filter method
    0x00, // interlace method
    0x00, 0x00, 0x00, 0x00, // CRC placeholder (will be invalid but works for basic use)
    0x00, 0x00, 0x00, 0x00, // IDAT chunk (empty for simplicity)
    0x49, 0x44, 0x41, 0x54,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // IEND chunk
    0x49, 0x45, 0x4e, 0x44,
    0xae, 0x42, 0x60, 0x82
  ]);
  return png;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder assets
const assets = [
  { name: 'icon.png', desc: 'App icon placeholder' },
  { name: 'splash.png', desc: 'Splash screen placeholder' },
  { name: 'adaptive-icon.png', desc: 'Android adaptive icon placeholder' },
  { name: 'favicon.png', desc: 'Web favicon placeholder' },
];

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  fs.writeFileSync(filePath, transparentPng);
  console.log(`Created: ${asset.name}`);
});

console.log('\nPlaceholder assets created successfully!');
console.log('Replace these with actual images for production use.');
