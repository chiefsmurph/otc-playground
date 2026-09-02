// Minimal .env loader (no dependency). Loads KEY=VALUE lines from ./.env into
// process.env without overwriting anything already set in the environment.
const fs = require('fs');
const path = require('path');

try {
  const text = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
} catch (e) {
  // no .env file — rely on real environment variables
}
