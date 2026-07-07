from app.services.student_service import delete_student_service
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from app.database.session import SessionLocal

from app.schemas.student_schema import StudentCreate

from app.services.student_service import (
    create_student_service,
    get_all_students_service,
    sync_all_students_service,
    get_students_latest_snapshots_service,
)

from app.services.profile_snapshot_service import (
    sync_student_snapshot
)

from app.services.contest_service import (
    sync_student_contests
)

student_sync_times = {}

router = APIRouter()

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

@router.post("/students")
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):

    created_student = create_student_service(
        db,
        student
    )

    return {
        "message": "Student created successfully",
        "student_id": created_student.id
    }

@router.get("/students")
def get_students(
    db: Session = Depends(get_db)
):

    students = get_all_students_service(db)

    return students

@router.post("/students/sync/{username}")
def sync_student(
    username: str,
    db: Session = Depends(get_db)
):

    now = datetime.now()

    if username in student_sync_times:

        elapsed = (
            now
            - student_sync_times[username]
        ).total_seconds()

        if elapsed < 60:

            raise HTTPException(
                status_code=429,
                detail=(
                    f"{username} was recently synced."
                )
            )

    student_sync_times[username] = now

    snapshot = sync_student_snapshot(
        db,
        username
    )

    contest_data = sync_student_contests(
        db,
        username
    )

    return {
        "message": "Student synced successfully",
        "snapshot_id": snapshot.id,
        "student_id": snapshot.student_id,
        "contests_synced": contest_data["contests_synced"]
    }

last_sync_time = None
SYNC_COOLDOWN_SECONDS = 60

@router.post("/sync-all")
def sync_all_students(
    db: Session = Depends(get_db)
):

    global last_sync_time

    if last_sync_time:

        elapsed = (
            datetime.now()
            - last_sync_time
        ).total_seconds()

        if elapsed < SYNC_COOLDOWN_SECONDS:

            remaining = int(
                SYNC_COOLDOWN_SECONDS - elapsed
            )

            raise HTTPException(
                status_code=429,
                detail=(
                    f"Please wait "
                    f"{remaining} seconds "
                    f"before syncing again."
                )
            )

    last_sync_time = datetime.now()

    return sync_all_students_service(db)

@router.post("/students/contest-sync/{username}")
def sync_contests(
    username: str,
    db: Session = Depends(get_db)
):
    return sync_student_contests(
        db,
        username
    )

@router.get("/students/snapshots/latest")
def get_students_latest_snapshots(
    db: Session = Depends(get_db)
):
    return get_students_latest_snapshots_service(db)

@router.delete("/students/{student_id}")
def delete_student_route(
    student_id: int,
    db: Session = Depends(get_db)
):

    return delete_student_service(
        db,
        student_id
    )

@router.get("/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    from app.services.analytics_service import get_overview_analytics_service
    return get_overview_analytics_service(db)

@router.get("/analytics/weekly")
def get_analytics_weekly(db: Session = Depends(get_db)):
    from app.services.analytics_service import get_weekly_analytics_service
    return get_weekly_analytics_service(db)

@router.get("/analytics/monthly")
def get_analytics_monthly(db: Session = Depends(get_db)):
    from app.services.analytics_service import get_monthly_analytics_service
    return get_monthly_analytics_service(db)

@router.get("/analytics/watchlist")
def get_analytics_watchlist(db: Session = Depends(get_db)):
    from app.services.analytics_service import get_watchlist_analytics_service
    return get_watchlist_analytics_service(db)

@router.get("/analytics/intelligence")
def get_analytics_intelligence(db: Session = Depends(get_db)):
    from app.services.analytics_service import get_department_intelligence_service
    return get_department_intelligence_service(db)