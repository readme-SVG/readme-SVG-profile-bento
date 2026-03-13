const { W, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');
const { ago } = require('../lib/helpers');

function repoName(issue) {
  const full = issue.repository_url ? issue.repository_url.split('/').slice(-2).join('/') : '';
  return full || issue.repository?.full_name || '?';
}

module.exports = {
  id: 'latestissues',
  fn: (user, repos, events, commits, issues) => {
    const list = (issues?.open || []).slice(0, 3);
    let o = '';
    if (!list.length) {
      o += T(W / 2, 88, 'no open issues found', 13, GH.sec, 400, 'middle');
      o += T(W / 2, 108, 'create or comment on public issues to populate this slide', 11, GH.mut, 400, 'middle');
      return svg(o);
    }

    list.forEach((issue, i) => {
      const ry = 8 + i * 60;
      const title = String(issue.title || 'untitled issue').slice(0, 56);
      o += `<rect x="8" y="${ry}" width="${W - 16}" height="52" rx="6" fill="${GH.card}" stroke="${GH.border}" stroke-width="1"/>`;
      o += `<circle cx="20" cy="${ry + 20}" r="5" fill="${GH.green}"/>`;
      o += T(32, ry + 22, title, 12, GH.text, 600);
      o += T(32, ry + 38, `#${issue.number} in ${repoName(issue)}`.slice(0, 62), 10, GH.blue);
      o += T(W - 14, ry + 22, ago(issue.updated_at || issue.created_at), 10, GH.mut, 400, 'end');
    });

    return svg(o);
  },
};
