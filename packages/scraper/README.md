# Cliniqo Scraper

Scrapes Google Maps for dental/medical clinics that have no website or a bad one, then syncs them to Supabase as leads.

## Setup

```bash
cd packages/scraper

# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Install Playwright browser
playwright install chromium

# 4. Configure environment
cp .env.example .env
# Edit .env with your Supabase URL and key
```

## Usage

### Run full pipeline (all queries from config.py)
```bash
python run.py
```

### Run a single query
```bash
python run.py --query "dental clinic Bangalore"
```

### Dry run — scrape but don't save to DB
```bash
python run.py --dry-run
```

### Save raw results to JSON
```bash
python run.py --save output/leads_today.json
```

### Watch the browser (useful for debugging)
```bash
python run.py --headful --query "dentist Mumbai"
```

## What gets filtered

The scraper keeps only clinics where:
- ✅ Rating ≥ 3.5
- ✅ Reviews ≥ 5
- ✅ No website OR website is a directory/free builder (JustDial, Sulekha, Wix etc.)

## Adding more cities / professions

Edit `config.py`:
```python
SEARCH_QUERIES = [
    "dental clinic Bangalore",
    "skin clinic Mumbai",
    "physiotherapy clinic Pune",
    # Add more here
]
```

## Output

After running, new leads appear in:
- **Supabase `leads` table** → visible in your Admin dashboard at `/admin/leads`
- **Admin dashboard** → click ⚡ Demo on any lead to instantly generate their demo site

## Schedule with cron (run daily at 9am)

```bash
0 9 * * * cd /path/to/packages/scraper && source venv/bin/activate && python run.py >> logs/scraper.log 2>&1
```
