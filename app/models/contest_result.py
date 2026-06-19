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


class ContestResult(Base):

    __tablename__ = "contest_results"


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


    contest_id = Column(
        Integer,
        ForeignKey("contests.id"),
        nullable=False,
        index=True
    )


    global_rank = Column(
        Integer
    )


    problems_solved = Column(
        Integer,
        default=0
    )


    total_problems = Column(
        Integer,
        default=4
    )


    finish_time_seconds = Column(
        Integer
    )


    rating_after = Column(
        Float
    )


    rating_change = Column(
        Float
    )


    fetched_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    student = relationship(
        "Student",
        back_populates="contest_results"
    )


    contest = relationship(
        "Contest",
        back_populates="results"
    )


    __table_args__ = (

        UniqueConstraint(
            "student_id",
            "contest_id",
            name="unique_student_contest"
        ),

    )