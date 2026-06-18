from sqlalchemy import Column, Integer, String, DateTime

from sqlalchemy.sql import func

from app.database.base import Base

class Student(Base):

    __tablename__ = "students"

    id = Column(Integer, primary_key=True)

    roll_no = Column(String(20), nullable=False)

    name = Column(String(100), nullable=False)

    year = Column(Integer)

    section = Column(String(10))

    leetcode_username = Column(

        String(100),

        unique=True,

        nullable=False

    )

    created_at = Column(

        DateTime(timezone=True),

        server_default=func.now()

    )