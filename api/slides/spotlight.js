const { W, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');
const { shuffle, fmt, ago, wrap, lc } = require('../lib/helpers');

module.exports = {
  id: 'spotlight',
  fn: (user, repos) => {
    const r = shuffle(repos.filter(x => !x.fork && x.description))[0];
    if (!r) return svg(T(W / 2, 98, 'no repos with descriptions', 13, GH.sec, 400, 'middle'));
    let o = '';
    o += T(16, 36, r.name.slice(0, 32), 18, GH.blue, 700);
    const lines = wrap(r.description, 56);
    lines.slice(0, 3).forEach((l, i) => { o += T(16, 58 + i * 17, l, 11, GH.sec); });
    const sy = 58 + Math.min(lines.length, 3) * 17 + 10;
    o += T(16, sy, `★ ${fmt(r.stargazers_count)}`, 13, GH.yellow, 600);
    o += T(90, sy, `⑂ ${fmt(r.forks_count)}`, 13, GH.purple, 600);
    if (r.open_issues_count !== undefined) o += T(160, sy, `● ${r.open_issues_count}`, 13, GH.sec, 600);
    if (r.language) {
      o += `<circle cx="17" cy="${sy + 16}" r="6" fill="${lc(r.language)}"/>`;
      o += T(28, sy + 20, r.language, 11, GH.sec);
    }
    if (r.topics && r.topics.length) {
      let tx = r.language ? 28 + r.language.length * 6 + 16 : 16;
      r.topics.slice(0, 4).forEach(t => {
        const tw = t.length * 5.5 + 16;
        if (tx + tw > W - 12) return;
        o += `<rect x="${tx.toFixed(0)}" y="${sy + 8}" width="${tw.toFixed(0)}" height="16" rx="8" fill="rgba(56,139,253,.15)" stroke="${GH.blue}" stroke-width="0.5"/>`;
        o += T(tx + 8, sy + 20, t.slice(0, 12), 8, GH.blue);
        tx += tw + 5;
      });
    }
    o += T(W - 14, sy + 20, ago(r.created_at), 10, GH.mut, 400, 'end');
    return svg(o);
  },
};
