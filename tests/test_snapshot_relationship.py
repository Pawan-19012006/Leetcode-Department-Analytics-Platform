from app.database.session import SessionLocal
from app.models.student import Student

# test whether the db returns the value
db = SessionLocal()


student = db.query(Student).first()

print(f"Student: {student.name}")

print("\nSnapshots:")

for snapshot in student.profile_snapshots:
    print(
        snapshot.current_rating,
        snapshot.total_solved
    )


db.close()

#Output
#Student: Pawan
#Snapshots:
#1539.04 428