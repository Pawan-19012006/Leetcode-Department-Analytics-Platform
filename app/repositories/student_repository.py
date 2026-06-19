from app.models.student import Student


def get_by_leetcode_username(db, username):

    return (
        db.query(Student)
        .filter(
            Student.leetcode_username == username
        )
        .first()
    )