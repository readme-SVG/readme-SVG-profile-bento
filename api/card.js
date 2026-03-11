const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
  Go: '#00add8', Rust: '#dea584', C: '#555555', 'C++': '#f34b7d',
  Ruby: '#701516', Java: '#b07219', PHP: '#4F5D95', Swift: '#f05138',
  Kotlin: '#A97BFF', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
  Vue: '#41b883', Svelte: '#ff3e00', Dart: '#00b4ab', Scala: '#c22d40',
  Elixir: '#6e4a7e', Haskell: '#5e5086', Lua: '#000080', R: '#198CE7',
  Nix: '#7e7eff', Dockerfile: '#384d54',
};

function langColor(l) { return LANG_COLORS[l] || '#888888'; }

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchJSON(url, token) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`GitHub API: ${r.status} on ${url}`);
  return r.json();
}

function buildHeatmap(events) {
  const counts = {};
  for (const e of events) {
    const d = e.created_at?.slice(0, 10);
    if (d) counts[d] = (counts[d] || 0) + 1;
  }
  const weeks = [];
  const now = new Date();
  for (let w = 25; w >= 0; w--) {
    const col = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + d));
      col.push(counts[date.toISOString().slice(0, 10)] || 0);
    }
    weeks.push(col);
  }
  return weeks;
}

function levelColor(n) {
  if (n === 0) return '#1a1a24';
  if (n <= 1) return '#3d2fa0';
  if (n <= 3) return '#5b48e0';
  if (n <= 6) return '#7c6af7';
  return '#a99cf9';
}

function eventIcon(type) {
  const m = {
    PushEvent: '◈', CreateEvent: '✦', WatchEvent: '★', ForkEvent: '⑂',
    IssuesEvent: '◎', PullRequestEvent: '⇄', IssueCommentEvent: '◉',
    ReleaseEvent: '◆', DeleteEvent: '✕',
  };
  return m[type] || '◇';
}

function eventDesc(e) {
  const r = (e.repo?.name || '').split('/')[1] || e.repo?.name || '';
  switch (e.type) {
    case 'PushEvent': return `pushed ${e.payload?.commits?.length || 0} commit(s) to ${r}`;
    case 'CreateEvent': return `created ${e.payload?.ref_type || 'ref'} in ${r}`;
    case 'WatchEvent': return `starred ${r}`;
    case 'ForkEvent': return `forked ${r}`;
    case 'IssuesEvent': return `${e.payload?.action || 'opened'} issue in ${r}`;
    case 'PullRequestEvent': return `${e.payload?.action || 'opened'} PR in ${r}`;
    case 'IssueCommentEvent': return `commented in ${r}`;
    case 'ReleaseEvent': return `released ${e.payload?.release?.tag_name || ''} in ${r}`;
    default: return `${e.type.replace('Event', '')} on ${r}`;
  }
}

// ─────────────────────────────────────────────
//  SVG BUILDER
// ─────────────────────────────────────────────

function buildSVG({ user, repos, events, theme }) {
  const W = 860, H = 560;
  const bg   = theme === 'light' ? '#f6f8fa' : '#0d0d14';
  const bg2  = theme === 'light' ? '#ffffff'  : '#13131d';
  const bg3  = theme === 'light' ? '#eaeef2'  : '#1a1a27';
  const text  = theme === 'light' ? '#1a1a2e'  : '#e8e8f0';
  const muted = theme === 'light' ? '#6b6b80'  : '#6b6b80';
  const acc1  = '#7c6af7';
  const acc2  = '#2dd4bf';
  const acc3  = '#f472b6';
  const yellow = '#fbbf24';
  const border = theme === 'light' ? '#d0d7de' : 'rgba(255,255,255,0.08)';

  // ── data prep ──
  const langMap = {};
  for (const r of repos) if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  const langs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalL = langs.reduce((s, [, v]) => s + v, 0) || 1;

  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);

  const pushEvents = events.filter(e => e.type === 'PushEvent' && e.payload?.commits?.length);
  const allCommits = pushEvents.flatMap(e =>
    (e.payload.commits || []).map(c => ({
      sha: c.sha?.slice(0, 7) || '???????',
      msg: c.message?.split('\n')[0]?.slice(0, 38) || '',
      repo: (e.repo?.name || '').split('/')[1] || '',
      time: e.created_at,
    }))
  );
  const commits = shuffle(allCommits).slice(0, 4);

  const recentEvents = shuffle(events).slice(0, 5);
  const heatmap = buildHeatmap(events);

  // ── helpers ──
  const card = (x, y, w, h, color = bg2, rx = 10) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}" stroke="${border}" stroke-width="1"/>`;

  const label = (x, y, txt, color = muted) =>
    `<text x="${x}" y="${y}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="8" fill="${color}" font-weight="500" letter-spacing="1.5" text-anchor="start">${esc(txt.toUpperCase())}</text>`;

  const txt = (x, y, content, size = 11, color = text, weight = 400, anchor = 'start') =>
    `<text x="${x}" y="${y}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(content)}</text>`;

  // ─── SECTION: Background ───
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;display=swap');
  </style>
  <clipPath id="avatarClip"><circle cx="36" cy="36" r="24"/></clipPath>
  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${acc1}" stop-opacity="0.15"/><stop offset="100%" stop-color="transparent"/></linearGradient>
  <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
    ${langs.map(([l, n], i) => {
      const pct = (langs.slice(0, i).reduce((s, [, v]) => s + v, 0) / totalL * 100).toFixed(1);
      const pct2 = (langs.slice(0, i + 1).reduce((s, [, v]) => s + v, 0) / totalL * 100).toFixed(1);
      return `<stop offset="${pct}%" stop-color="${langColor(l)}"/><stop offset="${pct2}%" stop-color="${langColor(l)}"/>`;
    }).join('')}
  </linearGradient>
