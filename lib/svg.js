const { W, H, GH } = require('./constants');
const { esc } = require('./helpers');

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,'SFMono-Regular','SF Mono',Menlo,Consolas,monospace";

function T(x, y, s, sz, fill, fw, an) {
  return `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${sz || 13}" fill="${esc(fill || GH.text)}" font-weight="${fw || 400}" text-anchor="${an || 'start'}">${esc(s)}</text>`;
}

function TM(x, y, s, sz, fill, fw, an) {
  return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${sz || 11}" fill="${esc(fill || GH.text)}" font-weight="${fw || 400}" text-anchor="${an || 'start'}">${esc(s)}</text>`;
}

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
}

module.exports = { T, TM, svg };
