from app.database.connection import engine
from app.database.base import Base

from app.models.student import Student
from app.models import *


Base.metadata.create_all(bind=engine) #Creating the class inside the db, base class only are created 

print("All Models imported successfully")
print("Tables Created Successfully")