from pydantic import BaseModel

# We use pydantic since we need only valid data to enter the db, hence pydantic does the job of validation
class StudentCreate(BaseModel):

    roll_no: str
    name: str
    batch: int
    section: str
    leetcode_username: str