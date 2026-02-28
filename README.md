# Job Searcher

CLI tool that searches job boards for openings and generates company-centric lead lists for consulting/staffing sales teams.

Aggregates listings from LinkedIn, Indeed, Glassdoor, ZipRecruiter, and company career pages via the [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch).

## Setup

```bash
npm install
cp .env.example .env
```

Add your RapidAPI key to `.env`:
```
RAPIDAPI_KEY=your_actual_key
```

Get a free key at [rapidapi.com/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (200 requests/month free).

## Commands

### `search` — Search job listings

```bash
npx tsx src/index.ts search "Java Developer" [options]
```

Returns raw job listings as JSON and/or CSV.

### `leads` — Generate company leads

```bash
npx tsx src/index.ts leads "Java Developer,React Developer,DevOps" [options]
```

Batch searches multiple job titles, then:
- Filters out staffing/recruiting firms
- Deduplicates listings across searches
- Groups results by company
- Scores each company as a lead based on hiring signals

Output is a company-centric CSV/JSON — one row per company, not per job.

#### Signal scoring

| Signal | Points | Rationale |
|--------|--------|-----------|
| Open role | +1 each | More roles = more opportunity |
| Matched multiple search queries | +N | Hiring across skill areas |
| Contractor role | +2 each | Signals openness to external help |
| Salary info available | +1 | Indicates budget transparency |

### Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--location` | `-l` | `Philadelphia, PA` | Location to search |
| `--radius` | `-r` | `50` | Search radius in km |
| `--days` | `-d` | `week` | Date posted: `today`, `3days`, `week`, `month` |
| `--type` | `-t` | (all) | Employment types: `fulltime`, `contractor`, `parttime`, `intern` |
| `--remote` | | `false` | Remote jobs only |
| `--pages` | `-p` | `1` | Pages to fetch (`search` only) |
| `--format` | `-f` | `both` | Output: `json`, `csv`, `both` |
| `--output` | `-o` | `./output` | Output directory |

### Examples

```bash
# Search for AI engineers in Philly
npx tsx src/index.ts search "AI Engineer"

# Generate leads across multiple roles in NYC
npx tsx src/index.ts leads "Java Developer,React Developer,DevOps Engineer" -l "New York, NY"

# Target contract roles for lead gen
npx tsx src/index.ts leads "Python Developer,Data Engineer" -t contractor

# Remote leads, JSON only
npx tsx src/index.ts leads "Cloud Architect,SRE,Platform Engineer" --remote -f json
```

npm scripts are also available:
```bash
npm run search -- "AI Engineer"
npm run leads -- "Java Developer,React Developer"
```

## Tech Stack

Node.js / TypeScript. No runtime dependencies beyond `commander`, `dotenv`, and `@json2csv/plainjs`.
