// Copy to config.js (gitignored) — or just set the env vars below and copy this
// file verbatim, since it reads from the environment. A local .env is auto-loaded.
//
// The only field the modern analyzer (otc.js) needs is tiingo.token.
// The gmail / proxy / stockinvestapi fields feed the legacy scrapers (mostly dead).

require('./load-env');

module.exports = {
  tiingo: {
    token: process.env.TIINGO_TOKEN || '',
  },
  daysToAnalyze: Number(process.env.DAYS_TO_ANALYZE || 90),

  // --- legacy scraper config (optional; unused by otc.js) ---
  serverName: process.env.SERVER_NAME || 'localhost',
  emails: (process.env.NOTIFY_EMAILS || '').split(',').filter(Boolean),
  gmail: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_PASS || '',
  },
  stockinvestapi: process.env.STOCKINVEST_API || '',
  proxy: process.env.PROXY_URL || '',
};
