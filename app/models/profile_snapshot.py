from sqlalchemy import (

    Column,

    Integer,

    Float,

    DateTime,

    ForeignKey,

    UniqueConstraint

)

from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.database.base import Base

class ProfileSnapshot(Base):

    __tablename__ = "profile_snapshots"

    id = Column(

        Integer,

        primary_key=True,

        index=True

    )

    student_id = Column(

        Integer,

        ForeignKey("students.id"),

        nullable=False,

        index=True

    )

    captured_at = Column(

        DateTime(timezone=True),

        server_default=func.now(),

        nullable=False

    )

    current_rating = Column(

        Float

    )

    global_rank = Column(

        Integer

    )

    contests_attended = Column(

        Integer,

        default=0

    )

    total_solved = Column(

        Integer,

        default=0

    )

    easy_solved = Column(

        Integer,

        default=0

    )

    medium_solved = Column(

        Integer,

        default=0

    )

    hard_solved = Column(

        Integer,

        default=0

    )

    top_percentage = Column(

        Float

    )

    student = relationship(

        "Student",

        back_populates="profile_snapshots"

    ) # Here student table has now been connected with the profile snapshot table

    __table_args__ = (

        UniqueConstraint(

            "student_id",

            "captured_at",

            name="unique_student_snapshot"

        ),

    )