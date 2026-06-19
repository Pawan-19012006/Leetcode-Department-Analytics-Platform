from app.repositories.student_repository import (
    create_student,
    get_by_leetcode_username,
    get_by_roll_no,
    get_all_students
)

from app.services.profile_snapshot_service import (

    sync_student_snapshot

)

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



def sync_all_students_service(db):

    students = get_all_students(db)

    successful = 0

    failed = []

    for student in students:

        try:

            sync_student_snapshot(

                db,

                student.leetcode_username

            )

            successful += 1

        except Exception:

            failed.append(

                student.leetcode_username

            )

    return {

        "total_students": len(students),

        "successful": successful,

        "failed": failed

    }