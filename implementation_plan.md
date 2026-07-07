# Implementation Plan - Time-Window Snapshot Analytics Redesign

This plan outlines the redesign of the analytics engine and presentation layers to shift from overall cumulative rating statistics to pure time-window based comparisons (Current Week vs. Previous Week, and Current Month vs. Previous Month) driven by profile snapshot comparisons.

---

## User Review Required

We have identified a conflict between the strict backend freeze constraint ("DO NOT modify backend code/routes") and the requirement to compute metrics based on profile snapshot comparisons ("Weekly analytics should compare Latest snapshot vs Snapshot closest to 7 days ago..."). The frontend currently has no API to fetch historical profile snapshots (it only has `/students/snapshots/latest`).

To solve this, we present two options:

> [!IMPORTANT]
> **Choose Implementation Option:**
> - **Option 1 (Recommended)**: We add a safe, read-only endpoint `GET /students/snapshots` to the backend. This returns all captured profile snapshots from the `profile_snapshots` table ordered by date. Since it is a safe read-only query, it does not alter database schemas, write operations, or sync logic.
> - **Option 2 (Pure Frontend)**: If the backend is strictly read-only, we can aggregate historical rating shifts and contest activity using the student's contest result history relative to 7-day and 30-day date offsets. We will mock the historical `total_solved` progress by subtracting problems solved in contests.

---

## Open Questions

- **Do you approve Option 1 (adding a simple, read-only `GET /students/snapshots` endpoint to the backend)?**
  *If approved, we will add the FastAPI route to student_routes.py. Otherwise, we will execute Option 2.*

---

## Proposed Changes

### Backend (Only if Option 1 is approved)

#### [MODIFY] [student_routes.py](file:///Users/pawaneswaran/Desktop/Work/PROJECTS/Leetcode-Tracker/app/api/student_routes.py)
Add a safe read-only endpoint to return all snapshots:
```python
@router.get("/students/snapshots")
def get_all_snapshots(
    db: Session = Depends(get_db)
):
    from app.models.profile_snapshot import ProfileSnapshot
    snapshots = db.query(ProfileSnapshot).order_by(ProfileSnapshot.captured_at.asc()).all()
    return [
        {
            "id": s.id,
            "student_id": s.student_id,
            "captured_at": s.captured_at.isoformat(),
            "current_rating": s.current_rating,
            "contests_attended": s.contests_attended,
            "total_solved": s.total_solved,
            "global_rank": s.global_rank,
            "top_percentage": s.top_percentage
        }
        for s in snapshots
    ]
```

---

### Frontend

#### [MODIFY] [dataService.ts](file:///Users/pawaneswaran/Desktop/Work/PROJECTS/Leetcode-Tracker/frontend/src/services/dataService.ts)
- Completely remove `Overall Rating Gain`, `overall rating improvement`, and lifetime analytics.
- If **Option 1** is selected: fetch `/students/snapshots` and perform a lookup to locate the snapshot closest to 7 days ago and 30 days ago.
- If **Option 2** is selected: parse the chronological contest results list of each student, finding the contest results nearest to 7 days and 30 days ago.
- For **Weekly Analytics** (Current Week vs. Previous Week):
  - Current Week = last 7 days (`captured_at` inside `[now - 7d, now]`).
  - Previous Week = previous 7 days (`captured_at` inside `[now - 14d, now - 7d]`).
  - Calculate weekly rating change, weekly problems solved change, and weekly contest attendance.
  - Sort **Top Weekly Performers** by: Primary weight = weekly rating increase, Secondary = weekly problems solved increase, Tertiary = weekly contest participation.
  - Sort **Weekly Underperformers** worst first: largest rating drop, lowest participation, reduced problems solved.
- For **Monthly Analytics** (Current Month vs. Previous Month):
  - Current Month = last 30 days.
  - Previous Month = previous 30 days (30 to 60 days ago).
  - Calculate monthly rating change, monthly problems solved change, and monthly contest attendance.
  - Sort **Top Monthly Performers**, **Top Monthly Improvers**, and **Monthly Underperformers** using the same priority logic.
- For **Overview**:
  - Keep exactly 6 KPIs: Total Students, Average Contest Rating, Average Problems Solved, Active Students, Students Above 1600, Students Below 1400.
  - Top 5 Weekly Performers (Student, Weekly Rating Change, Problems Solved Increase).
  - Top 5 Monthly Performers (Student, Monthly Rating Change, Problems Solved Increase).
  - Department Health Rating Distribution chart.
  - Remove all other sections (Most Improved, overall improvements, etc.).

#### [MODIFY] [AnalyticsPage.tsx](file:///Users/pawaneswaran/Desktop/Work/PROJECTS/Leetcode-Tracker/frontend/src/pages/AnalyticsPage.tsx)
- Re-align tab presentation code to utilize the simplified Overview structure:
  - Section 1: Executive KPIs.
  - Section 2: Top 5 Weekly Performers Table.
  - Section 3: Top 5 Monthly Performers Table.
  - Section 4: Rating Distribution chart (Option A layout).
- Update Weekly and Monthly tabs to use the new time-window difference columns and indicators.
- Clean up any unused styling and verify visual grid spacing.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in the `frontend` folder to guarantee typescript safety and compilation.
