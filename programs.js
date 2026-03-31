const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');

if (process.argv.length !== 3) {
  console.error('Usage: node app.js <input.xml>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = inputFile.replace(/\.tll$/, '_modified.tll');

const xmlData = fs.readFileSync(inputFile, 'utf8');
const doc = new DOMParser().parseFromString(xmlData, 'text/xml');

// Recursive function to find and update prNum based on vchName
function updatePrNums(node) {
  // Update current node if it has both vchName and prNum
  const vchNameEl = node.getElementsByTagName('vchName')[0];
  const prNumEl = node.getElementsByTagName('prNum')[0];
  if (vchNameEl && prNumEl) {
    prNumEl.textContent = vchNameEl.textContent;
  }

  // Recurse into children
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === 1) { // Element node
      updatePrNums(child);
    }
  }
}

// Start from document element (root)
updatePrNums(doc.documentElement);

const serializer = new XMLSerializer();
let modifiedXml = serializer.serializeToString(doc);

// Pretty print with 2-space indentation
modifiedXml = modifiedXml.replace(/></g, '>\n  <').replace(/>\n  <\/[^>]+>/g, '></');
modifiedXml = modifiedXml.split('\n').map(line => line.trimStart()).join('\n');
modifiedXml = modifiedXml.replace(/\n  \n/g, '\n');

fs.writeFileSync(outputFile, modifiedXml, 'utf8');
console.log(`Modified XML written to ${outputFile}`);