from app.repositories.contest_repository import (
    get_all_contests
)

from app.repositories.contest_result_repository import (
    get_results_by_contest
)


def get_all_contests_service(db):

    return get_all_contests(db)


def get_contest_results_service(
    db,
    contest_id
):

    results = get_results_by_contest(
        db,
        contest_id
    )

    ranking_table = []

    for result in results:

        ranking_table.append({

            "rank":
                result.global_rank,

            "student_name":
                result.student.name,

            "roll_no":
                result.student.roll_no,

            "leetcode_username":
                result.student.leetcode_username,

            "problems_solved":
                result.problems_solved,

            "total_problems":
                result.total_problems,

            "finish_time_seconds":
                result.finish_time_seconds,

            "rating_after":
                result.rating_after,

            "rating_change":
                result.rating_change
        })

    ranking_table.sort(
        key=lambda x: x["rank"]
    )

    return ranking_table