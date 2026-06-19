from app.database.session import SessionLocal

from app.models.student import Student
from app.models.contest import Contest
from app.models.contest_result import ContestResult

# testing the insertion of data into contest_result table
db = SessionLocal()

student = db.query(Student).first()

contest = db.query(Contest).first()


result = ContestResult(
    student_id=student.id,
    contest_id=contest.id,

    global_rank=13441,

    problems_solved=2,

    total_problems=4,

    finish_time_seconds=3765,

    rating_after=1539.04,

    rating_change=-9.62
)

db.add(result)

db.commit()

print("Contest Result inserted successfully")

db.close()