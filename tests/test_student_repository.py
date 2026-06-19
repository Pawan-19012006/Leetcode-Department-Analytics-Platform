from app.database.session import SessionLocal

from app.repositories.student_repository import (

    get_by_leetcode_username

)

db = SessionLocal()

student = get_by_leetcode_username(

    db,

    "pawaneswaran19"

)

print(student.name)

db.close()