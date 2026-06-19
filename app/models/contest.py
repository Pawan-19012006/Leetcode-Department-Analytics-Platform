from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class Contest(Base):

    __tablename__ = "contests"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    contest_name = Column(
        String(100),
        nullable=False
    )


    contest_type = Column(
        String(20),
        nullable=False
    )


    contest_number = Column(
        Integer
    )


    contest_date = Column(
        DateTime(timezone=True),
        nullable=False
    )


    results = relationship(
        "ContestResult",
        back_populates="contest",
        cascade="all, delete"
    )


    __table_args__ = (
        UniqueConstraint(
            "contest_name",
            name="unique_contest_name"
        ),
    )