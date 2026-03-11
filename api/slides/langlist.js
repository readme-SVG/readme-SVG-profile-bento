const { W, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');
const { lc } = require('../lib/helpers');

module.exports = {
  id: 'langlist',
  fn: (user, repos) => {
    const map = {};
    repos.forEach(r => { if (r.language) map[r.language] = (map[r.language] || 0) + 1; });
    const langs = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const tot = langs.reduce((s, [, v]) => s + v, 0) || 1;
    const maxV = langs[0] ? langs[0][1] : 1;
    let o = '';
    langs.forEach(([l, n], i) => {
      const ly = 14 + i * 34;
      const pct = (n / tot) * 100;
      const bw = Math.max((n / maxV) * (W - 160), 4);
      o += `<circle cx="22" cy="${ly + 12}" r="7" fill="${lc(l)}"/>`;
      o += T(36, ly + 16, l, 12, GH.text, 600);
      o += `<rect x="138" y="${ly + 5}" width="${(W - 155).toFixed(0)}" height="14" rx="7" fill="${GH.border}"/>`;
      o += `<rect x="138" y="${ly + 5}" width="${bw.toFixed(1)}" height="14" rx="7" fill="${lc(l)}" opacity="0.85"/>`;
      o += T(W - 14, ly + 16, `${pct.toFixed(1)}%`, 11, GH.sec, 500, 'end');
    });
    return svg(o);
  },
};
