from app.models.contest_result import ContestResult


def create_result(
    db,
    student_id,
    contest_id,
    result_data
):

    result = ContestResult(

        student_id=student_id,

        contest_id=contest_id,

        global_rank=result_data["ranking"],

        problems_solved=result_data["problemsSolved"],

        total_problems=result_data["totalProblems"],

        finish_time_seconds=result_data["finishTimeInSeconds"],

        rating_after=result_data["rating"],

        rating_change=result_data["rating_change"]

    )

    db.add(result)

    db.commit()

    db.refresh(result)

    return result


def get_results_by_student(
    db,
    student_id
):

    return (
        db.query(ContestResult)
        .filter(
            ContestResult.student_id == student_id
        )
        .all()
    )


def get_results_by_contest(
    db,
    contest_id
):

    return (
        db.query(ContestResult)
        .filter(
            ContestResult.contest_id == contest_id
        )
        .all()
    )

def get_result_by_student_and_contest(
    db,
    student_id,
    contest_id
):

    return (
        db.query(ContestResult)
        .filter(
            ContestResult.student_id == student_id,
            ContestResult.contest_id == contest_id
        )
        .first()
    )

def get_all_contests(db):

    return (
        db.query(Contest)
        .order_by(
            Contest.contest_number.desc()
        )
        .all()
    )