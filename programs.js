const fs = require('fs');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

if (process.argv.length !== 3) {
  console.error('Usage: node app.js <input.xml>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = inputFile.replace(/\.tll$/, '_modified.tll');

const xmlData = fs.readFileSync(inputFile, 'utf8');
const parser = new XMLParser({
  ignoreAttributes: true,
  attributeNamePrefix: '',
  textNodeName: '#text'
});
let jsonObj = parser.parse(xmlData);

function processNode(node) {
  if (node && typeof node === 'object') {
    if (Array.isArray(node)) {
      for (let item of node) {
        processNode(item);
      }
    } else {
      // Check if current node has vchName
      if ('vchName' in node && node.vchName !== undefined) {
        const prNewNum = node.vchName;
        // Set prNum to prNameValue if present
        if ('prNum' in node) {
          node.prNum = prNewNum;
        }
      }
      // Recurse into children
      for (let key in node) {
        if (key !== 'vchName' && key !== 'prNum') {
          processNode(node[key]);
        }
      }
    }
  }
}

processNode(jsonObj);

const builder = new XMLBuilder({
  format: true,
  indentBy: '  '
});
const modifiedXml = builder.build(jsonObj);

fs.writeFileSync(outputFile, modifiedXml, 'utf8');
console.log(`Modified XML written to ${outputFile}`);