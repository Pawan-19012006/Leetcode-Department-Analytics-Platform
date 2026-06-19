from app.repositories.student_repository import (
    get_by_leetcode_username
)

from app.repositories.profile_snapshot_repository import (
    create_snapshot
)

from app.services.profile_snapshot_builder import (
    build_profile_snapshot
)


def sync_student_snapshot(
    db,
    username
):

    student = get_by_leetcode_username(
        db,
        username
    )

    if not student:
        raise ValueError(
            f"Student with username {username} not found"
        )

    snapshot_data = build_profile_snapshot(
        username
    )

    snapshot = create_snapshot(
        db,
        student.id,
        snapshot_data
    )

    return snapshot