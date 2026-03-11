const { W, GH } = require('../lib/constants');
const { esc } = require('../lib/helpers');
const { gh } = require('../lib/github');
const ALL_SLIDES = require('../slides');

function pickSlide(user, repos, events, commits, slidesParam, overrideIdx) {
  let enabled = ALL_SLIDES;
  if (slidesParam) {
    const ids = slidesParam.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      enabled = ALL_SLIDES.filter(s => ids.includes(s.id));
      if (!enabled.length) enabled = ALL_SLIDES;
    }
  }

  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const idx = (overrideIdx !== undefined && overrideIdx >= 0 && overrideIdx < enabled.length)
    ? overrideIdx
    : bucket % enabled.length;
  return enabled[idx].fn(user, repos, events, commits);
}

module.exports = async function handler(req, res) {
  const q = req.query || {};
  const username = q.user || null;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const errSVG = msg => (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="80" viewBox="0 0 ${W} 80">`
    + `<rect width="${W}" height="80" rx="6" fill="${GH.card}" stroke="${GH.border}" stroke-width="1"/>`
    + `<text x="14" y="30" font-family="monospace" font-size="11" fill="${GH.red}" font-weight="600">gh-card error</text>`
    + `<text x="14" y="48" font-family="monospace" font-size="9" fill="${GH.sec}">${esc(String(msg).slice(0, 70))}</text>`
    + `<text x="14" y="63" font-family="monospace" font-size="8" fill="${GH.mut}">set GITHUB_TOKEN env var to raise rate limit</text>`
    + '</svg>'
  );

  if (!username) return res.status(200).send(errSVG('Missing ?user= query param'));

  const token = process.env.GITHUB_TOKEN || '';
  try {
    const base = 'https://api.github.com';
    const [user, repos, events] = await Promise.all([
      gh(`${base}/users/${username}`, token),
      gh(`${base}/users/${username}/repos?sort=updated&per_page=100`, token),
      gh(`${base}/users/${username}/events/public?per_page=100`, token),
    ]);

    const commits = [];
    const reposSorted = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    for (const repo of reposSorted.filter(r => !r.fork && r.pushed_at).slice(0, 3)) {
      try {
        const data = await gh(`${base}/repos/${username}/${repo.name}/commits?per_page=20&author=${username}`, token);
        if (Array.isArray(data) && data.length) {
          commits.push(...data.map(c => ({
            sha: c.sha ? c.sha.slice(0, 7) : '???????',
            msg: c.commit?.message ? (c.commit.message.split('\n')[0].trim() || 'update') : 'update',
            repo: repo.name,
            time: c.commit?.author ? c.commit.author.date : repo.pushed_at,
          })));
        }
      } catch (_) {}
      if (commits.length >= 10) break;
    }

    events.forEach(e => {
      if (e.type === 'PushEvent' && e.payload?.commits) {
        e.payload.commits.forEach(c => {
          commits.push({
            sha: c.sha ? c.sha.slice(0, 7) : '???????',
            msg: (c.message || '').split('\n')[0].trim() || 'update',
            repo: e.repo?.name ? e.repo.name.split('/').pop() : '?',
            time: e.created_at,
          });
        });
      }
    });

    const overrideIdx = q._slide !== undefined ? parseInt(q._slide, 10) : undefined;
    const slidesParam = q.slides || '';
    const svgOut = pickSlide(user, repos, events, commits, slidesParam, overrideIdx);
    const isPreview = overrideIdx !== undefined;
    res.setHeader('Cache-Control', isPreview ? 'no-cache' : 's-maxage=600,stale-while-revalidate=60');
    return res.status(200).send(svgOut);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(errSVG(err.message));
  }
};
