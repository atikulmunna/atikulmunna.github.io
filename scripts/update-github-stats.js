/**
 * Update hero GitHub stats.
 * Fetches public repo count, last-year commits, total PRs and total stars via
 * the GitHub GraphQL API, then writes the numbers into the
 * `data-github-stat="…"` spans in index.html. Meant to run in CI on a schedule
 * with the Actions-provided GITHUB_TOKEN. Run: `node scripts/update-github-stats.js`.
 */
const fs = require('fs');
const path = require('path');

const LOGIN = process.env.GH_STATS_LOGIN || 'atikulmunna';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const HTML_PATH = path.join(__dirname, '..', 'index.html');

if (!TOKEN) {
  console.error('Missing GITHUB_TOKEN/GH_TOKEN — cannot query the GitHub API.');
  process.exit(1);
}

async function graphql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': `${LOGIN}-portfolio-stats`
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function fetchCoreStats() {
  const query = `
    query($login: String!, $prQuery: String!) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
        contributionsCollection { totalCommitContributions }
      }
      prs: search(query: $prQuery, type: ISSUE) { issueCount }
    }`;
  const data = await graphql(query, {
    login: LOGIN,
    prQuery: `type:pr author:${LOGIN}`
  });
  return {
    repos: data.user.repositories.totalCount,
    commits: data.user.contributionsCollection.totalCommitContributions,
    prs: data.prs.issueCount
  };
}

async function fetchStars() {
  const query = `
    query($login: String!, $cursor: String) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC, first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { stargazerCount }
        }
      }
    }`;
  let cursor = null;
  let stars = 0;
  do {
    const data = await graphql(query, { login: LOGIN, cursor });
    const repos = data.user.repositories;
    stars += repos.nodes.reduce((sum, r) => sum + (r.stargazerCount || 0), 0);
    cursor = repos.pageInfo.hasNextPage ? repos.pageInfo.endCursor : null;
  } while (cursor);
  return stars;
}

function format(n) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`;
}

function inject(html, key, value) {
  const re = new RegExp(
    `(<span[^>]*data-github-stat="${key}"[^>]*>)([^<]*)(</span>)`
  );
  if (!re.test(html)) {
    throw new Error(`Could not find data-github-stat="${key}" span in index.html`);
  }
  return html.replace(re, `$1${format(value)}$3`);
}

(async () => {
  const [core, stars] = await Promise.all([fetchCoreStats(), fetchStars()]);
  const stats = { ...core, stars };
  console.log('Fetched GitHub stats:', stats);

  let html = fs.readFileSync(HTML_PATH, 'utf8');
  for (const key of ['repos', 'commits', 'prs', 'stars']) {
    html = inject(html, key, stats[key]);
  }
  fs.writeFileSync(HTML_PATH, html);
  console.log('index.html updated.');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
