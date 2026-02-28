# Job Searcher

Lead generation tool for Chariot Solutions. Searches job boards for openings that represent potential consulting/staffing opportunities.

## Setup

```bash
npm install
```

Add your RapidAPI key to `.env`:
```
RAPIDAPI_KEY=your_actual_key
```

Get a free key at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch (200 requests/month free).

## Usage

```bash
npx tsx src/index.ts search "<job title>" [options]
```

Or via npm script:
```bash
npm run search -- "<job title>" [options]
```

### Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--location` | `-l` | `Philadelphia, PA` | Location to search |
| `--radius` | `-r` | `50` | Search radius in kilometers |
| `--days` | `-d` | `week` | Date posted: `today`, `3days`, `week`, `month` |
| `--type` | `-t` | (all) | Employment types, comma-separated: `fulltime`, `contractor`, `parttime`, `intern` |
| `--remote` | | `false` | Remote jobs only |
| `--pages` | `-p` | `1` | Pages to fetch (10 results per page, each page = 1 API request) |
| `--format` | `-f` | `both` | Output format: `json`, `csv`, `both` |
| `--output` | `-o` | `./output` | Output directory |

### Examples

```bash
# Java developers in Philly area (default)
npx tsx src/index.ts search "Java Developer"

# React developers in NYC, posted today
npx tsx src/index.ts search "React Developer" -l "New York, NY" -d today

# Remote contract Python roles, 3 pages of results
npx tsx src/index.ts search "Python Developer" --remote -t contractor -p 3

# DevOps in DC area, CSV only
npx tsx src/index.ts search "DevOps Engineer" -l "Washington, DC" -f csv
```

## Output

Files are written to `./output/` (configurable with `-o`).

### JSON structure
```json
{
  "query": "Java Developer",
  "location": "Philadelphia, PA",
  "searchedAt": "2026-02-27T...",
  "totalResults": 10,
  "listings": [
    {
      "jobId": "...",
      "title": "Senior Java Developer",
      "company": "Acme Corp",
      "companyWebsite": "https://acme.com",
      "companyType": "Information Technology",
      "location": "Philadelphia, PA",
      "isRemote": false,
      "description": "Full job description text...",
      "applyLink": "https://...",
      "applyOptions": [{"publisher": "LinkedIn", "link": "https://..."}],
      "postedAt": "2026-02-25T...",
      "expiresAt": null,
      "employmentType": "FULLTIME",
      "source": "LinkedIn",
      "minSalary": 120000,
      "maxSalary": 160000,
      "salaryCurrency": "USD",
      "salaryPeriod": "YEAR",
      "benefits": ["Health insurance", "401k"],
      "requiredSkills": ["Java", "Spring Boot", "AWS"],
      "requiredExperience": {"months": 60, "noExperienceRequired": false},
      "requiredEducation": {"degree": "Bachelor's", "degreeRequired": true},
      "highlights": {
        "qualifications": ["5+ years Java experience"],
        "responsibilities": ["Design microservices"],
        "benefits": ["Competitive salary"]
      }
    }
  ]
}
```

### CSV columns
Company, Company Website, Title, Location, Remote, Employment Type, Salary Range, Apply Link, Posted Date, Source, Required Skills, Benefits, Description (truncated to 500 chars)

## Leads Mode

Batch search across multiple job titles and produce a **company-centric** lead list. Filters out staffing firms, deduplicates listings, groups by company, and scores lead strength.

```bash
npx tsx src/index.ts leads "Java Developer,React Developer,DevOps" [options]
```

Or via npm script:
```bash
npm run leads -- "Java Developer,React Developer,DevOps" [options]
```

Same flags as `search` except no `--pages` (always 1 page per query to conserve quota).

### Signal scoring
- +1 per open role
- +N if company matched N different search queries (N > 1)
- +2 per contractor role (signals openness to external help)
- +1 if salary info is available

### Leads CSV columns
Company, Company Website, Company Type, Signal Score, Signal Reasons, Open Roles, Matched Queries, Role Titles, Has Contractor Roles, Salary Range, Top Apply Link

### Examples

```bash
# Multi-title search in Philly (default)
npx tsx src/index.ts leads "Java Developer,React Developer,DevOps Engineer"

# Target contract roles in NYC
npx tsx src/index.ts leads "Python Developer,Data Engineer" -l "New York, NY" -t contractor

# Remote leads, JSON only
npx tsx src/index.ts leads "Cloud Architect,SRE,Platform Engineer" --remote -f json
```

## Data Source

Uses JSearch API via RapidAPI, which aggregates from Google for Jobs (indexes LinkedIn, Indeed, Glassdoor, ZipRecruiter, company career pages, etc.).

**Quota**: Free tier = 200 requests/month. Each search page = 1 request. Use `--pages` conservatively.

## Tech Stack

Node.js / TypeScript. Key deps: `commander` (CLI), `dotenv` (config), `@json2csv/plainjs` (CSV export).

Run type checks: `npx tsc --noEmit`
