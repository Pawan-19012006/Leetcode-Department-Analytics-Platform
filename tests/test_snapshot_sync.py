from app.database.session import SessionLocal

from app.services.profile_snapshot_service import (
    sync_student_snapshot
)

db = SessionLocal()

snapshot = sync_student_snapshot(
    db,
    "pawaneswaran19"
)

print(
    "Snapshot Created:",
    snapshot.id
)

db.close()

#leetcode_tracker=# SELECT * FROM profile_snapshots;
# id | student_id |           captured_at            |  current_rating   | global_rank | contests_attended | total_solved | easy_solved | medium_solved | hard_solved | top_percentage 
#----+------------+----------------------------------+-------------------+-------------+-------------------+--------------+-------------+---------------+-------------+----------------
# (manual) --> 1 |          1 | 2026-06-19 13:26:52.436749+05:30 |           1539.04 |      297422 |                17 |          428 |         300 |           104 |          24 |          34.43
# (leetcode fetched) --> 2 |          1 | 2026-06-19 15:23:37.495057+05:30 | 1539.044831591768 |      263034 |                17 |          429 |         300 |           105 |          24 |          34.43
#(2 rows)
