#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const xml2js = require('xml2js');

if (process.argv.length < 3) {
  console.error('Usage: node lg.js <GlobalClone00001.TLL>');
  process.exit(1);
}

// Get the filespec from the command line and expand if necessary
fileSpec = process.argv[2];
if (fileSpec.startsWith('~/')) {
  fileSpec = path.join(os.homedir(), fileSpec.slice(2));
}

const filePath = path.resolve(fileSpec);

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('Error reading file:', err.message);
    process.exit(1);
  }

  xml2js.parseString(data, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error('Error parsing TLL (is it XML-based?):', err.message);
      process.exit(1);
    }

    // The exact structure varies; many LG XML TLLs have a root like <GlobalClone> with <Channel> entries.[web:4]
    const root = result.TLLDATA || result.GlobalClone || result.globalclone || result;
    const channelLists =
      root.CHANNEL.DTV ||
      root.ChannelList ||
      root.Channels ||
      root.channelList ||
      root.channels ||
      root.ProgramList ||
      root.programList;

    if (!channelLists) {
      console.error('Could not find channel list in parsed TLL. Dumping top-level keys:');
      console.error(Object.keys(root));
      process.exit(1);
    }

    // Normalize to an array of channel nodes
    const channels = [];
    const pushChannels = obj => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(pushChannels);
      } else if (obj.ITEM || obj.Channel || obj.channel) {
        const list = obj.ITEM || obj.Channel || obj.channel;
        if (Array.isArray(list)) channels.push(...list);
        else channels.push(list);
      } else if (Array.isArray(obj)) {
        channels.push(...obj);
      }
    };

    pushChannels(channelLists);

    if (!channels.length) {
      console.error('No channels found under channel list node.');
      process.exit(1);
    }

    // Sort before doing anything else
    channels.sort((a, b) => {
      const getNum = ch => {
        const num =
          ch.prNum ||
          ch.ProgNum ||
          ch.progNum ||
          ch.prNum ||
          ch.ChNo ||
          ch.chNo ||
          ch.LCN ||
          ch.lcn ||
          ch.Number ||
          ch.number ||
          ch.ProgIndex ||
          ch.progIndex ||
          0;
        return parseInt(typeof num === 'object' ? num._ || num : num) || 0;
      };
      return getNum(a) - getNum(b);
    });

    // Try common field names for program number and name (varies by model/format).[web:6][web:9]
    channels.forEach(ch => {
      const num =
        ch.prNum ||
        ch.ProgNum ||
        ch.progNum ||
        ch.ChNo ||
        ch.chNo ||
        ch.LogicalChannelNumber ||
        ch.logicalChannelNumber ||
        ch.Number ||
        ch.number ||
        ch.LCN ||
        ch.lcn ||
        ch.ProgIndex ||
        ch.progIndex;

      const name =
        ch.hexVchName;

      const n1 =
        ch.programNo;

      const n2 =
        ch.physicalNum;

      // nameStr = typeof name === 'object' && name._ ? name._ : name;

      numStr = typeof num === 'object' && num._ ? num._ : num;
      //Buffer.from(nameStr, 'latin1').toString('utf8');
      //nameStr = Buffer.from(name, 'hex').toString('utf8');
      nameStr = Buffer.from(name, 'hex').toString('latin1').toString('utf8');

      // Pad for formatting
      while (numStr.length < 6) {
        numStr = ` ${numStr}`;
      }

      hintStr = `${n1} ${n2}`;
      while (hintStr.length < 12) {
        hintStr = ` ${hintStr}`;
      }

      if (numStr != null || nameStr != null) {
        //console.log(`${numStr ?? ''}\t${hintStr}\t${nameStr ?? ''}`);
        console.log(`${numStr ?? ''}\t${nameStr ?? ''}`);
      }
    });
  });
});
