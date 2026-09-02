# otc-playground

Penny/OTC stock **watch-list performance analyzer** + scanner.

Originally (2020) this scraped a dozen sites via Puppeteer. Most of those
scrapers are dead now (see below). The **price/analysis backbone runs on
Tiingo**, which is alive and covers a large chunk of the OTC/penny universe —
so the "watch list performance analyzer" half works today with zero scraping.

## Quick start

No `npm install` needed — uses Node 18+ global `fetch` (+ `curl` for the scanner).

```bash
cp config.example.js config.js          # then set TIINGO_TOKEN in .env (or the env)

# SCAN — today's hot OTC movers (OTCMarkets backend, live)
node scan                                # advancers, default filters
node scan --domestic --priceMax 1 --minVol 5000   # US pennies Tiingo can analyze
node scan --out universe.json            # save the symbol universe

# ANALYZE — Tiingo performance for tickers or a saved universe
node otc TRTC HYSNF ABML
node otc --watchlist universe.json       # feed the scanner's output straight in
node otc --watchlist data/watch-lists/1-10-2020.json
```

Full pipeline: `node scan --domestic --out u.json` → `node otc --watchlist u.json`
→ (in pattern-predict) `node outlook scan --universe u.json` to rank by pattern outlook.

Output (trailing `daysToAnalyze` trading days): last price, return %, window
high/low, % off high, average volume, last-volume-vs-average spike, trend.
Tickers Tiingo no longer covers (delisted) are listed separately — a stale
`date` column is itself a "this name is halted/dead" signal.

## Configuration

`config.js` is gitignored. Copy `config.example.js` and set:

| Var | Used for |
|-----|----------|
| `TIINGO_TOKEN` | **required** — price history (covers many OTC names) |
| `DAYS_TO_ANALYZE` | analysis window (default 90) |

The `gmail`, `proxy`, and `stockinvestapi` fields only feed the legacy scrapers.

## What's alive vs. dead

| Component | Source | Status |
|-----------|--------|--------|
| Price history / analyzer | api.tiingo.com | ✅ **works** (`otc.js`) |
| Scanner: OTCMarkets backend | backend.otcmarkets.com | ✅ **works** (`scan.js`) — via curl, `pageSize<=50` |
| Scanner: Finviz | finviz.com | ⚠️ 301 (markup changed) |
| Scanner: Barchart / iHub / StockInvest | various | ⚠️ scrape rewrite needed |
| Scanner: Twitter | twitter.com | ☠️ dead (now paid X API) |
| Puppeteer 1.12 headless browser | — | ☠️ won't install on modern Node/Apple Silicon |

Notes on the revived scanner (`scan.js`):
- OTCMarkets' backend fingerprints the HTTP client — Node's `fetch` is blocked
  (403/412), so `scan.js` shells out to `curl`. It also now caps `pageSize` at
  50, so the scanner paginates (records come volume-sorted).
- **Coverage overlap:** the highest-volume OTC movers are often foreign ADRs
  (`-F`/`-Y` suffix) that **Tiingo doesn't cover**. Use `--domestic` to drop
  them; even so, Tiingo covers only a subset of US OTC pennies. The scanner
  finds *everything*; the analyzer/ranker only work on Tiingo-covered names.

Finviz / iHub / Barchart / Twitter discovery would each need a bespoke modern
rebuild (Twitter is effectively gone).

## Legacy entrypoints (2020, mostly non-functional)

```bash
node index.js               # boots Puppeteer + dead scrapers
node run scan               # scanner (dead sources)
node run watch-list-perf    # aggregate historical day-perfs (data/ present)
```
