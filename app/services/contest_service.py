from datetime import datetime, timezone

from app.repositories.student_repository import (
    get_by_leetcode_username
)

from app.repositories.contest_repository import (
    get_or_create_contest
)

from app.repositories.contest_result_repository import (
    create_result,
    get_result_by_student_and_contest
)

from app.collectors.contest_history_collector import (
    collect_contest_history
)


def sync_student_contests(
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

    history = collect_contest_history(
        username
    )

    previous_rating = None

    for contest_record in reversed(history):

        contest_title = contest_record["contest"]["title"]

        start_time = contest_record["contest"]["startTime"]

        contest_date = datetime.fromtimestamp(
            start_time,
            tz=timezone.utc
        )

        if "Weekly" in contest_title:

            contest_type = "weekly"

        elif "Biweekly" in contest_title:

            contest_type = "biweekly"

        else:

            contest_type = "other"

        contest_number = int(
            contest_title.split()[-1]
        )

        contest = get_or_create_contest(
            db,
            contest_title,
            contest_type,
            contest_number,
            contest_date
        )

        current_rating = contest_record["rating"]

        if previous_rating is None:

            rating_change = 0

        else:

            rating_change = (
                current_rating
                - previous_rating
            )

        result_data = {

            "ranking":
                contest_record["ranking"],

            "problemsSolved":
                contest_record["problemsSolved"],

            "totalProblems":
                contest_record["totalProblems"],

            "finishTimeInSeconds":
                contest_record["finishTimeInSeconds"],

            "rating":
                current_rating,

            "rating_change":
                rating_change
        }

        existing_result = (
            get_result_by_student_and_contest(
                db,
                student.id,
                contest.id
            )
        )

        if existing_result:

            previous_rating = current_rating
            continue

        create_result(
            db,
            student.id,
            contest.id,
            result_data
        )

        previous_rating = current_rating

    return {
        "student": username,
        "contests_synced": len(history)
    }

