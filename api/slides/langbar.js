const { W, GH } = require('../lib/constants');
const { lc } = require('../lib/helpers');
const { T, svg } = require('../lib/svg');

module.exports = {
  id: 'langbar',
  fn: (user, repos) => {
    const map = {};
    repos.forEach(r => { if (r.language) map[r.language] = (map[r.language] || 0) + 1; });
    const langs = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const tot = langs.reduce((s, [, v]) => s + v, 0) || 1;
    let o = '';
    const bx = 16; const by = 14; const bw = W - 32; const bh = 10;
    o += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" fill="${GH.border}"/>`;
    let off = bx;
    langs.forEach(([l, n], i) => {
      const w = Math.max((n / tot) * bw, 2);
      o += `<rect x="${off.toFixed(1)}" y="${by}" width="${w.toFixed(1)}" height="${bh}" rx="${i === 0 ? 5 : 0}" fill="${lc(l)}"/>`;
      off += w;
    });
    langs.forEach(([l, n], i) => {
      const col = i < 3 ? 0 : 1;
      const row = i < 3 ? i : i - 3;
      const lx = 16 + col * 246;
      const ly = 42 + row * 46;
      o += `<circle cx="${lx + 7}" cy="${ly + 9}" r="7" fill="${lc(l)}"/>`;
      o += T(lx + 20, ly + 13, l, 13, GH.text, 600);
      o += T(lx + 20, ly + 29, `${((n / tot) * 100).toFixed(1)}%  ·  ${n} repos`, 11, GH.sec);
    });
    return svg(o);
  },
};
