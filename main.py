from fastapi import FastAPI

from app.api.student_routes import router as student_router

from app.api.contest_routes import router as contest_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="LeetCode Department Tracker"
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)

app.include_router(student_router)

app.include_router(contest_router)