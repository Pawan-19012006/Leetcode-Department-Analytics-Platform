from app.models.contest import Contest


def get_by_name(
    db,
    contest_name
):

    return (
        db.query(Contest)
        .filter(
            Contest.contest_name == contest_name
        )
        .first()
    )


def create_contest(
    db,
    contest_name,
    contest_type,
    contest_number,
    contest_date
):

    contest = Contest(

        contest_name=contest_name,

        contest_type=contest_type,

        contest_number=contest_number,

        contest_date=contest_date

    )

    db.add(contest)

    db.commit()

    db.refresh(contest)

    return contest


def get_or_create_contest(
    db,
    contest_name,
    contest_type,
    contest_number,
    contest_date
):

    contest = get_by_name(
        db,
        contest_name
    )

    if contest:
        return contest

    return create_contest(
        db,
        contest_name,
        contest_type,
        contest_number,
        contest_date
    )

def get_all_contests(db):

    return (
        db.query(Contest)
        .order_by(
            Contest.contest_number.desc()
        )
        .all()
    )