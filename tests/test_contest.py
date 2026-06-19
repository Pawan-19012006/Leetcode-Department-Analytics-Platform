from app.database.session import SessionLocal

from app.models.contest import Contest

from datetime import datetime

db = SessionLocal()

contest = Contest(

    contest_name="Weekly Contest 505",

    contest_type="Weekly",

    contest_number=505,

    contest_date=datetime.now()

)

db.add(contest)

db.commit()

print("Contest inserted successfully")

db.close()