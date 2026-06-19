from app.database.session import SessionLocal

from app.models.student import Student

# Fetches the data of the contest based upon the student name
db = SessionLocal()

student = db.query(Student).first()

print(f"Student: {student.name}")

for result in student.contest_results:

    print(
        result.contest.contest_name,
        result.global_rank,
        result.problems_solved
    )

db.close()