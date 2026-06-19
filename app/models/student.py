from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Student(Base):

    __tablename__ = "students"


    id = Column( #Creating the id for every student which will be the primary key identifier
        Integer,
        primary_key=True,
        index=True
    )


    roll_no = Column( # rno is created as a col, that is unique and connot contain any null vals
        String(20),
        unique=True,
        nullable=False,
        index=True
    )


    name = Column(
        String(100),
        nullable=False
    )


    batch = Column(
        Integer,
        nullable=False
    )


    section = Column(
        String(10)
    )


    leetcode_username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )


    created_at = Column( #stores the time at which the data is created
        DateTime(timezone=True),
        server_default=func.now()
    )


    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )


    # Relationships

    profile_snapshots = relationship( #We make a relationship between the student table and profile snapshot table
        "ProfileSnapshot",
        back_populates="student",
        cascade="all, delete"
    )


    contest_results = relationship(
        "ContestResult",
        back_populates="student",
        cascade="all, delete"
    )


    language_stats = relationship(
        "LanguageStat",
        back_populates="student",
        cascade="all, delete"
    ) #Likewise we have created a relationship between all the other tables with the student tables too
    #We have used backpopulates here since we need to go back and forth between tables, ie, get data of contest using students and vice versa too
    #We use cascade becoz, if we delete a data of one table, its respective datas must also be erased since they are all interconnected, hence we use cascade and delete
    #Cascade delete here only works when the data is deleted, not updated or edited

    
