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