from app.database.connection import engine
from app.database.base import Base

from app.models.student import Student


Base.metadata.create_all(bind=engine) #Creating the class inside the db, base class only are created 

print("Tables Created Successfully")