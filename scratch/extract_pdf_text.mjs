import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('d:/My/EslamAhmed/public/uploads/1790988851884-___-_____-____.pdf');
const str = buf.toString('latin1');
const regex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
const streams = [];
let m;
while ((m = regex.exec(str)) !== null) {
  try {
    streams.push(zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('utf8'));
  } catch (e) {}
}

const cmapStream = streams.find((s) => s.includes('beginbfchar') && s.includes('038E'));
const cMap = new Map();

if (cmapStream) {
  const charRegex = /<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]+)>/g;
  let cm;
  while ((cm = charRegex.exec(cmapStream)) !== null) {
    const code = parseInt(cm[1], 16);
    const unicodeHex = cm[2];
    let unicodeStr = '';
    for (let i = 0; i < unicodeHex.length; i += 4) {
      unicodeStr += String.fromCharCode(parseInt(unicodeHex.substr(i, 4), 16));
    }
    cMap.set(code, unicodeStr);
  }

  // Handle bfrange
  const lines = cmapStream.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const rangeMatch = line.match(/^<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 16);
      const end = parseInt(rangeMatch[2], 16);
      const uniStart = parseInt(rangeMatch[3], 16);
      for (let c = start; c <= end; c++) {
        cMap.set(c, String.fromCharCode(uniStart + (c - start)));
      }
    }
    const arrMatch = line.match(/^<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>\s*\[(.*?)\]$/);
    if (arrMatch) {
      const start = parseInt(arrMatch[1], 16);
      const tokens = arrMatch[3].match(/<([0-9A-Fa-f]+)>/g) || [];
      tokens.forEach((t, idx) => {
        const hex = t.slice(1, -1);
        let uStr = '';
        for (let j = 0; j < hex.length; j += 4) {
          uStr += String.fromCharCode(parseInt(hex.substr(j, 4), 16));
        }
        cMap.set(start + idx, uStr);
      });
    }
  }
}

function decodeStream(textStream) {
  if (!textStream) return '';
  const tjRegex = /\[(.*?)\]\s*TJ/g;
  let tm;
  let full = '';
  while ((tm = tjRegex.exec(textStream)) !== null) {
    const inner = tm[1];
    const hexParts = inner.match(/<([0-9A-Fa-f]+)>/g) || [];
    let line = '';
    for (const hp of hexParts) {
      const h = hp.slice(1, -1);
      for (let i = 0; i < h.length; i += 4) {
        const cid = parseInt(h.substr(i, 4), 16);
        line += cMap.get(cid) || ' ';
      }
    }
    const asciiParts = inner.match(/\((.*?)\)/g) || [];
    if (asciiParts.length > 0) {
      line += asciiParts.map((a) => a.slice(1, -1)).join(' ');
    }
    if (line.trim()) {
      full += line.trim() + '\n';
    }
  }
  return full;
}

const out = '=== PAGE 1 ===\n' + decodeStream(streams[0]) + '\n\n=== PAGE 2 ===\n' + decodeStream(streams[1]);
fs.writeFileSync('d:/My/EslamAhmed/scratch/legal_full.txt', out, 'utf8');
console.log('Saved to legal_full.txt. Total length:', out.length);
