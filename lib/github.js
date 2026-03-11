async function gh(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'gh-card/3',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`GitHub ${r.status} (${url.split('/').slice(-2).join('/')})`);
  return r.json();
}

module.exports = { gh };
