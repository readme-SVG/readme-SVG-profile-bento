const { W, H, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');
const { ago } = require('../lib/helpers');

function desc(e) {
  if (e.type === 'PushEvent' && e.payload?.commits?.length) return [`pushed ${e.payload.commits.length} commit(s)`, e.repo?.name || '?'];
  if (e.type === 'CreateEvent') return [`created ${e.payload?.ref_type || 'item'}`, e.repo?.name || '?'];
  if (e.type === 'WatchEvent') return ['starred', e.repo?.name || '?'];
  if (e.type === 'ForkEvent') return ['forked', e.repo?.name || '?'];
  if (e.type === 'IssuesEvent') return ['issue activity', e.repo?.name || '?'];
  if (e.type === 'PullRequestEvent') return ['pull request activity', e.repo?.name || '?'];
  return [e.type.replace('Event', ''), e.repo?.name || '?'];
}

module.exports = {
  id: 'events',
  fn: (user, repos, events) => {
    const icons = { PushEvent: '↑', CreateEvent: '+', WatchEvent: '★', ForkEvent: '⑂', IssuesEvent: '●', PullRequestEvent: '↵' };
    const list = events.slice(0, 4);
    let o = '';
    if (!list.length) {
      o += T(W / 2, H / 2, 'no public events', 13, GH.sec, 400, 'middle');
      return svg(o);
    }
    list.forEach((e, i) => {
      const ry = 10 + i * 44;
      o += `<rect x="8" y="${ry}" width="${W - 16}" height="36" rx="6" fill="${GH.card}" stroke="${GH.border}" stroke-width="1"/>`;
      o += T(20, ry + 23, icons[e.type] || '•', 14, GH.blue, 600);
      const [line1, line2] = desc(e);
      o += T(38, ry + 20, line1.slice(0, 42), 12, GH.text, 600);
      o += T(38, ry + 33, line2.slice(0, 52), 10, GH.blue);
      o += T(W - 14, ry + 23, ago(e.created_at), 10, GH.mut, 400, 'end');
    });
    return svg(o);
  },
};
