// hex-to-ascii.js

function hexToAscii(hexString) {
  // Remove any spaces or '0x' prefixes
  const cleanHex = hexString.replace(/\s|0x/g, '');
  
  // Ensure even length
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  
  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  
  // Use Buffer for proper UTF-8 decoding (handles á, é, ñ, etc.)
  return Buffer.from(bytes).toString('utf8');
}

// Examples
const examples = [
  '054c612038204d65646974657272e16e656f204844',
  '05526164696f6ce9'
];

examples.forEach(hex => {
  const decoded = hexToAscii(hex);
  // Show printable chars only (filter out control chars like 0x05)
  const printable = decoded.replace(/[\x00-\x1F\x7F]/g, '');
  console.log(`Hex: ${hex}`);
  console.log(`Decoded: "${decoded}"`);
  console.log(`Printable: "${printable}"\n`);
});

// Export for use in other modules
module.exports = { hexToAscii };
