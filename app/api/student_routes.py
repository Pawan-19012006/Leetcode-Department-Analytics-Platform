from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import SessionLocal

from app.schemas.student_schema import StudentCreate

from app.services.student_service import (
    create_student_service,
    get_all_students_service,
    sync_all_students_service
)

from app.services.profile_snapshot_service import (
    sync_student_snapshot
)

from app.services.contest_service import (
    sync_student_contests
)

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

@router.post("/sync-all")
def sync_all_students(
    db: Session = Depends(get_db)
):

    result = sync_all_students_service(db)

    return result

@router.post("/students/contest-sync/{username}")
def sync_contests(
    username: str,
    db: Session = Depends(get_db)
):
    return sync_student_contests(
        db,
        username
    )