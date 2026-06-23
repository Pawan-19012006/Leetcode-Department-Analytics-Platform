from app.repositories.student_repository import (
    create_student,
    get_by_leetcode_username,
    get_by_roll_no,
    get_all_students,
    delete_student
)

from app.repositories.contest_result_repository import (

    delete_results_by_student_id

)

from app.repositories.profile_snapshot_repository import (

    delete_snapshots_by_student_id

)

from app.services.profile_snapshot_service import (

    sync_student_snapshot,

)

from app.services.contest_service import (
    sync_student_contests
)

import time
from datetime import datetime



def create_student_service(
    db,
    student_data
):

    existing_student = get_by_leetcode_username(
        db,
        student_data.leetcode_username
    )

    existing_roll_no = get_by_roll_no(
        db,
        student_data.roll_no
    )

    if existing_roll_no:
        raise ValueError(
            "Roll Number already exists"
        )

    if existing_student:
        raise ValueError(
            "LeetCode username already exists"
        )

    return create_student(
        db,
        student_data
    )


def get_all_students_service(db):

    return get_all_students(db)

BATCH_SIZE = 2

DELAY_SECONDS = 2

def sync_all_students_service(db):

    students = get_all_students(db)

    successful = 0

    failed = []

    for i in range(

        0,

        len(students),

        BATCH_SIZE

    ):

        batch = students[

            i : i + BATCH_SIZE

        ]

        print(
    f"\n=== Processing Batch {(i // BATCH_SIZE) + 1} ==="
)

        for student in batch:

            try:

                print(
    f"[{datetime.now()}] Syncing: {student.leetcode_username}"
)

                sync_student_snapshot(

                    db,

                    student.leetcode_username

                )

                sync_student_contests(

                    db,

                    student.leetcode_username

                )

                successful += 1

            except Exception:

                failed.append(

                    student.leetcode_username

                )

        if i + BATCH_SIZE < len(students):

            print(
    f"Waiting {DELAY_SECONDS} seconds before next batch..."
)

            time.sleep(

                DELAY_SECONDS

            )

    return {

        "total_students": len(students),

        "successful": successful,

        "failed": failed

    }


def get_students_latest_snapshots_service(db):
    from sqlalchemy import func
    from app.models.student import Student
    from app.models.profile_snapshot import ProfileSnapshot

    # Subquery to find the latest snapshot ID for each student
    subquery = (
        db.query(
            ProfileSnapshot.student_id,
            func.max(ProfileSnapshot.id).label("max_id")
        )
        .group_by(ProfileSnapshot.student_id)
        .subquery()
    )

    # Query all students and their latest snapshot
    results = (
        db.query(Student, ProfileSnapshot)
        .outerjoin(subquery, Student.id == subquery.c.student_id)
        .outerjoin(ProfileSnapshot, ProfileSnapshot.id == subquery.c.max_id)
        .all()
    )

    snapshots_data = []
    for student, snapshot in results:
        snapshots_data.append({
            "student_id": student.id,
            "roll_no": student.roll_no,
            "leetcode_username": student.leetcode_username,
            "current_rating": snapshot.current_rating if snapshot else 1500.0,
            "contests_attended": snapshot.contests_attended if snapshot else 0,
            "total_solved": snapshot.total_solved if snapshot else 0,
            "global_rank": snapshot.global_rank if snapshot else None,
            "top_percentage": snapshot.top_percentage if snapshot else None
        })
    return snapshots_data

def delete_student_service(
    db,
    student_id
):

    try:

        delete_results_by_student_id(
            db,
            student_id
        )

        delete_snapshots_by_student_id(
            db,
            student_id
        )

        student = delete_student(
            db,
            student_id
        )

        if not student:

            raise ValueError(
                "Student not found"
            )

        db.commit()

        return {
            "message": "Student deleted successfully"
        }

    except Exception:

        db.rollback()

        raise