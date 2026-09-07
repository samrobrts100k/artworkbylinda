export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) {
    res.status(500).json({ error: 'server_not_configured' });
    return;
  }

  const body = req.body || {};
  const authHash = body.authHash;
  const data = body.data;
  if (!authHash || typeof authHash !== 'string' || !data || typeof data !== 'object') {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const newContentStr = JSON.stringify(data);
  if (newContentStr.length > 4000000) {
    res.status(413).json({ error: 'too_large' });
    return;
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/data.json`;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'painter-landing-page-save'
  };

  try {
    // Metadata call: always includes `sha`, regardless of file size.
    const metaResp = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers: ghHeaders });
    if (!metaResp.ok) {
      res.status(502).json({ error: 'github_read_failed' });
      return;
    }
    const meta = await metaResp.json();

    // Content call: files over 1MB come back with an empty `content` field
    // on the default media type, so fetch the raw bytes instead (works up to 100MB).
    const rawResp = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...ghHeaders, Accept: 'application/vnd.github.raw+json' }
    });
    if (!rawResp.ok) {
      res.status(502).json({ error: 'github_read_failed' });
      return;
    }
    const currentContent = JSON.parse(await rawResp.text());

    if (currentContent.passwordHash !== authHash) {
      res.status(403).json({ error: 'wrong_password' });
      return;
    }

    const putResp = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update site content',
        content: Buffer.from(newContentStr, 'utf8').toString('base64'),
        sha: meta.sha,
        branch
      })
    });

    if (!putResp.ok) {
      res.status(502).json({ error: 'github_write_failed' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
}
