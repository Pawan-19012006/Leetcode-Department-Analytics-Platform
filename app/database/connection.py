from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:pawan1916@localhost:5432/leetcode_tracker"

engine = create_engine(DATABASE_URL)

print("Database engine created successfully")