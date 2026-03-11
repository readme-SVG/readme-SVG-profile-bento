const { W, H, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');

module.exports = {
  id: 'avgstars',
  fn: (user, repos) => {
    const own = repos.filter(r => !r.fork);
    const total = own.reduce((s, r) => s + r.stargazers_count, 0);
    const avg = own.length ? (total / own.length) : 0;
    const cx = W / 2;
    const cy = H / 2 - 12;
    let o = '';
    o += `<circle cx="${cx}" cy="${cy}" r="78" fill="${GH.yellow}" opacity="0.04"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="50" fill="${GH.yellow}" opacity="0.05"/>`;
    o += T(cx, cy + 14, avg < 10 ? avg.toFixed(1) : Math.round(avg).toString(), 60, GH.text, 700, 'middle');
    o += T(cx, cy + 36, 'avg stars per repo', 13, GH.yellow, 600, 'middle');
    o += T(cx, cy + 54, `(${own.length} original repos)`, 11, GH.mut, 400, 'middle');
    return svg(o);
  },
};
