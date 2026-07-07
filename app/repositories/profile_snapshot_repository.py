from app.models.profile_snapshot import ProfileSnapshot

def delete_snapshots_by_student_id(
    db,
    student_id
):

    db.query(
        ProfileSnapshot
    ).filter(
        ProfileSnapshot.student_id == student_id
    ).delete()

def create_snapshot(
    db,
    student_id,
    snapshot_data
):



    snapshot = ProfileSnapshot(
        student_id=student_id,

        current_rating=snapshot_data["current_rating"],
        global_rank=snapshot_data["global_rank"],

        contests_attended=snapshot_data["contests_attended"],

        total_solved=snapshot_data["total_solved"],
        easy_solved=snapshot_data["easy_solved"],
        medium_solved=snapshot_data["medium_solved"],
        hard_solved=snapshot_data["hard_solved"],

        top_percentage=snapshot_data["top_percentage"]
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot

def get_latest_snapshot(db, student_id):
    return (
        db.query(ProfileSnapshot)
        .filter(ProfileSnapshot.student_id == student_id)
        .order_by(ProfileSnapshot.captured_at.desc())
        .first()
    )

def get_all_snapshots_for_student(db, student_id):
    return (
        db.query(ProfileSnapshot)
        .filter(ProfileSnapshot.student_id == student_id)
        .order_by(ProfileSnapshot.captured_at.asc())
        .all()
    )

def get_snapshots_in_date_range(db, student_id, start_date, end_date):
    return (
        db.query(ProfileSnapshot)
        .filter(
            ProfileSnapshot.student_id == student_id,
            ProfileSnapshot.captured_at >= start_date,
            ProfileSnapshot.captured_at <= end_date
        )
        .order_by(ProfileSnapshot.captured_at.asc())
        .all()
    )

def get_snapshot_closest_to_date(db, student_id, target_date):
    # Try to find the closest snapshot captured at or before target_date
    snap = (
        db.query(ProfileSnapshot)
        .filter(
            ProfileSnapshot.student_id == student_id,
            ProfileSnapshot.captured_at <= target_date
        )
        .order_by(ProfileSnapshot.captured_at.desc())
        .first()
    )
    # If no snapshot exists before target_date, get the earliest available one
    if not snap:
        snap = (
            db.query(ProfileSnapshot)
            .filter(ProfileSnapshot.student_id == student_id)
            .order_by(ProfileSnapshot.captured_at.asc())
            .first()
        )
    return snap