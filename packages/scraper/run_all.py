"""
run_all.py — Full city sweep with parallel workers + checkpoint resume + lead limit.

The scraper remembers which queries it completed. Run it daily with --limit to
collect a fixed number of leads per day without repeating work.

Usage:
    # Day 1 — get 100 leads and stop
    python run_all.py --limit 100

    # Day 2 — automatically resumes from where Day 1 left off
    python run_all.py --limit 100

    # See how far along the sweep is
    python run_all.py --status

    # Reset checkpoint and start fresh
    python run_all.py --reset

    # Change city
    python run_all.py --city Mysore --limit 50

    # Single profession sweep
    python run_all.py --profession "dental clinic" --limit 200

    # All tier-2 cities
    python run_all.py --city all-tier2 --limit 500

    # Speed options
    python run_all.py --workers 5 --limit 100
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
from checkpoint import CheckpointManager, make_sweep_id


# ─── Worker function (runs in a subprocess) ───────────────────────────────────

def _worker(args: tuple) -> dict:
    """Scrape one query and sync results. Each call runs in its own process."""
    query, max_per_query, dry_run = args

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
        return {"query": query, "inserted": 0, "skipped": 0, "error": str(e)[:100]}


# ─── Build query list ─────────────────────────────────────────────────────────

def build_queries(city: str, profession: Optional[str]) -> list:
    if city.lower() == "all-tier2":
        queries = []
        for c, areas in TIER2_CITY_AREAS.items():
            for p in PROFESSIONS:
                for area in areas:
                    queries.append(f"{p} {area}")
        return queries
    elif profession:
        if city.lower() == "bangalore":
            return [f"{profession} {area} Bangalore" for area in BANGALORE_AREAS]
        else:
            return [f"{profession} {city}"]
    else:
        return get_all_queries(city)


# ─── Main sweep ───────────────────────────────────────────────────────────────

def run_full_sweep(
    city: str,
    profession: Optional[str],
    max_per_query: int,
    dry_run: bool,
    workers: int,
    limit: Optional[int],
    reset: bool,
    status_only: bool,
):
    sweep_id   = make_sweep_id(city, profession)
    checkpoint = CheckpointManager(sweep_id, city, profession)
    all_queries = build_queries(city, profession)

    if reset:
        checkpoint.reset()
        print("Checkpoint cleared. Run again without --reset to start fresh.")
        return

    if status_only:
        print(f"\n{'═'*55}")
        print(f"  SWEEP STATUS  |  {sweep_id}")
        print(f"{'─'*55}")
        checkpoint.print_status(len(all_queries))
        print(f"{'═'*55}\n")
        return

    pending = checkpoint.pending_queries(all_queries)
    already_done = len(all_queries) - len(pending)

    if not pending:
        print(f"\n✅ All {len(all_queries)} queries already completed!")
        print(f"   Run with --reset to start over.\n")
        return

    limit_label = f"stop at +{limit} new leads" if limit else "no limit"
    print(f"""
{'='*60}
  CLINIQO SWEEP  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}
  City     : {city}{'  |  Profession: ' + profession if profession else ''}
  Workers  : {workers}  |  Max/query: {max_per_query}
  Limit    : {limit_label}
  Progress : {already_done}/{len(all_queries)} queries done already
  Remaining: {len(pending)} queries to run today
  Mode     : {'DRY RUN' if dry_run else 'LIVE'}
{'='*60}
""")

    checkpoint.set_total_queries(len(all_queries))
    worker_args = [(q, max_per_query, dry_run) for q in pending]

    run_inserted  = 0
    run_skipped   = 0
    run_done      = 0
    failed_queries = []
    start_time    = time.time()
    limit_reached = False

    with multiprocessing.Pool(processes=workers) as pool:
        for result in pool.imap_unordered(_worker, worker_args, chunksize=1):
            run_done += 1
            elapsed = time.time() - start_time

            checkpoint.mark_done(result["query"], result.get("inserted", 0))

            if result["error"]:
                failed_queries.append(result["query"])
                status = f"✗ error: {result['error'][:50]}"
            else:
                run_inserted += result["inserted"]
                run_skipped  += result["skipped"]
                rate = run_done / elapsed * 60  # queries/min
                eta  = (len(pending) - run_done) / (run_done / elapsed) / 60 if run_done > 0 else 0
                status = (
                    f"+{result['inserted']:2d} new  "
                    f"| today={run_inserted}  "
                    f"| {rate:.1f}q/min  "
                    f"| ETA {eta:.0f}m"
                )

            print(f"  [{run_done}/{len(pending)}] {status}  —  {result['query'][:40]}")

            # Stop when daily limit is reached
            if limit and run_inserted >= limit:
                print(f"\n  🎯 Limit of {limit} leads reached for today! Stopping.")
                limit_reached = True
                pool.terminate()
                break

    checkpoint.finish_run()

    elapsed_min = (time.time() - start_time) / 60
    remaining_after = len(checkpoint.pending_queries(all_queries))

    print(f"\n{'═'*60}")
    print(f"  RUN COMPLETE  ({elapsed_min:.1f} min)")
    print(f"{'─'*60}")
    print(f"  ✅ New leads today : {run_inserted}")
    print(f"  ⏭  Skipped (dup)   : {run_skipped}")
    print(f"  Queries done today : {run_done}")
    print(f"  Queries remaining  : {remaining_after} (resume tomorrow)")
    print(f"  All-time total     : {checkpoint.total_inserted_all_time} leads")
    if failed_queries:
        print(f"  ❌ Failed queries  : {len(failed_queries)}")
    if limit_reached:
        print(f"\n  💡 Run again tomorrow with same command to continue from here.")
    elif remaining_after == 0:
        print(f"\n  🏁 Full sweep complete! Use --reset to start over.")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    multiprocessing.set_start_method("spawn", force=True)

    parser = argparse.ArgumentParser(description="Parallel clinic sweep with resume")
    parser.add_argument("--city", default="Bangalore",
                        help='City to sweep. "all-tier2" for all tier-2 cities.')
    parser.add_argument("--profession", default=None,
                        help='Single profession e.g. "dental clinic"')
    parser.add_argument("--limit", type=int, default=None,
                        help="Stop after inserting this many NEW leads (e.g. 100)")
    parser.add_argument("--max", type=int, default=20,
                        help="Max listings to check per query (default: 20)")
    parser.add_argument("--workers", type=int, default=WORKER_COUNT,
                        help=f"Parallel browser workers (default: {WORKER_COUNT})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Scrape but don't save to Supabase")
    parser.add_argument("--status", action="store_true",
                        help="Show sweep progress and exit")
    parser.add_argument("--reset", action="store_true",
                        help="Clear checkpoint and start sweep from scratch")
    args = parser.parse_args()

    run_full_sweep(
        city=args.city,
        profession=args.profession,
        max_per_query=args.max,
        dry_run=args.dry_run,
        workers=args.workers,
        limit=args.limit,
        reset=args.reset,
        status_only=args.status,
    )
