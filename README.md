# Luci Gene Dashboard

Raw DNA result management for patients. Upload 23andMe or Tellmegen CSV files and search any gene by RS code, position, or gene name — enriched live from NCBI.

## Features

- **Patient profiles** — create, edit, delete patients with DOB, sex, contact info
- **DNA file upload** — supports 23andMe (.txt) and Tellmegen (.csv) raw formats
- **Background parsing** — streams and batch-imports up to 700k+ SNPs without blocking
- **Gene search** — by RS code, gene name (BRCA1), or chromosome:position (17:41276113)
- **NCBI enrichment** — gene names, clinical significance, and MAF fetched from NCBI dbSNP on demand and cached
- **Gene reference DB** — bulk-import ClinVar clinical variants via `npm run build-gene-db`
- **SNP detail drawer** — click any result for full variant details + link to NCBI dbSNP

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Node.js 18+ / Express 4       |
| Database  | PostgreSQL 15                 |
| Frontend  | Vanilla JS SPA (no framework) |
| Deployment| Render.com                    |

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd luci-gene-dashboard
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL

# 3. Start
npm run dev
# → http://localhost:3000
```

The server auto-applies the database schema on startup.

### Build gene reference database (optional but recommended)

Downloads ClinVar clinical variants (~1M records) from NCBI FTP and imports them:

```bash
# Full import (takes 5-15 min depending on connection)
npm run build-gene-db

# Test with first 10,000 records
node scripts/buildGeneDb.js --limit 10000
```

### Get NCBI API key (free, recommended)

Without an API key: 3 requests/second (fine for light use).
With an API key: 10 requests/second.

1. Create account at https://www.ncbi.nlm.nih.gov/account/
2. Go to Settings → API Key Management
3. Add to `.env`: `NCBI_API_KEY=your_key_here`

---

## Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `render.yaml` and creates:
   - A **web service** (Node.js app)
   - A **PostgreSQL** database (linked automatically)
4. Set optional env vars in Render dashboard:
   - `NCBI_EMAIL` — your email for NCBI API
   - `NCBI_API_KEY` — from NCBI account
5. Deploy!

---

## API Reference

### Patients
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create patient |
| `GET`  | `/api/patients/:id` | Get patient + files |
| `PUT`  | `/api/patients/:id` | Update patient |
| `DELETE` | `/api/patients/:id` | Delete patient + all DNA data |

### Files
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/files/upload/:patientId` | Upload DNA file (multipart) |
| `GET`  | `/api/files/:fileId/status` | Poll processing status |
| `DELETE` | `/api/files/:fileId` | Delete file + SNP data |

### Genes
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/genes/search?q=BRCA1&patientId=1` | Search genes |
| `GET`  | `/api/genes/:rsid?patientId=1` | Get RS detail |
| `GET`  | `/api/genes/patient/:patientId` | Browse all patient SNPs |

### Search query formats
- **RS code**: `rs4477212` or `4477212`
- **Gene name**: `BRCA1`, `MTHFR`, `APOE`
- **Position**: `17:41276113` (chromosome:position, ±5kb window)

---

## Supported DNA File Formats

### 23andMe
Tab-separated, lines starting with `#` are comments:
```
# rsid	chromosome	position	genotype
rs4477212	1	82154	AA
rs3094315	1	752566	AG
```

### Tellmegen
Comma-separated, similar structure:
```
# rsid,chromosome,position,genotype
rs4477212,1,82154,AA
rs3094315,1,752566,AG
```

---

## License
MIT