</defs>

<!-- bg -->
<rect width="${W}" height="${H}" rx="16" fill="${bg}"/>
<rect width="${W}" height="${H}" rx="16" fill="url(#g1)"/>

`;

  // ─── SECTION 1: Profile (top-left) ───
  svg += card(16, 16, 260, 88);
  // avatar placeholder circle
  svg += `<circle cx="52" cy="60" r="24" fill="${bg3}" stroke="${border}" stroke-width="1.5"/>`;
  svg += `<image href="${user.avatar_url}&s=96" x="28" y="36" width="48" height="48" clip-path="url(#avatarClip)" style="clip-path:circle(24px at 24px 24px)"/>`;
  svg += txt(86, 52, user.name || user.login, 13, text, 700);
  svg += txt(86, 66, `@${user.login}`, 9, acc1, 400);
  if (user.bio) svg += txt(86, 79, user.bio.slice(0, 30) + (user.bio.length > 30 ? '…' : ''), 8, muted, 400);
  if (user.location) svg += txt(86, 91, `◎ ${user.location.slice(0, 28)}`, 8, acc2, 400);

  // ─── SECTION 2: Four stat cards ───
  const stats = [
    { label: 'REPOS', val: user.public_repos },
    { label: 'STARS', val: repos.reduce((s, r) => s + r.stargazers_count, 0) },
    { label: 'FOLLOWERS', val: user.followers },
    { label: 'FOLLOWING', val: user.following },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 63;
    svg += card(x, 114, 57, 52, bg2);
    svg += txt(x + 29, 135, String(s.val), 14, text, 700, 'middle');
    svg += `<text x="${x + 29}" y="${y = 154}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="6.5" fill="${muted}" font-weight="500" letter-spacing="0.8" text-anchor="middle">${esc(s.label)}</text>`;
  });
  let y = 154;

  // ─── SECTION 3: Languages (top-right area) ───
  svg += card(286, 16, 270, 90);
  svg += label(298, 30, '◆ languages');
  // bar
  let lx = 298;
  const barW = 246, barY = 38, barH = 5;
  svg += `<rect x="${lx}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="${bg3}"/>`;
  let lxOff = lx;
  for (const [l, n] of langs) {
    const w = (n / totalL) * barW;
    svg += `<rect x="${lxOff}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" rx="2" fill="${langColor(l)}"/>`;
    lxOff += w;
  }
  // legend
  langs.forEach(([l, n], i) => {
    const col = i < 3 ? 298 + i * 90 : 298 + (i - 3) * 90;
    const row = i < 3 ? 60 : 77;
    svg += `<circle cx="${col + 4}" cy="${row - 3}" r="3.5" fill="${langColor(l)}"/>`;
    svg += txt(col + 12, row, `${l}`, 8, text, 400);
    svg += txt(col + 12, row + 11, `${((n / totalL) * 100).toFixed(0)}%`, 7, muted, 400);
  });

  // ─── SECTION 4: Top repos ───
  svg += card(566, 16, 278, 148);
  svg += label(578, 30, '★ top starred');
  topRepos.forEach((r, i) => {
    const ry = 42 + i * 38;
    svg += `<text x="${578}" y="${ry + 10}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="9" fill="${acc1}" font-weight="500">${esc(r.name.slice(0, 24))}</text>`;
    if (r.description) svg += txt(578, ry + 22, r.description.slice(0, 34) + (r.description.length > 34 ? '…' : ''), 7.5, muted);
    svg += txt(578, ry + 33, `★ ${r.stargazers_count}${r.language ? '  · ' + r.language : ''}`, 7.5, yellow);
    if (i < 2) svg += `<line x1="578" y1="${ry + 38}" x2="832" y2="${ry + 38}" stroke="${border}" stroke-width="0.5"/>`;
  });

  // ─── SECTION 5: Heatmap ───
  svg += card(286, 116, 550, 68);
  svg += label(298, 130, '◈ activity (26 weeks)');
  heatmap.forEach((col, wi) => {
    col.forEach((n, di) => {
      const cx = 298 + wi * 13;
      const cy = 138 + di * 7;
      svg += `<rect x="${cx}" y="${cy}" width="10" height="5.5" rx="1.5" fill="${levelColor(n)}"/>`;
    });
  });

  // ─── SECTION 6: Random commits ───
  svg += card(16, 176, 270, 144);
  svg += label(28, 190, '◉ random commits');
  commits.forEach((c, i) => {
    const cy = 202 + i * 28;
    svg += `<text x="28" y="${cy}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="7.5" fill="${acc3}" font-weight="500">${esc(c.sha)}</text>`;
    svg += txt(28, cy + 11, c.msg.slice(0, 37), 8, text);
    svg += txt(28, cy + 21, `${c.repo} · ${timeAgo(c.time)}`, 7, muted);
    if (i < commits.length - 1) svg += `<line x1="28" y1="${cy + 25}" x2="274" y2="${cy + 25}" stroke="${border}" stroke-width="0.5"/>`;
  });

  // ─── SECTION 7: Recent events ───
  svg += card(286, 194, 270, 126);
  svg += label(298, 208, '◇ recent events');
  recentEvents.forEach((e, i) => {
    const ey = 220 + i * 20;
    svg += `<text x="298" y="${ey}" font-family="ui-monospace,SFMono-Regular,monospace" font-size="9" fill="${acc1}">${esc(eventIcon(e.type))}</text>`;
    svg += txt(312, ey, eventDesc(e).slice(0, 30), 8, text);
    svg += txt(312, ey + 10, timeAgo(e.created_at), 6.5, muted);
  });

  // ─── SECTION 8: Random repo spotlight ───
  const spotlight = shuffle(repos.filter(r => !r.fork && r.description))[0];
  svg += card(566, 174, 278, 146);
  if (spotlight) {
    svg += label(578, 188, '◆ spotlight repo');
    svg += `<text x="578" y="205" font-family="ui-monospace,SFMono-Regular,monospace" font-size="11" fill="${acc1}" font-weight="600">${esc(spotlight.name.slice(0, 24))}</text>`;
    // wrap description
    const words = (spotlight.description || '').split(' ');
    let line = '', lineY = 222, lineN = 0;
    for (const w of words) {
      if ((line + ' ' + w).trim().length > 28 || lineN === 0) {
        if (line) { svg += txt(578, lineY, line, 8.5, muted); lineY += 14; }
        line = w; lineN++;
        if (lineN > 3) break;
      } else line += ' ' + w;
    }
    if (line && lineY < 270) svg += txt(578, lineY, line, 8.5, muted);

    svg += txt(578, 272, `★ ${spotlight.stargazers_count}  ⑂ ${spotlight.forks_count}`, 8.5, yellow);
    if (spotlight.language) {
      svg += `<circle cx="579" cy="284" r="4" fill="${langColor(spotlight.language)}"/>`;
      svg += txt(587, 287, spotlight.language, 8, muted);
    }
    const topics = (spotlight.topics || []).slice(0, 3);
    topics.forEach((t, i) => {
      const tx = 578 + i * 72;
      svg += `<rect x="${tx}" y="294" width="${Math.min(t.length * 5.5 + 10, 68)}" height="13" rx="4" fill="${bg3}"/>`;
      svg += txt(tx + 5, 304, t.slice(0, 10), 7, muted);
    });
  }

  // ─── SECTION 9: Footer bar ───
  svg += card(16, 330, 828, 20, bg3, 8);
  svg += `<text x="24" y="344" font-family="ui-monospace,SFMono-Regular,monospace" font-size="7" fill="${muted}" letter-spacing="0.5">github.com/${esc(user.login)}  ·  ${user.public_repos} repos  ·  ${user.followers} followers  ·  generated by gh-card</text>`;
  svg += `<text x="836" y="344" font-family="ui-monospace,SFMono-Regular,monospace" font-size="7" fill="${muted}" text-anchor="end" letter-spacing="0.5">${new Date().toISOString().slice(0, 10)}</text>`;

  svg += '</svg>';
  return svg;
}

// ─────────────────────────────────────────────
//  VERCEL HANDLER
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  const { user: username, theme = 'dark' } = req.query;

  if (!username) {
    res.status(400).send('Missing ?user= parameter');
    return;
  }

  const token = process.env.GITHUB_TOKEN;

  try {
    const base = 'https://api.github.com';
    const [user, repos, events] = await Promise.all([
      fetchJSON(`${base}/users/${username}`, token),
      fetchJSON(`${base}/users/${username}/repos?sort=updated&per_page=100`, token),
      fetchJSON(`${base}/users/${username}/events/public?per_page=100`, token),
    ]);

    const svg = buildSVG({ user, repos, events, theme });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(svg);
  } catch (err) {
    // Return an error SVG so it renders gracefully in README
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60" viewBox="0 0 400 60">
      <rect width="400" height="60" rx="8" fill="#0d0d14" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="20" y="25" font-family="monospace" font-size="11" fill="#f472b6">gh-card error</text>
      <text x="20" y="44" font-family="monospace" font-size="9" fill="#6b6b80">${esc(err.message.slice(0, 55))}</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errSvg);
  }
}
