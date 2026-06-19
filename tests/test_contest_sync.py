from app.database.session import SessionLocal

from app.services.contest_service import (

    sync_student_contests

)

db = SessionLocal()

result = sync_student_contests(

    db,

    "pawaneswaran19"

)

print(result)

db.close()