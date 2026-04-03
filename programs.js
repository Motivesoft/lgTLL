const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');

if (process.argv.length !== 3) {
  console.error('Usage: node app.js <input.xml>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = inputFile.replace(/\.TLL$/, '_modified.TLL');

const xmlData = fs.readFileSync(inputFile, 'utf8');
const doc = new DOMParser().parseFromString(xmlData, 'text/xml');

const prNameToPrNumMap = {
  "La 1 HD": "1",
  "La 2 HD": "2",
  "Antena 3": "3",
  "Cuatro HD": "4",
  "Telecinco HD": "5",
  "laSexta": "6",
  "La 8 Mediterráneo HD": "8",
  "A Punt HD": "9",
  "TEN": "10",
  "FDF": "11",
  "BeMad tv HD": "12",
  "TRECE": "13",
  "Divinity": "14",
  "Energy": "15",
  "neox": "16",
  "A3Series": "17",
  "BOM": "18",
  "nova": "19",
  "PARAMOUNT NETWORK": "21",
  "DKISS": "20",
  "DMAX": "22",
  "GOL PLAY HD": "23",
  "MEGA": "24",
  "SQUIRREL": "25",
  "SQUIRREL2": "26",
  "VEO 7": "27",
  "Clan HD": "28",
  "Boing": "29",
  "24h HD": "30",
  "tdp HD": "31",
  "Realmadrid TV HD": "32",
  "Disney Channel": "41",
  "La 1 UHD": "51",
  "Die Neue Zeit TV": "60",
  "SENDER NEU JERUSALEM": "61",
  "Eurosport 1 Deutschland": "62",
  "RTL Austria": "63",
  "RTLZWEI Austria": "64",
  "Rai YoYo HD": "65",
  "Rai Radio 2 Visual": "66",
  "SUPER RTL A": "67",
  "VOX Austria": "68",
  "La 2": "80",
  "tdp": "81",
  "Clan": "82",
  "Cuatro": "83",
  "antena3": "84",
  "24h": "85",
  "Telecinco": "87",
  "BBC One Lon HD": "101",
  "BBC Two HD": "102",
  "ITV1 HD": "103",
  "Channel 4": "104",
  "BBC Four HD": "114",
  "STV": "121",
  "ITV2+1": "122",
  "ITV3+1": "123",
  "ITV4 HD": "124",
  "ITV Quiz HD": "125",
  "e4": "133",
  "E4+1": "134",
  "E4 Extra": "135",
  "Film4+1": "136",
  "More4": "137",
  "CBeebies HD": "140",
  "CITV": "141",
  "Radio 5 RNE": "16385",
  "RNE Murcia": "16386",
  "Melodia FM": "16387",
  "ONDA CERO": "16388",
  "CADENA 100": "16389",
  "RADIO MARIA": "16390",
  "Kiss FM": "16391",
  "LOS40": "16392",
  "Radio Clasica HQ RNE": "16393",
  "RADIO MARCA": "16394",
  "Radio Exterior RNE": "16395",
  "Radio3 HQ RNE": "16396",
  "EUROPA FM": "16397",
  "DIAL": "16398",
  "esRadio": "16399",
  "HIT FM": "16400",
  "Radiolé": "16401",
  "LOS40 Urban": "16402",
  "LOS40 Classic": "16403",
  "COPE": "16404",
  "SER": "16405",
};


// Recursive function to find and update prNum based on vchName
function updatePrNums(node) {
  // Update current node if it has both vchName and prNum
  const vchNameEl = node.getElementsByTagName('vchName')[0];
  const prNumEl = node.getElementsByTagName('prNum')[0];
  const isUserSelCHNo = node.getElementsByTagName('isUserSelCHNo')[0];
  if (vchNameEl && prNumEl) {
    const vchNameValue = vchNameEl.textContent.trim();
    if (prNameToPrNumMap.hasOwnProperty(vchNameValue)) {
      prNumEl.textContent = prNameToPrNumMap[vchNameValue];
      if (isUserSelCHNo) {
        isUserSelCHNo.textContent = '1';
      }
    } else {
      console.log(`No mapping found for prName "${vchNameValue}" (${prNumEl.textContent}) - skipping update`);
    }
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