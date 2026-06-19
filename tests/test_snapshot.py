from app.database.session import SessionLocal

from app.models.student import Student

from app.models.profile_snapshot import ProfileSnapshot

#This will show the relationship between the student table and the profile snapshot table, the student id will be directly matched with the snapshot table
db = SessionLocal()

student = db.query(Student).first() #first data in the student table

print(f"Student Found: {student.name}")

snapshot = ProfileSnapshot(

    student_id=student.id,

    current_rating=1539.04,

    global_rank=297422,

    contests_attended=17,

    total_solved=428,

    easy_solved=300,

    medium_solved=104,

    hard_solved=24,

    top_percentage=34.43

)

db.add(snapshot)

db.commit()

print("Snapshot inserted successfully")

db.close()

#Output
# id | student_id |           captured_at            | current_rating | global_rank | contests_attended | total_solved | easy_solved | medium_solved | hard_solved | top_percentage 
#----+------------+----------------------------------+----------------+-------------+-------------------+--------------+-------------+---------------+-------------+----------------
#  1 |          1 | 2026-06-19 13:26:52.436749+05:30 |        1539.04 |      297422 |                17 |          428 |         300 |           104 |          24 |          34.43
#(1 row)