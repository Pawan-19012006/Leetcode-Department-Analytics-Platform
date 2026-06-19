from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import SessionLocal

from app.services.contest_query_service import (
    get_all_contests_service,
    get_contest_results_service
)

router = APIRouter()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.get("/contests")
def get_contests(
    db: Session = Depends(get_db)
):

    return get_all_contests_service(db)


@router.get("/contests/{contest_id}/results")
def get_contest_results(
    contest_id: int,
    db: Session = Depends(get_db)
):

    return get_contest_results_service(
        db,
        contest_id
    )