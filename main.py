from fastapi import FastAPI

from app.api.student_routes import router


app = FastAPI(
    title="LeetCode Department Tracker"
)

app.include_router(router)