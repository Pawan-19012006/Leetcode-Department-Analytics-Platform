# Walkthrough - Backend Snapshot Analytics Service Migration

This walkthrough documents the full migration of the department performance analytics platform from client-side aggregation calculations in React to a robust, snapshot-driven backend architecture in FastAPI.

---

## 1. Accomplishments

### Backend Services & Repository Layer
- **Snapshot Date-Window Retrieval (`profile_snapshot_repository.py`)**: Added query functions for fetching latest snapshot, student-specific snapshots list, snapshots within a date range, and closest snapshot to a target date (using target offsets `captured_at <= target_date` falling back to earliest available).
- **Core Analytics Service (`analytics_service.py`)**: Implemented all metrics calculations in Python:
  - **Overview**: Computes total students, active count, averages, rating distribution, and weekly/monthly Top 5 rating/solved performers lists.
  - **Weekly Analytics**: Compares the latest student snapshots with snapshots closest to 7 days ago. Calculates participation turnouts, solved deltas, rating distribution shifts, and weekly score standings.
  - **Monthly Analytics**: Compares the latest student snapshots with snapshots closest to 30 days ago.
  - **Academic Watchlist**: Evaluates intervention status (Critical, At Risk, Warning, Good) based on exact threshold metrics (rating drops, solves drops, and inactivity deltas) alongside customized, human-readable reason strings.
  - **Department Intelligence**: Generates comparisons across Section A, B, C, D alongside mathematically-derived department health scores.
- **Analytics Router Routes (`student_routes.py`)**: Added endpoints `/analytics/overview`, `/analytics/weekly`, `/analytics/monthly`, `/analytics/watchlist`, and `/analytics/intelligence`.

### Frontend Presentation Layer
- **Delegation of Data (`dataService.ts`)**: Completely removed client-side calculations and lifetime/cumulative rating computations. Replaced the getter mappings to fetch directly from the backend cached endpoints `/analytics/*`.
- **View Render updates (`AnalyticsPage.tsx`)**: Realigned Overview, Weekly, Monthly, Watchlist, and Intelligence tabs to use the new time-window comparisons.

---

## 2. API Diagnostics & Verification

### Test Overview JSON Payload
The new endpoint `/analytics/overview` returns:
```json
{
  "total_students": 63,
  "active_students": 63,
  "average_rating": 1497.36,
  "average_solved": 440.84,
  "average_participation": 35.58,
  "students_above_1600": 19,
  "students_below_1400": 24,
  "health_score": 65,
  "health_status": "Average",
  "weekly_top_rating": [
    {
      "name": "Ajay G",
      "roll_no": "24CB0007",
      "username": "AJAYG_28",
      "weekly_rating_change": 105.7,
      "weekly_solved_change": 17
    }
  ],
  ...
}
```

### Verification
- FastAPI endpoint queries: **Successful with HTTP 200 responses returning computed lists.**
- Vite client compiler status: **TypeScript checks and compilation successful with build output code 0.**
