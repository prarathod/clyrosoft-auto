"""
run_all.py — Full city sweep with parallel workers.

Each worker is a separate OS process with its own browser instance.
Queries are distributed across workers so N queries run simultaneously.

Usage:
    python run_all.py                              # Full Bangalore sweep, 3 workers
    python run_all.py --workers 5                  # Faster (needs good machine)
    python run_all.py --city Mysore                # Tier-2 city
    python run_all.py --city all-tier2             # All tier-2 cities
    python run_all.py --profession "dental clinic" # One profession, all Bangalore areas
    python run_all.py --dry-run                    # Preview without saving
"""

import argparse
import multiprocessing
import time
from datetime import datetime
from typing import Optional

from config import (
    get_all_queries, PROFESSIONS, BANGALORE_AREAS,
    TIER2_CITY_AREAS, WORKER_COUNT,
)


# ─── Worker function (runs in a subprocess) ───────────────────────────────────
# Must be a top-level function (not a lambda/closure) for multiprocessing to work.

def _worker(args: tuple) -> dict:
    """Scrape one query and sync results. Runs in its own process."""
    query, max_per_query, dry_run = args

    # Import here so each process gets its own Playwright instance
    from scraper import scrape_query
    from sync import sync_leads

    try:
        leads = scrape_query(query, max_results=max_per_query, headless=True)
        if not leads:
            return {"query": query, "inserted": 0, "skipped": 0, "error": None}

        stats = sync_leads(leads, dry_run=dry_run)
        return {
            "query": query,
            "inserted": stats.get("inserted", 0),
            "skipped": stats.get("skipped", 0),
            "error": None,
        }
    except Exception as e:
        return {"query": query, "inserted": 0, "skipped": 0, "error": str(e)}


# ─── Main sweep ───────────────────────────────────────────────────────────────

def run_full_sweep(
    city: str,
    profession: Optional[str],
    max_per_query: int,
    dry_run: bool,
    workers: int,
):
    if city.lower() == "all-tier2":
        queries = []
        for c, areas in TIER2_CITY_AREAS.items():
            for p in PROFESSIONS:
                for area in areas:
                    queries.append(f"{p} {area}")
    elif profession:
        if city.lower() == "bangalore":
            queries = [f"{profession} {area} Bangalore" for area in BANGALORE_AREAS]
        else:
            queries = [f"{profession} {city}"]
    else:
        queries = get_all_queries(city)

    total = len(queries)
    print(f"""
{'='*60}
  CLINIQO PARALLEL SWEEP  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}
  City: {city}  |  Queries: {total}
  Workers: {workers}  |  Max/query: {max_per_query}
  Mode: {'DRY RUN' if dry_run else 'LIVE'}
{'='*60}
""")

    worker_args = [(q, max_per_query, dry_run) for q in queries]

    total_inserted = 0
    total_skipped  = 0
    done           = 0
    failed_queries = []
    start_time     = time.time()

    # imap_unordered streams results as they complete — no waiting for a full batch
    with multiprocessing.Pool(processes=workers) as pool:
        for result in pool.imap_unordered(_worker, worker_args, chunksize=1):
            done += 1
            elapsed = time.time() - start_time
            rate    = done / elapsed * 60  # queries per minute

            if result["error"]:
                print(f"  [{done}/{total}] ✗ {result['query'][:50]} — {result['error'][:60]}")
                failed_queries.append(result["query"])
            else:
                total_inserted += result["inserted"]
                total_skipped  += result["skipped"]
                new = result["inserted"]
                eta_min = (total - done) / (done / elapsed) / 60 if done > 0 else 0
                print(
                    f"  [{done}/{total}] +{new:2d} new | "
                    f"total={total_inserted} | "
                    f"{rate:.1f} q/min | "
                    f"ETA {eta_min:.0f}m | "
                    f"{result['query'][:45]}"
                )

    elapsed_min = (time.time() - start_time) / 60
    print(f"\n{'═'*60}")
    print(f"  SWEEP COMPLETE  ({elapsed_min:.1f} min)")
    print(f"{'─'*60}")
    print(f"  Queries run:   {total - len(failed_queries)}/{total}")
    print(f"  ✅ Inserted:   {total_inserted} new leads")
    print(f"  ⏭  Skipped:    {total_skipped} duplicates")
    if failed_queries:
        print(f"  ❌ Failed ({len(failed_queries)}):")
        for q in failed_queries[:10]:
            print(f"     • {q}")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    # Required on macOS/Windows for multiprocessing
    multiprocessing.set_start_method("spawn", force=True)

    parser = argparse.ArgumentParser(description="Parallel clinic sweep")
    parser.add_argument("--city", default="Bangalore",
                        help='City to sweep. Use "all-tier2" for tier-2 cities.')
    parser.add_argument("--profession", default=None,
                        help='Single profession e.g. "dental clinic"')
    parser.add_argument("--max", type=int, default=20,
                        help="Max results per query (default: 20)")
    parser.add_argument("--workers", type=int, default=WORKER_COUNT,
                        help=f"Parallel browser workers (default: {WORKER_COUNT})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Scrape but don't save to Supabase")
    args = parser.parse_args()

    run_full_sweep(
        city=args.city,
        profession=args.profession,
        max_per_query=args.max,
        dry_run=args.dry_run,
        workers=args.workers,
    )
