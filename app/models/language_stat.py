from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class LanguageStat(Base):

    __tablename__ = "language_stats"


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


    language_name = Column(
        String(50),
        nullable=False
    )


    problems_solved = Column(
        Integer,
        default=0
    )


    student = relationship(
        "Student",
        back_populates="language_stats"
    )


    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "language_name",
            name="unique_student_language"
        ),
    )