# ai-service/main.py

from fastapi import FastAPI  # type: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[reportMissingImports]
from dotenv import load_dotenv  # type: ignore[reportMissingImports]
import os

load_dotenv()

app = FastAPI(
    title="InterviewCopilot AI Service",
    description="AI-powered interview preparation platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8082",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import ats
from routers import questions

app.include_router(ats.router, prefix="/api")
app.include_router(questions.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "InterviewCopilot AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/ats/analyze",
            "/api/questions/generate",
            "/api/questions/feedback",
            "/api/questions/topics",
        ]
    }


@app.get("/health")
async def health():
    return {"status": "UP", "service": "ai-service"}