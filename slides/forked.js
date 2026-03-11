const { W, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');
const { fmt, lc } = require('../lib/helpers');

module.exports = {
  id: 'forked',
  fn: (user, repos) => {
    const top = [...repos].filter(r => !r.fork).sort((a, b) => b.forks_count - a.forks_count).slice(0, 3);
    let o = '';
    top.forEach((r, i) => {
      const ry = 8 + i * 60;
      o += `<rect x="8" y="${ry}" width="${W - 16}" height="52" rx="6" fill="${GH.card}" stroke="${GH.border}" stroke-width="1"/>`;
      o += `<rect x="8" y="${ry}" width="3" height="52" rx="2" fill="${GH.purple}" opacity="${1 - i * 0.3}"/>`;
      o += T(20, ry + 20, r.name.slice(0, 32), 13, GH.blue, 600);
      o += T(W - 16, ry + 20, `⑂ ${fmt(r.forks_count)}`, 12, GH.purple, 600, 'end');
      o += T(20, ry + 37, (r.description || '').slice(0, 56), 11, GH.sec);
      if (r.language) {
        o += `<circle cx="${W - 52}" cy="${ry + 32}" r="5" fill="${lc(r.language)}"/>`;
        o += T(W - 43, ry + 37, r.language.slice(0, 12), 10, GH.mut);
      }
    });
    return svg(o);
  },
};
