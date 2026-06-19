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

# id | roll_no | name  | batch | section | leetcode_username |           created_at           | updated_at 
#----+---------+-------+-------+---------+-------------------+--------------------------------+------------
#  1 | 22CS001 | Pawan |  2024 | A       | pawaneswaran19    | 2026-06-19 11:58:58.7645+05:30 | 