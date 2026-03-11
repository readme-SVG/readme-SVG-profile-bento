const { W, H, GH } = require('../lib/constants');
const { T, TM, svg } = require('../lib/svg');
const { shuffle, ago, wrap } = require('../lib/helpers');

module.exports = {
  id: 'commits',
  fn: (user, repos, events, commits) => {
    const picks = shuffle(commits).slice(0, 2);
    let o = '';
    if (!picks.length) {
      o += T(W / 2, H / 2 - 8, 'no public commits found', 13, GH.sec, 400, 'middle');
      o += T(W / 2, H / 2 + 12, 'activity may be in private repos', 11, GH.mut, 400, 'middle');
      return svg(o);
    }

    picks.forEach((c, i) => {
      const ry = 8 + i * 90;
      o += `<rect x="8" y="${ry}" width="${W - 16}" height="82" rx="6" fill="${GH.card}" stroke="${GH.border}" stroke-width="1"/>`;
      o += `<rect x="14" y="${ry + 10}" width="62" height="18" rx="5" fill="rgba(188,140,255,.12)" stroke="${GH.purple}" stroke-width="0.5"/>`;
      o += TM(18, ry + 23, c.sha, 10, GH.purple, 600);
      o += T(84, ry + 23, c.repo.slice(0, 22), 11, GH.sec);
      o += T(W - 14, ry + 23, ago(c.time), 10, GH.mut, 400, 'end');
      const lines = wrap(c.msg, 60);
      lines.slice(0, 2).forEach((l, li) => { o += T(14, ry + 44 + li * 18, l, 12, GH.text); });
    });
    return svg(o);
  },
};
