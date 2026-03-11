const { W, H, GH } = require('../lib/constants');
const { fmt } = require('../lib/helpers');
const { T, svg } = require('../lib/svg');

function slideStat(value, label, color) {
  const cx = W / 2;
  const cy = H / 2 - 12;
  let o = '';
  o += `<circle cx="${cx}" cy="${cy}" r="78" fill="${color}" opacity="0.04"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="50" fill="${color}" opacity="0.05"/>`;
  o += T(cx, cy + 14, fmt(value), 60, GH.text, 700, 'middle');
  o += T(cx, cy + 36, label, 13, color, 600, 'middle');
  return svg(o);
}

module.exports = { slideStat };
