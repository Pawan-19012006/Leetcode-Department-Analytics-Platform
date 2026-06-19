from app.database.session import SessionLocal
from app.models.student import Student


db = SessionLocal()


student = Student(
    roll_no="22CS001",
    name="Pawan",
    batch=2024,
    section="A",
    leetcode_username="pawaneswaran19"
)


db.add(student)

db.commit()

print("Student inserted successfully")


db.close()