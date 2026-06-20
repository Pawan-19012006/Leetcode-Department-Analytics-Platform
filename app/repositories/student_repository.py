from app.models.student import Student


def get_by_leetcode_username(db, username):

    return (
        db.query(Student)
        .filter(
            Student.leetcode_username == username
        )
        .first()
    )

def get_by_roll_no(db, roll_no):
    return (
        db.query(Student)
        .filter(Student.roll_no == roll_no)
        .first()
    )

def get_by_id(db, student_id):

    return (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

def get_all_students(db):

    return db.query(Student).all()

def delete_student(
    db,
    student_id
):

    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        return None

    db.delete(student)

    return student

def update_student(
    db,
    student_id,
    update_data
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        return None

    student.name = update_data.name
    student.roll_no = update_data.roll_no
    student.batch = update_data.batch
    student.section = update_data.section

    db.commit()

    db.refresh(student)

    return student


def create_student(

    db,

    student_data

):



    student = Student(

        roll_no=student_data.roll_no,

        name=student_data.name,

        batch=student_data.batch,

        section=student_data.section,

        leetcode_username=student_data.leetcode_username

    )

    db.add(student)

    db.commit()

    db.refresh(student)

    return student