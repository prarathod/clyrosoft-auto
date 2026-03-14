"""
Scraper checkpoint system.
Remembers which queries were completed so the next run continues where it left off.
One checkpoint file per sweep (city + profession combo).
"""

import json
import os
from datetime import datetime
from typing import Optional

CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints")


def make_sweep_id(city: str, profession: Optional[str] = None) -> str:
    """Deterministic ID for a sweep config — used as the checkpoint filename."""
    parts = [city.lower().replace(" ", "-")]
    if profession:
        parts.append(profession.lower().replace(" ", "-")[:30])
    return "_".join(parts)


class CheckpointManager:
    """
    Tracks progress for a single sweep across multiple runs.

    File structure (checkpoints/{sweep_id}.json):
    {
        "sweep_id": "bangalore",
        "city": "Bangalore",
        "profession": null,
        "total_queries": 2850,
        "completed_queries": ["dental clinic Koramangala Bangalore", ...],
        "total_inserted_all_time": 450,
        "runs": [
            {"date": "2024-03-14", "inserted": 100, "queries_done": 32},
            {"date": "2024-03-15", "inserted": 100, "queries_done": 31},
        ],
        "started_at": "2024-03-14T09:00:00",
        "last_updated": "2024-03-14T11:30:00"
    }
    """

    def __init__(self, sweep_id: str, city: str, profession: Optional[str] = None):
        os.makedirs(CHECKPOINT_DIR, exist_ok=True)
        self.filepath = os.path.join(CHECKPOINT_DIR, f"{sweep_id}.json")
        self.sweep_id = sweep_id
        self.city = city
        self.profession = profession
        self._data = self._load()
        self._run_inserted = 0   # inserted in the CURRENT run only
        self._run_queries   = 0  # queries completed in the CURRENT run

    def _load(self) -> dict:
        if os.path.exists(self.filepath):
            with open(self.filepath) as f:
                return json.load(f)
        return {
            "sweep_id": self.sweep_id,
            "city": self.city,
            "profession": self.profession,
            "total_queries": 0,
            "completed_queries": [],
            "total_inserted_all_time": 0,
            "runs": [],
            "started_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
        }

    def _save(self) -> None:
        self._data["last_updated"] = datetime.now().isoformat()
        with open(self.filepath, "w") as f:
            json.dump(self._data, f, indent=2, ensure_ascii=False)

    # ── Read ──────────────────────────────────────────────────────────────────

    @property
    def completed(self) -> set:
        return set(self._data["completed_queries"])

    @property
    def total_inserted_all_time(self) -> int:
        return self._data["total_inserted_all_time"]

    @property
    def runs(self) -> list:
        return self._data.get("runs", [])

    def pending_queries(self, all_queries: list) -> list:
        """Return queries not yet completed, preserving order."""
        done = self.completed
        return [q for q in all_queries if q not in done]

    # ── Write ─────────────────────────────────────────────────────────────────

    def set_total_queries(self, n: int) -> None:
        self._data["total_queries"] = n
        self._save()

    def mark_done(self, query: str, inserted: int) -> None:
        """Call after each query completes."""
        if query not in self.completed:
            self._data["completed_queries"].append(query)
        self._data["total_inserted_all_time"] += inserted
        self._run_inserted += inserted
        self._run_queries  += 1
        self._save()

    def finish_run(self) -> None:
        """Call at the end of a run to log a run summary."""
        self._data["runs"].append({
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "inserted": self._run_inserted,
            "queries_completed": self._run_queries,
        })
        self._save()

    def reset(self) -> None:
        """Delete checkpoint and start fresh."""
        if os.path.exists(self.filepath):
            os.remove(self.filepath)
        self._data = self._load()
        print(f"  ✓ Checkpoint reset: {self.filepath}")

    # ── Display ───────────────────────────────────────────────────────────────

    def print_status(self, total_queries: int) -> None:
        done    = len(self.completed)
        remain  = total_queries - done
        pct     = done / total_queries * 100 if total_queries else 0
        print(f"  Progress : {done}/{total_queries} queries done ({pct:.1f}%)")
        print(f"  Remaining: {remain} queries to go")
        print(f"  All-time : {self.total_inserted_all_time} leads inserted")
        if self.runs:
            last = self.runs[-1]
            print(f"  Last run : {last['date']} — +{last['inserted']} leads, {last['queries_completed']} queries")
