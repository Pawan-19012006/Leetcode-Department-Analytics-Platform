from app.repositories.student_repository import (
    create_student,
    get_by_leetcode_username,
    get_by_roll_no
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