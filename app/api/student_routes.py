from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import SessionLocal

from app.schemas.student_schema import StudentCreate

from app.services.student_service import (
    create_student_service,
    get_all_students_service
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